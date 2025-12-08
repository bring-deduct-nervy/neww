import { supabase } from '@/lib/supabase';

export interface CaseData {
  case_number: string;
  beneficiary_id?: string;
  category: string;
  priority: string;
  status: string;
  description: string;
  address?: string;
  district?: string;
  gs_division?: string;
  village?: string;
  latitude?: number;
  longitude?: number;
  access_notes?: string;
  people_affected?: number;
  assigned_volunteer_id?: string;
  sla_deadline?: string;
}

export async function createCase(data: CaseData) {
  const { data: result, error } = await supabase
    .from('cases')
    .insert(data)
    .select()
    .single();
  
  if (error) throw error;
  return result;
}

export async function getCases(filters?: {
  status?: string;
  priority?: string;
  district?: string;
  assigned_volunteer_id?: string;
}) {
  let query = supabase
    .from('cases')
    .select(`
      *,
      beneficiary:beneficiaries(*),
      volunteer:volunteers(*)
    `)
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.priority) {
    query = query.eq('priority', filters.priority);
  }
  if (filters?.district) {
    query = query.eq('district', filters.district);
  }
  if (filters?.assigned_volunteer_id) {
    query = query.eq('assigned_volunteer_id', filters.assigned_volunteer_id);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getCaseByNumber(caseNumber: string) {
  const { data, error } = await supabase
    .from('cases')
    .select(`
      *,
      beneficiary:beneficiaries(*),
      volunteer:volunteers(*),
      notes:case_notes(*),
      status_history:case_status_history(*)
    `)
    .eq('case_number', caseNumber)
    .single();

  if (error) throw error;
  return data;
}

export async function updateCase(id: string, data: Partial<CaseData>) {
  const { data: result, error } = await supabase
    .from('cases')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function assignVolunteer(caseId: string, volunteerId: string) {
  const { data, error } = await supabase
    .from('cases')
    .update({ 
      assigned_volunteer_id: volunteerId, 
      status: 'ASSIGNED',
      updated_at: new Date().toISOString()
    })
    .eq('id', caseId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function addCaseNote(caseId: string, authorName: string, content: string, isInternal = false) {
  const { data, error } = await supabase
    .from('case_notes')
    .insert({
      case_id: caseId,
      author_name: authorName,
      content,
      is_internal: isInternal
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCaseStatus(caseId: string, newStatus: string, changedByName: string, reason?: string) {
  const { data: currentCase } = await supabase
    .from('cases')
    .select('status')
    .eq('id', caseId)
    .single();

  await supabase
    .from('case_status_history')
    .insert({
      case_id: caseId,
      from_status: currentCase?.status,
      to_status: newStatus,
      changed_by_name: changedByName,
      reason
    });

  const updateData: any = { 
    status: newStatus, 
    updated_at: new Date().toISOString() 
  };
  
  if (newStatus === 'RESOLVED') {
    updateData.resolved_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('cases')
    .update(updateData)
    .eq('id', caseId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getCaseStats() {
  const { data: cases, error } = await supabase
    .from('cases')
    .select('status, priority, category, district');

  if (error) throw error;

  const stats = {
    total: cases?.length || 0,
    byStatus: {} as Record<string, number>,
    byPriority: {} as Record<string, number>,
    byCategory: {} as Record<string, number>,
    byDistrict: {} as Record<string, number>
  };

  cases?.forEach(c => {
    stats.byStatus[c.status] = (stats.byStatus[c.status] || 0) + 1;
    stats.byPriority[c.priority] = (stats.byPriority[c.priority] || 0) + 1;
    stats.byCategory[c.category] = (stats.byCategory[c.category] || 0) + 1;
    if (c.district) {
      stats.byDistrict[c.district] = (stats.byDistrict[c.district] || 0) + 1;
    }
  });

  return stats;
}

export function subscribeToCases(callback: (payload: any) => void) {
  return supabase
    .channel('cases-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'cases' }, callback)
    .subscribe();
}

export function generateCaseNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `SOS-${dateStr}-${random}`;
}
