'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DocumentGrid } from '@/components/documents/DocumentGrid'
import { DocumentUploader } from '@/components/documents/DocumentUploader'
import { DocumentViewer } from '@/components/documents/DocumentViewer'
import { CategorySelect } from '@/components/documents/CategorySelect'
import { getDocuments } from './actions'
import { useDebounce } from '@/hooks/useDebounce'
import type { FamilyMember, DocumentCategory, MedicalDocumentWithRelations } from '@/lib/types/database'

interface DocumentsClientProps {
  familyId: string
  members: Pick<FamilyMember, 'id' | 'name' | 'avatar_url'>[]
  categories: DocumentCategory[]
  initialDocuments: MedicalDocumentWithRelations[]
  canDelete: boolean
  canUpload: boolean
}

export function DocumentsClient({
  familyId,
  members,
  categories,
  initialDocuments,
  canDelete,
  canUpload,
}: DocumentsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [documents, setDocuments] = useState(initialDocuments)
  const [isLoading, setIsLoading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<MedicalDocumentWithRelations | null>(null)
  const [showViewer, setShowViewer] = useState(false)
  
  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [memberId, setMemberId] = useState(searchParams.get('member') || 'all')
  const [categoryId, setCategoryId] = useState(searchParams.get('category') || 'all')
  
  const debouncedSearch = useDebounce(search, 300)

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true)
    const { data } = await getDocuments({
      memberId: memberId !== 'all' ? memberId : undefined,
      categoryId: categoryId !== 'all' ? categoryId : undefined,
      search: debouncedSearch || undefined,
    })
    setDocuments(data || [])
    setIsLoading(false)
  }, [memberId, categoryId, debouncedSearch])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (memberId !== 'all') params.set('member', memberId)
    if (categoryId !== 'all') params.set('category', categoryId)
    
    const newUrl = params.toString() ? `?${params.toString()}` : '/documents'
    router.replace(newUrl, { scroll: false })
  }, [search, memberId, categoryId, router])

  const handleDocumentClick = (doc: MedicalDocumentWithRelations) => {
    setSelectedDocument(doc)
    setShowViewer(true)
  }

  const handleUploadComplete = () => {
    setShowUpload(false)
    fetchDocuments()
  }

  const handleDeleted = () => {
    fetchDocuments()
  }

  return (
    <div className="container max-w-6xl py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dokumen Medis</h1>
          <p className="text-muted-foreground">
            Kelola dokumen kesehatan keluarga
          </p>
        </div>
        
        {canUpload && (
          <Button onClick={() => setShowUpload(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Upload
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari dokumen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={memberId} onValueChange={setMemberId}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Semua Anggota" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Anggota</SelectItem>
            {members.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="w-full sm:w-[180px]">
          <CategorySelect
            categories={categories}
            value={categoryId}
            onValueChange={setCategoryId}
            placeholder="Semua Kategori"
            allowAll
          />
        </div>
      </div>

      {/* Document grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <DocumentGrid
          documents={documents}
          onDocumentClick={handleDocumentClick}
        />
      )}

      {/* Upload sheet */}
      <Sheet open={showUpload} onOpenChange={setShowUpload}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Upload Dokumen</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <DocumentUploader
              familyId={familyId}
              members={members as FamilyMember[]}
              categories={categories}
              onUploadComplete={handleUploadComplete}
              onCancel={() => setShowUpload(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Document viewer */}
      <DocumentViewer
        document={selectedDocument}
        open={showViewer}
        onOpenChange={setShowViewer}
        onDeleted={handleDeleted}
        canDelete={canDelete}
      />
    </div>
  )
}
