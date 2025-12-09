/**
 * Flood Monitor Integration
 * Integrates Sri Lankan Flood Monitor Dashboard API with ResQ-Unified
 * Data source: DMC via nuuuwan/lk_dmc_vis
 */

const FLOOD_MONITOR_API_BASE = 'https://flood-monitor-yncnkpwl8-rensithudaragonalagoda-3015s-projects.vercel.app/api';

// Station types for Sri Lanka flood monitoring
export interface Station {
  id: string;
  name: string;
  river: string;
  basin: string;
  latitude: number;
  longitude: number;
  district: string;
  alert_level?: string;
  current_level?: number;
  normal_level?: number;
  warning_level?: number;
  danger_level?: number;
  last_updated?: string;
}

export interface RiverData {
  id: string;
  name: string;
  basin: string;
  district: string;
  stations_count: number;
  alert_level: string;
  latest_level?: number;
}

export interface BasinData {
  id: string;
  name: string;
  area: number;
  district: string;
  rivers_count: number;
  stations_count: number;
  alert_level: string;
}

export interface WaterLevelData {
  station_id: string;
  station_name: string;
  river_name: string;
  current_level: number;
  normal_level: number;
  warning_level: number;
  danger_level: number;
  trend: 'rising' | 'stable' | 'falling';
  timestamp: string;
  alert_status: 'normal' | 'warning' | 'danger' | 'critical';
}

export interface FloodAlert {
  id: string;
  station_id: string;
  station_name: string;
  river_name: string;
  district: string;
  alert_type: 'warning' | 'danger' | 'critical';
  level: number;
  percentage: number;
  description: string;
  recommendation: string;
  timestamp: string;
  resolved: boolean;
}

/**
 * Fetch all gauging stations with current status
 */
