import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { FamilyOverview, type FamilyMemberData } from '@/components/health/FamilyOverview'
import { AlertsSection, type HealthAlert } from '@/components/health/AlertsSection'
import { RecentActivity, type Activity } from '@/components/health/RecentActivity'
import { QuickAddFAB } from '@/components/health/QuickAddFAB'
import type { 
  FamilyMember, 
  HealthMetric, 
  Medication, 
  DoctorVisit, 
  MedicalDocument,
  MedicationLog,
  HealthProfile 
} from '@/lib/types/database'

/**
 * Page metadata
 */
export const metadata: Metadata = {
  title: 'Beranda | Atmando Health',
  description: 'Pantau kesehatan keluarga Anda dalam satu tempat',
}

/**
 * Indonesian labels for the dashboard
 */
const LABELS = {
  pageTitle: 'Kesehatan Keluarga',
  greeting: (name: string) => `Halo, ${name}!`,
  subtitle: 'Pantau kesehatan keluarga Anda',
} as const

/**
 * Type for family member with health profile from joined query
 */
type FamilyMemberWithHealthProfile = FamilyMember & {
  health_profiles: HealthProfile | null
}

/**
 * Type for metric from query
 */
type MetricQueryResult = Pick<HealthMetric, 'metric_type' | 'value_primary' | 'value_secondary' | 'measured_at'>

/**
 * Fetch family members with their health data
 */
async function getFamilyMembers(): Promise<FamilyMemberData[]> {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return []
  }
  
  // Get user's family
  const { data: memberData } = await supabase
    .from('family_members')
    .select('family_id')
    .eq('user_id', user.id)
    .single()
  
  if (!memberData) {
    return []
  }
  
  const familyId = (memberData as { family_id: string }).family_id
  
  // Get all family members with their health profiles
  const { data: members, error } = await supabase
    .from('family_members')
    .select(`
      id,
      name,
      avatar_url,
      birth_date,
      health_profiles (
        blood_type,
        allergies,
        conditions
      )
    `)
    .eq('family_id', familyId)
    .order('name')
  
  if (error || !members) {
    console.error('Error fetching family members:', error)
    return []
  }
  
  // Cast to proper type
  const typedMembers = members as unknown as FamilyMemberWithHealthProfile[]
  
  // Get latest metrics for each member
  const membersWithMetrics: FamilyMemberData[] = await Promise.all(
    typedMembers.map(async (member) => {
      const { data: metrics } = await supabase
        .from('health_metrics')
        .select('metric_type, value_primary, value_secondary, measured_at')
        .eq('member_id', member.id)
        .order('measured_at', { ascending: false })
        .limit(3)
      
      const typedMetrics = (metrics || []) as MetricQueryResult[]
      
      return {
        id: member.id,
        name: member.name,
        avatarUrl: member.avatar_url,
        birthDate: member.birth_date || '',
        latestMetrics: typedMetrics.map(m => ({
          type: m.metric_type,
          value: m.value_primary,
          valueSecondary: m.value_secondary ?? undefined,
          measuredAt: m.measured_at,
        })),
        alerts: [], // Will be populated by calculateAlerts
      }
    })
  )
  
  return membersWithMetrics
}

/**
 * Calculate health alerts (due vaccinations, medications, appointments)
 */
