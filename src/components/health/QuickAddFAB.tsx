'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Plus, X, Activity, FileUp, Pill } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Props for the QuickAddFAB component
 */
export interface QuickAddFABProps {
  /** Callback when "Add Metric" action is selected */
  onAddMetric?: () => void
  /** Callback when "Upload Document" action is selected */
  onUploadDocument?: () => void
  /** Callback when "Log Medication" action is selected */
  onLogMedication?: () => void
}

/**
 * Indonesian labels for the component
 */
const LABELS = {
  title: 'Tambah Cepat',
  description: 'Pilih tindakan yang ingin dilakukan',
  addMetric: 'Tambah Metrik',
  addMetricDescription: 'Catat data kesehatan baru',
  uploadDocument: 'Unggah Dokumen',
  uploadDocumentDescription: 'Simpan dokumen medis',
  logMedication: 'Catat Obat',
  logMedicationDescription: 'Catat konsumsi obat',
} as const

/**
 * Quick action item configuration
 */
interface QuickAction {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  onClick?: () => void
  color: string
}

/**
 * QuickAddFAB - Floating Action Button for quick health entry actions
 * 
 * This is a Client Component that renders a floating action button fixed at
 * the bottom-right corner of the screen. When clicked, it opens a bottom sheet
 * with quick action options:
 * - Add Metric (Tambah Metrik)
 * - Upload Document (Unggah Dokumen)
 * - Log Medication (Catat Obat)
 * 
 * The component is mobile-friendly with appropriate touch targets and
 * smooth animations.
 * 
 * @example
 * ```tsx
 * <QuickAddFAB
 *   onAddMetric={() => router.push('/health/add')}
 *   onUploadDocument={() => router.push('/documents/upload')}
 *   onLogMedication={() => router.push('/medications/log')}
 * />
 * ```
 */
export function QuickAddFAB({
  onAddMetric,
  onUploadDocument,
  onLogMedication,
}: QuickAddFABProps) {
  const [isOpen, setIsOpen] = useState(false)

  /**
   * Handle action selection - close sheet and trigger callback
   */
  const handleAction = (callback?: () => void) => {
    setIsOpen(false)
    callback?.()
  }

  /**
   * Quick action items configuration
   */
  const quickActions: QuickAction[] = [
    {
      id: 'add-metric',
      label: LABELS.addMetric,
      description: LABELS.addMetricDescription,
      icon: <Activity className="h-5 w-5" />,
      onClick: () => handleAction(onAddMetric),
      color: 'bg-blue-500 hover:bg-blue-600 text-white',
    },
    {
      id: 'upload-document',
      label: LABELS.uploadDocument,
      description: LABELS.uploadDocumentDescription,
      icon: <FileUp className="h-5 w-5" />,
      onClick: () => handleAction(onUploadDocument),
      color: 'bg-green-500 hover:bg-green-600 text-white',
    },
    {
      id: 'log-medication',
      label: LABELS.logMedication,
      description: LABELS.logMedicationDescription,
      icon: <Pill className="h-5 w-5" />,
      onClick: () => handleAction(onLogMedication),
      color: 'bg-purple-500 hover:bg-purple-600 text-white',
    },
  ]

  return (
    <>
      {/* Floating Action Button */}
      <Button
        onClick={() => setIsOpen(true)}
        size="icon-lg"
        className={cn(
          'fixed bottom-6 right-6 z-40',
          'h-14 w-14 rounded-full shadow-lg',
          'transition-all duration-300 ease-in-out',
          'hover:scale-105 hover:shadow-xl',
          'active:scale-95',
          // Ensure good touch target on mobile
          'touch-manipulation'
        )}
        aria-label={LABELS.title}
      >
        <Plus className={cn(
          'h-6 w-6 transition-transform duration-300',
          isOpen && 'rotate-45'
        )} />
      </Button>

      {/* Bottom Sheet with Quick Actions */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent 
          side="bottom" 
          className="rounded-t-2xl pb-8"
          showCloseButton={false}
        >
          {/* Header */}
          <SheetHeader className="pb-2">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-lg">{LABELS.title}</SheetTitle>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsOpen(false)}
                className="rounded-full"
                aria-label="Tutup"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <SheetDescription>{LABELS.description}</SheetDescription>
          </SheetHeader>

          {/* Quick Action Buttons */}
          <div className="flex flex-col gap-3 px-4 pt-2">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={action.onClick}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl',
                  'transition-all duration-200',
                  'hover:scale-[1.02] active:scale-[0.98]',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                  'touch-manipulation',
                  action.color
                )}
              >
                {/* Icon */}
                <div className="flex-shrink-0 p-2 bg-white/20 rounded-lg">
                  {action.icon}
                </div>
                
                {/* Label and Description */}
                <div className="flex flex-col items-start text-left">
                  <span className="font-semibold">{action.label}</span>
                  <span className="text-sm opacity-90">{action.description}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Safe area padding for mobile devices */}
          <div className="h-safe-area-inset-bottom" />
        </SheetContent>
      </Sheet>
    </>
  )
}

export default QuickAddFAB
