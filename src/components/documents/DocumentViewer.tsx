'use client'

import { useState, useEffect } from 'react'
import { Download, Trash2, Loader2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { formatDate, formatFileSize } from '@/lib/utils/format'
import { getDocumentUrl, deleteDocument } from '@/app/(dashboard)/documents/actions'
import { toast } from 'sonner'
import type { MedicalDocumentWithRelations } from '@/lib/types/database'

interface DocumentViewerProps {
  document: MedicalDocumentWithRelations | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted?: () => void
  canDelete?: boolean
}

export function DocumentViewer({
  document,
  open,
  onOpenChange,
  onDeleted,
  canDelete = false,
}: DocumentViewerProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    let isMounted = true
    
    async function loadFileUrl() {
      if (!document) return
      
      setIsLoading(true)
      const { url, error } = await getDocumentUrl(document.file_path)
      
      if (isMounted) {
        if (error) {
          toast.error('Gagal memuat file')
        } else {
          setFileUrl(url)
        }
        setIsLoading(false)
      }
    }

    if (document && open) {
      loadFileUrl()
    }
    
    return () => {
      isMounted = false
    }
  }, [document, open])

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setFileUrl(null)
    }
    onOpenChange(newOpen)
  }

  const handleDownload = () => {
    if (fileUrl) {
      window.open(fileUrl, '_blank')
    }
  }

  const handleDelete = async () => {
    if (!document) return
    
    setIsDeleting(true)
    const { success, error } = await deleteDocument(document.id)
    
    if (success) {
      toast.success('Dokumen berhasil dihapus')
      onOpenChange(false)
      onDeleted?.()
    } else {
      toast.error(`Gagal menghapus: ${error}`)
    }
    setIsDeleting(false)
  }

  if (!document) return null

  const isPdf = document.mime_type === 'application/pdf'
  const isImage = document.mime_type?.startsWith('image/')

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-lg">{document.title}</DialogTitle>
              
              <div className="flex items-center gap-2 mt-2">
                {document.health_document_categories && (
                  <Badge 
                    variant="secondary"
                    style={{ 
                      backgroundColor: `${document.health_document_categories.color}20`,
                      color: document.health_document_categories.color 
                    }}
                  >
                    {document.health_document_categories.icon} {document.health_document_categories.name}
                  </Badge>
                )}
                
                {document.family_members && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Avatar className="w-5 h-5">
                      <AvatarImage src={document.family_members.avatar_url || undefined} />
                      <AvatarFallback className="text-[10px]">
                        {document.family_members.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{document.family_members.name}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload} disabled={!fileUrl}>
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
              
              {canDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={isDeleting}>
                      {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hapus Dokumen?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Dokumen &quot;{document.title}&quot; akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>Hapus</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Document preview */}
        <div className="flex-1 min-h-0 mt-4 overflow-hidden rounded-lg bg-muted">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : fileUrl ? (
            isPdf ? (
              <iframe
                src={fileUrl}
                className="w-full h-full min-h-[400px]"
                title={document.title}
              />
            ) : isImage ? (
              <div className="flex items-center justify-center h-full p-4">
                <img
                  src={fileUrl}
                  alt={document.title}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <p className="text-muted-foreground">Preview tidak tersedia</p>
                <Button variant="outline" onClick={handleDownload}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Buka di tab baru
                </Button>
              </div>
            )
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Gagal memuat file</p>
            </div>
          )}
        </div>

        {/* Document details */}
        <div className="flex-shrink-0 mt-4 pt-4 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {document.document_date && (
              <div>
                <p className="text-muted-foreground">Tanggal Dokumen</p>
                <p className="font-medium">{formatDate(document.document_date)}</p>
              </div>
            )}
            {document.doctor_name && (
              <div>
                <p className="text-muted-foreground">Dokter</p>
                <p className="font-medium">{document.doctor_name}</p>
              </div>
            )}
            {document.hospital_name && (
              <div>
                <p className="text-muted-foreground">RS/Klinik</p>
                <p className="font-medium">{document.hospital_name}</p>
              </div>
            )}
            {document.file_size && (
              <div>
                <p className="text-muted-foreground">Ukuran File</p>
                <p className="font-medium">{formatFileSize(document.file_size)}</p>
              </div>
            )}
          </div>
          
          {document.notes && (
            <div className="mt-4">
              <p className="text-muted-foreground text-sm">Catatan</p>
              <p className="text-sm mt-1">{document.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
