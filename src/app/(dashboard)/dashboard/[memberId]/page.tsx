import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertsSection, type HealthAlert } from '@/components/health/AlertsSection'
import { formatAge, formatRelative, formatWeight, formatHeight, formatBloodPressure, formatTemperature, formatHeartRate, formatBloodSugar, formatOxygenSaturation } from '@/lib/utils/format'
import type { FamilyMember, HealthProfile, HealthMetric, Medication, DoctorVisit } from '@/lib/types/database'
import { 
  ArrowLeft, 
  Activity, 
  FileText, 
  Syringe, 
  Pill, 
  Stethoscope,
  AlertTriangle,
  Droplets,
  Heart,
  Thermometer,
  Scale,
  Ruler,
  TrendingUp
} from 'lucide-react'

/**
 * Page props with dynamic route parameter
 */
interface MemberDashboardPageProps {
  params: Promise<{
    memberId: string
  }>
}

/**
 * Indonesian labels for the page
 */
const LABELS = {
  backToDashboard: 'Kembali ke Beranda',
  bloodType: 'Golongan Darah',
  allergies: 'Alergi',
  conditions: 'Kondisi Kronis',
  noAllergies: 'Tidak ada alergi tercatat',
  noConditions: 'Tidak ada kondisi tercatat',
  tabs: {
    metrics: 'Metrik',
    documents: 'Dokumen',
    vaccinations: 'Vaksinasi',
    medications: 'Obat',
    visits: 'Kunjungan',
  },
  sections: {
    recentMetrics: 'Metrik Kesehatan Terbaru',
    memberAlerts: 'Peringatan',
    noMetrics: 'Belum ada data metrik kesehatan',
    addFirstMetric: 'Tambahkan metrik pertama',
  },
  metricTypes: {
    weight: 'Berat Badan',
    height: 'Tinggi Badan',
    blood_pressure: 'Tekanan Darah',
    blood_sugar: 'Gula Darah',
    heart_rate: 'Detak Jantung',
    temperature: 'Suhu Tubuh',
    oxygen_saturation: 'Saturasi Oksigen',
    bmi: 'BMI',
  },
  comingSoon: 'Segera hadir',
  tabPlaceholder: (tab: string) => `Konten ${tab} akan ditambahkan di versi berikutnya.`,
} as const

/**
 * Type for member with health profile from joined query
 */
type MemberWithProfile = FamilyMember & {
  health_profiles: HealthProfile | null
}

/**
 * Type for metric from query
 */
type MetricQueryResult = Pick<HealthMetric, 'id' | 'metric_type' | 'value_primary' | 'value_secondary' | 'unit' | 'measured_at'>

/**
 * Generate metadata for the page
 */
export async function generateMetadata({ params }: MemberDashboardPageProps): Promise<Metadata> {
  const { memberId } = await params
  const supabase = await createClient()
  
  const { data: member } = await supabase
    .from('family_members')
    .select('name')
    .eq('id', memberId)
    .single()
  
  const memberData = member as { name: string } | null
  
  if (!memberData) {
    return {
      title: 'Anggota Tidak Ditemukan | Atmando Health',
    }
  }
  
  return {
    title: `${memberData.name} | Atmando Health`,
    description: `Profil kesehatan ${memberData.name}`,
  }
}

/**
 * Fetch member data with health profile
 */
async function getMemberWithProfile(memberId: string): Promise<MemberWithProfile | null> {
  const supabase = await createClient()
  
  const { data: member, error } = await supabase
    .from('family_members')
    .select(`
      id,
      family_id,
      user_id,
      name,
      role,
      avatar_url,
      birth_date,
      created_at,
      health_profiles (
        id,
        family_member_id,
        blood_type,
        allergies,
        conditions,
        emergency_contact_name,
        emergency_contact_phone,
        emergency_contact_relationship,
        insurance_provider,
        insurance_number,
        notes,
        created_at,
        updated_at
      )
    `)
    .eq('id', memberId)
    .single()
  
  if (error || !member) {
    console.error('Error fetching member:', error)
    return null
  }
  
  return member as unknown as MemberWithProfile
}

/**
 * Fetch recent health metrics for a member
 */
async function getRecentMetrics(memberId: string): Promise<MetricQueryResult[]> {
  const supabase = await createClient()
  
  const { data: metrics, error } = await supabase
    .from('health_metrics')
    .select('id, metric_type, value_primary, value_secondary, unit, measured_at')
    .eq('member_id', memberId)
    .order('measured_at', { ascending: false })
    .limit(10)
  
  if (error) {
    console.error('Error fetching metrics:', error)
    return []
  }
  
  return (metrics || []) as MetricQueryResult[]
}

