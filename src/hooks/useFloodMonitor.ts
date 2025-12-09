import { useEffect, useState, useCallback, useRef } from 'react';
import {
  getFloodAlerts,
  getFloodStations,
  subscribeToFloodAlerts,
  FloodAlert,
  Station,
  syncFloodDataWithBackend
} from '@/lib/api/flood-monitor';
import { supabase } from '@/lib/supabase';

interface UseFloodMonitorOptions {
  pollInterval?: number; // in milliseconds
  autoSync?: boolean; // auto-sync to Supabase
}

/**
 * Hook for real-time flood monitoring
 * Manages flood alerts, stations, and automatic syncing with backend
 */
export function useFloodMonitor(options: UseFloodMonitorOptions = {}) {
  const {
    pollInterval = 5 * 60 * 1000, // 5 minutes default
    autoSync = true
  } = options;

  const [alerts, setAlerts] = useState<FloodAlert[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Load flood data
  const loadFloodData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [alertsData, stationsData] = await Promise.all([
        getFloodAlerts(),
        getFloodStations()
      ]);

      setAlerts(alertsData);
      setStations(stationsData);
      setLastUpdated(new Date());

      // Auto-sync to backend if enabled
      if (autoSync && supabase) {
        try {
          await syncFloodDataWithBackend(supabase);
        } catch (syncError) {
          console.warn('Failed to sync flood data to backend:', syncError);
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error('Error loading flood data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [autoSync]);

  // Subscribe to real-time alerts
  const subscribeToAlerts = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    unsubscribeRef.current = subscribeToFloodAlerts(
      (alert) => {
        setAlerts(prev => {
          const exists = prev.some(a => a.id === alert.id);
          if (exists) {
            return prev.map(a => a.id === alert.id ? alert : a);
          } else {
            return [alert, ...prev];
          }
        });
      },
      (error) => {
        console.error('Error in flood alert subscription:', error);
        setError(error);
      }
    );
  }, []);

  // Setup polling and subscription
  useEffect(() => {
    // Initial load
    loadFloodData();

    // Setup polling
    const pollInterval_ = setInterval(loadFloodData, pollInterval);

    // Setup real-time subscription
    subscribeToAlerts();

    // Cleanup
    return () => {
      clearInterval(pollInterval_);
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [loadFloodData, subscribeToAlerts, pollInterval]);

  // Get critical alerts
  const getCriticalAlerts = useCallback((): FloodAlert[] => {
    return alerts.filter(a => a.alert_type === 'critical');
  }, [alerts]);

  // Get danger alerts
  const getDangerAlerts = useCallback((): FloodAlert[] => {
    return alerts.filter(a => a.alert_type === 'danger');
  }, [alerts]);

  // Get warning alerts
  const getWarningAlerts = useCallback((): FloodAlert[] => {
    return alerts.filter(a => a.alert_type === 'warning');
  }, [alerts]);

  // Get stations at risk
  const getStationsAtRisk = useCallback((): Station[] => {
    return stations.filter(s => {
      const level = s.current_level || 0;
      return level >= (s.danger_level || Infinity);
    });
  }, [stations]);

  // Get stations with warning
  const getStationsWithWarning = useCallback((): Station[] => {
    return stations.filter(s => {
      const level = s.current_level || 0;
      return level >= (s.warning_level || Infinity) && level < (s.danger_level || Infinity);
    });
  }, [stations]);

  // Get affected districts
  const getAffectedDistricts = useCallback((): string[] => {
    return [...new Set(alerts.map(a => a.district))];
  }, [alerts]);

  // Get summary
  const getSummary = useCallback(() => ({
    total_alerts: alerts.length,
    critical_alerts: getCriticalAlerts().length,
    danger_alerts: getDangerAlerts().length,
    warning_alerts: getWarningAlerts().length,
    total_stations: stations.length,
    stations_at_risk: getStationsAtRisk().length,
    stations_warning: getStationsWithWarning().length,
    affected_districts: getAffectedDistricts().length,
    last_updated: lastUpdated
  }), [alerts, stations, getCriticalAlerts, getDangerAlerts, getWarningAlerts, getStationsAtRisk, getStationsWithWarning, getAffectedDistricts, lastUpdated]);

  return {
    // Data
    alerts,
    stations,

    // State
    isLoading,
    error,
    lastUpdated,

    // Actions
    refresh: loadFloodData,

    // Filters
    getCriticalAlerts,
    getDangerAlerts,
    getWarningAlerts,
    getStationsAtRisk,
    getStationsWithWarning,
    getAffectedDistricts,

    // Summary
    getSummary
  };
}

/**
 * Hook for monitoring a specific station
 */
export function useStationMonitor(stationId: string) {
  const [station, setStation] = useState<Station | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadStation = async () => {
      try {
        setIsLoading(true);
        const { getFloodStation } = await import('@/lib/api/flood-monitor');
        const data = await getFloodStation(stationId);
        setStation(data);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStation();

    // Poll every 5 minutes
    const interval = setInterval(loadStation, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [stationId]);

  return { station, isLoading, error };
}

/**
 * Hook for monitoring alert status
 */
export function useAlertMonitor() {
  const [hasNewAlerts, setHasNewAlerts] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const previousCountRef = useRef(0);

  const { alerts } = useFloodMonitor({ pollInterval: 2 * 60 * 1000 }); // 2 minutes

  useEffect(() => {
    if (alerts.length > previousCountRef.current) {
      setHasNewAlerts(true);
      // Auto-hide notification after 10 seconds
      const timeout = setTimeout(() => setHasNewAlerts(false), 10000);
      return () => clearTimeout(timeout);
    }
    previousCountRef.current = alerts.length;
    setAlertCount(alerts.length);
  }, [alerts]);

  return { hasNewAlerts, alertCount, alerts };
}
