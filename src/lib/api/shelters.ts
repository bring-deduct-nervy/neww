import { supabase } from '@/lib/supabase';

export interface ShelterData {
  name: string;
  type: string;
  address: string;
  district: string;
  latitude?: number;
  longitude?: number;
  total_capacity: number;
  current_occupancy?: number;
  status?: string;
  has_medical?: boolean;
  has_food?: boolean;
  has_water?: boolean;
  has_sanitation?: boolean;
  has_electricity?: boolean;
  has_internet?: boolean;
  is_accessible?: boolean;
  contact_name?: string;
  contact_phone?: string;
  needs?: string[];
}

export async function createShelter(data: ShelterData) {
  const { data: result, error } = await supabase
    .from('shelters')
    .insert(data)
    .select()
    .single();
  
  if (error) throw error;
  return result;
}

export async function getShelters(filters?: {
  district?: string;
  status?: string;
  type?: string;
}) {
  let query = supabase
    .from('shelters')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.district) {
    query = query.eq('district', filters.district);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.type) {
    query = query.eq('type', filters.type);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getShelterById(id: string) {
  const { data, error } = await supabase
    .from('shelters')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function updateShelter(id: string, data: Partial<ShelterData>) {
  const { data: result, error } = await supabase
    .from('shelters')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function updateOccupancy(id: string, occupancy: number) {
  const { data: shelter } = await supabase
    .from('shelters')
    .select('total_capacity')
    .eq('id', id)
    .single();

  const status = occupancy >= (shelter?.total_capacity || 0) ? 'FULL' : 'ACTIVE';

  const { data, error } = await supabase
    .from('shelters')
    .update({ 
      current_occupancy: occupancy, 
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getShelterStats() {
  const { data, error } = await supabase
    .from('shelters')
    .select('status, district, total_capacity, current_occupancy');

  if (error) throw error;

  const stats = {
    total: data?.length || 0,
    active: data?.filter(s => s.status === 'ACTIVE').length || 0,
    full: data?.filter(s => s.status === 'FULL').length || 0,
    totalCapacity: data?.reduce((sum, s) => sum + (s.total_capacity || 0), 0) || 0,
    totalOccupancy: data?.reduce((sum, s) => sum + (s.current_occupancy || 0), 0) || 0,
    byDistrict: {} as Record<string, number>
  };

  data?.forEach(s => {
    stats.byDistrict[s.district] = (stats.byDistrict[s.district] || 0) + 1;
  });

  return stats;
}

export function subscribeToShelters(callback: (payload: any) => void) {
  return supabase
    .channel('shelters-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'shelters' }, callback)
    .subscribe();
}