/**
 * Calculate alerts specific to this member
 */
async function getMemberAlerts(memberId: string, memberName: string): Promise<HealthAlert[]> {
  const supabase = await createClient()
  const alerts: HealthAlert[] = []
  const today = new Date()
  
  // Check for active medications that might need attention
  const { data: medications } = await supabase
    .from('medications')
    .select('id, name, end_date')
    .eq('member_id', memberId)
    .eq('is_active', true)
  
  const typedMedications = (medications || []) as Pick<Medication, 'id' | 'name' | 'end_date'>[]
  
  typedMedications.forEach(med => {
    if (med.end_date) {
      const endDate = new Date(med.end_date)
      const daysUntilEnd = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysUntilEnd <= 7 && daysUntilEnd > 0) {
        alerts.push({
          id: `med-${med.id}`,
          type: 'medication',
          memberName,
          memberId,
          message: `Obat ${med.name} akan habis dalam ${daysUntilEnd} hari`,
          dueDate: med.end_date,
        })
      }
    }
  })
  
  // Check for upcoming doctor visits
  const { data: visits } = await supabase
    .from('doctor_visits')
    .select('id, doctor_name, visit_date, reason')
    .eq('member_id', memberId)
    .gte('visit_date', today.toISOString().split('T')[0])
    .order('visit_date')
    .limit(3)
  
  const typedVisits = (visits || []) as Pick<DoctorVisit, 'id' | 'doctor_name' | 'visit_date' | 'reason'>[]
  
  typedVisits.forEach(visit => {
    const visitDate = new Date(visit.visit_date)
    const daysUntil = Math.ceil((visitDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntil <= 7) {
      alerts.push({
        id: `visit-${visit.id}`,
        type: 'appointment',
        memberName,
        memberId,
        message: `Jadwal kontrol dengan ${visit.doctor_name}: ${visit.reason}`,
        dueDate: visit.visit_date,
      })
    }
  })
  
  return alerts
}

/**
 * Get initials from a name for avatar fallback
 */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Get icon for metric type
 */
function MetricIcon({ type }: { type: string }) {
  switch (type) {
    case 'weight':
      return <Scale className="h-4 w-4" />
    case 'height':
      return <Ruler className="h-4 w-4" />
    case 'blood_pressure':
      return <Activity className="h-4 w-4" />
    case 'heart_rate':
      return <Heart className="h-4 w-4" />
    case 'temperature':
      return <Thermometer className="h-4 w-4" />
    case 'blood_sugar':
      return <Droplets className="h-4 w-4" />
    case 'oxygen_saturation':
      return <TrendingUp className="h-4 w-4" />
    default:
      return <Activity className="h-4 w-4" />
  }
}

/**
 * Format metric value based on type
 */
function formatMetricValue(metric: MetricQueryResult): string {
  switch (metric.metric_type) {
    case 'weight':
      return formatWeight(metric.value_primary)
    case 'height':
      return formatHeight(metric.value_primary)
    case 'blood_pressure':
      return formatBloodPressure(metric.value_primary, metric.value_secondary ?? 0)
    case 'heart_rate':
      return formatHeartRate(metric.value_primary)
    case 'temperature':
      return formatTemperature(metric.value_primary)
    case 'blood_sugar':
      return formatBloodSugar(metric.value_primary)
    case 'oxygen_saturation':
      return formatOxygenSaturation(metric.value_primary)
    default:
      return `${metric.value_primary} ${metric.unit}`
  }
}

/**
 * Member Header Component
 */
