import { supabase } from '@/lib/supabase';

export interface AlertData {
  type: string;
  severity: string;
  title: string;
  message: string;
  districts?: string[];
  source?: string;
  starts_at?: string;
  expires_at?: string;
  is_active?: boolean;
}

export async function createAlert(data: AlertData) {
  const { data: result, error } = await supabase
    .from('alerts')
    .insert(data)
    .select()
    .single();
  
  if (error) throw error;
  return result;
}

export async function getAlerts(filters?: {
  is_active?: boolean;
  severity?: string;
  type?: string;
  district?: string;
}) {
  let query = supabase
    .from('alerts')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.is_active !== undefined) {
    query = query.eq('is_active', filters.is_active);
  }
  if (filters?.severity) {
    query = query.eq('severity', filters.severity);
  }
  if (filters?.type) {
    query = query.eq('type', filters.type);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getActiveAlerts(district?: string) {
  let query = supabase
    .from('alerts')
    .select('*')
    .eq('is_active', true)
    .order('severity', { ascending: false })
    .order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function updateAlert(id: string, data: Partial<AlertData>) {
  const { data: result, error } = await supabase
    .from('alerts')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function deactivateAlert(id: string) {
  const { data, error } = await supabase
    .from('alerts')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export function subscribeToAlerts(callback: (payload: any) => void) {
  return supabase
    .channel('alerts-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, callback)
    .subscribe();
}
