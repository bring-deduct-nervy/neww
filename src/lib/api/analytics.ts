import { supabase } from '@/lib/supabase';

export interface AnalyticsEvent {
  id: string;
  event_type: string;
  event_data: Record<string, any>;
  user_id?: string;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface DashboardAnalytics {
  totalCases: number;
  newCasesToday: number;
  casesInProgress: number;
  casesResolved: number;
  casesByPriority: Record<string, number>;
  casesByCategory: Record<string, number>;
  casesByDistrict: Record<string, number>;
  casesByStatus: Record<string, number>;
  averageResolutionTime: number;
  slaComplianceRate: number;
  totalBeneficiaries: number;
  totalVolunteers: number;
  activeVolunteers: number;
  totalShelters: number;
  shelterOccupancy: number;
  activeAlerts: number;
  criticalAlerts: number;
  donationsTotal: number;
  resourcesDistributed: number;
}

// Track analytics event
export async function trackEvent(
  eventType: string,
  eventData: Record<string, any> = {},
  userId?: string
) {
  try {
    await supabase.from('analytics_events').insert({
      event_type: eventType,
      event_data: eventData,
      user_id: userId,
      session_id: sessionStorage.getItem('session_id') || generateSessionId(),
      user_agent: navigator.userAgent
    });
  } catch (error) {
    console.error('Error tracking event:', error);
  }
}

function generateSessionId(): string {
  const id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem('session_id', id);
  return id;
}

// Get comprehensive dashboard analytics
export async function getDashboardAnalytics(): Promise<DashboardAnalytics> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  const [
    casesResult,
    beneficiariesResult,
    volunteersResult,
    sheltersResult,
    alertsResult,
    donationsResult,
    aidItemsResult
  ] = await Promise.all([
    supabase.from('cases').select('*'),
    supabase.from('beneficiaries').select('id, household_size'),
    supabase.from('volunteers').select('id, status, sla_compliance_rate, average_resolution_time'),
    supabase.from('shelters').select('id, status, total_capacity, current_occupancy'),
    supabase.from('alerts').select('id, severity, is_active'),
    supabase.from('donations').select('id, amount, status'),
    supabase.from('aid_items').select('id, quantity')
  ]);

  const cases = casesResult.data || [];
  const beneficiaries = beneficiariesResult.data || [];
  const volunteers = volunteersResult.data || [];
  const shelters = sheltersResult.data || [];
  const alerts = alertsResult.data || [];
  const donations = donationsResult.data || [];
  const aidItems = aidItemsResult.data || [];

  // Calculate case metrics
  const newCasesToday = cases.filter(c => new Date(c.created_at) >= today).length;
  const casesInProgress = cases.filter(c => ['IN_PROGRESS', 'ASSIGNED'].includes(c.status)).length;
  const casesResolved = cases.filter(c => ['RESOLVED', 'CLOSED'].includes(c.status)).length;

