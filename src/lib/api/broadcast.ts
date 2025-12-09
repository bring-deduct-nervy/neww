import { supabase } from '@/lib/supabase';

export interface BroadcastData {
  title: string;
  message: string;
  type: 'ALERT' | 'WARNING' | 'INFO' | 'UPDATE';
  channels: string[];
  target_districts?: string[];
  target_roles?: string[];
  scheduled_for?: string;
}

export async function createBroadcast(data: BroadcastData, userId: string) {
  const { data: result, error } = await supabase
    .from('broadcasts')
    .insert({
      ...data,
      sent_by: userId,
      status: data.scheduled_for ? 'SCHEDULED' : 'SENDING'
    })
    .select()
    .single();
  
  if (error) throw error;
  return result;
}

export async function getBroadcasts(filters?: {
  status?: string;
  type?: string;
  limit?: number;
}) {
  let query = supabase
    .from('broadcasts')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters?.type) {
    query = query.eq('type', filters.type);
  }
  
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
}

export async function updateBroadcast(id: string, data: Partial<BroadcastData & { status: string }>) {
  const { data: result, error } = await supabase
    .from('broadcasts')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return result;
}

export async function sendBroadcastNow(id: string) {
  const { data, error: fetchError } = await supabase
    .from('broadcasts')
    .select('*')
    .eq('id', id)
    .single();
  
  if (fetchError) throw fetchError;
  
  // Update status to SENDING
  const { error: updateError } = await supabase
    .from('broadcasts')
    .update({ status: 'SENDING', sent_at: new Date().toISOString() })
    .eq('id', id);
  
  if (updateError) throw updateError;
  
  // Queue notifications for each target
  const notifications = await queueNotifications(data);
  
  return { broadcast: data, queued: notifications.length };
}

async function queueNotifications(broadcast: any) {
  const users = await getTargetUsers(broadcast);
  
  const notifications = users.map(user => ({
    type: 'SMS', // Can be SMS, EMAIL, PUSH
    recipient: user.phone || user.email,
    subject: broadcast.title,
    message: broadcast.message,
    status: 'PENDING',
    scheduled_for: new Date().toISOString()
  }));
  
  if (notifications.length === 0) return [];
  
  const { data, error } = await supabase
    .from('notification_queue')
    .insert(notifications)
    .select();
  
  if (error) throw error;
  return data;
}

