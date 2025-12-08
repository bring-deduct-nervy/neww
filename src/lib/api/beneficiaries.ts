import { supabase } from '@/lib/supabase';

export interface BeneficiaryData {
  name: string;
  phone: string;
  alternate_phone?: string;
  email?: string;
  national_id?: string;
  household_size: number;
  address: string;
  district: string;
  gs_division?: string;
  village?: string;
  latitude?: number;
  longitude?: number;
  vulnerabilities?: string[];
  opt_in_sms?: boolean;
  opt_in_email?: boolean;
}

export async function createBeneficiary(data: BeneficiaryData) {
  const { data: result, error } = await supabase
    .from('beneficiaries')
    .insert(data)
    .select()
    .single();
  
  if (error) throw error;
  return result;
}

export async function getBeneficiaries(filters?: {
  district?: string;
  search?: string;
}) {
  let query = supabase
    .from('beneficiaries')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.district) {
    query = query.eq('district', filters.district);
  }
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getBeneficiaryById(id: string) {
  const { data, error } = await supabase
    .from('beneficiaries')
    .select(`
      *,
      cases(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function updateBeneficiary(id: string, data: Partial<BeneficiaryData>) {
  const { data: result, error } = await supabase
    .from('beneficiaries')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function getBeneficiaryStats() {
  const { data, error } = await supabase
    .from('beneficiaries')
    .select('district, vulnerabilities, household_size');

  if (error) throw error;

  const stats = {
    total: data?.length || 0,
    totalPeople: data?.reduce((sum, b) => sum + (b.household_size || 1), 0) || 0,
    byDistrict: {} as Record<string, number>,
    byVulnerability: {} as Record<string, number>
  };

  data?.forEach(b => {
    stats.byDistrict[b.district] = (stats.byDistrict[b.district] || 0) + 1;
    b.vulnerabilities?.forEach((v: string) => {
      stats.byVulnerability[v] = (stats.byVulnerability[v] || 0) + 1;
    });
  });

  return stats;
}
