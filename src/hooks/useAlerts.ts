import { useState, useEffect, useCallback } from 'react';
import { Alert, SeverityLevel } from '@/lib/types';
import { supabase } from '@/lib/supabase';

interface UseAlertsReturn {
  alerts: Alert[];
  criticalAlert: Alert | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  dismissAlert: (alertId: string) => void;
  filterBySeverity: (severity: SeverityLevel | 'ALL') => Alert[];
  filterByDistrict: (district: string) => Alert[];
}

export function useAlerts(userDistrict?: string): UseAlertsReturn {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('alerts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      let filteredAlerts = (data || [])
        .filter(alert => !dismissedAlerts.includes(alert.id))
        .map(alert => ({
          id: alert.id,
          type: alert.type,
          severity: alert.severity as SeverityLevel,
          title: alert.title,
          message: alert.message,
          districts: alert.districts || [],
          source: alert.source,
          startsAt: new Date(alert.starts_at),
          expiresAt: alert.expires_at ? new Date(alert.expires_at) : undefined,
          isActive: alert.is_active
        }));

      if (userDistrict) {
        filteredAlerts = filteredAlerts.filter(
          alert => alert.districts.includes(userDistrict) || alert.districts.length === 0
        );
      }

      setAlerts(filteredAlerts);
    } catch (err) {
      setError('Failed to fetch alerts');
      console.error('Error fetching alerts:', err);
    } finally {
      setIsLoading(false);
    }
  }, [dismissedAlerts, userDistrict]);

  useEffect(() => {
    fetchAlerts();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('alerts_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'alerts' },
        () => fetchAlerts()
      )
      .subscribe();

    // Refresh alerts every 5 minutes
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    
    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [fetchAlerts]);

  const criticalAlert = alerts.find(
    alert => alert.severity === 'CRITICAL' && alert.isActive
  ) || null;

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => [...prev, alertId]);
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const filterBySeverity = (severity: SeverityLevel | 'ALL') => {
    if (severity === 'ALL') return alerts;
    return alerts.filter(alert => alert.severity === severity);
  };

  const filterByDistrict = (district: string) => {
    return alerts.filter(alert => alert.districts.includes(district));
  };

  return {
    alerts,
    criticalAlert,
    isLoading,
    error,
    refetch: fetchAlerts,
    dismissAlert,
    filterBySeverity,
    filterByDistrict
  };
}
