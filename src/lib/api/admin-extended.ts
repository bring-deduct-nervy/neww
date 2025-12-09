import { supabase } from '@/lib/supabase';

/**
 * Get all users with pagination
 */
export async function getAllUsers(limit = 50, offset = 0) {
  const { data, error, count } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) throw error;
  return { data, total: count };
}

/**
 * Search users
 */
export async function searchUsers(query: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .or(`email.ilike.%${query}%,full_name.ilike.%${query}%,phone.ilike.%${query}%`)
    .limit(20);
  
  if (error) throw error;
  return data;
}

/**
 * Update user role
 */
export async function updateUserRole(userId: string, role: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Deactivate user
 */
export async function deactivateUser(userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Activate user
 */
export async function activateUser(userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Get audit logs
 */
export async function getAuditLogs(filters?: {
  user_id?: string;
  action?: string;
  resource_type?: string;
  limit?: number;
}) {
  let query = supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (filters?.user_id) {
    query = query.eq('user_id', filters.user_id);
  }
  
  if (filters?.action) {
    query = query.eq('action', filters.action);
  }
  
  if (filters?.resource_type) {
    query = query.eq('resource_type', filters.resource_type);
  }
  
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
}

/**
 * Create audit log entry
 */
export async function createAuditLog(
  userId: string | null,
  userEmail: string,
  action: string,
  resourceType: string,
  resourceId?: string,
  oldValues?: any,
  newValues?: any
) {
  const { error } = await supabase
    .from('audit_logs')
    .insert({
      user_id: userId,
      user_email: userEmail,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      old_values: oldValues,
      new_values: newValues,
      ip_address: null // Could be captured from request
    });
  
  if (error) throw error;
}

/**
 * Get system health metrics
 */
export async function getSystemHealth() {
  const [cases, alerts, notifications, documents] = await Promise.all([
    supabase.from('cases').select('count()'),
    supabase.from('alerts').select('count()'),
    supabase.from('notification_queue').select('count()', { count: 'exact' }),
    supabase.from('uploaded_documents').select('count()', { count: 'exact' })
  ]);
  
  // Get notification queue stats
  const { data: pendingNotifications } = await supabase
    .from('notification_queue')
    .select('*')
    .eq('status', 'PENDING')
    .limit(100);
  
  const { data: failedNotifications } = await supabase
    .from('notification_queue')
    .select('*')
    .eq('status', 'FAILED')
    .limit(100);
  
  // Get document processing stats
  const { data: processingDocs } = await supabase
    .from('uploaded_documents')
    .select('*')
    .eq('processing_status', 'PROCESSING');
  
  const { data: failedDocs } = await supabase
    .from('uploaded_documents')
    .select('*')
    .eq('processing_status', 'FAILED');
  
  return {
    database: {
      cases_total: cases.count,
      alerts_total: alerts.count,
      notifications_total: notifications.count,
      documents_total: documents.count,
      pending_notifications: pendingNotifications?.length || 0,
      failed_notifications: failedNotifications?.length || 0,
      processing_documents: processingDocs?.length || 0,
      failed_documents: failedDocs?.length || 0
    },
    status: 'healthy' // Can be determined by various metrics
  };
}

/**
 * Export data as JSON
 */
export async function exportDataToJson(table: string) {
  const { data, error } = await supabase
    .from(table)
    .select('*');
  
  if (error) throw error;
  return data;
}

/**
 * Clear notification queue
 */
export async function clearNotificationQueue() {
  const { error } = await supabase
    .from('notification_queue')
    .delete()
    .eq('status', 'SENT');
  
  if (error) throw error;
}

/**
 * Get notification queue stats
 */
export async function getNotificationQueueStats() {
  const { data } = await supabase
    .from('notification_queue')
    .select('status');
  
  const stats = {
    pending: 0,
    sending: 0,
    sent: 0,
    failed: 0
  };
  
  data?.forEach(item => {
    const status = item.status.toLowerCase();
    if (status in stats) {
      stats[status as keyof typeof stats]++;
    }
  });
  
  return stats;
}

/**
 * Retry failed notifications
 */
export async function retryFailedNotifications(limit = 10) {
  const { data, error: fetchError } = await supabase
    .from('notification_queue')
    .select('*')
    .eq('status', 'FAILED')
    .lt('retry_count', 3)
    .limit(limit);
  
  if (fetchError) throw fetchError;
  
  if (!data || data.length === 0) return [];
  
  const ids = data.map(n => n.id);
  
  const { error: updateError } = await supabase
    .from('notification_queue')
    .update({
      status: 'PENDING',
      retry_count: supabase.rpc('increment_retry_count'),
      error_message: null
    })
    .in('id', ids);
  
  if (updateError) throw updateError;
  
  return data;
}

/**
 * Get analytics summary
 */
export async function getAnalyticsSummary(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data } = await supabase
    .from('analytics_events')
    .select('event_type, created_at')
    .gte('created_at', startDate.toISOString());
  
  const summary: Record<string, number> = {};
  
  data?.forEach(event => {
    summary[event.event_type] = (summary[event.event_type] || 0) + 1;
  });
  
  return summary;
}

/**
 * Verify volunteer
 */
export async function verifyVolunteer(volunteerId: string) {
  const { data, error } = await supabase
    .from('volunteers')
    .update({
      is_verified: true,
      verified_at: new Date().toISOString(),
      status: 'ACTIVE'
    })
    .eq('id', volunteerId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Suspend volunteer
 */
export async function suspendVolunteer(volunteerId: string, reason?: string) {
  const { data, error } = await supabase
    .from('volunteers')
    .update({
      status: 'SUSPENDED',
      updated_at: new Date().toISOString()
    })
    .eq('id', volunteerId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Get system configuration
 */
export async function getSystemConfig() {
  const { data, error } = await supabase
    .from('system_settings')
    .select('*');
  
  if (error) throw error;
  
  const config: Record<string, any> = {};
  
  data?.forEach(setting => {
    config[setting.key] = setting.value;
  });
  
  return config;
}

/**
 * Update system configuration
 */
export async function updateSystemConfig(key: string, value: any) {
  const { data, error } = await supabase
    .from('system_settings')
    .upsert({
      key,
      value,
      updated_at: new Date().toISOString()
    }, { onConflict: 'key' })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Get API service status
 */
export async function checkApiServiceStatus(service: string) {
  try {
    const apiKey = await supabase
      .from('api_keys')
      .select('key_value')
      .eq('service', service)
      .eq('is_active', true)
      .single();
    
    return {
      service,
      configured: !!apiKey.data,
      active: apiKey.data?.key_value ? true : false
    };
  } catch (error) {
    return {
      service,
      configured: false,
      active: false,
      error: 'Service not configured'
    };
  }
}

/**
 * Generate admin report
 */
export async function generateAdminReport(reportType: string, filters?: any) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  let query;
  
  switch (reportType) {
    case 'case_summary':
      query = supabase
        .from('cases')
        .select('*')
        .gte('created_at', thirtyDaysAgo.toISOString());
      break;
    
    case 'volunteer_performance':
      query = supabase
        .from('volunteers')
        .select('*');
      break;
    
    case 'fundraising':
      query = supabase
        .from('donations')
        .select('*')
        .gte('created_at', thirtyDaysAgo.toISOString());
      break;
    
    default:
      throw new Error('Invalid report type');
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
}
