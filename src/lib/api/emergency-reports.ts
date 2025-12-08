import { supabase } from '@/lib/supabase';

export interface EmergencyReportData {
  category: string;
  severity: string;
  title: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  district?: string;
  people_affected?: number;
  has_children?: boolean;
  has_elderly?: boolean;
  has_disabled?: boolean;
  has_medical_needs?: boolean;
  contact_name?: string;
  contact_phone?: string;
  is_anonymous?: boolean;
  images?: string[];
}

export async function createEmergencyReport(data: EmergencyReportData) {
  const { data: result, error } = await supabase
    .from('emergency_reports')
    .insert(data)
    .select()
    .single();
  
  if (error) throw error;
  return result;
}

export async function getEmergencyReports(filters?: {
  status?: string;
  severity?: string;
  district?: string;
  category?: string;
}) {
  let query = supabase
    .from('emergency_reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.severity) query = query.eq('severity', filters.severity);
  if (filters?.district) query = query.eq('district', filters.district);
  if (filters?.category) query = query.eq('category', filters.category);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function updateEmergencyReport(id: string, data: Partial<EmergencyReportData & { status?: string }>) {
  const { data: result, error } = await supabase
    .from('emergency_reports')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function verifyReport(id: string) {
  const { data, error } = await supabase
    .from('emergency_reports')
    .update({ 
      is_verified: true, 
      status: 'VERIFIED',
      updated_at: new Date().toISOString() 
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function upvoteReport(id: string) {
  const { data: current } = await supabase
    .from('emergency_reports')
    .select('upvotes')
    .eq('id', id)
    .single();

  const { data, error } = await supabase
    .from('emergency_reports')
    .update({ upvotes: (current?.upvotes || 0) + 1 })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function downvoteReport(id: string) {
  const { data: current } = await supabase
    .from('emergency_reports')
    .select('downvotes')
    .eq('id', id)
    .single();

  const { data, error } = await supabase
    .from('emergency_reports')
    .update({ downvotes: (current?.downvotes || 0) + 1 })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export function subscribeToEmergencyReports(callback: (payload: any) => void) {
  return supabase
    .channel('emergency-reports-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'emergency_reports' }, callback)
    .subscribe();
}