  const casesByPriority = cases.reduce((acc, c) => {
    acc[c.priority] = (acc[c.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const casesByCategory = cases.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const casesByDistrict = cases.reduce((acc, c) => {
    if (c.district) acc[c.district] = (acc[c.district] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const casesByStatus = cases.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate volunteer metrics
  const activeVolunteers = volunteers.filter(v => v.status === 'ACTIVE').length;
  const avgSlaCompliance = volunteers.length > 0
    ? volunteers.reduce((sum, v) => sum + (Number(v.sla_compliance_rate) || 0), 0) / volunteers.length
    : 0;
  const avgResolutionTime = volunteers.length > 0
    ? volunteers.reduce((sum, v) => sum + (Number(v.average_resolution_time) || 0), 0) / volunteers.length
    : 0;

  // Calculate shelter metrics
  const activeShelters = shelters.filter(s => s.status === 'ACTIVE');
  const totalCapacity = activeShelters.reduce((sum, s) => sum + (s.total_capacity || 0), 0);
  const totalOccupancy = activeShelters.reduce((sum, s) => sum + (s.current_occupancy || 0), 0);
  const shelterOccupancy = totalCapacity > 0 ? (totalOccupancy / totalCapacity) * 100 : 0;

  // Calculate alert metrics
  const activeAlerts = alerts.filter(a => a.is_active).length;
  const criticalAlerts = alerts.filter(a => a.is_active && a.severity === 'CRITICAL').length;

  // Calculate donation metrics
  const completedDonations = donations.filter(d => d.status === 'COMPLETED');
  const donationsTotal = completedDonations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  // Calculate resources distributed
  const resourcesDistributed = aidItems.reduce((sum, a) => sum + (a.quantity || 0), 0);

  return {
    totalCases: cases.length,
    newCasesToday,
    casesInProgress,
    casesResolved,
    casesByPriority,
    casesByCategory,
    casesByDistrict,
    casesByStatus,
    averageResolutionTime: avgResolutionTime,
    slaComplianceRate: avgSlaCompliance,
    totalBeneficiaries: beneficiaries.reduce((sum, b) => sum + (b.household_size || 1), 0),
    totalVolunteers: volunteers.length,
    activeVolunteers,
    totalShelters: activeShelters.length,
    shelterOccupancy,
    activeAlerts,
    criticalAlerts,
    donationsTotal,
    resourcesDistributed
  };
}

// Get time series data for charts
export async function getTimeSeriesData(
  metric: 'cases' | 'donations' | 'volunteers',
  days: number = 30
): Promise<{ date: string; value: number }[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  let query;
  switch (metric) {
    case 'cases':
      query = supabase
        .from('cases')
        .select('created_at')
        .gte('created_at', startDate.toISOString());
      break;
    case 'donations':
      query = supabase
        .from('donations')
        .select('created_at, amount')
        .eq('status', 'COMPLETED')
        .gte('created_at', startDate.toISOString());
      break;
    case 'volunteers':
      query = supabase
        .from('volunteers')
        .select('created_at')
        .gte('created_at', startDate.toISOString());
      break;
  }

  const { data, error } = await query;
  if (error) throw error;

  // Group by date
  const grouped = (data || []).reduce((acc, item) => {
    const date = new Date(item.created_at).toISOString().split('T')[0];
    if (metric === 'donations') {
      acc[date] = (acc[date] || 0) + (Number((item as any).amount) || 0);
    } else {
      acc[date] = (acc[date] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Fill in missing dates
  const result: { date: string; value: number }[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    result.push({ date: dateStr, value: grouped[dateStr] || 0 });
  }

  return result;
}

// Get geographic distribution
export async function getGeographicDistribution(): Promise<{
  district: string;
  cases: number;
  beneficiaries: number;
  volunteers: number;
  shelters: number;
}[]> {
  const [cases, beneficiaries, volunteers, shelters] = await Promise.all([
    supabase.from('cases').select('district'),
    supabase.from('beneficiaries').select('district'),
    supabase.from('volunteers').select('district'),
    supabase.from('shelters').select('district')
  ]);

  const districts = new Set<string>();
  [cases.data, beneficiaries.data, volunteers.data, shelters.data].forEach(data => {
    (data || []).forEach(item => {
      if (item.district) districts.add(item.district);
    });
  });

  return Array.from(districts).map(district => ({
    district,
    cases: (cases.data || []).filter(c => c.district === district).length,
    beneficiaries: (beneficiaries.data || []).filter(b => b.district === district).length,
    volunteers: (volunteers.data || []).filter(v => v.district === district).length,
    shelters: (shelters.data || []).filter(s => s.district === district).length
  }));
}

// Audit logging
export async function logAuditEvent(
  action: string,
  resourceType: string,
  resourceId?: string,
  oldValues?: any,
  newValues?: any,
  userId?: string,
  userEmail?: string
) {
  try {
    await supabase.from('audit_logs').insert({
      user_id: userId,
      user_email: userEmail,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      old_values: oldValues,
      new_values: newValues
    });
  } catch (error) {
    console.error('Error logging audit event:', error);
  }
}

// Get audit logs
export async function getAuditLogs(filters?: {
  userId?: string;
  action?: string;
  resourceType?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}) {
  let query = supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.userId) query = query.eq('user_id', filters.userId);
  if (filters?.action) query = query.eq('action', filters.action);
  if (filters?.resourceType) query = query.eq('resource_type', filters.resourceType);
  if (filters?.startDate) query = query.gte('created_at', filters.startDate);
  if (filters?.endDate) query = query.lte('created_at', filters.endDate);
  if (filters?.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}
