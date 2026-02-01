'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { AlertTriangle, Phone, Share2, Printer, Download } from 'lucide-react'
import { QRCodeDisplay } from './QRCodeDisplay'
import { ShareSheet } from './ShareSheet'
import { formatDate, formatAge } from '@/lib/utils/format'

interface EmergencyContact {
  name: string
  phone: string
  relationship: string
}

interface EmergencyCardProps {
  member: {
    id: string
    name: string
    birth_date: string | null
    avatar_url: string | null
  }
  profile: {
    blood_type: string | null
    allergies: string[] | null
    conditions: string[] | null
    emergency_contact_name: string | null
    emergency_contact_phone: string | null
    emergency_contact_relationship: string | null
  } | null
  token?: string
  isPublic?: boolean
}

export function EmergencyCard({ member, profile, token, isPublic = false }: EmergencyCardProps) {
  const [showShareSheet, setShowShareSheet] = useState(false)

  const emergencyContacts: EmergencyContact[] = []
  if (profile?.emergency_contact_name && profile?.emergency_contact_phone) {
    emergencyContacts.push({
      name: profile.emergency_contact_name,
      phone: profile.emergency_contact_phone,
      relationship: profile.emergency_contact_relationship || 'Kontak Darurat',
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const handleSaveImage = async () => {
    // TODO: Implement save as image functionality
    console.log('Save as image')
  }

  const publicUrl = token ? `${window.location.origin}/e/${token}` : ''

  return (
    <>
      <Card className="emergency-card max-w-md mx-auto print:shadow-none print:border-2 print:border-black">
        <CardHeader className="text-center pb-4 print:pb-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <CardTitle className="text-red-600 font-bold text-lg print:text-base">
              INFORMASI DARURAT
            </CardTitle>
          </div>
          {isPublic && (
            <p className="text-xs text-muted-foreground">
              Kartu darurat digital - Atmando Health
            </p>
          )}
        </CardHeader>

        <CardContent className="space-y-4 print:space-y-2">
          {/* Person Info */}
          <div className="text-center">
            <h2 className="text-xl font-bold print:text-lg">{member.name}</h2>
            {member.birth_date && (
              <div className="text-sm text-muted-foreground print:text-xs">
                <p>Lahir: {formatDate(member.birth_date)}</p>
                <p>Usia: {formatAge(member.birth_date)}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Blood Type */}
          {profile?.blood_type && (
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Golongan Darah</p>
              <p className="text-2xl font-bold text-red-600 print:text-xl">
                {profile.blood_type}
              </p>
            </div>
          )}

          {/* Allergies */}
          {profile?.allergies && profile.allergies.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-red-600 mb-2">⚠️ ALERGI:</p>
              <div className="flex flex-wrap gap-1">
                {profile.allergies.map((allergy, index) => (
                  <Badge key={index} variant="destructive" className="text-xs print:text-xs">
                    {allergy}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Conditions */}
          {profile?.conditions && profile.conditions.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-orange-600 mb-2">🏥 KONDISI MEDIS:</p>
              <div className="flex flex-wrap gap-1">
                {profile.conditions.map((condition, index) => (
                  <Badge key={index} variant="secondary" className="text-xs print:text-xs">
                    {condition}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Emergency Contacts */}
          {emergencyContacts.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-blue-600 mb-2">📞 KONTAK DARURAT:</p>
              <div className="space-y-1">
                {emergencyContacts.map((contact, index) => (
                  <div key={index} className="flex items-center justify-between text-sm print:text-xs">
                    <div>
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-xs text-muted-foreground">{contact.relationship}</p>
                    </div>
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 print:text-black"
                    >
                      <Phone className="h-3 w-3" />
                      {contact.phone}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QR Code */}
          {token && (
            <div className="text-center">
              <Separator className="mb-4" />
              <QRCodeDisplay url={publicUrl} size={120} />
              <p className="text-xs text-muted-foreground mt-2 print:text-xs">
                Scan untuk info lengkap
              </p>
            </div>
          )}

          {/* Action Buttons - Hidden in print and public view */}
          {!isPublic && (
            <div className="flex gap-2 pt-4 print:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowShareSheet(true)}
                className="flex-1"
              >
                <Share2 className="h-4 w-4 mr-1" />
                Bagikan
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="flex-1"
              >
                <Printer className="h-4 w-4 mr-1" />
                Cetak
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveImage}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-1" />
                Simpan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Share Sheet */}
      <ShareSheet
        isOpen={showShareSheet}
        onClose={() => setShowShareSheet(false)}
        memberName={member.name}
        shareUrl={publicUrl}
      />
    </>
  )
}