function MemberHeader({ member }: { member: MemberWithProfile }) {
  const initials = getInitials(member.name)
  const age = member.birth_date ? formatAge(member.birth_date) : null
  const profile = member.health_profiles
  
  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
      {/* Avatar */}
      <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
        {member.avatar_url && (
          <AvatarImage src={member.avatar_url} alt={member.name} />
        )}
        <AvatarFallback className="text-2xl font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
      
      {/* Info */}
      <div className="flex-1 space-y-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{member.name}</h1>
          {age && (
            <p className="text-muted-foreground">{age}</p>
          )}
        </div>
        
        {/* Quick Info Badges */}
        <div className="flex flex-wrap gap-2">
          {profile?.blood_type && profile.blood_type !== 'Unknown' && (
            <Badge variant="outline" className="gap-1">
              <Droplets className="h-3 w-3" />
              {LABELS.bloodType}: {profile.blood_type}
            </Badge>
          )}
          
          {profile?.allergies && profile.allergies.length > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              {profile.allergies.length} {LABELS.allergies}
            </Badge>
          )}
        </div>
        
        {/* Allergies List */}
        {profile?.allergies && profile.allergies.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {profile.allergies.map((allergy, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {allergy}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Health Metrics Summary Component
 */
function HealthMetricsSummary({ metrics }: { metrics: MetricQueryResult[] }) {
  if (metrics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{LABELS.sections.recentMetrics}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>{LABELS.sections.noMetrics}</p>
            <Button variant="outline" size="sm" className="mt-4">
              {LABELS.sections.addFirstMetric}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  // Group metrics by type and get the latest of each
  const latestByType = metrics.reduce((acc, metric) => {
    if (!acc[metric.metric_type]) {
      acc[metric.metric_type] = metric
    }
    return acc
  }, {} as Record<string, MetricQueryResult>)
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{LABELS.sections.recentMetrics}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.values(latestByType).map((metric) => (
            <div 
              key={metric.id} 
              className="flex flex-col p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <MetricIcon type={metric.metric_type} />
                <span className="text-xs font-medium">
                  {LABELS.metricTypes[metric.metric_type as keyof typeof LABELS.metricTypes] || metric.metric_type}
                </span>
              </div>
              <span className="text-lg font-semibold">
                {formatMetricValue(metric)}
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                {formatRelative(metric.measured_at)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Tab Placeholder Component for future content
 */
function TabPlaceholder({ tabName }: { tabName: string }) {
  return (
    <Card>
      <CardContent className="py-12">
        <div className="text-center text-muted-foreground">
          <Badge variant="secondary" className="mb-3">
            {LABELS.comingSoon}
          </Badge>
          <p>{LABELS.tabPlaceholder(tabName)}</p>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Member Dashboard Page - Individual member health view
 * 
 * This is a Server Component that displays:
 * - Member header with avatar, name, age, blood type, allergies
 * - Tabs for different health sections
 * - Recent health metrics summary
 * - Member-specific alerts
 */
export default async function MemberDashboardPage({ params }: MemberDashboardPageProps) {
  const { memberId } = await params
  
  // Fetch member data
  const member = await getMemberWithProfile(memberId)
  
  // Handle member not found
  if (!member) {
    notFound()
  }
  
  // Fetch additional data in parallel
  const [metrics, alerts] = await Promise.all([
    getRecentMetrics(memberId),
    getMemberAlerts(memberId, member.name),
  ])
  
  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <Link 
        href="/dashboard" 
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {LABELS.backToDashboard}
      </Link>
      
      {/* Member Header */}
      <MemberHeader member={member} />
      
      {/* Member Alerts */}
      {alerts.length > 0 && (
        <AlertsSection alerts={alerts} />
      )}
      
      {/* Tabs Navigation */}
      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="w-full sm:w-auto overflow-x-auto">
          <TabsTrigger value="metrics" className="gap-1.5">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">{LABELS.tabs.metrics}</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-1.5">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">{LABELS.tabs.documents}</span>
          </TabsTrigger>
          <TabsTrigger value="vaccinations" className="gap-1.5">
            <Syringe className="h-4 w-4" />
            <span className="hidden sm:inline">{LABELS.tabs.vaccinations}</span>
          </TabsTrigger>
          <TabsTrigger value="medications" className="gap-1.5">
            <Pill className="h-4 w-4" />
            <span className="hidden sm:inline">{LABELS.tabs.medications}</span>
          </TabsTrigger>
          <TabsTrigger value="visits" className="gap-1.5">
            <Stethoscope className="h-4 w-4" />
            <span className="hidden sm:inline">{LABELS.tabs.visits}</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Metrics Tab Content */}
        <TabsContent value="metrics" className="mt-6">
          <HealthMetricsSummary metrics={metrics} />
        </TabsContent>
        
        {/* Documents Tab Content - Placeholder */}
        <TabsContent value="documents" className="mt-6">
          <TabPlaceholder tabName={LABELS.tabs.documents} />
        </TabsContent>
        
        {/* Vaccinations Tab Content - Placeholder */}
        <TabsContent value="vaccinations" className="mt-6">
          <TabPlaceholder tabName={LABELS.tabs.vaccinations} />
        </TabsContent>
        
        {/* Medications Tab Content - Placeholder */}
        <TabsContent value="medications" className="mt-6">
          <TabPlaceholder tabName={LABELS.tabs.medications} />
        </TabsContent>
        
        {/* Visits Tab Content - Placeholder */}
        <TabsContent value="visits" className="mt-6">
          <TabPlaceholder tabName={LABELS.tabs.visits} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
