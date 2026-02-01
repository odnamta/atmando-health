import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DocumentsClient } from './DocumentsClient'
import { getDocuments, getCategories, seedCategories } from './actions'

export default async function DocumentsPage() {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get user's family
  const { data: memberData } = await supabase
    .from('family_members')
    .select('family_id, role')
    .eq('user_id', user.id)
    .single()

  if (!memberData) {
    redirect('/onboarding')
  }
  
  const member = memberData as { family_id: string; role: string }

  // Get family members for filter
  const { data: membersData } = await supabase
    .from('family_members')
    .select('id, name, avatar_url')
    .eq('family_id', member.family_id)
    .order('name')
  
  const members = (membersData || []) as Array<{ id: string; name: string; avatar_url: string | null }>

  // Get or seed categories
  let { data: categories } = await getCategories(member.family_id)
  
  if (!categories || categories.length === 0) {
    await seedCategories(member.family_id)
    const result = await getCategories(member.family_id)
    categories = result.data
  }

  // Get documents
  const { data: documents } = await getDocuments()

  const canDelete = member.role === 'admin'
  const canUpload = ['admin', 'parent'].includes(member.role)

  return (
    <DocumentsClient
      familyId={member.family_id}
      members={members}
      categories={categories || []}
      initialDocuments={documents || []}
      canDelete={canDelete}
      canUpload={canUpload}
    />
  )
}
