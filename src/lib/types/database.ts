// Placeholder types - regenerate with: npx supabase gen types typescript --project-id [PROJECT_ID]

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      families: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      family_members: {
        Row: {
          id: string
          family_id: string
          user_id: string
          name: string
          role: 'admin' | 'parent' | 'child' | 'staff' | 'viewer'
          avatar_url: string | null
          birth_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          family_id: string
          user_id: string
          name: string
          role: 'admin' | 'parent' | 'child' | 'staff' | 'viewer'
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          user_id?: string
          name?: string
          role?: 'admin' | 'parent' | 'child' | 'staff' | 'viewer'
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
        }
      }
      health_metrics: {
        Row: {
          id: string
          family_id: string
          member_id: string
          metric_type: 'weight' | 'height' | 'blood_pressure' | 'blood_sugar' | 'heart_rate' | 'temperature' | 'oxygen_saturation' | 'bmi'
          value_primary: number
          value_secondary: number | null
          unit: string
          measured_at: string
          notes: string | null
          source: string
          source_id: string | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          family_id: string
          member_id: string
          metric_type: 'weight' | 'height' | 'blood_pressure' | 'blood_sugar' | 'heart_rate' | 'temperature' | 'oxygen_saturation' | 'bmi'
          value_primary: number
          value_secondary?: number | null
          unit: string
          measured_at?: string
          notes?: string | null
          source?: string
          source_id?: string | null
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          family_id?: string
          member_id?: string
          metric_type?: 'weight' | 'height' | 'blood_pressure' | 'blood_sugar' | 'heart_rate' | 'temperature' | 'oxygen_saturation' | 'bmi'
          value_primary?: number
          value_secondary?: number | null
          unit?: string
          measured_at?: string
          notes?: string | null
          source?: string
          source_id?: string | null
          created_at?: string
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "health_metrics_family_id_fkey"
            columns: ["family_id"]
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_metrics_member_id_fkey"
            columns: ["member_id"]
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          }
        ]
      }
      health_document_categories: {
        Row: {
          id: string
          family_id: string
          name: string
          icon: string
          color: string
          sort_order: number
          is_system: boolean
          created_at: string
        }
        Insert: {
          id?: string
          family_id: string
          name: string
          icon?: string
          color?: string
          sort_order?: number
          is_system?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          name?: string
          icon?: string
          color?: string
          sort_order?: number
          is_system?: boolean
          created_at?: string
        }
      }
      medical_documents: {
        Row: {
          id: string
          family_id: string
          member_id: string
          title: string
          document_type: 'lab_result' | 'prescription' | 'medical_record' | 'imaging' | 'vaccination' | 'insurance' | 'referral' | 'other'
          category_id: string | null
          file_path: string
          file_size: number | null
          mime_type: string | null
          document_date: string | null
          doctor_name: string | null
          hospital_name: string | null
          notes: string | null
          ocr_text: string | null
          is_ocr_processed: boolean
          tags: string[] | null
          created_at: string
          created_by: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          family_id: string
          member_id: string
          title: string
          document_type: 'lab_result' | 'prescription' | 'medical_record' | 'imaging' | 'vaccination' | 'insurance' | 'referral' | 'other'
          category_id?: string | null
          file_path: string
          file_size?: number | null
          mime_type?: string | null
          document_date?: string | null
          doctor_name?: string | null
          hospital_name?: string | null
          notes?: string | null
          ocr_text?: string | null
          is_ocr_processed?: boolean
          tags?: string[] | null
          created_at?: string
          created_by?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          member_id?: string
          title?: string
          document_type?: 'lab_result' | 'prescription' | 'medical_record' | 'imaging' | 'vaccination' | 'insurance' | 'referral' | 'other'
          category_id?: string | null
          file_path?: string
          file_size?: number | null
          mime_type?: string | null
          document_date?: string | null
          doctor_name?: string | null
          hospital_name?: string | null
          notes?: string | null
          ocr_text?: string | null
          is_ocr_processed?: boolean
          tags?: string[] | null
          created_at?: string
          created_by?: string | null
          updated_at?: string
        }
      }
      medications: {
        Row: {
          id: string
          family_id: string
          member_id: string
          name: string
          dosage: string
          frequency: string
          instructions: string | null
          start_date: string
          end_date: string | null
          prescribing_doctor: string | null
          is_active: boolean
          notes: string | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          family_id: string
          member_id: string
          name: string
          dosage: string
          frequency: string
          instructions?: string | null
          start_date: string
          end_date?: string | null
          prescribing_doctor?: string | null
          is_active?: boolean
          notes?: string | null
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          family_id?: string
          member_id?: string
          name?: string
          dosage?: string
          frequency?: string
          instructions?: string | null
          start_date?: string
          end_date?: string | null
          prescribing_doctor?: string | null
          is_active?: boolean
          notes?: string | null
          created_at?: string
          created_by?: string | null
        }
      }
      medication_logs: {
        Row: {
          id: string
          medication_id: string
          taken_at: string
          status: 'taken' | 'skipped' | 'late'
          notes: string | null
          logged_by: string | null
        }
        Insert: {
          id?: string
          medication_id: string
          taken_at?: string
          status: 'taken' | 'skipped' | 'late'
          notes?: string | null
          logged_by?: string | null
        }
        Update: {
          id?: string
          medication_id?: string
          taken_at?: string
          status?: 'taken' | 'skipped' | 'late'
          notes?: string | null
          logged_by?: string | null
        }
      }
      doctor_visits: {
        Row: {
          id: string
          family_id: string
          member_id: string
          visit_date: string
          visit_time: string | null
          visit_type: 'checkup' | 'sick_visit' | 'follow_up' | 'emergency' | 'specialist' | 'vaccination' | 'other'
          status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
          doctor_name: string
          hospital_name: string | null
          facility_phone: string | null
          specialty: string | null
          reason: string
          diagnosis: string | null
          treatment: string | null
          follow_up_date: string | null
          notes: string | null
          reminder_enabled: boolean
          reminder_sent: boolean
          created_at: string
          created_by: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          family_id: string
          member_id: string
          visit_date: string
          visit_time?: string | null
          visit_type?: 'checkup' | 'sick_visit' | 'follow_up' | 'emergency' | 'specialist' | 'vaccination' | 'other'
          status?: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
          doctor_name: string
          hospital_name?: string | null
          facility_phone?: string | null
          specialty?: string | null
          reason: string
          diagnosis?: string | null
          treatment?: string | null
          follow_up_date?: string | null
          notes?: string | null
          reminder_enabled?: boolean
          reminder_sent?: boolean
          created_at?: string
          created_by?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          member_id?: string
          visit_date?: string
          visit_time?: string | null
          visit_type?: 'checkup' | 'sick_visit' | 'follow_up' | 'emergency' | 'specialist' | 'vaccination' | 'other'
          status?: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
          doctor_name?: string
          hospital_name?: string | null
          facility_phone?: string | null
          specialty?: string | null
          reason?: string
          diagnosis?: string | null
          treatment?: string | null
          follow_up_date?: string | null
          notes?: string | null
          reminder_enabled?: boolean
          reminder_sent?: boolean
          created_at?: string
          created_by?: string | null
          updated_at?: string
        }
      }
      health_profiles: {
        Row: {
          id: string
          family_member_id: string
          blood_type: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Unknown' | null
          allergies: string[] | null
          conditions: string[] | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          insurance_provider: string | null
          insurance_number: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          family_member_id: string
          blood_type?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Unknown' | null
          allergies?: string[] | null
          conditions?: string[] | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          insurance_provider?: string | null
          insurance_number?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          family_member_id?: string
          blood_type?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Unknown' | null
          allergies?: string[] | null
          conditions?: string[] | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          insurance_provider?: string | null
          insurance_number?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      vaccinations: {
        Row: {
          id: string
          family_id: string
          member_id: string
          vaccine_name: string
          vaccine_code: string | null
          dose_number: number
          date_given: string | null
          date_due: string | null
          location: string | null
          administered_by: string | null
          batch_number: string | null
          document_id: string | null
          notes: string | null
          reminder_enabled: boolean
          reminder_sent: boolean
          created_at: string
          created_by: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          family_id: string
          member_id: string
          vaccine_name: string
          vaccine_code?: string | null
          dose_number?: number
          date_given?: string | null
          date_due?: string | null
          location?: string | null
          administered_by?: string | null
          batch_number?: string | null
          document_id?: string | null
          notes?: string | null
          reminder_enabled?: boolean
          reminder_sent?: boolean
          created_at?: string
          created_by?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          member_id?: string
          vaccine_name?: string
          vaccine_code?: string | null
          dose_number?: number
          date_given?: string | null
          date_due?: string | null
          location?: string | null
          administered_by?: string | null
          batch_number?: string | null
          document_id?: string | null
          notes?: string | null
          reminder_enabled?: boolean
          reminder_sent?: boolean
          created_at?: string
          created_by?: string | null
          updated_at?: string
        }
      }
      emergency_tokens: {
        Row: {
          id: string
          family_member_id: string
          token: string
          expires_at: string
          access_count: number
          last_accessed_at: string | null
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          family_member_id: string
          token: string
          expires_at?: string
          access_count?: number
          last_accessed_at?: string | null
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          family_member_id?: string
          token?: string
          expires_at?: string
          access_count?: number
          last_accessed_at?: string | null
          created_at?: string
          created_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_tokens_family_member_id_fkey"
            columns: ["family_member_id"]
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_tokens_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      health_connected_accounts: {
        Row: {
          id: string
          user_id: string
          family_member_id: string
          provider: 'garmin' | 'apple_health' | 'fitbit' | 'google_fit'
          provider_user_id: string | null
          access_token: string | null
          access_token_secret: string | null
          refresh_token: string | null
          token_expires_at: string | null
          last_sync_at: string | null
          last_sync_status: 'success' | 'failed' | 'partial' | null
          last_sync_error: string | null
          sync_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          family_member_id: string
          provider: 'garmin' | 'apple_health' | 'fitbit' | 'google_fit'
          provider_user_id?: string | null
          access_token?: string | null
          access_token_secret?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          last_sync_at?: string | null
          last_sync_status?: 'success' | 'failed' | 'partial' | null
          last_sync_error?: string | null
          sync_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          family_member_id?: string
          provider?: 'garmin' | 'apple_health' | 'fitbit' | 'google_fit'
          provider_user_id?: string | null
          access_token?: string | null
          access_token_secret?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          last_sync_at?: string | null
          last_sync_status?: 'success' | 'failed' | 'partial' | null
          last_sync_error?: string | null
          sync_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_connected_accounts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_connected_accounts_family_member_id_fkey"
            columns: ["family_member_id"]
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          }
        ]
      }
      vaccination_schedule: {
        Row: {
          id: string
          vaccine_name: string
          vaccine_code: string | null
          dose_number: number
          age_months_min: number
          age_months_max: number | null
          description: string | null
          is_mandatory: boolean
          sort_order: number
        }
        Insert: {
          id?: string
          vaccine_name: string
          vaccine_code?: string | null
          dose_number?: number
          age_months_min: number
          age_months_max?: number | null
          description?: string | null
          is_mandatory?: boolean
          sort_order?: number
        }
        Update: {
          id?: string
          vaccine_name?: string
          vaccine_code?: string | null
          dose_number?: number
          age_months_min?: number
          age_months_max?: number | null
          description?: string | null
          is_mandatory?: boolean
          sort_order?: number
        }
      }
      health_growth_records: {
        Row: {
          id: string
          family_id: string
          member_id: string
          measured_at: string
          height_cm: number | null
          weight_kg: number | null
          head_circumference_cm: number | null
          height_percentile: number | null
          weight_percentile: number | null
          bmi_percentile: number | null
          head_circumference_percentile: number | null
          bmi: number | null
          age_months: number | null
          notes: string | null
          source: string
          created_at: string
          created_by: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          family_id: string
          member_id: string
          measured_at: string
          height_cm?: number | null
          weight_kg?: number | null
          head_circumference_cm?: number | null
          height_percentile?: number | null
          weight_percentile?: number | null
          bmi_percentile?: number | null
          head_circumference_percentile?: number | null
          bmi?: number | null
          age_months?: number | null
          notes?: string | null
          source?: string
          created_at?: string
          created_by?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          member_id?: string
          measured_at?: string
          height_cm?: number | null
          weight_kg?: number | null
          head_circumference_cm?: number | null
          height_percentile?: number | null
          weight_percentile?: number | null
          bmi_percentile?: number | null
          head_circumference_percentile?: number | null
          bmi?: number | null
          age_months?: number | null
          notes?: string | null
          source?: string
          created_at?: string
          created_by?: string | null
          updated_at?: string
        }
      }
      health_milestones: {
        Row: {
          id: string
          family_id: string
          member_id: string
          milestone_type: 'motor' | 'language' | 'social' | 'cognitive'
          milestone_name: string
          achieved_date: string | null
          age_months: number | null
          notes: string | null
          photo_url: string | null
          created_at: string
          created_by: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          family_id: string
          member_id: string
          milestone_type: 'motor' | 'language' | 'social' | 'cognitive'
          milestone_name: string
          achieved_date?: string | null
          age_months?: number | null
          notes?: string | null
          photo_url?: string | null
          created_at?: string
          created_by?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          member_id?: string
          milestone_type?: 'motor' | 'language' | 'social' | 'cognitive'
          milestone_name?: string
          achieved_date?: string | null
          age_months?: number | null
          notes?: string | null
          photo_url?: string | null
          created_at?: string
          created_by?: string | null
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_or_create_emergency_token: {
        Args: {
          member_id: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Convenience types
export type Family = Tables<'families'>
export type FamilyMember = Tables<'family_members'>
export type HealthMetric = Tables<'health_metrics'>
export type MedicalDocument = Tables<'medical_documents'>
export type DocumentCategory = Tables<'health_document_categories'>
export type Medication = Tables<'medications'>
export type MedicationLog = Tables<'medication_logs'>
export type DoctorVisit = Tables<'doctor_visits'>
export type HealthProfile = Tables<'health_profiles'>
export type Vaccination = Tables<'vaccinations'>
export type VaccinationSchedule = Tables<'vaccination_schedule'>
export type EmergencyToken = Tables<'emergency_tokens'>
export type HealthConnectedAccount = Tables<'health_connected_accounts'>
export type GrowthRecord = Tables<'health_growth_records'>
export type Milestone = Tables<'health_milestones'>

// Insert types
export type InsertHealthProfile = InsertTables<'health_profiles'>
export type InsertMedicalDocument = InsertTables<'medical_documents'>
export type InsertDocumentCategory = InsertTables<'health_document_categories'>
export type InsertVaccination = InsertTables<'vaccinations'>
export type InsertDoctorVisit = InsertTables<'doctor_visits'>

// Update types
export type UpdateHealthProfile = UpdateTables<'health_profiles'>
export type UpdateMedicalDocument = UpdateTables<'medical_documents'>
export type UpdateVaccination = UpdateTables<'vaccinations'>
export type UpdateDoctorVisit = UpdateTables<'doctor_visits'>

// Growth types
export type InsertGrowthRecord = InsertTables<'health_growth_records'>
export type UpdateGrowthRecord = UpdateTables<'health_growth_records'>
export type InsertMilestone = InsertTables<'health_milestones'>
export type UpdateMilestone = UpdateTables<'health_milestones'>
export type MilestoneType = Milestone['milestone_type']

// Growth record with member info
export type GrowthRecordWithMember = GrowthRecord & {
  family_members: Pick<FamilyMember, 'id' | 'name' | 'avatar_url' | 'birth_date'> | null
}

// Milestone with member info
export type MilestoneWithMember = Milestone & {
  family_members: Pick<FamilyMember, 'id' | 'name' | 'avatar_url'> | null
}

export type FamilyRole = FamilyMember['role']
export type MetricType = HealthMetric['metric_type']
export type DocumentType = MedicalDocument['document_type']
export type VisitType = DoctorVisit['visit_type']
export type VisitStatus = DoctorVisit['status']

// Visit type labels in Indonesian
export const VISIT_TYPE_LABELS: Record<VisitType, string> = {
  checkup: 'Pemeriksaan Rutin',
  sick_visit: 'Sakit',
  follow_up: 'Kontrol',
  emergency: 'Darurat',
  specialist: 'Spesialis',
  vaccination: 'Vaksinasi',
  other: 'Lainnya',
}

// Visit status labels in Indonesian
export const VISIT_STATUS_LABELS: Record<VisitStatus, string> = {
  scheduled: 'Terjadwal',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
  no_show: 'Tidak Hadir',
}

// Vaccination status type
export type VaccinationStatus = 'completed' | 'due' | 'overdue' | 'upcoming'

// Vaccination with member info
export type VaccinationWithMember = Vaccination & {
  family_members: Pick<FamilyMember, 'id' | 'name' | 'avatar_url' | 'birth_date'> | null
}

// Doctor visit with member info
export type DoctorVisitWithMember = DoctorVisit & {
  family_members: Pick<FamilyMember, 'id' | 'name' | 'avatar_url'> | null
}

// Document with relations
export type MedicalDocumentWithRelations = MedicalDocument & {
  family_members: Pick<FamilyMember, 'id' | 'name' | 'avatar_url'> | null
  health_document_categories: Pick<DocumentCategory, 'id' | 'name' | 'icon' | 'color'> | null
}

// Document category constants
export const DOCUMENT_CATEGORIES = [
  { name: 'Lab Results', icon: '🔬', color: '#8B5CF6' },
  { name: 'Prescription', icon: '💊', color: '#EC4899' },
  { name: 'Vaccination', icon: '💉', color: '#10B981' },
  { name: 'Checkup', icon: '🩺', color: '#3B82F6' },
  { name: 'X-Ray/Imaging', icon: '📷', color: '#F59E0B' },
  { name: 'Insurance', icon: '📋', color: '#6366F1' },
  { name: 'Referral', icon: '📨', color: '#14B8A6' },
  { name: 'Hospital', icon: '🏥', color: '#EF4444' },
  { name: 'Pathology', icon: '🧪', color: '#A855F7' },
  { name: 'Other', icon: '📄', color: '#6B7280' },
] as const

// Blood type enum
export type BloodType = NonNullable<HealthProfile['blood_type']>

// Blood type options for dropdowns
export const BLOOD_TYPE_OPTIONS: BloodType[] = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'
] as const

// Family member with health profile (for joined queries)
export type FamilyMemberWithProfile = FamilyMember & {
  health_profiles: HealthProfile | null
}

// Medication frequency labels in Indonesian
export const MEDICATION_FREQUENCIES: Record<string, string> = {
  once_daily: 'Sekali sehari',
  twice_daily: '2x sehari',
  three_times_daily: '3x sehari',
  four_times_daily: '4x sehari',
  every_8_hours: 'Setiap 8 jam',
  every_12_hours: 'Setiap 12 jam',
  as_needed: 'Bila perlu',
  weekly: 'Seminggu sekali',
  monthly: 'Sebulan sekali',
} as const

// Medication instruction labels in Indonesian
export const MEDICATION_INSTRUCTIONS: Record<string, string> = {
  before_meal: 'Sebelum makan',
  after_meal: 'Sesudah makan',
  with_meal: 'Bersama makan',
  empty_stomach: 'Perut kosong',
  before_sleep: 'Sebelum tidur',
  morning: 'Pagi hari',
} as const

// Medication with member info
export type MedicationWithMember = Medication & {
  family_members: Pick<FamilyMember, 'id' | 'name' | 'avatar_url'> | null
}

// Medication log status type
export type MedicationLogStatus = MedicationLog['status']

// Connected account provider type
export type ConnectedAccountProvider = HealthConnectedAccount['provider']

// Provider labels in Indonesian
export const PROVIDER_LABELS: Record<ConnectedAccountProvider, string> = {
  garmin: 'Garmin Connect',
  apple_health: 'Apple Health',
  fitbit: 'Fitbit',
  google_fit: 'Google Fit',
} as const

// Provider icons
export const PROVIDER_ICONS: Record<ConnectedAccountProvider, string> = {
  garmin: '⌚',
  apple_health: '🍎',
  fitbit: '💪',
  google_fit: '🏃',
} as const

// Sync status labels in Indonesian
export const SYNC_STATUS_LABELS: Record<string, string> = {
  success: 'Berhasil',
  failed: 'Gagal',
  partial: 'Sebagian',
} as const
