import { supabase } from '@/lib/supabase';

export interface DonationData {
  donor_name?: string;
  donor_phone?: string;
  donor_email?: string;
  type: 'MONETARY' | 'IN_KIND';
  amount?: number;
  currency?: string;
  items?: any;
  payment_reference?: string;
}

export async function createDonation(data: DonationData) {
  const { data: result, error } = await supabase
    .from('donations')
    .insert(data)
    .select()
    .single();
  
  if (error) throw error;
  return result;
}

export async function getDonations(filters?: {
  type?: string;
  status?: string;
}) {
  let query = supabase
    .from('donations')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.type) query = query.eq('type', filters.type);
  if (filters?.status) query = query.eq('status', filters.status);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function updateDonationStatus(id: string, status: string) {
  const { data, error } = await supabase
    .from('donations')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getDonationStats() {
  const { data, error } = await supabase
    .from('donations')
    .select('type, amount, status');

  if (error) throw error;

  const stats = {
    totalMonetary: 0,
    totalInKind: 0,
    pendingCount: 0,
    completedCount: 0,
    totalDonors: data?.length || 0
  };

  data?.forEach(d => {
    if (d.type === 'MONETARY' && d.status === 'COMPLETED') {
      stats.totalMonetary += d.amount || 0;
    }
    if (d.type === 'IN_KIND') {
      stats.totalInKind++;
    }
    if (d.status === 'PENDING') {
      stats.pendingCount++;
    }
    if (d.status === 'COMPLETED') {
      stats.completedCount++;
    }
  });

  return stats;
}
