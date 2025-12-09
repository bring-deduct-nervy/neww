import { supabase } from '@/lib/supabase';

export interface ApiKeyData {
  name: string;
  service: string;
  key_value: string;
  is_active?: boolean;
}

export async function createApiKey(data: ApiKeyData) {
  const { data: result, error } = await supabase
    .from('api_keys')
    .insert(data)
    .select()
    .single();
  
  if (error) throw error;
  return result;
}

export async function getApiKeys() {
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateApiKey(id: string, data: Partial<ApiKeyData>) {
  const { data: result, error } = await supabase
    .from('api_keys')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function deleteApiKey(id: string) {
  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getApiKeyByService(service: string) {
  const { data, error } = await supabase
    .from('api_keys')
    .select('key_value')
    .eq('service', service)
    .eq('is_active', true)
    .single();

  if (error) return null;
  return data?.key_value;
}

export interface SystemSettingData {
  key: string;
  value: any;
  description?: string;
}

export async function getSystemSettings() {
  const { data, error } = await supabase
    .from('system_settings')
    .select('*')
    .order('key');

  if (error) throw error;
  return data;
}

export async function getSystemSetting(key: string) {
  const { data, error } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', key)
    .single();

  if (error) return null;
  return data?.value;
}

export async function upsertSystemSetting(data: SystemSettingData) {
  const { data: result, error } = await supabase
    .from('system_settings')
    .upsert({ 
      ...data, 
      updated_at: new Date().toISOString() 
    }, { 
      onConflict: 'key' 
    })
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function getSystemConfig(): Promise<Record<string, any>> {
  const { data, error } = await supabase
    .from('system_settings')
    .select('key, value');

  if (error) return {};
  
  const config: Record<string, any> = {};
  data.forEach(setting => {
    config[setting.key] = setting.value;
  });
  return config;
}

export async function updateSystemConfig(key: string, value: any) {
  const { data, error } = await supabase
    .from('system_settings')
    .upsert(
      { key, value, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getDashboardStats() {
  const [cases, beneficiaries, volunteers, shelters, alerts] = await Promise.all([
    supabase.from('cases').select('status, priority, category, district, created_at'),
    supabase.from('beneficiaries').select('district, household_size'),
    supabase.from('volunteers').select('status, district, completed_cases, sla_compliance_rate'),
    supabase.from('shelters').select('status, total_capacity, current_occupancy'),
    supabase.from('alerts').select('severity, is_active')
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const casesData = cases.data || [];
  const newToday = casesData.filter(c => new Date(c.created_at) >= today).length;

  return {
    cases: {
      total: casesData.length,
      newToday,
      byStatus: casesData.reduce((acc, c) => {
        acc[c.status] = (acc[c.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byPriority: casesData.reduce((acc, c) => {
        acc[c.priority] = (acc[c.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byCategory: casesData.reduce((acc, c) => {
        acc[c.category] = (acc[c.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byDistrict: casesData.reduce((acc, c) => {
        if (c.district) acc[c.district] = (acc[c.district] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    },
    beneficiaries: {
      total: beneficiaries.data?.length || 0,
      totalPeople: beneficiaries.data?.reduce((sum, b) => sum + (b.household_size || 1), 0) || 0
    },
    volunteers: {
      total: volunteers.data?.length || 0,
      active: volunteers.data?.filter(v => v.status === 'ACTIVE').length || 0,
      avgSlaCompliance: volunteers.data?.length 
        ? volunteers.data.reduce((sum, v) => sum + (v.sla_compliance_rate || 0), 0) / volunteers.data.length 
        : 0
    },
    shelters: {
      total: shelters.data?.length || 0,
      active: shelters.data?.filter(s => s.status === 'ACTIVE').length || 0,
      totalCapacity: shelters.data?.reduce((sum, s) => sum + (s.total_capacity || 0), 0) || 0,
      totalOccupancy: shelters.data?.reduce((sum, s) => sum + (s.current_occupancy || 0), 0) || 0
    },
    alerts: {
      total: alerts.data?.length || 0,
      active: alerts.data?.filter(a => a.is_active).length || 0,
      critical: alerts.data?.filter(a => a.severity === 'CRITICAL' && a.is_active).length || 0
    }
  };
}

export async function uploadDocument(file: File, uploadedById?: string) {
  const filename = `${Date.now()}-${file.name}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filename, file);

  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from('uploaded_documents')
    .insert({
      filename: file.name,
      file_type: file.type,
      file_size: file.size,
      storage_path: uploadData.path,
      processing_status: 'PENDING',
      uploaded_by_id: uploadedById
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUploadedDocuments() {
  const { data, error } = await supabase
    .from('uploaded_documents')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateDocumentStatus(id: string, status: string, extractedData?: any, errorMessage?: string) {
  const updateData: any = {
    processing_status: status,
    processed_at: status === 'COMPLETED' ? new Date().toISOString() : null
  };

  if (extractedData) updateData.extracted_data = extractedData;
  if (errorMessage) updateData.error_message = errorMessage;

  const { data, error } = await supabase
    .from('uploaded_documents')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
