import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

type TableName = 'cases' | 'volunteers' | 'shelters' | 'alerts' | 'beneficiaries' | 'river_levels' | 'weather_data' | 'emergency_reports';

export function subscribeToTable(
  table: TableName,
  callback: (payload: any) => void
): RealtimeChannel {
  return supabase
    .channel(`${table}-realtime`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      callback
    )
    .subscribe();
}

export function subscribeToMultipleTables(
  tables: TableName[],
  callback: (table: string, payload: any) => void
): RealtimeChannel {
  const channel = supabase.channel('multi-table-realtime');
  
  tables.forEach(table => {
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      (payload) => callback(table, payload)
    );
  });

  return channel.subscribe();
}

export function unsubscribe(channel: RealtimeChannel) {
  supabase.removeChannel(channel);
}

export function subscribeToAlertUpdates(callback: (alert: any) => void) {
  return supabase
    .channel('critical-alerts')
    .on(
      'postgres_changes',
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'alerts',
        filter: 'is_active=eq.true'
      },
      (payload) => callback(payload.new)
    )
    .subscribe();
}

export function subscribeToCaseUpdates(caseId: string, callback: (payload: any) => void) {
  return supabase
    .channel(`case-${caseId}`)
    .on(
      'postgres_changes',
      { 
        event: '*', 
        schema: 'public', 
        table: 'cases',
        filter: `id=eq.${caseId}`
      },
      callback
    )
    .on(
      'postgres_changes',
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'case_notes',
        filter: `case_id=eq.${caseId}`
      },
      callback
    )
    .subscribe();
}

export function subscribeToVolunteerAssignments(volunteerId: string, callback: (payload: any) => void) {
  return supabase
    .channel(`volunteer-${volunteerId}`)
    .on(
      'postgres_changes',
      { 
        event: '*', 
        schema: 'public', 
        table: 'cases',
        filter: `assigned_volunteer_id=eq.${volunteerId}`
      },
      callback
    )
    .subscribe();
}
