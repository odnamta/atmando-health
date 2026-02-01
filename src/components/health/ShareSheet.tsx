'use client'

import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { 
  Share2, 
  Copy, 
  MessageCircle, 
  Mail, 
  Check,
  ExternalLink 
} from 'lucide-react'
import { toast } from 'sonner'

interface ShareSheetProps {
  isOpen: boolean
  onClose: () => void
  memberName: string
  shareUrl: string
}

export function ShareSheet({ isOpen, onClose, memberName, shareUrl }: ShareSheetProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success('Link berhasil disalin')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Gagal menyalin link')
    }
  }

  const shareViaWebAPI = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Kartu Darurat - ${memberName}`,
          text: `Kartu darurat kesehatan untuk ${memberName}`,
          url: shareUrl,
        })
      } catch (err) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed:', err)
      }
    } else {
      // Fallback to copy
      copyToClipboard()
    }
  }

  const shareViaWhatsApp = () => {
    const message = encodeURIComponent(
      `Kartu darurat kesehatan untuk ${memberName}\n\n${shareUrl}\n\n*Atmando Health* - Family Health Vault`
    )
    window.open(`https://wa.me/?text=${message}`, '_blank')
  }

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Kartu Darurat - ${memberName}`)
    const body = encodeURIComponent(
      `Kartu darurat kesehatan untuk ${memberName}\n\nAkses melalui link berikut:\n${shareUrl}\n\nKartu ini berisi informasi penting seperti golongan darah, alergi, dan kontak darurat.\n\n--\nAtmando Health - Family Health Vault`
    )
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Bagikan Kartu Darurat
          </SheetTitle>
          <SheetDescription>
            Bagikan kartu darurat {memberName} untuk akses cepat dalam keadaan darurat
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Share URL */}
          <div className="space-y-2">
            <Label htmlFor="share-url">Link Kartu Darurat</Label>
            <div className="flex gap-2">
              <Input
                id="share-url"
                value={shareUrl}
                readOnly
                className="text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Link ini dapat diakses tanpa login untuk situasi darurat
            </p>
          </div>

          <Separator />

          {/* Share Options */}
          <div className="space-y-3">
            <Label>Pilihan Berbagi</Label>
            
            {/* Web Share API */}
            {navigator.share && (
              <Button
                variant="outline"
                onClick={shareViaWebAPI}
                className="w-full justify-start"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Bagikan...
              </Button>
            )}

            {/* WhatsApp */}
            <Button
              variant="outline"
              onClick={shareViaWhatsApp}
              className="w-full justify-start"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Bagikan via WhatsApp
            </Button>

            {/* Email */}
            <Button
              variant="outline"
              onClick={shareViaEmail}
              className="w-full justify-start"
            >
              <Mail className="h-4 w-4 mr-2" />
              Bagikan via Email
            </Button>

            {/* Open in new tab */}
            <Button
              variant="outline"
              onClick={() => window.open(shareUrl, '_blank')}
              className="w-full justify-start"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Buka di Tab Baru
            </Button>
          </div>

          <Separator />

          {/* Security Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-amber-800 mb-1">
              ⚠️ Penting untuk Diketahui
            </h4>
            <ul className="text-xs text-amber-700 space-y-1">
              <li>• Link ini berisi informasi kesehatan sensitif</li>
              <li>• Hanya bagikan dengan orang yang dipercaya</li>
              <li>• Link akan kedaluwarsa dalam 1 tahun</li>
              <li>• Akses akan dicatat untuk keamanan</li>
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}