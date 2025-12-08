// Nominatim Geocoding API Integration (OpenStreetMap)
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  displayName: string;
  address: {
    road?: string;
    suburb?: string;
    city?: string;
    district?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<GeocodingResult> {
  const params = new URLSearchParams({
    lat: latitude.toString(),
    lon: longitude.toString(),
    format: 'json',
    addressdetails: '1'
  });

  const response = await fetch(`${NOMINATIM_BASE_URL}/reverse?${params}`, {
    headers: {
      'User-Agent': 'ResQ-Unified-App'
    }
  });

  if (!response.ok) {
    throw new Error('Geocoding failed');
  }

  const data = await response.json();

  return {
    latitude: parseFloat(data.lat),
    longitude: parseFloat(data.lon),
    displayName: data.display_name,
    address: {
      road: data.address?.road,
      suburb: data.address?.suburb,
      city: data.address?.city || data.address?.town || data.address?.village,
      district: data.address?.state_district || data.address?.county,
      state: data.address?.state,
      country: data.address?.country,
      postcode: data.address?.postcode
    }
  };
}

export async function searchLocation(query: string): Promise<GeocodingResult[]> {
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    addressdetails: '1',
    limit: '5',
    countrycodes: 'lk' // Limit to Sri Lanka
  });

  const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params}`, {
    headers: {
      'User-Agent': 'ResQ-Unified-App'
    }
  });

  if (!response.ok) {
    throw new Error('Location search failed');
  }

  const data = await response.json();

  return data.map((item: any) => ({
    latitude: parseFloat(item.lat),
    longitude: parseFloat(item.lon),
    displayName: item.display_name,
    address: {
      road: item.address?.road,
      suburb: item.address?.suburb,
      city: item.address?.city || item.address?.town || item.address?.village,
      district: item.address?.state_district || item.address?.county,
      state: item.address?.state,
      country: item.address?.country,
      postcode: item.address?.postcode
    }
  }));
}

// Calculate distance between two coordinates (Haversine formula)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
