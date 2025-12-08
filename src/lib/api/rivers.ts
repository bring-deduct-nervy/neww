import { supabase } from '@/lib/supabase';

export interface RiverLevel {
  id: string;
  riverName: string;
  stationName: string;
  district: string;
  latitude: number;
  longitude: number;
  currentLevel: number;
  warningLevel: number;
  dangerLevel: number;
  status: 'NORMAL' | 'WARNING' | 'DANGER' | 'CRITICAL';
  recordedAt: string;
}

// Sri Lanka major rivers and monitoring stations
const RIVER_STATIONS = [
  { river: 'Kelani River', station: 'Nagalagam Street', district: 'Colombo', lat: 6.9497, lng: 79.8612, warning: 5.0, danger: 6.0 },
  { river: 'Kelani River', station: 'Hanwella', district: 'Colombo', lat: 6.9097, lng: 80.0842, warning: 8.0, danger: 9.5 },
  { river: 'Kalu Ganga', station: 'Putupaula', district: 'Kalutara', lat: 6.5854, lng: 80.0607, warning: 4.5, danger: 5.5 },
  { river: 'Kalu Ganga', station: 'Ratnapura', district: 'Ratnapura', lat: 6.6828, lng: 80.3992, warning: 6.0, danger: 7.5 },
  { river: 'Nilwala Ganga', station: 'Pitabeddara', district: 'Matara', lat: 6.1549, lng: 80.4550, warning: 3.5, danger: 4.5 },
  { river: 'Gin Ganga', station: 'Baddegama', district: 'Galle', lat: 6.1535, lng: 80.1210, warning: 4.0, danger: 5.0 },
  { river: 'Mahaweli River', station: 'Peradeniya', district: 'Kandy', lat: 7.2706, lng: 80.5937, warning: 7.0, danger: 8.5 },
  { river: 'Walawe Ganga', station: 'Thimbolketiya', district: 'Ratnapura', lat: 6.4828, lng: 80.5992, warning: 5.5, danger: 6.5 },
  { river: 'Attanagalu Oya', station: 'Dunamale', district: 'Gampaha', lat: 7.0917, lng: 79.9942, warning: 3.0, danger: 4.0 },
  { river: 'Maha Oya', station: 'Dewalegama', district: 'Kurunegala', lat: 7.4863, lng: 80.3647, warning: 4.0, danger: 5.0 },
];

function calculateStatus(current: number, warning: number, danger: number): RiverLevel['status'] {
  if (current >= danger * 1.2) return 'CRITICAL';
  if (current >= danger) return 'DANGER';
  if (current >= warning) return 'WARNING';
  return 'NORMAL';
}

export async function generateRiverLevelData(): Promise<RiverLevel[]> {
  const results: RiverLevel[] = [];
  
  for (const station of RIVER_STATIONS) {
    // Generate realistic water level based on random variation
    const baseLevel = station.warning * 0.6;
    const variation = (Math.random() - 0.3) * 2;
    const currentLevel = Math.max(0.5, baseLevel + variation);
    
    const riverLevel: RiverLevel = {
      id: `${station.river}-${station.station}`.replace(/\s/g, '-').toLowerCase(),
      riverName: station.river,
      stationName: station.station,
      district: station.district,
      latitude: station.lat,
      longitude: station.lng,
      currentLevel: parseFloat(currentLevel.toFixed(2)),
      warningLevel: station.warning,
      dangerLevel: station.danger,
      status: calculateStatus(currentLevel, station.warning, station.danger),
      recordedAt: new Date().toISOString()
    };
    
    results.push(riverLevel);
    
    // Store in database
    await supabase.from('river_levels').insert({
      river_name: riverLevel.riverName,
      station_name: riverLevel.stationName,
      district: riverLevel.district,
      latitude: riverLevel.latitude,
      longitude: riverLevel.longitude,
      current_level: riverLevel.currentLevel,
      warning_level: riverLevel.warningLevel,
      danger_level: riverLevel.dangerLevel,
      status: riverLevel.status,
      recorded_at: riverLevel.recordedAt
    });
  }
  
  return results;
}

export async function getRiverLevels(): Promise<any[]> {
  const { data, error } = await supabase
    .from('river_levels')
    .select('*')
    .order('recorded_at', { ascending: false });

  if (error) throw error;
  
  // Get unique latest readings per station
  const latestByStation = new Map();
  data?.forEach(reading => {
    const key = `${reading.river_name}-${reading.station_name}`;
    if (!latestByStation.has(key)) {
      latestByStation.set(key, reading);
    }
  });
  
  return Array.from(latestByStation.values());
}

export async function getRiverLevelHistory(riverName: string, stationName: string, hours: number = 24): Promise<any[]> {
  const since = new Date();
  since.setHours(since.getHours() - hours);

  const { data, error } = await supabase
    .from('river_levels')
    .select('*')
    .eq('river_name', riverName)
    .eq('station_name', stationName)
    .gte('recorded_at', since.toISOString())
    .order('recorded_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export function subscribeToRiverLevels(callback: (payload: any) => void) {
  return supabase
    .channel('river-levels-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'river_levels' }, callback)
    .subscribe();
}