async function calculateAlerts(): Promise<HealthAlert[]> {
  const supabase = await createClient()
  const alerts: HealthAlert[] = []
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return alerts
  }
  
  // Get user's family
  const { data: memberData } = await supabase
    .from('family_members')
    .select('family_id')
    .eq('user_id', user.id)
    .single()
  
  if (!memberData) {
    return alerts
  }
  
  const familyId = (memberData as { family_id: string }).family_id
  
  // Get family members for name lookup
  const { data: members } = await supabase
    .from('family_members')
    .select('id, name')
    .eq('family_id', familyId)
  
  const typedMembers = (members || []) as Pick<FamilyMember, 'id' | 'name'>[]
  const memberMap = new Map(typedMembers.map(m => [m.id, m.name]))
  
  // Check for active medications that might need attention
  const { data: medications } = await supabase
    .from('medications')
    .select('id, member_id, name, end_date')
    .eq('family_id', familyId)
    .eq('is_active', true)
  
  const typedMedications = (medications || []) as Pick<Medication, 'id' | 'member_id' | 'name' | 'end_date'>[]
  
  const today = new Date()
  typedMedications.forEach(med => {
    if (med.end_date) {
      const endDate = new Date(med.end_date)
      const daysUntilEnd = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysUntilEnd <= 7 && daysUntilEnd > 0) {
        alerts.push({
          id: `med-${med.id}`,
          type: 'medication',
          memberName: memberMap.get(med.member_id) || 'Unknown',
          memberId: med.member_id,
          message: `Obat ${med.name} akan habis dalam ${daysUntilEnd} hari`,
          dueDate: med.end_date,
        })
      }
    }
  })
  
  // Check for upcoming doctor visits
  const { data: visits } = await supabase
    .from('doctor_visits')
    .select('id, member_id, doctor_name, visit_date, reason')
    .eq('family_id', familyId)
    .gte('visit_date', new Date().toISOString().split('T')[0])
    .order('visit_date')
    .limit(5)
  
  const typedVisits = (visits || []) as Pick<DoctorVisit, 'id' | 'member_id' | 'doctor_name' | 'visit_date' | 'reason'>[]
  
  typedVisits.forEach(visit => {
    const visitDate = new Date(visit.visit_date)
    const daysUntil = Math.ceil((visitDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntil <= 7) {
      alerts.push({
        id: `visit-${visit.id}`,
        type: 'appointment',
        memberName: memberMap.get(visit.member_id) || 'Unknown',
        memberId: visit.member_id,
        message: `Jadwal kontrol dengan ${visit.doctor_name}: ${visit.reason}`,
        dueDate: visit.visit_date,
      })
    }
  })
  
  return alerts
}

/**
 * Get recent health activities across the family
 */
