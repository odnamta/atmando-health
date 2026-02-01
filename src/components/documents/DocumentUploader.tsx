'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, FileText, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CategorySelect } from './CategorySelect'
import { formatFileSize } from '@/lib/utils/format'
import { uploadDocument } from '@/app/(dashboard)/documents/actions'
import { toast } from 'sonner'
import type { FamilyMember, DocumentCategory, DocumentType } from '@/lib/types/database'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
}

const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'lab_result', label: 'Hasil Lab' },
  { value: 'prescription', label: 'Resep' },
  { value: 'medical_record', label: 'Rekam Medis' },
  { value: 'imaging', label: 'X-Ray/Imaging' },
  { value: 'vaccination', label: 'Vaksinasi' },
  { value: 'insurance', label: 'Asuransi' },
  { value: 'referral', label: 'Rujukan' },
  { value: 'other', label: 'Lainnya' },
]

interface DocumentUploaderProps {
  familyId: string
  members: FamilyMember[]
  categories: DocumentCategory[]
  onUploadComplete: () => void
  onCancel: () => void
}

export function DocumentUploader({
  familyId,
  members,
  categories,
  onUploadComplete,
  onCancel,
}: DocumentUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    memberId: '',
    categoryId: '',
    documentType: 'other' as DocumentType,
    documentDate: '',
    doctorName: '',
    hospitalName: '',
    notes: '',
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0]
    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        toast.error('Ukuran file maksimal 10MB')
        return
      }
      setFile(selectedFile)
      // Auto-fill title from filename
      if (!formData.title) {
        const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, '')
        setFormData(prev => ({ ...prev, title: nameWithoutExt }))
      }
    }
  }, [formData.title])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      toast.error('Pilih file untuk diupload')
      return
    }
    
    if (!formData.memberId) {
      toast.error('Pilih anggota keluarga')
      return
    }
    
    if (!formData.title.trim()) {
      toast.error('Masukkan judul dokumen')
      return
    }

    setIsUploading(true)
    
    try {
      const { error } = await uploadDocument(file, {
        family_id: familyId,
        member_id: formData.memberId,
        title: formData.title.trim(),
        document_type: formData.documentType,
        category_id: formData.categoryId || null,
        document_date: formData.documentDate || null,
        doctor_name: formData.doctorName || null,
        hospital_name: formData.hospitalName || null,
        notes: formData.notes || null,
      })

      if (error) {
        toast.error(`Gagal upload: ${error}`)
        return
      }

      toast.success('Dokumen berhasil diupload')
      onUploadComplete()
    } catch {
      toast.error('Terjadi kesalahan saat upload')
    } finally {
      setIsUploading(false)
    }
  }

  const isPdf = file?.type === 'application/pdf'
  const isImage = file?.type.startsWith('image/')

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Dropzone */}
      {!file ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">
            {isDragActive
              ? 'Lepaskan file di sini...'
              : 'Drag & drop file, atau klik untuk memilih'}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            PDF, JPG, PNG (maks. 10MB)
          </p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                {isPdf ? (
                  <FileText className="w-6 h-6 text-red-500" />
                ) : isImage ? (
                  <ImageIcon className="w-6 h-6 text-blue-500" />
                ) : (
                  <FileText className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setFile(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metadata form */}
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Judul *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Hasil Lab Darah"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="member">Anggota Keluarga *</Label>
          <Select
            value={formData.memberId}
            onValueChange={(value) => setFormData(prev => ({ ...prev, memberId: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih anggota" />
            </SelectTrigger>
            <SelectContent>
              {members.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="category">Kategori</Label>
            <CategorySelect
              categories={categories}
              value={formData.categoryId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
              placeholder="Pilih kategori"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="documentType">Tipe Dokumen</Label>
            <Select
              value={formData.documentType}
              onValueChange={(value) => setFormData(prev => ({ ...prev, documentType: value as DocumentType }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="documentDate">Tanggal Dokumen</Label>
          <Input
            id="documentDate"
            type="date"
            value={formData.documentDate}
            onChange={(e) => setFormData(prev => ({ ...prev, documentDate: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="doctorName">Nama Dokter</Label>
            <Input
              id="doctorName"
              value={formData.doctorName}
              onChange={(e) => setFormData(prev => ({ ...prev, doctorName: e.target.value }))}
              placeholder="dr. ..."
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="hospitalName">Rumah Sakit/Klinik</Label>
            <Input
              id="hospitalName"
              value={formData.hospitalName}
              onChange={(e) => setFormData(prev => ({ ...prev, hospitalName: e.target.value }))}
              placeholder="RS ..."
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="notes">Catatan</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Catatan tambahan..."
            rows={3}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" disabled={isUploading || !file}>
          {isUploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Upload
        </Button>
      </div>
    </form>
  )
}
