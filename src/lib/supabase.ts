import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

export type Database = {
  public: {
    Tables: {
      beneficiaries: {
        Row: {
          id: string;
          name: string;
          phone: string;
          alternate_phone: string | null;
          email: string | null;
          national_id: string | null;
          household_size: number;
          address: string;
          district: string;
          gs_division: string | null;
          village: string | null;
          latitude: number | null;
          longitude: number | null;
          vulnerabilities: string[];
          opt_in_sms: boolean;
          opt_in_email: boolean;
          total_aid_received: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['beneficiaries']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['beneficiaries']['Insert']>;
      };
      cases: {
        Row: {
          id: string;
          case_number: string;
          beneficiary_id: string | null;
          category: string;
          priority: string;
          status: string;
          description: string;
          address: string | null;
          district: string | null;
          gs_division: string | null;
          village: string | null;
          latitude: number | null;
          longitude: number | null;
          access_notes: string | null;
          people_affected: number;
          assigned_volunteer_id: string | null;
          sla_deadline: string | null;
          resolved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['cases']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['cases']['Insert']>;
      };
      volunteers: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          phone: string;
          email: string | null;
          district: string;
          skills: string[];
          equipment: string[];
          availability: string;
          status: string;
          role: string;
          is_verified: boolean;
          verified_at: string | null;
          completed_cases: number;
          total_cases_handled: number;
          cases_resolved_on_time: number;
          average_response_time: number;
          average_resolution_time: number;
          sla_compliance_rate: number;
          customer_satisfaction_score: number;
          rating: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['volunteers']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['volunteers']['Insert']>;
      };
      shelters: {
        Row: {
          id: string;
          name: string;
          type: string;
          address: string;
          district: string;
          latitude: number | null;
          longitude: number | null;
          total_capacity: number;
          current_occupancy: number;
          status: string;
          has_medical: boolean;
          has_food: boolean;
          has_water: boolean;
          has_sanitation: boolean;
          has_electricity: boolean;
          has_internet: boolean;
          is_accessible: boolean;
          contact_name: string | null;
          contact_phone: string | null;
          needs: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['shelters']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['shelters']['Insert']>;
      };
      alerts: {
        Row: {
          id: string;
          type: string;
          severity: string;
          title: string;
          message: string;
          districts: string[];
          source: string | null;
          starts_at: string;
          expires_at: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['alerts']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['alerts']['Insert']>;
      };
      api_keys: {
        Row: {
          id: string;
          name: string;
          service: string;
          key_value: string;
          is_active: boolean;
          last_used_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['api_keys']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['api_keys']['Insert']>;
      };
      river_levels: {
        Row: {
          id: string;
          river_name: string;
          station_name: string;
          district: string | null;
          latitude: number | null;
          longitude: number | null;
          current_level: number | null;
          warning_level: number | null;
          danger_level: number | null;
          status: string;
          recorded_at: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['river_levels']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['river_levels']['Insert']>;
      };
      weather_data: {
        Row: {
          id: string;
          district: string;
          latitude: number | null;
          longitude: number | null;
          temperature: number | null;
          humidity: number | null;
          rainfall: number | null;
          wind_speed: number | null;
          wind_direction: number | null;
          pressure: number | null;
          cloud_cover: number | null;
          visibility: number | null;
          feels_like: number | null;
          weather_code: number | null;
          flood_risk_level: string;
          recorded_at: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['weather_data']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['weather_data']['Insert']>;
      };
      uploaded_documents: {
        Row: {
          id: string;
          filename: string;
          file_type: string;
          file_size: number | null;
          storage_path: string | null;
          extracted_data: any;
          processing_status: string;
          error_message: string | null;
          uploaded_by_id: string | null;
          created_at: string;
          processed_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['uploaded_documents']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['uploaded_documents']['Insert']>;
      };
    };
  };
};
