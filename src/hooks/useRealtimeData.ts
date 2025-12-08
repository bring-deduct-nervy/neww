import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useRealtimeData<T>(
  table: string,
  initialFetch: () => Promise<T[]>,
  filters?: Record<string, any>
) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await initialFetch();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [initialFetch]);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel(`${table}-realtime-${Date.now()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setData(prev => [payload.new as T, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setData(prev => prev.map(item => 
              (item as any).id === payload.new.id ? payload.new as T : item
            ));
          } else if (payload.eventType === 'DELETE') {
            setData(prev => prev.filter(item => (item as any).id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

export function useRealtimeCases(filters?: { status?: string; priority?: string; district?: string }) {
  const fetchCases = useCallback(async () => {
    let query = supabase
      .from('cases')
      .select(`
        *,
        beneficiary:beneficiaries(*),
        volunteer:volunteers(*)
      `)
      .order('created_at', { ascending: false });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.priority) query = query.eq('priority', filters.priority);
    if (filters?.district) query = query.eq('district', filters.district);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }, [filters?.status, filters?.priority, filters?.district]);

  return useRealtimeData('cases', fetchCases);
}

export function useRealtimeAlerts(activeOnly = true) {
  const fetchAlerts = useCallback(async () => {
    let query = supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (activeOnly) query = query.eq('is_active', true);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }, [activeOnly]);

  return useRealtimeData('alerts', fetchAlerts);
}

export function useRealtimeShelters(filters?: { status?: string; district?: string }) {
  const fetchShelters = useCallback(async () => {
    let query = supabase
      .from('shelters')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.district) query = query.eq('district', filters.district);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }, [filters?.status, filters?.district]);

  return useRealtimeData('shelters', fetchShelters);
}

export function useRealtimeVolunteers(filters?: { status?: string; district?: string }) {
  const fetchVolunteers = useCallback(async () => {
    let query = supabase
      .from('volunteers')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.district) query = query.eq('district', filters.district);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }, [filters?.status, filters?.district]);

  return useRealtimeData('volunteers', fetchVolunteers);
}

export function useRealtimeRiverLevels() {
  const fetchRiverLevels = useCallback(async () => {
    const { data, error } = await supabase
      .from('river_levels')
      .select('*')
      .order('recorded_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }, []);

  return useRealtimeData('river_levels', fetchRiverLevels);
}

export function useRealtimeWeather(district?: string) {
  const fetchWeather = useCallback(async () => {
    let query = supabase
      .from('weather_data')
      .select('*')
      .order('recorded_at', { ascending: false })
      .limit(1);

    if (district) query = query.eq('district', district);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }, [district]);

  return useRealtimeData('weather_data', fetchWeather);
}

export function useRealtimeStats() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const [cases, beneficiaries, volunteers, shelters, alerts] = await Promise.all([
        supabase.from('cases').select('status, priority, category, district'),
        supabase.from('beneficiaries').select('district, household_size'),
        supabase.from('volunteers').select('status, completed_cases'),
        supabase.from('shelters').select('status, total_capacity, current_occupancy'),
        supabase.from('alerts').select('is_active, severity')
      ]);

      setStats({
        cases: {
          total: cases.data?.length || 0,
          new: cases.data?.filter(c => c.status === 'PENDING').length || 0,
          inProgress: cases.data?.filter(c => ['ASSIGNED', 'IN_PROGRESS'].includes(c.status)).length || 0,
          resolved: cases.data?.filter(c => c.status === 'RESOLVED').length || 0
        },
        beneficiaries: {
          total: beneficiaries.data?.length || 0,
          people: beneficiaries.data?.reduce((sum, b) => sum + (b.household_size || 1), 0) || 0
        },
        volunteers: {
          total: volunteers.data?.length || 0,
          active: volunteers.data?.filter(v => v.status === 'ACTIVE').length || 0
        },
        shelters: {
          total: shelters.data?.length || 0,
          capacity: shelters.data?.reduce((sum, s) => sum + (s.total_capacity || 0), 0) || 0,
          occupancy: shelters.data?.reduce((sum, s) => sum + (s.current_occupancy || 0), 0) || 0
        },
        alerts: {
          active: alerts.data?.filter(a => a.is_active).length || 0,
          critical: alerts.data?.filter(a => a.is_active && a.severity === 'CRITICAL').length || 0
        }
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    const channel = supabase
      .channel('stats-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cases' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'beneficiaries' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'volunteers' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shelters' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, fetchStats)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStats]);

  return { stats, isLoading, refetch: fetchStats };
}
