'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { FileText, Image as ImageIcon } from 'lucide-react'
import { formatDate, formatFileSize } from '@/lib/utils/format'
import type { MedicalDocumentWithRelations } from '@/lib/types/database'

interface DocumentCardProps {
  document: MedicalDocumentWithRelations
  onClick: () => void
}

export function DocumentCard({ document, onClick }: DocumentCardProps) {
  const isPdf = document.mime_type === 'application/pdf'
  const isImage = document.mime_type?.startsWith('image/')
  
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* File type icon */}
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
            {isPdf ? (
              <FileText className="w-6 h-6 text-red-500" />
            ) : isImage ? (
              <ImageIcon className="w-6 h-6 text-blue-500" />
            ) : (
              <FileText className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3 className="font-medium text-sm truncate">{document.title}</h3>
            
            {/* Category badge */}
            {document.health_document_categories && (
              <Badge 
                variant="secondary" 
                className="mt-1 text-xs"
                style={{ 
                  backgroundColor: `${document.health_document_categories.color}20`,
                  color: document.health_document_categories.color 
                }}
              >
                {document.health_document_categories.icon} {document.health_document_categories.name}
              </Badge>
            )}
            
            {/* Member and date */}
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              {document.family_members && (
                <div className="flex items-center gap-1">
                  <Avatar className="w-4 h-4">
                    <AvatarImage src={document.family_members.avatar_url || undefined} />
                    <AvatarFallback className="text-[8px]">
                      {document.family_members.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{document.family_members.name}</span>
                </div>
              )}
              <span>•</span>
              <span>{document.document_date ? formatDate(document.document_date) : formatDate(document.created_at)}</span>
            </div>
            
            {/* File size */}
            {document.file_size && (
              <p className="text-xs text-muted-foreground mt-1">
                {formatFileSize(document.file_size)}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