async function getTargetUsers(broadcast: any) {
  let query = supabase
    .from('user_profiles')
    .select('*');
  
  if (broadcast.target_districts?.length > 0) {
    query = query.in('district', broadcast.target_districts);
  }
  
  if (broadcast.target_roles?.length > 0) {
    query = query.in('role', broadcast.target_roles);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export interface ResourceData {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  location: string;
  shelter_id?: string;
}

export async function createResource(data: ResourceData) {
  const { data: result, error } = await supabase
    .from('resources')
    .insert(data)
    .select()
    .single();
  
  if (error) throw error;
  return result;
}

export async function getResources(filters?: {
  category?: string;
  shelter_id?: string;
  status?: string;
}) {
  let query = supabase
    .from('resources')
    .select('*')
    .order('updated_at', { ascending: false });
  
  if (filters?.category) {
    query = query.eq('category', filters.category);
  }
  
  if (filters?.shelter_id) {
    query = query.eq('shelter_id', filters.shelter_id);
  }
  
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
}

export async function updateResource(id: string, data: Partial<ResourceData>) {
  const { data: result, error } = await supabase
    .from('resources')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return result;
}

export async function deleteResource(id: string) {
  const { error } = await supabase
    .from('resources')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

export interface AidItemData {
  case_id?: string;
  beneficiary_id?: string;
  category: string;
  item_name: string;
  quantity: number;
  unit: string;
  value?: number;
  distributed_by: string;
  notes?: string;
}

export async function createAidItem(data: AidItemData) {
  const { data: result, error } = await supabase
    .from('aid_items')
    .insert({
      ...data,
      distributed_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) throw error;
  return result;
}

export async function getAidItems(filters?: {
  case_id?: string;
  beneficiary_id?: string;
  category?: string;
}) {
  let query = supabase
    .from('aid_items')
    .select(`
      *,
      case:cases(case_number),
      beneficiary:beneficiaries(name),
      volunteer:volunteers(name)
    `)
    .order('distributed_at', { ascending: false });
  
  if (filters?.case_id) {
    query = query.eq('case_id', filters.case_id);
  }
  
  if (filters?.beneficiary_id) {
    query = query.eq('beneficiary_id', filters.beneficiary_id);
  }
  
  if (filters?.category) {
    query = query.eq('category', filters.category);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
}

export interface DonationData {
  donor_name?: string;
  donor_email: string;
  donor_phone?: string;
  amount: number;
  currency?: string;
  payment_method: string;
  payment_reference?: string;
  campaign_id?: string;
  notes?: string;
  is_anonymous?: boolean;
}

export async function createDonation(data: DonationData) {
  const { data: result, error } = await supabase
    .from('donations')
    .insert({
      ...data,
      status: 'COMPLETED'
    })
    .select()
    .single();
  
  if (error) throw error;
  return result;
}

export async function getDonations(filters?: {
  status?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
}) {
  let query = supabase
    .from('donations')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters?.start_date) {
    query = query.gte('created_at', filters.start_date);
  }
  
  if (filters?.end_date) {
    query = query.lte('created_at', filters.end_date);
  }
  
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
}

export async function getDonationStats() {
  const { data, error } = await supabase
    .from('donations')
    .select('amount, currency, status, created_at');
  
  if (error) throw error;
  
  if (!data) return { total: 0, count: 0, average: 0, by_currency: {} };
  
  const completed = data.filter(d => d.status === 'COMPLETED');
  const total = completed.reduce((sum, d) => sum + (d.amount || 0), 0);
  
  const by_currency: Record<string, number> = {};
  completed.forEach(d => {
    const curr = d.currency || 'LKR';
    by_currency[curr] = (by_currency[curr] || 0) + (d.amount || 0);
  });
  
  return {
    total,
    count: completed.length,
    average: completed.length > 0 ? total / completed.length : 0,
    by_currency
  };
}

export interface MissingPersonData {
  name: string;
  age?: number;
  gender?: string;
  description: string;
  last_seen_location: string;
  last_seen_date: string;
  district: string;
  latitude?: number;
  longitude?: number;
  photo_url?: string;
  contact_name: string;
  contact_phone: string;
  notes?: string;
}

export async function createMissingPerson(data: MissingPersonData) {
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
  limit?: number;
}) {
  let query = supabase
    .from('missing_persons')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters?.district) {
    query = query.eq('district', filters.district);
  }
  
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
}

export async function updateMissingPersonStatus(id: string, status: string, location?: string) {
  const update: any = {
    status,
    updated_at: new Date().toISOString()
  };
  
  if (status === 'FOUND' && location) {
    update.found_location = location;
    update.found_at = new Date().toISOString();
  }
  
  const { data, error } = await supabase
    .from('missing_persons')
    .update(update)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export interface CaseNoteData {
  case_id: string;
  author_id: string;
  author_name: string;
  content: string;
  is_internal?: boolean;
}

export async function createCaseNote(data: CaseNoteData) {
  const { data: result, error } = await supabase
    .from('case_notes')
    .insert(data)
    .select()
    .single();
  
  if (error) throw error;
  return result;
}

export async function getCaseNotes(caseId: string) {
  const { data, error } = await supabase
    .from('case_notes')
    .select('*')
    .eq('case_id', caseId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function subscribeToResources(callback: (payload: any) => void) {
  const subscription = supabase
    .channel('resources-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'resources'
    }, payload => callback(payload))
    .subscribe();
  
  return subscription;
}

export async function subscribeToDonations(callback: (payload: any) => void) {
  const subscription = supabase
    .channel('donations-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'donations'
    }, payload => callback(payload))
    .subscribe();
  
  return subscription;
}
