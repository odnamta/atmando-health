'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Skeleton } from '@/components/ui/skeleton'

interface QRCodeDisplayProps {
  url: string
  size?: number
  className?: string
}

export function QRCodeDisplay({ url, size = 200, className = '' }: QRCodeDisplayProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (!url) {
      setError('URL tidak tersedia')
      setIsLoading(false)
      return
    }

    const generateQR = async () => {
      try {
        setIsLoading(true)
        setError('')
        
        const qrDataUrl = await QRCode.toDataURL(url, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
          errorCorrectionLevel: 'M',
        })
        
        setQrCodeUrl(qrDataUrl)
      } catch (err) {
        console.error('Error generating QR code:', err)
        setError('Gagal membuat QR code')
      } finally {
        setIsLoading(false)
      }
    }

    generateQR()
  }, [url, size])

  if (isLoading) {
    return (
      <div className={`flex justify-center ${className}`}>
        <Skeleton className="rounded-lg" style={{ width: size, height: size }} />
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`} 
           style={{ width: size, height: size }}>
        <p className="text-xs text-gray-500 text-center px-2">{error}</p>
      </div>
    )
  }

  return (
    <div className={`flex justify-center ${className}`}>
      <img
        src={qrCodeUrl}
        alt="QR Code untuk kartu darurat"
        className="rounded-lg"
        style={{ width: size, height: size }}
      />
    </div>
  )
}