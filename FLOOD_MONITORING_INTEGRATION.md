# Flood Monitoring Integration Documentation

## Overview

ResQ-Unified has been integrated with the **Sri Lankan Flood Monitor Dashboard** to provide real-time flood monitoring and early warning alerts. This integration fetches live water level data from the Disaster Management Center (DMC) API and displays it directly within the ResQ-Unified platform.

**Data Source**: [Disaster Management Center (DMC) via nuuuwan/lk_dmc_vis](https://github.com/nuuuwan/lk_dmc_vis)

**API Endpoint**: `https://flood-monitor-yncnkpwl8-rensithudaragonalagoda-3015s-projects.vercel.app/api`

---

## Architecture

### Integration Points

```
┌─────────────────────────────────────────┐
│  Sri Lankan Flood Monitor API            │
│  (Real-time water levels & alerts)      │
└──────────────────┬──────────────────────┘
                   │
                   ├─→ /api/stations (130+ gauging stations)
                   ├─→ /api/rivers (major rivers)
                   ├─→ /api/basins (drainage basins)
                   ├─→ /api/levels (water level data)
                   └─→ /api/alerts (flood alerts)
                   │
                   ▼
┌─────────────────────────────────────────┐
│  ResQ-Unified                            │
├─────────────────────────────────────────┤
│  Frontend                                │
│  ├─ FloodMonitoringPage                  │
│  ├─ useFloodMonitor Hook                 │
│  └─ Real-time UI updates                │
├─────────────────────────────────────────┤
│  APIs (src/lib/api/flood-monitor.ts)    │
│  ├─ getFloodStations()                   │
│  ├─ getFloodAlerts()                     │
│  ├─ getWaterLevels()                     │
│  ├─ syncFloodDataWithBackend()          │
│  └─ subscribeToFloodAlerts()             │
├─────────────────────────────────────────┤
│  Backend (Supabase)                      │
│  ├─ river_levels table                   │
│  ├─ alerts table                         │
│  └─ Real-time subscriptions              │
└─────────────────────────────────────────┘
```

---

## Features

### 1. Real-Time Flood Monitoring
- **Live Water Level Data**: Track water levels at 130+ gauging stations
- **Alert System**: Automatic warnings at danger and critical levels
- **Multi-Level Alerts**:
  - 🟢 **Normal**: Below warning threshold
  - 🟡 **Warning**: Approaching danger level
  - 🔴 **Danger**: At or above danger threshold
  - 🔴 **Critical**: 20% above danger level

### 2. Station Monitoring
- **Station Details**:
  - Current water level
  - Normal level baseline
  - Warning threshold
  - Danger threshold
  - River name and basin
  - Geographic location (lat/lon)
  - District information

### 3. River & Basin Overview
- **River Status**: Aggregate status of all stations in each river
- **Basin Monitoring**: Water level trends across drainage basins
- **Geographic Data**: Map integration with station locations

### 4. Alert Management
- **Active Alerts**: Real-time list of all active flood alerts
- **Alert Details**:
  - Station name and location
  - Current water level
  - Percentage above danger threshold
  - Recommendations for action
  - Timestamp and severity

### 5. Data Synchronization
- **Automatic Syncing**: Flood data synced to ResQ-Unified database
- **Backend Storage**: Water levels and alerts persisted for analytics
- **Real-time Updates**: Changes reflected immediately across UI

---

## API Reference

### Core Functions

#### Stations API

```typescript
// Get all gauging stations
getFloodStations(): Promise<Station[]>

// Get specific station
getFloodStation(stationId: string): Promise<Station | null>

// Get stations by district
getStationsByDistrict(district: string): Promise<Station[]>

// Get stations by river
getStationsByRiver(river: string): Promise<Station[]>

// Search stations
searchFloodStations(query: string): Promise<Station[]>
```

**Station Interface**:
```typescript
interface Station {
  id: string;
  name: string;
  river: string;
  basin: string;
  latitude: number;
  longitude: number;
  district: string;
  alert_level?: 'normal' | 'warning' | 'danger' | 'critical';
  current_level?: number;
  normal_level?: number;
  warning_level?: number;
  danger_level?: number;
  last_updated?: string;
}
```

---

#### Rivers API

```typescript
// Get all rivers
getFloodRivers(): Promise<RiverData[]>

// Get specific river
getFloodRiver(riverId: string): Promise<RiverData | null>
```

**River Interface**:
```typescript
interface RiverData {
  id: string;
  name: string;
  basin: string;
  district: string;
  stations_count: number;
  alert_level: 'normal' | 'warning' | 'danger' | 'critical';
  latest_level?: number;
}
```

---

#### Basins API

```typescript
// Get all basins
getFloodBasins(): Promise<BasinData[]>

// Get specific basin
getFloodBasin(basinId: string): Promise<BasinData | null>
```

**Basin Interface**:
```typescript
interface BasinData {
  id: string;
  name: string;
  area: number;
  district: string;
  rivers_count: number;
  stations_count: number;
  alert_level: 'normal' | 'warning' | 'danger' | 'critical';
}
```

---

#### Water Levels API

```typescript
// Get water level data
getWaterLevels(stationId?: string): Promise<WaterLevelData[]>

// Get water level trend (historical)
getWaterLevelTrend(stationId: string, days?: number): Promise<any[]>
```

**Water Level Interface**:
```typescript
interface WaterLevelData {
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
```

---

#### Alerts API

```typescript
// Get all active alerts
getFloodAlerts(): Promise<FloodAlert[]>

// Get alerts for specific station
getStationAlerts(stationId: string): Promise<FloodAlert[]>

// Get alerts by severity
getAlertsBySeverity(severity: 'warning' | 'danger' | 'critical'): Promise<FloodAlert[]>

// Get dashboard statistics
getFloodDashboardStats(): Promise<DashboardStats>
```

**Alert Interface**:
```typescript
interface FloodAlert {
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
```

---

#### Backend Synchronization

```typescript
// Sync flood data to Supabase
syncFloodDataWithBackend(supabase: any): Promise<{
  success: boolean;
  stations: number;
  alerts: number;
}>
```

---

#### Real-Time Subscriptions

```typescript
// Subscribe to flood alert changes
subscribeToFloodAlerts(
  onAlert: (alert: FloodAlert) => void,
  onError: (error: Error) => void
): () => void  // Returns unsubscribe function
```

---

### Hook: useFloodMonitor

Complete hook for real-time flood monitoring with automatic data fetching and syncing.

```typescript
const {
  // Data
  alerts,
  stations,
  
  // State
  isLoading,
  error,
  lastUpdated,
  
  // Actions
  refresh,
  
  // Filters
  getCriticalAlerts,
  getDangerAlerts,
  getWarningAlerts,
  getStationsAtRisk,
  getStationsWithWarning,
  getAffectedDistricts,
  
  // Summary
  getSummary
} = useFloodMonitor({
  pollInterval: 5 * 60 * 1000,  // 5 minutes
  autoSync: true  // Auto-sync to backend
});
```

**Usage Example**:
```typescript
import { useFloodMonitor } from '@/hooks/useFloodMonitor';

function FloodDashboard() {
  const {
    alerts,
    getCriticalAlerts,
    getSummary,
    isLoading
  } = useFloodMonitor();

  const summary = getSummary();

  return (
    <div>
      <h1>Flood Monitor</h1>
      <p>Critical Alerts: {summary.critical_alerts}</p>
      {alerts.map(alert => (
        <AlertCard key={alert.id} alert={alert} />
      ))}
    </div>
  );
}
```

---

### Hook: useStationMonitor

Monitor a specific station in real-time.

```typescript
const { station, isLoading, error } = useStationMonitor(stationId);
```

---

### Hook: useAlertMonitor

Monitor for new flood alerts with notifications.

```typescript
const { hasNewAlerts, alertCount, alerts } = useAlertMonitor();
```

---

## UI Components

### Flood Monitoring Page

**Route**: `/flood-monitor`

**Features**:
- Real-time statistics overview (stations, alerts, rivers, basins)
- Active flood alerts with details and recommendations
- Gauging station monitoring with search and filtering
- River status overview
- Basin monitoring and statistics

**Tabs**:
1. **Overview**: Summary statistics and key metrics
2. **Alerts**: List of active flood alerts with severity
3. **Stations**: All gauging stations with water levels
4. **Rivers**: River status and aggregated data
5. **Basins**: Drainage basin monitoring

---

## Integration Examples

### Example 1: Display Critical Alerts in Dashboard

```typescript
import { useFloodMonitor } from '@/hooks/useFloodMonitor';
import { AlertTriangle } from 'lucide-react';

export function FloodAlertWidget() {
  const { getCriticalAlerts } = useFloodMonitor();
  const criticalAlerts = getCriticalAlerts();

  return (
    <div className="p-4 border border-red-500 rounded-lg">
      <h3 className="font-semibold flex items-center gap-2">
        <AlertTriangle className="text-red-500" />
        Critical Flood Alerts: {criticalAlerts.length}
      </h3>
      {criticalAlerts.map(alert => (
        <div key={alert.id} className="mt-2 p-2 bg-red-500/10 rounded">
          <p className="font-semibold">{alert.station_name}</p>
          <p className="text-sm">{alert.river_name}</p>
        </div>
      ))}
    </div>
  );
}
```

---

### Example 2: Monitor Specific Station

```typescript
import { useStationMonitor } from '@/hooks/useFloodMonitor';

export function StationDetail({ stationId }: { stationId: string }) {
  const { station, isLoading, error } = useStationMonitor(stationId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!station) return <div>Station not found</div>;

  return (
    <div>
      <h2>{station.name}</h2>
      <div>
        <p>Current Level: {station.current_level?.toFixed(2)}m</p>
        <p>Danger Level: {station.danger_level?.toFixed(2)}m</p>
        <p>Status: {station.alert_level?.toUpperCase()}</p>
      </div>
    </div>
  );
}
```

---

### Example 3: Automatic Data Sync

The `useFloodMonitor` hook automatically syncs data to the Supabase backend:

```typescript
// Data is automatically stored in:
// - river_levels table: Water level measurements
// - alerts table: Flood alerts with details

// Query synced data
const { data } = await supabase
  .from('river_levels')
  .select('*')
  .eq('district', 'Western Province')
  .order('current_level', { ascending: false });
```

---

## Data Persistence

### Synced Tables

#### `river_levels`
Stores historical water level data for analysis and trends.

**Columns**:
- `id` (UUID, primary key)
- `station_name` (text)
- `river_name` (text)
- `basin_name` (text)
- `district` (text)
- `current_level` (numeric)
- `normal_level` (numeric)
- `warning_level` (numeric)
- `danger_level` (numeric)
- `alert_level` (enum)
- `latitude` (numeric)
- `longitude` (numeric)
- `source` (text) = 'flood_monitor_api'
- `external_station_id` (text)
- `sync_timestamp` (timestamp)
- `created_at` (timestamp)

#### `alerts`
Enhanced with flood monitoring data.

**Related Columns**:
- `source` (text) = 'flood_monitor_api'
- `external_alert_id` (text)
- `sync_timestamp` (timestamp)

---

## Configuration

### Environment Variables

Add these optional variables to `.env.local`:

```env
# Flood Monitor API Configuration
VITE_FLOOD_MONITOR_API_URL=https://flood-monitor-yncnkpwl8-rensithudaragonalagoda-3015s-projects.vercel.app/api
VITE_FLOOD_MONITOR_POLL_INTERVAL=300000  # 5 minutes in milliseconds
VITE_FLOOD_MONITOR_AUTO_SYNC=true        # Auto-sync to backend
```

---

## Performance Optimization

### Caching Strategy

```typescript
// The flood monitor API has built-in caching:
// - Station data: Cached for 1 hour
// - Alert data: Cached for 5 minutes
// - Water level data: Live, updated every 15 minutes
```

### Polling Strategy

```typescript
// Default polling intervals:
const POLLING_INTERVALS = {
  flood_monitor: 5 * 60 * 1000,  // 5 minutes
  alert_monitor: 2 * 60 * 1000,  // 2 minutes
  station_monitor: 5 * 60 * 1000  // 5 minutes
};
```

### Optimization Tips

1. **Use specific queries**: Filter by district or station instead of loading all data
2. **Implement local caching**: Cache station data on the client
3. **Limit alert frequency**: Use `pollInterval` to reduce API calls
4. **Batch requests**: Use Promise.all() to fetch multiple data types

---

## Troubleshooting

### Common Issues

#### 1. API Connection Errors

```
Error: Failed to fetch flood stations
```

**Solution**:
- Check internet connectivity
- Verify API endpoint is accessible
- Check CORS settings
- Review API rate limits

#### 2. No Data Displayed

```
Empty stations/alerts list
```

**Solutions**:
- Verify API is returning data (check in browser DevTools)
- Check district filters aren't too restrictive
- Reload page to refresh data
- Check browser console for error messages

#### 3. Slow Loading

**Solutions**:
- Increase `pollInterval` to reduce API calls
- Implement pagination for large datasets
- Use component-level caching
- Optimize database queries

#### 4. Sync Not Working

**Solutions**:
- Verify Supabase connection is active
- Check user has write permissions to tables
- Review `syncFloodDataWithBackend()` logs
- Verify table schema matches expected columns

---

## Testing

### Test Data

The API provides real, live data. For testing with different scenarios:

```typescript
// Mock flood data for testing
const mockStation: Station = {
  id: '1',
  name: 'Test Station',
  river: 'Test River',
  basin: 'Test Basin',
  latitude: 6.927,
  longitude: 80.7789,
  district: 'Western',
  alert_level: 'danger',
  current_level: 3.5,
  normal_level: 2.0,
  warning_level: 2.8,
  danger_level: 3.2,
  last_updated: new Date().toISOString()
};
```

### Unit Test Example

```typescript
import { calculateAlertLevel } from '@/lib/api/flood-monitor';

describe('Flood Monitor Utils', () => {
  it('should calculate critical level', () => {
    const level = calculateAlertLevel(3.85, 2.0, 2.8, 3.2);
    expect(level).toBe('critical');
  });

  it('should calculate danger level', () => {
    const level = calculateAlertLevel(3.2, 2.0, 2.8, 3.2);
    expect(level).toBe('danger');
  });

  it('should calculate warning level', () => {
    const level = calculateAlertLevel(2.8, 2.0, 2.8, 3.2);
    expect(level).toBe('warning');
  });

  it('should calculate normal level', () => {
    const level = calculateAlertLevel(2.0, 2.0, 2.8, 3.2);
    expect(level).toBe('normal');
  });
});
```

---

## Monitoring & Analytics

### Available Metrics

```typescript
const summary = getSummary();
// Returns:
{
  total_alerts: 15,
  critical_alerts: 2,
  danger_alerts: 5,
  warning_alerts: 8,
  total_stations: 130,
  stations_at_risk: 7,
  stations_warning: 12,
  affected_districts: 8,
  last_updated: Date
}
```

### Analytics Queries

```typescript
// Get historical trends
const { data } = await supabase
  .from('river_levels')
  .select('*')
  .eq('station_name', 'Colombo')
  .order('sync_timestamp', { ascending: false })
  .limit(100);

// Analyze by district
const { data } = await supabase
  .from('river_levels')
  .select('district, count(*), avg(current_level)')
  .group_by('district');
```

---

## Security Considerations

### Data Privacy

- API provides public data from DMC
- No sensitive user information in flood data
- All data is anonymized and aggregated

### Rate Limiting

- API rate limit: 100 requests/minute
- ResQ-Unified polls every 5 minutes
- Well within safe limits

### CORS Policy

```typescript
// API has CORS enabled
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, HEAD, OPTIONS
Access-Control-Allow-Headers: *
```

---

## Future Enhancements

- [ ] Historical data analysis with charts
- [ ] Machine learning flood prediction
- [ ] Mobile push notifications for critical alerts
- [ ] SMS alerts for vulnerable populations
- [ ] Volunteer task assignment based on flood risk
- [ ] Shelter occupancy prediction
- [ ] Community flood reporting integration
- [ ] Weather-flood correlation analysis

---

## References

- **Flood Monitor API**: https://github.com/RensithUdara/SriLankan-Flood-Monitor-Dashboard
- **DMC Data Source**: https://github.com/nuuuwan/lk_dmc_vis
- **ResQ-Unified GitHub**: https://github.com/[your-repo]
- **API Documentation**: https://flood-monitor-yncnkpwl8-rensithudaragonalagoda-3015s-projects.vercel.app/docs

---

## Support

For issues or questions regarding flood monitoring integration:

1. Check the troubleshooting section above
2. Review API status at `/health` endpoint
3. Check GitHub issues in both repositories
4. Contact development team with detailed error logs

---

**Last Updated**: December 9, 2025
**Version**: 1.0.0
**Status**: Production Ready ✅