async function getRecentActivity(): Promise<Activity[]> {
  const supabase = await createClient()
  const activities: Activity[] = []
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return activities
  }
  
  // Get user's family
  const { data: memberData } = await supabase
    .from('family_members')
    .select('family_id')
    .eq('user_id', user.id)
    .single()
  
  if (!memberData) {
    return activities
  }
  
  const familyId = (memberData as { family_id: string }).family_id
  
  // Get family members for name lookup
  const { data: members } = await supabase
    .from('family_members')
    .select('id, name')
    .eq('family_id', familyId)
  
  const typedMembers = (members || []) as Pick<FamilyMember, 'id' | 'name'>[]
  const memberMap = new Map(typedMembers.map(m => [m.id, m.name]))
  
  // Get recent health metrics
  const { data: metrics } = await supabase
    .from('health_metrics')
    .select('id, member_id, metric_type, value_primary, value_secondary, unit, created_at')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false })
    .limit(5)
  
  const typedMetrics = (metrics || []) as Pick<HealthMetric, 'id' | 'member_id' | 'metric_type' | 'value_primary' | 'value_secondary' | 'unit' | 'created_at'>[]
  
  typedMetrics.forEach(metric => {
    const memberName = memberMap.get(metric.member_id) || 'Unknown'
    const metricLabel = getMetricLabel(metric.metric_type)
    const value = formatMetricValue(metric.metric_type, metric.value_primary, metric.value_secondary, metric.unit)
    
    activities.push({
      id: `metric-${metric.id}`,
      type: 'metric',
      memberName,
      memberId: metric.member_id,
      description: `${memberName} menambahkan ${metricLabel}: ${value}`,
      createdAt: metric.created_at,
    })
  })
  
  // Get recent documents
  const { data: documents } = await supabase
    .from('medical_documents')
    .select('id, member_id, title, document_type, created_at')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false })
    .limit(3)
  
  const typedDocuments = (documents || []) as Pick<MedicalDocument, 'id' | 'member_id' | 'title' | 'document_type' | 'created_at'>[]
  
  typedDocuments.forEach(doc => {
    const memberName = memberMap.get(doc.member_id) || 'Unknown'
    
    activities.push({
      id: `doc-${doc.id}`,
      type: 'document',
      memberName,
      memberId: doc.member_id,
      description: `${memberName} mengunggah dokumen: ${doc.title}`,
      createdAt: doc.created_at,
    })
  })
  
  // Get recent medication logs - simplified query without join
  const { data: medLogs } = await supabase
    .from('medication_logs')
    .select('id, medication_id, taken_at, status')
    .order('taken_at', { ascending: false })
    .limit(5)
  
  if (medLogs && medLogs.length > 0) {
    const typedMedLogs = medLogs as Pick<MedicationLog, 'id' | 'medication_id' | 'taken_at' | 'status'>[]
    
    // Get medication details for the logs
    const medicationIds = typedMedLogs.map(log => log.medication_id)
    const { data: medicationsData } = await supabase
      .from('medications')
      .select('id, member_id, name')
      .in('id', medicationIds)
    
    const typedMedicationsData = (medicationsData || []) as Pick<Medication, 'id' | 'member_id' | 'name'>[]
    const medicationMap = new Map(typedMedicationsData.map(m => [m.id, m]))
    
    typedMedLogs.forEach(log => {
      const med = medicationMap.get(log.medication_id)
      if (med) {
        const memberName = memberMap.get(med.member_id) || 'Unknown'
        const statusLabel = log.status === 'taken' ? 'meminum' : log.status === 'skipped' ? 'melewatkan' : 'terlambat meminum'
        
        activities.push({
          id: `medlog-${log.id}`,
          type: 'medication',
          memberName,
          memberId: med.member_id,
          description: `${memberName} ${statusLabel} obat ${med.name}`,
          createdAt: log.taken_at,
        })
      }
    })
  }
  
  // Sort all activities by date and return top 10
  return activities
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)
}

/**
 * Get Indonesian label for metric type
 */
function getMetricLabel(type: string): string {
  const labels: Record<string, string> = {
    weight: 'berat badan',
    height: 'tinggi badan',
    blood_pressure: 'tekanan darah',
    blood_sugar: 'gula darah',
    heart_rate: 'detak jantung',
    temperature: 'suhu tubuh',
    oxygen_saturation: 'saturasi oksigen',
    bmi: 'BMI',
  }
  return labels[type] || type
}

/**
 * Format metric value with unit
 */
function formatMetricValue(
  type: string,
  primary: number,
  secondary: number | null,
  unit: string
): string {
  if (type === 'blood_pressure' && secondary !== null) {
    return `${Math.round(primary)}/${Math.round(secondary)} ${unit}`
  }
  return `${primary} ${unit}`
}

/**
 * Dashboard Page - Main family health overview
 * 
 * This is a Server Component that displays:
 * - Health alerts (due vaccinations, medications, appointments)
 * - Family member cards with latest health status
 * - Recent activity feed
 * - Quick add floating action button
 */
export default async function DashboardPage() {
  // Fetch all data in parallel
  const [familyMembers, alerts, recentActivity] = await Promise.all([
    getFamilyMembers(),
    calculateAlerts(),
    getRecentActivity(),
  ])
  
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {LABELS.pageTitle}
        </h1>
        <p className="text-muted-foreground">
          {LABELS.subtitle}
        </p>
      </div>
      
      {/* Alerts Section */}
      <AlertsSection alerts={alerts} />
      
      {/* Family Overview Grid */}
      <FamilyOverview members={familyMembers} />
      
      {/* Recent Activity Feed */}
      <RecentActivity activities={recentActivity} limit={5} />
      
      {/* Quick Add FAB */}
      <QuickAddFAB />
    </div>
  )
}
