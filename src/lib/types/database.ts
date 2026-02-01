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
      medical_documents: {
        Row: {
          id: string
          family_id: string
          member_id: string
          title: string
          document_type: 'lab_result' | 'prescription' | 'medical_record' | 'imaging' | 'vaccination' | 'insurance' | 'referral' | 'other'
          file_path: string
          file_size: number | null
          mime_type: string | null
          document_date: string | null
          doctor_name: string | null
          hospital_name: string | null
          notes: string | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          family_id: string
          member_id: string
          title: string
          document_type: 'lab_result' | 'prescription' | 'medical_record' | 'imaging' | 'vaccination' | 'insurance' | 'referral' | 'other'
          file_path: string
          file_size?: number | null
          mime_type?: string | null
          document_date?: string | null
          doctor_name?: string | null
          hospital_name?: string | null
          notes?: string | null
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          family_id?: string
          member_id?: string
          title?: string
          document_type?: 'lab_result' | 'prescription' | 'medical_record' | 'imaging' | 'vaccination' | 'insurance' | 'referral' | 'other'
          file_path?: string
          file_size?: number | null
          mime_type?: string | null
          document_date?: string | null
          doctor_name?: string | null
          hospital_name?: string | null
          notes?: string | null
          created_at?: string
          created_by?: string | null
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
          doctor_name: string
          hospital_name: string | null
          specialty: string | null
          reason: string
          diagnosis: string | null
          treatment: string | null
          follow_up_date: string | null
          notes: string | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          family_id: string
          member_id: string
          visit_date: string
          doctor_name: string
          hospital_name?: string | null
          specialty?: string | null
          reason: string
          diagnosis?: string | null
          treatment?: string | null
          follow_up_date?: string | null
          notes?: string | null
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          family_id?: string
          member_id?: string
          visit_date?: string
          doctor_name?: string
          hospital_name?: string | null
          specialty?: string | null
          reason?: string
          diagnosis?: string | null
          treatment?: string | null
          follow_up_date?: string | null
          notes?: string | null
          created_at?: string
          created_by?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
export type Medication = Tables<'medications'>
export type MedicationLog = Tables<'medication_logs'>
export type DoctorVisit = Tables<'doctor_visits'>
export type HealthProfile = Tables<'health_profiles'>

// Insert types
export type InsertHealthProfile = InsertTables<'health_profiles'>

// Update types
export type UpdateHealthProfile = UpdateTables<'health_profiles'>

export type FamilyRole = FamilyMember['role']
export type MetricType = HealthMetric['metric_type']
export type DocumentType = MedicalDocument['document_type']

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
