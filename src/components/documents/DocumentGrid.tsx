'use client'

import { DocumentCard } from './DocumentCard'
import type { MedicalDocumentWithRelations } from '@/lib/types/database'

interface DocumentGridProps {
  documents: MedicalDocumentWithRelations[]
  onDocumentClick: (document: MedicalDocumentWithRelations) => void
}

export function DocumentGrid({ documents, onDocumentClick }: DocumentGridProps) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Belum ada dokumen</p>
        <p className="text-sm text-muted-foreground mt-1">
          Upload dokumen medis pertama Anda
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((doc) => (
        <DocumentCard
          key={doc.id}
          document={doc}
          onClick={() => onDocumentClick(doc)}
        />
      ))}
    </div>
  )
}
