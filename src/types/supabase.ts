export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      aid_items: {
        Row: {
          beneficiary_id: string | null
          case_id: string | null
          category: string
          created_at: string | null
          distributed_at: string | null
          distributed_by: string | null
          id: string
          item_name: string
          notes: string | null
          quantity: number | null
          unit: string | null
          value: number | null
        }
        Insert: {
          beneficiary_id?: string | null
          case_id?: string | null
          category: string
          created_at?: string | null
          distributed_at?: string | null
          distributed_by?: string | null
          id?: string
          item_name: string
          notes?: string | null
          quantity?: number | null
          unit?: string | null
          value?: number | null
        }
        Update: {
          beneficiary_id?: string | null
          case_id?: string | null
          category?: string
          created_at?: string | null
          distributed_at?: string | null
          distributed_by?: string | null
          id?: string
          item_name?: string
          notes?: string | null
          quantity?: number | null
          unit?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "aid_items_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aid_items_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aid_items_distributed_by_fkey"
            columns: ["distributed_by"]
            isOneToOne: false
            referencedRelation: "volunteers"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          created_at: string | null
          districts: string[] | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          message: string
          severity: string
          source: string | null
          starts_at: string | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          districts?: string[] | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          message: string
          severity: string
          source?: string | null
          starts_at?: string | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          districts?: string[] | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          message?: string
          severity?: string
          source?: string | null
          starts_at?: string | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          key_value: string
          last_used_at: string | null
          name: string
          service: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          key_value: string
          last_used_at?: string | null
          name: string
          service: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          key_value?: string
          last_used_at?: string | null
          name?: string
          service?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      beneficiaries: {
        Row: {
          address: string
          alternate_phone: string | null
          created_at: string | null
          district: string
          email: string | null
          gs_division: string | null
          household_size: number | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          national_id: string | null
          opt_in_email: boolean | null
          opt_in_sms: boolean | null
          phone: string
          total_aid_received: number | null
          updated_at: string | null
          village: string | null
          vulnerabilities: string[] | null
        }
        Insert: {
          address: string
          alternate_phone?: string | null
          created_at?: string | null
          district: string
          email?: string | null
          gs_division?: string | null
          household_size?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          national_id?: string | null
          opt_in_email?: boolean | null
          opt_in_sms?: boolean | null
          phone: string
          total_aid_received?: number | null
          updated_at?: string | null
          village?: string | null
          vulnerabilities?: string[] | null
        }
        Update: {
          address?: string
          alternate_phone?: string | null
          created_at?: string | null
          district?: string
          email?: string | null
          gs_division?: string | null
          household_size?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          national_id?: string | null
          opt_in_email?: boolean | null
          opt_in_sms?: boolean | null
          phone?: string
          total_aid_received?: number | null
          updated_at?: string | null
          village?: string | null
          vulnerabilities?: string[] | null
        }
        Relationships: []
      }
      broadcasts: {
        Row: {
          channels: string[] | null
          created_at: string | null
          id: string
          message: string
          recipients_count: number | null
          scheduled_for: string | null
          sent_at: string | null
          sent_by: string | null
          status: string | null
          target_districts: string[] | null
          target_roles: string[] | null
          title: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          channels?: string[] | null
          created_at?: string | null
          id?: string
          message: string
          recipients_count?: number | null
          scheduled_for?: string | null
          sent_at?: string | null
          sent_by?: string | null
          status?: string | null
          target_districts?: string[] | null
          target_roles?: string[] | null
          title: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          channels?: string[] | null
          created_at?: string | null
          id?: string
          message?: string
          recipients_count?: number | null
          scheduled_for?: string | null
          sent_at?: string | null
          sent_by?: string | null
          status?: string | null
          target_districts?: string[] | null
          target_roles?: string[] | null
          title?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      case_attachments: {
        Row: {
          case_id: string | null
          created_at: string | null
          file_size: number | null
          file_type: string | null
          filename: string
          id: string
          storage_path: string
          uploaded_by: string | null
        }
        Insert: {
          case_id?: string | null
          created_at?: string | null
          file_size?: number | null
          file_type?: string | null
          filename: string
          id?: string
          storage_path: string
          uploaded_by?: string | null
        }
        Update: {
          case_id?: string | null
          created_at?: string | null
          file_size?: number | null
          file_type?: string | null
          filename?: string
          id?: string
          storage_path?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_attachments_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_notes: {
        Row: {
          author_id: string | null
          author_name: string | null
          case_id: string | null
          content: string
          created_at: string | null
          id: string
          is_internal: boolean | null
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          case_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          case_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "case_notes_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          access_notes: string | null
          address: string | null
          assigned_volunteer_id: string | null
          beneficiary_id: string | null
          case_number: string
          category: string
          created_at: string | null
          description: string
          district: string | null
          gs_division: string | null
          id: string
          latitude: number | null
          longitude: number | null
          people_affected: number | null
          priority: string
          resolved_at: string | null
          sla_deadline: string | null
          status: string | null
          updated_at: string | null
          village: string | null
        }
        Insert: {
          access_notes?: string | null
          address?: string | null
          assigned_volunteer_id?: string | null
          beneficiary_id?: string | null
          case_number: string
          category: string
          created_at?: string | null
          description: string
          district?: string | null
          gs_division?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          people_affected?: number | null
          priority: string
          resolved_at?: string | null
          sla_deadline?: string | null
          status?: string | null
          updated_at?: string | null
          village?: string | null
        }
        Update: {
          access_notes?: string | null
          address?: string | null
          assigned_volunteer_id?: string | null
          beneficiary_id?: string | null
          case_number?: string
          category?: string
          created_at?: string | null
          description?: string
          district?: string | null
          gs_division?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          people_affected?: number | null
          priority?: string
          resolved_at?: string | null
          sla_deadline?: string | null
          status?: string | null
          updated_at?: string | null
          village?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cases_assigned_volunteer_id_fkey"
            columns: ["assigned_volunteer_id"]
            isOneToOne: false
            referencedRelation: "volunteers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          amount: number
          campaign_id: string | null
          created_at: string | null
          currency: string | null
          donor_email: string | null
          donor_name: string | null
          donor_phone: string | null
          id: string
          is_anonymous: boolean | null
          notes: string | null
          payment_method: string | null
          payment_reference: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          campaign_id?: string | null
          created_at?: string | null
          currency?: string | null
          donor_email?: string | null
          donor_name?: string | null
          donor_phone?: string | null
          id?: string
          is_anonymous?: boolean | null
          notes?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          campaign_id?: string | null
          created_at?: string | null
          currency?: string | null
          donor_email?: string | null
          donor_name?: string | null
          donor_phone?: string | null
          id?: string
          is_anonymous?: boolean | null
          notes?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      emergency_reports: {
        Row: {
          address: string | null
          case_id: string | null
          category: string
          created_at: string | null
          description: string
          district: string | null
          id: string
          latitude: number | null
          longitude: number | null
          reporter_name: string | null
          reporter_phone: string
          severity: string | null
          status: string | null
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          address?: string | null
          case_id?: string | null
          category: string
          created_at?: string | null
          description: string
          district?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          reporter_name?: string | null
          reporter_phone: string
          severity?: string | null
          status?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          address?: string | null
          case_id?: string | null
          category?: string
          created_at?: string | null
          description?: string
          district?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          reporter_name?: string | null
          reporter_phone?: string
          severity?: string | null
          status?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emergency_reports_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      flood_predictions: {
        Row: {
          affected_areas: string[] | null
          created_at: string | null
          district: string
          expected_rainfall: number | null
          expected_river_level: number | null
          id: string
          model_version: string | null
          prediction_date: string
          probability: number | null
          recommendations: string[] | null
          risk_level: string
          river_name: string | null
        }
        Insert: {
          affected_areas?: string[] | null
          created_at?: string | null
          district: string
          expected_rainfall?: number | null
          expected_river_level?: number | null
          id?: string
          model_version?: string | null
          prediction_date: string
          probability?: number | null
          recommendations?: string[] | null
          risk_level: string
          river_name?: string | null
        }
        Update: {
          affected_areas?: string[] | null
          created_at?: string | null
          district?: string
          expected_rainfall?: number | null
          expected_river_level?: number | null
          id?: string
          model_version?: string | null
          prediction_date?: string
          probability?: number | null
          recommendations?: string[] | null
          risk_level?: string
          river_name?: string | null
        }
        Relationships: []
      }
      missing_persons: {
        Row: {
          age: number | null
          contact_name: string
          contact_phone: string
          created_at: string | null
          description: string | null
          district: string | null
          found_at: string | null
          found_location: string | null
          gender: string | null
          id: string
          last_seen_date: string | null
          last_seen_location: string | null
          latitude: number | null
          longitude: number | null
          name: string
          notes: string | null
          photo_url: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          age?: number | null
          contact_name: string
          contact_phone: string
          created_at?: string | null
          description?: string | null
          district?: string | null
          found_at?: string | null
          found_location?: string | null
          gender?: string | null
          id?: string
          last_seen_date?: string | null
          last_seen_location?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          notes?: string | null
          photo_url?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          age?: number | null
          contact_name?: string
          contact_phone?: string
          created_at?: string | null
          description?: string | null
          district?: string | null
          found_at?: string | null
          found_location?: string | null
          gender?: string | null
          id?: string
          last_seen_date?: string | null
          last_seen_location?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          notes?: string | null
          photo_url?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notification_queue: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          message: string
          recipient: string
          retry_count: number | null
          scheduled_for: string | null
          sent_at: string | null
          status: string | null
          subject: string | null
          type: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          message: string
          recipient: string
          retry_count?: number | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          type: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          message?: string
          recipient?: string
          retry_count?: number | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          type?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          category: string
          created_at: string | null
          id: string
          last_restocked_at: string | null
          location: string | null
          min_stock_level: number | null
          name: string
          quantity: number | null
          shelter_id: string | null
          status: string | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          last_restocked_at?: string | null
          location?: string | null
          min_stock_level?: number | null
          name: string
          quantity?: number | null
          shelter_id?: string | null
          status?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          last_restocked_at?: string | null
          location?: string | null
          min_stock_level?: number | null
          name?: string
          quantity?: number | null
          shelter_id?: string | null
          status?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resources_shelter_id_fkey"
            columns: ["shelter_id"]
            isOneToOne: false
            referencedRelation: "shelters"
            referencedColumns: ["id"]
          },
        ]
      }
      river_levels: {
        Row: {
          created_at: string | null
          current_level: number | null
          danger_level: number | null
          district: string | null
          id: string
          latitude: number | null
          longitude: number | null
          recorded_at: string | null
          river_name: string
          station_name: string
          status: string | null
          warning_level: number | null
        }
        Insert: {
          created_at?: string | null
          current_level?: number | null
          danger_level?: number | null
          district?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          recorded_at?: string | null
          river_name: string
          station_name: string
          status?: string | null
          warning_level?: number | null
        }
        Update: {
          created_at?: string | null
          current_level?: number | null
          danger_level?: number | null
          district?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          recorded_at?: string | null
          river_name?: string
          station_name?: string
          status?: string | null
          warning_level?: number | null
        }
        Relationships: []
      }
      shelters: {
        Row: {
          address: string
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          current_occupancy: number | null
          district: string
          has_electricity: boolean | null
          has_food: boolean | null
          has_internet: boolean | null
          has_medical: boolean | null
          has_sanitation: boolean | null
          has_water: boolean | null
          id: string
          is_accessible: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          needs: string[] | null
          status: string | null
          total_capacity: number | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          address: string
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          current_occupancy?: number | null
          district: string
          has_electricity?: boolean | null
          has_food?: boolean | null
          has_internet?: boolean | null
          has_medical?: boolean | null
          has_sanitation?: boolean | null
          has_water?: boolean | null
          id?: string
          is_accessible?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          needs?: string[] | null
          status?: string | null
          total_capacity?: number | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          current_occupancy?: number | null
          district?: string
          has_electricity?: boolean | null
          has_food?: boolean | null
          has_internet?: boolean | null
          has_medical?: boolean | null
          has_sanitation?: boolean | null
          has_water?: boolean | null
          id?: string
          is_accessible?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          needs?: string[] | null
          status?: string | null
          total_capacity?: number | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      uploaded_documents: {
        Row: {
          created_at: string | null
          error_message: string | null
          extracted_data: Json | null
          file_size: number | null
          file_type: string
          filename: string
          id: string
          processed_at: string | null
          processing_status: string | null
          storage_path: string | null
          uploaded_by_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          extracted_data?: Json | null
          file_size?: number | null
          file_type: string
          filename: string
          id?: string
          processed_at?: string | null
          processing_status?: string | null
          storage_path?: string | null
          uploaded_by_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          extracted_data?: Json | null
          file_size?: number | null
          file_type?: string
          filename?: string
          id?: string
          processed_at?: string | null
          processing_status?: string | null
          storage_path?: string | null
          uploaded_by_id?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          district: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          last_login_at: string | null
          phone: string | null
          role: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          district?: string | null
          email: string
          full_name: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          district?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      volunteers: {
        Row: {
          availability: string | null
          average_resolution_time: number | null
          average_response_time: number | null
          cases_resolved_on_time: number | null
          completed_cases: number | null
          created_at: string | null
          customer_satisfaction_score: number | null
          district: string
          email: string | null
          equipment: string[] | null
          id: string
          is_verified: boolean | null
          name: string
          phone: string
          rating: number | null
          role: string | null
          skills: string[] | null
          sla_compliance_rate: number | null
          status: string | null
          total_cases_handled: number | null
          updated_at: string | null
          user_id: string | null
          verified_at: string | null
        }
        Insert: {
          availability?: string | null
          average_resolution_time?: number | null
          average_response_time?: number | null
          cases_resolved_on_time?: number | null
          completed_cases?: number | null
          created_at?: string | null
          customer_satisfaction_score?: number | null
          district: string
          email?: string | null
          equipment?: string[] | null
          id?: string
          is_verified?: boolean | null
          name: string
          phone: string
          rating?: number | null
          role?: string | null
          skills?: string[] | null
          sla_compliance_rate?: number | null
          status?: string | null
          total_cases_handled?: number | null
          updated_at?: string | null
          user_id?: string | null
          verified_at?: string | null
        }
        Update: {
          availability?: string | null
          average_resolution_time?: number | null
          average_response_time?: number | null
          cases_resolved_on_time?: number | null
          completed_cases?: number | null
          created_at?: string | null
          customer_satisfaction_score?: number | null
          district?: string
          email?: string | null
          equipment?: string[] | null
          id?: string
          is_verified?: boolean | null
          name?: string
          phone?: string
          rating?: number | null
          role?: string | null
          skills?: string[] | null
          sla_compliance_rate?: number | null
          status?: string | null
          total_cases_handled?: number | null
          updated_at?: string | null
          user_id?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "volunteers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      weather_data: {
        Row: {
          cloud_cover: number | null
          created_at: string | null
          district: string
          feels_like: number | null
          flood_risk_level: string | null
          humidity: number | null
          id: string
          latitude: number | null
          longitude: number | null
          pressure: number | null
          rainfall: number | null
          recorded_at: string | null
          temperature: number | null
          visibility: number | null
          weather_code: number | null
          wind_direction: number | null
          wind_speed: number | null
        }
        Insert: {
          cloud_cover?: number | null
          created_at?: string | null
          district: string
          feels_like?: number | null
          flood_risk_level?: string | null
          humidity?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          pressure?: number | null
          rainfall?: number | null
          recorded_at?: string | null
          temperature?: number | null
          visibility?: number | null
          weather_code?: number | null
          wind_direction?: number | null
          wind_speed?: number | null
        }
        Update: {
          cloud_cover?: number | null
          created_at?: string | null
          district?: string
          feels_like?: number | null
          flood_risk_level?: string | null
          humidity?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          pressure?: number | null
          rainfall?: number | null
          recorded_at?: string | null
          temperature?: number | null
          visibility?: number | null
          weather_code?: number | null
          wind_direction?: number | null
          wind_speed?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
