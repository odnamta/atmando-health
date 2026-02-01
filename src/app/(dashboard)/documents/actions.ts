'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { InsertMedicalDocument, UpdateMedicalDocument, DocumentCategory } from '@/lib/types/database'

export async function getDocuments(params?: {
  memberId?: string
  categoryId?: string
  search?: string
}) {
  const supabase = await createClient()
  
  let query = supabase
    .from('medical_documents')
    .select(`
      *,
      family_members!inner (id, name, avatar_url),
      health_document_categories (id, name, icon, color)
    `)
    .order('document_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (params?.memberId) {
    query = query.eq('member_id', params.memberId)
  }

  if (params?.categoryId) {
    query = query.eq('category_id', params.categoryId)
  }

  if (params?.search) {
    query = query.or(`title.ilike.%${params.search}%,notes.ilike.%${params.search}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching documents:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function getDocument(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('medical_documents')
    .select(`
      *,
      family_members (id, name, avatar_url),
      health_document_categories (id, name, icon, color)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching document:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function getCategories(familyId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('health_document_categories')
    .select('*')
    .eq('family_id', familyId)
    .order('sort_order')

  if (error) {
    console.error('Error fetching categories:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function seedCategories(familyId: string) {
  const supabase = await createClient()
  
  // Use raw SQL call since the function isn't in the generated types
  const { error } = await supabase.rpc('seed_document_categories' as never, {
    p_family_id: familyId
  } as never)

  if (error) {
    console.error('Error seeding categories:', error)
    return { success: false, error: error.message }
  }

  return { success: true, error: null }
}

export async function uploadDocument(
  file: File,
  metadata: Omit<InsertMedicalDocument, 'file_path' | 'file_size' | 'mime_type'>
) {
  const supabase = await createClient()
  
  // Generate file path: family_id/member_id/timestamp-filename
  const timestamp = Date.now()
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const filePath = `${metadata.family_id}/${metadata.member_id}/${timestamp}-${sanitizedName}`

  // Upload file to storage
  const { error: uploadError } = await supabase.storage
    .from('health-documents')
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    console.error('Error uploading file:', uploadError)
    return { data: null, error: uploadError.message }
  }

  // Create document record - cast to any to bypass strict type checking
  // since the generated types may not match the actual schema
  const insertData = {
    ...metadata,
    file_path: filePath,
    file_size: file.size,
    mime_type: file.type,
  }
  
  const { data, error } = await supabase
    .from('medical_documents')
    .insert(insertData as never)
    .select()
    .single()

  if (error) {
    // Clean up uploaded file if DB insert fails
    await supabase.storage.from('health-documents').remove([filePath])
    console.error('Error creating document record:', error)
    return { data: null, error: error.message }
  }

  revalidatePath('/documents')
  return { data, error: null }
}

export async function updateDocument(id: string, updates: UpdateMedicalDocument) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('medical_documents')
    .update(updates as never)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating document:', error)
    return { data: null, error: error.message }
  }

  revalidatePath('/documents')
  revalidatePath(`/documents/${id}`)
  return { data, error: null }
}

export async function deleteDocument(id: string) {
  const supabase = await createClient()
  
  // Get the document to find the file path
  const { data: doc, error: fetchError } = await supabase
    .from('medical_documents')
    .select('file_path')
    .eq('id', id)
    .single()

  if (fetchError) {
    console.error('Error fetching document:', fetchError)
    return { success: false, error: fetchError.message }
  }

  // Delete from storage
  const filePath = (doc as { file_path?: string })?.file_path
  if (filePath) {
    const { error: storageError } = await supabase.storage
      .from('health-documents')
      .remove([filePath])

    if (storageError) {
      console.error('Error deleting file from storage:', storageError)
      // Continue with DB deletion even if storage fails
    }
  }

  // Delete from database
  const { error } = await supabase
    .from('medical_documents')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting document:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/documents')
  return { success: true, error: null }
}

export async function getDocumentUrl(filePath: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase.storage
    .from('health-documents')
    .createSignedUrl(filePath, 3600) // 1 hour expiry

  if (error) {
    console.error('Error creating signed URL:', error)
    return { url: null, error: error.message }
  }

  return { url: data.signedUrl, error: null }
}
