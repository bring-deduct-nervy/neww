// GDACS (Global Disaster Alert and Coordination System) API Integration
const GDACS_API_URL = 'https://www.gdacs.org/gdacsapi/api/events';

export interface GDACSAlert {
  eventId: string;
  eventType: string;
  alertLevel: string;
  severity: string;
  country: string;
  name: string;
  description: string;
  fromDate: string;
  toDate: string;
  latitude: number;
  longitude: number;
  url: string;
}

export async function fetchGDACSAlerts(countryCode: string = 'LKA'): Promise<GDACSAlert[]> {
  try {
    const response = await fetch(
      `${GDACS_API_URL}/geteventlist/SEARCH?eventlist=&country=${countryCode}&alertlevel=&fromDate=&toDate=&limit=20`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch GDACS alerts');
    }

    const data = await response.json();

    return data.features?.map((feature: any) => ({
      eventId: feature.properties.eventid,
      eventType: feature.properties.eventtype,
      alertLevel: feature.properties.alertlevel,
      severity: feature.properties.severity?.severitytext,
      country: feature.properties.country,
      name: feature.properties.name,
      description: feature.properties.description,
      fromDate: feature.properties.fromdate,
      toDate: feature.properties.todate,
      latitude: feature.geometry?.coordinates?.[1],
      longitude: feature.geometry?.coordinates?.[0],
      url: feature.properties.url
    })) || [];
  } catch (error) {
    console.error('Error fetching GDACS alerts:', error);
    return [];
  }
}

// Sri Lanka Meteorological Department alerts (mock - would need actual API)
export interface MetDeptAlert {
  id: string;
  type: 'WEATHER' | 'FLOOD' | 'LANDSLIDE' | 'CYCLONE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  districts: string[];
  issuedAt: Date;
  expiresAt?: Date;
}

// Mock function - in production, this would call the actual Met Dept API
export async function fetchMetDeptAlerts(): Promise<MetDeptAlert[]> {
  // This would be replaced with actual API call
  return [
    {
      id: '1',
      type: 'WEATHER',
      severity: 'HIGH',
      title: 'Heavy Rainfall Warning',
      message: 'Heavy rainfall expected in Western and Southern provinces over the next 24 hours. Rainfall may exceed 100mm in some areas.',
      districts: ['Colombo', 'Gampaha', 'Kalutara', 'Galle'],
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      type: 'FLOOD',
      severity: 'CRITICAL',
      title: 'Flood Warning - Kelani River',
      message: 'Water levels in Kelani River have exceeded warning levels. Residents in low-lying areas advised to evacuate.',
      districts: ['Colombo', 'Gampaha'],
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000)
    }
  ];
}

// Disaster Management Centre alerts
export async function fetchDMCAlerts(): Promise<MetDeptAlert[]> {
  // This would be replaced with actual DMC API call
  return [
    {
      id: '3',
      type: 'LANDSLIDE',
      severity: 'HIGH',
      title: 'Landslide Risk - Hill Country',
      message: 'High risk of landslides in Nuwara Eliya, Badulla, and Kegalle districts due to soil saturation.',
      districts: ['Nuwara Eliya', 'Badulla', 'Kegalle'],
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000)
    }
  ];
}