export async function getFloodStations(): Promise<Station[]> {
  try {
    const response = await fetch(`${FLOOD_MONITOR_API_BASE}/stations`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return data.data || data || [];
  } catch (error) {
    console.error('Error fetching flood stations:', error);
    return [];
  }
}

/**
 * Get details for a specific station
 */
export async function getFloodStation(stationId: string): Promise<Station | null> {
  try {
    const response = await fetch(`${FLOOD_MONITOR_API_BASE}/stations/${stationId}`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return data.data || data || null;
  } catch (error) {
    console.error(`Error fetching station ${stationId}:`, error);
    return null;
  }
}

/**
 * Get all rivers with status
 */
export async function getFloodRivers(): Promise<RiverData[]> {
  try {
    const response = await fetch(`${FLOOD_MONITOR_API_BASE}/rivers`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return data.data || data || [];
  } catch (error) {
    console.error('Error fetching rivers:', error);
    return [];
  }
}

/**
 * Get specific river data
 */
export async function getFloodRiver(riverId: string): Promise<RiverData | null> {
  try {
    const response = await fetch(`${FLOOD_MONITOR_API_BASE}/rivers/${riverId}`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return data.data || data || null;
  } catch (error) {
    console.error(`Error fetching river ${riverId}:`, error);
    return null;
  }
}

/**
 * Get all basins with alert status
 */
export async function getFloodBasins(): Promise<BasinData[]> {
  try {
    const response = await fetch(`${FLOOD_MONITOR_API_BASE}/basins`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return data.data || data || [];
  } catch (error) {
    console.error('Error fetching basins:', error);
    return [];
  }
}

/**
 * Get specific basin data
 */
export async function getFloodBasin(basinId: string): Promise<BasinData | null> {
  try {
    const response = await fetch(`${FLOOD_MONITOR_API_BASE}/basins/${basinId}`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return data.data || data || null;
  } catch (error) {
    console.error(`Error fetching basin ${basinId}:`, error);
    return null;
  }
}

/**
 * Get water level data for a specific station
 */
export async function getWaterLevels(stationId?: string): Promise<WaterLevelData[]> {
  try {
    const url = stationId 
      ? `${FLOOD_MONITOR_API_BASE}/levels/${stationId}`
      : `${FLOOD_MONITOR_API_BASE}/levels`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return data.data || data || [];
  } catch (error) {
    console.error('Error fetching water levels:', error);
    return [];
  }
}

/**
 * Get active flood alerts
 */
export async function getFloodAlerts(): Promise<FloodAlert[]> {
  try {
    const response = await fetch(`${FLOOD_MONITOR_API_BASE}/alerts`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return data.data || data || [];
  } catch (error) {
    console.error('Error fetching flood alerts:', error);
    return [];
  }
}

/**
 * Get alerts for a specific station
 */
export async function getStationAlerts(stationId: string): Promise<FloodAlert[]> {
  try {
    const response = await fetch(`${FLOOD_MONITOR_API_BASE}/alerts?station=${stationId}`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return data.data || data || [];
  } catch (error) {
    console.error(`Error fetching alerts for station ${stationId}:`, error);
    return [];
  }
}

/**
 * Get alerts by severity
 */
export async function getAlertsBySeverity(severity: 'warning' | 'danger' | 'critical'): Promise<FloodAlert[]> {
  try {
    const response = await fetch(`${FLOOD_MONITOR_API_BASE}/alerts?severity=${severity}`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return data.data || data || [];
  } catch (error) {
    console.error(`Error fetching ${severity} alerts:`, error);
    return [];
  }
}

/**
 * Get flood dashboard statistics
 */
export async function getFloodDashboardStats() {
  try {
    const [stations, rivers, basins, alerts] = await Promise.all([
      getFloodStations(),
      getFloodRivers(),
      getFloodBasins(),
      getFloodAlerts()
    ]);

    const criticalAlerts = alerts.filter(a => a.alert_type === 'critical').length;
    const dangerAlerts = alerts.filter(a => a.alert_type === 'danger').length;
    const warningAlerts = alerts.filter(a => a.alert_type === 'warning').length;

    return {
      stations: {
        total: stations.length,
        at_risk: stations.filter(s => {
          const level = s.current_level || 0;
          return level >= (s.danger_level || Infinity);
        }).length,
        warning: stations.filter(s => {
          const level = s.current_level || 0;
          return level >= (s.warning_level || Infinity) && level < (s.danger_level || Infinity);
        }).length
      },
      rivers: rivers.length,
      basins: basins.length,
      alerts: {
        total: alerts.length,
        critical: criticalAlerts,
        danger: dangerAlerts,
        warning: warningAlerts
      },
      affected_districts: [...new Set(alerts.map(a => a.district))].length,
      last_updated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return null;
  }
}

/**
 * Get historical water level trend for a station
 */
export async function getWaterLevelTrend(stationId: string, days: number = 7): Promise<any[]> {
  try {
    const response = await fetch(
      `${FLOOD_MONITOR_API_BASE}/levels/${stationId}/trend?days=${days}`
    );
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return data.data || data || [];
  } catch (error) {
    console.error(`Error fetching trend for station ${stationId}:`, error);
    return [];
  }
}

/**
 * Search stations by name or district
 */
export async function searchFloodStations(query: string): Promise<Station[]> {
  try {
    const stations = await getFloodStations();
    return stations.filter(s => 
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.district.toLowerCase().includes(query.toLowerCase()) ||
      s.river.toLowerCase().includes(query.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching stations:', error);
    return [];
  }
}

/**
 * Get stations by district
 */
export async function getStationsByDistrict(district: string): Promise<Station[]> {
  try {
    const stations = await getFloodStations();
    return stations.filter(s => s.district.toLowerCase() === district.toLowerCase());
  } catch (error) {
    console.error(`Error fetching stations for district ${district}:`, error);
    return [];
  }
}

/**
 * Get stations by river
 */
export async function getStationsByRiver(river: string): Promise<Station[]> {
  try {
    const stations = await getFloodStations();
    return stations.filter(s => s.river.toLowerCase() === river.toLowerCase());
  } catch (error) {
    console.error(`Error fetching stations for river ${river}:`, error);
    return [];
  }
}

/**
 * Calculate alert level for water data
 */
export function calculateAlertLevel(
  currentLevel: number,
  normalLevel: number,
  warningLevel: number,
  dangerLevel: number
): 'normal' | 'warning' | 'danger' | 'critical' {
  if (currentLevel >= dangerLevel * 1.2) return 'critical';
  if (currentLevel >= dangerLevel) return 'danger';
  if (currentLevel >= warningLevel) return 'warning';
  return 'normal';
}

/**
 * Format alert level for display
 */
export function getAlertLevelColor(level: 'normal' | 'warning' | 'danger' | 'critical'): string {
  switch (level) {
    case 'critical':
      return '#ff0000'; // Red
    case 'danger':
      return '#ff6600'; // Orange-red
    case 'warning':
      return '#ffcc00'; // Orange
    case 'normal':
      return '#00cc00'; // Green
    default:
      return '#999999';
  }
}

/**
 * Get alert description based on water level
 */
export function getAlertDescription(
  currentLevel: number,
  normalLevel: number,
  dangerLevel: number
): string {
  const percentage = ((currentLevel - normalLevel) / (dangerLevel - normalLevel)) * 100;
  
  if (percentage >= 120) {
    return 'CRITICAL: Water levels are dangerously high. Immediate evacuation recommended.';
  } else if (percentage >= 100) {
    return 'DANGER: Water levels exceed danger threshold. Prepare for evacuation.';
  } else if (percentage >= 80) {
    return 'WARNING: Water levels rising towards danger threshold. Stay alert.';
  } else if (percentage >= 50) {
    return 'CAUTION: Water levels elevated. Monitor situation closely.';
  } else {
    return 'NORMAL: Water levels within acceptable range.';
  }
}

/**
 * Get recommendation based on alert level
 */
export function getAlertRecommendation(level: 'normal' | 'warning' | 'danger' | 'critical'): string {
  switch (level) {
    case 'critical':
      return 'IMMEDIATE ACTION: Evacuate low-lying areas immediately. Contact emergency services.';
    case 'danger':
      return 'URGENT: Prepare for evacuation. Gather emergency supplies. Monitor official updates.';
    case 'warning':
      return 'ALERT: Avoid flood-prone areas. Pack emergency bags. Monitor water levels.';
    case 'normal':
      return 'NORMAL: Continue monitoring weather and water levels.';
    default:
      return '';
  }
}

/**
 * Subscribe to real-time flood alerts (WebSocket implementation)
 * Note: This requires WebSocket support from the API
 */
export function subscribeToFloodAlerts(
  onAlert: (alert: FloodAlert) => void,
  onError: (error: Error) => void
): () => void {
  // Polling fallback since the API may not have WebSocket
  const interval = setInterval(async () => {
    try {
      const alerts = await getFloodAlerts();
      alerts.forEach(alert => onAlert(alert));
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Unknown error'));
    }
  }, 30000); // Poll every 30 seconds

  // Return unsubscribe function
  return () => clearInterval(interval);
}

/**
 * Sync flood data with ResQ-Unified backend
 * Stores flood monitoring data in the database for persistence and analytics
 */
export async function syncFloodDataWithBackend(supabase: any) {
  try {
    const [stations, alerts] = await Promise.all([
      getFloodStations(),
      getFloodAlerts()
    ]);

    // Store water level data
    if (stations.length > 0) {
      const waterLevelData = stations.map(station => ({
        station_name: station.name,
        river_name: station.river,
        basin_name: station.basin,
        district: station.district,
        current_level: station.current_level || 0,
        normal_level: station.normal_level || 0,
        warning_level: station.warning_level || 0,
        danger_level: station.danger_level || 0,
        alert_level: station.alert_level || 'normal',
        latitude: station.latitude,
        longitude: station.longitude,
        source: 'flood_monitor_api',
        external_station_id: station.id,
        sync_timestamp: new Date().toISOString()
      }));

      const { error: insertError } = await supabase
        .from('river_levels')
        .insert(waterLevelData);

      if (insertError) {
        console.error('Error syncing water level data:', insertError);
      }
    }

    // Create alerts in ResQ-Unified
    if (alerts.length > 0) {
      const alertData = alerts.map(alert => ({
        title: `Flood Alert: ${alert.station_name}`,
        description: `Water level at ${alert.station_name} in ${alert.district}: ${alert.description}`,
        severity: alert.alert_type === 'critical' ? 'CRITICAL' : 
                 alert.alert_type === 'danger' ? 'WARNING' : 'INFORMATION',
        alert_type: 'FLOOD',
        district: alert.district,
        targeted_roles: ['USER', 'VOLUNTEER', 'COORDINATOR', 'ADMIN'],
        is_active: !alert.resolved,
        source: 'flood_monitor_api',
        external_alert_id: alert.id,
        sync_timestamp: new Date().toISOString()
      }));

      const { error: alertError } = await supabase
        .from('alerts')
        .insert(alertData);

      if (alertError) {
        console.error('Error syncing flood alerts:', alertError);
      }
    }

    return { success: true, stations: stations.length, alerts: alerts.length };
  } catch (error) {
    console.error('Error syncing flood data:', error);
    throw error;
  }
}

/**
 * Get API health status
 */
export async function getFloodMonitorHealth() {
  try {
    const response = await fetch('https://flood-monitor-yncnkpwl8-rensithudaragonalagoda-3015s-projects.vercel.app/health');
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return { ...data, timestamp: new Date().toISOString() };
  } catch (error) {
    console.error('Error checking flood monitor health:', error);
    return { status: 'unhealthy', error: (error as Error).message };
  }
}
