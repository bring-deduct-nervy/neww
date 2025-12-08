import { supabase } from '@/lib/supabase';

export interface MissingPersonData {
  name: string;
  age?: number;
  gender?: string;
  height?: string;
  weight?: string;
  physical_desc?: string;
  clothing_desc?: string;
  photo_url?: string;
  last_seen_at?: string;
  last_seen_location?: string;
  last_seen_lat?: number;
  last_seen_lng?: number;
  district?: string;
  contact_name?: string;
  contact_phone?: string;
}

export interface SightingData {
  missing_person_id: string;
  location: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  reporter_name?: string;
  reporter_phone?: string;
  photo_url?: string;
}

export async function createMissingPersonReport(data: MissingPersonData) {
  const { data: result, error } = await supabase
    .from('missing_persons')
    .insert(data)
    .select()
    .single();
  
  if (error) throw error;
  return result;
}

export async function getMissingPersons(filters?: {
  status?: string;
  district?: string;
}) {
  let query = supabase
    .from('missing_persons')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.district) query = query.eq('district', filters.district);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getMissingPersonById(id: string) {
  const { data, error } = await supabase
    .from('missing_persons')
    .select(`
      *,
      sightings(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function updateMissingPerson(id: string, data: Partial<MissingPersonData & { status?: string }>) {
  const { data: result, error } = await supabase
    .from('missing_persons')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function markAsFound(id: string) {
  const { data, error } = await supabase
    .from('missing_persons')
    .update({ 
      status: 'FOUND', 
      updated_at: new Date().toISOString() 
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function reportSighting(data: SightingData) {
  const { data: result, error } = await supabase
    .from('sightings')
    .insert(data)
    .select()
    .single();
  
  if (error) throw error;
  return result;
}

export async function getSightings(missingPersonId: string) {
  const { data, error } = await supabase
    .from('sightings')
    .select('*')
    .eq('missing_person_id', missingPersonId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function verifySighting(id: string) {
  const { data, error } = await supabase
    .from('sightings')
    .update({ verified: true })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export function subscribeToMissingPersons(callback: (payload: any) => void) {
  return supabase
    .channel('missing-persons-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'missing_persons' }, callback)
    .subscribe();
}
