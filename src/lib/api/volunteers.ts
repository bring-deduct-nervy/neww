import { supabase } from '@/lib/supabase';

export interface VolunteerData {
  name: string;
  phone: string;
  email?: string;
  district: string;
  skills?: string[];
  equipment?: string[];
  availability?: string;
  role?: string;
}

export async function createVolunteer(data: VolunteerData) {
  const { data: result, error } = await supabase
    .from('volunteers')
    .insert(data)
    .select()
    .single();
  
  if (error) throw error;
  return result;
}

export async function getVolunteers(filters?: {
  district?: string;
  status?: string;
  role?: string;
  availability?: string;
}) {
  let query = supabase
    .from('volunteers')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.district) {
    query = query.eq('district', filters.district);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.role) {
    query = query.eq('role', filters.role);
  }
  if (filters?.availability) {
    query = query.eq('availability', filters.availability);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getVolunteerById(id: string) {
  const { data, error } = await supabase
    .from('volunteers')
    .select(`
      *,
      badges:volunteer_badges(*),
      assigned_cases:cases(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function updateVolunteer(id: string, data: Partial<VolunteerData & { status?: string }>) {
  const { data: result, error } = await supabase
    .from('volunteers')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function verifyVolunteer(id: string) {
  const { data, error } = await supabase
    .from('volunteers')
    .update({ 
      is_verified: true, 
      verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getVolunteerStats() {
  const { data, error } = await supabase
    .from('volunteers')
    .select('status, district, role, is_verified, completed_cases, sla_compliance_rate');

  if (error) throw error;

  const stats = {
    total: data?.length || 0,
    active: data?.filter(v => v.status === 'ACTIVE').length || 0,
    verified: data?.filter(v => v.is_verified).length || 0,
    totalCasesCompleted: data?.reduce((sum, v) => sum + (v.completed_cases || 0), 0) || 0,
    avgSlaCompliance: data?.length 
      ? data.reduce((sum, v) => sum + (v.sla_compliance_rate || 0), 0) / data.length 
      : 0,
    byDistrict: {} as Record<string, number>,
    byRole: {} as Record<string, number>
  };

  data?.forEach(v => {
    stats.byDistrict[v.district] = (stats.byDistrict[v.district] || 0) + 1;
    stats.byRole[v.role] = (stats.byRole[v.role] || 0) + 1;
  });

  return stats;
}

export async function getAvailableVolunteers(district?: string) {
  let query = supabase
    .from('volunteers')
    .select('*')
    .eq('status', 'ACTIVE')
    .in('availability', ['FULL_TIME', 'PART_TIME', 'ON_CALL']);

  if (district) {
    query = query.eq('district', district);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export function subscribeToVolunteers(callback: (payload: any) => void) {
  return supabase
    .channel('volunteers-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'volunteers' }, callback)
    .subscribe();
}
