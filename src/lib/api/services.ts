/**
 * API Service Configuration
 * Manages different API services with free and paid alternatives
 */

export interface ApiService {
  id: string;
  name: string;
  description: string;
  category: 'weather' | 'sms' | 'maps' | 'ai' | 'analytics';
  free?: {
    name: string;
    url: string;
    limitations?: string;
  };
  paid?: {
    name: string;
    url: string;
    pricing: string;
  };
  currentChoice?: 'free' | 'paid';
}

export const availableApiServices: ApiService[] = [
  {
    id: 'weather',
    name: 'Weather & Flood Prediction',
    description: 'Real-time weather data and flood risk predictions',
    category: 'weather',
    free: {
      name: 'Open-Meteo',
      url: 'https://open-meteo.com/',
      limitations: 'Free tier: 10,000 requests/day, publicly available data only'
    },
    paid: {
      name: 'OpenWeatherMap',
      url: 'https://openweathermap.org/api',
      pricing: 'Free tier available + Professional plans'
    },
    currentChoice: 'free'
  },
  {
    id: 'sms',
    name: 'SMS Notifications',
    description: 'Send SMS alerts and notifications',
    category: 'sms',
    free: {
      name: 'AWS SNS',
      url: 'https://aws.amazon.com/sns/',
      limitations: 'Free tier: first 100 SMS/month'
    },
    paid: {
      name: 'Twilio',
      url: 'https://www.twilio.com/',
      pricing: '$0.0075 per SMS (Sri Lanka)'
    },
    currentChoice: 'free'
  },
  {
    id: 'maps',
    name: 'Maps & Geolocation',
    description: 'Interactive maps and location services',
    category: 'maps',
    free: {
      name: 'OpenStreetMap + Leaflet',
      url: 'https://www.openstreetmap.org/',
      limitations: 'Open source, unlimited requests'
    },
    paid: {
      name: 'Google Maps',
      url: 'https://developers.google.com/maps',
      pricing: 'Usage-based pricing, free tier available'
    },
    currentChoice: 'free'
  },
  {
    id: 'ai',
    name: 'AI Assistant',
    description: 'Chatbot and AI-powered emergency guidance',
    category: 'ai',
    paid: {
      name: 'OpenAI',
      url: 'https://openai.com/api/',
      pricing: '$0.002 per 1K tokens for GPT-3.5'
    }
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'User behavior and system analytics',
    category: 'analytics',
    free: {
      name: 'PostHog (Open Source)',
      url: 'https://posthog.com/',
      limitations: 'Open source, unlimited events'
    }
  }
];

/**
 * Get available services for a category
 */
export function getServicesForCategory(category: ApiService['category']): ApiService[] {
  return availableApiServices.filter(service => service.category === category);
}

/**
 * Weather API Implementations
 */

interface WeatherRequestOptions {
  latitude: number;
  longitude: number;
  forecastDays?: number;
}

/**
 * Fetch weather from Open-Meteo (free)
 */
export async function fetchWeatherOpenMeteo(options: WeatherRequestOptions) {
  const params = new URLSearchParams({
    latitude: String(options.latitude),
    longitude: String(options.longitude),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m',
    hourly: 'precipitation,weather_code',
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code',
    timezone: 'auto'
  });
  
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch weather data from Open-Meteo');
  }
  
  return await response.json();
}

/**
 * SMS API Implementations
 */

interface SmsOptions {
  phoneNumber: string;
  message: string;
}

/**
 * Send SMS via AWS SNS (free tier)
 */
export async function sendSmsAwsSns(options: SmsOptions, apiKey: string) {
  // This would require backend implementation
  // Frontend cannot directly call AWS SNS due to security
  const response = await fetch('/api/sms/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: 'aws-sns',
      ...options
    })
  });
  
  if (!response.ok) {
    throw new Error('Failed to send SMS');
  }
  
  return await response.json();
}

/**
 * Send SMS via Twilio
 */
export async function sendSmsTwilio(options: SmsOptions, apiKey: string) {
  const response = await fetch('/api/sms/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: 'twilio',
      ...options
    })
  });
  
  if (!response.ok) {
    throw new Error('Failed to send SMS');
  }
  
  return await response.json();
}

/**
 * Geocoding API
 */

interface GeocodeOptions {
  query: string;
  limit?: number;
}

/**
 * Reverse geocode using OpenStreetMap
 */
export async function reverseGeocodeOsm(latitude: number, longitude: number) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to reverse geocode');
  }
  
  return await response.json();
}

/**
 * Forward geocode using OpenStreetMap
 */
export async function geocodeOsm(options: GeocodeOptions) {
  const params = new URLSearchParams({
    q: options.query,
    format: 'json',
    limit: String(options.limit || 5)
  });
  
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${params}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to geocode');
  }
  
  return await response.json();
}

/**
 * AI Assistant API
 */

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Chat with OpenAI
 */
export async function chatWithOpenAi(
  messages: ChatMessage[],
  apiKey: string,
  model = 'gpt-3.5-turbo'
) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2000
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to chat with AI');
  }
  
  return await response.json();
}

/**
 * Flood Prediction using weather data
 */
export async function predictFloodRisk(
  rainfall: number,
  riverLevel: number,
  historicalData?: { rainfall: number[]; riverLevel: number[] }
) {
  // Simple rule-based prediction
  // In production, this would use ML models
  
  let riskLevel = 'LOW';
  let probability = 0;
  
  // Rainfall-based assessment
  if (rainfall > 50) probability += 30;
  if (rainfall > 100) probability += 20;
  if (rainfall > 150) probability += 20;
  
  // River level assessment
  if (riverLevel > 0.8) probability += 20;
  if (riverLevel > 0.95) probability += 10;
  
  // Trending assessment
  if (historicalData) {
    const rainfallTrend = historicalData.rainfall.length > 1
      ? historicalData.rainfall[historicalData.rainfall.length - 1] - historicalData.rainfall[0]
      : 0;
    
    if (rainfallTrend > 50) probability += 15;
  }
  
  if (probability >= 75) {
    riskLevel = 'EXTREME';
  } else if (probability >= 60) {
    riskLevel = 'VERY_HIGH';
  } else if (probability >= 45) {
    riskLevel = 'HIGH';
  } else if (probability >= 25) {
    riskLevel = 'MODERATE';
  }
  
  return {
    risk_level: riskLevel,
    probability: Math.min(probability, 100),
    factors: {
      rainfall_mm: rainfall,
      river_level: riverLevel,
      trend: historicalData ? 'increasing' : 'stable'
    }
  };
}

/**
 * Free API alternatives mapping
 */
export const freeApiAlternatives: Record<string, string> = {
  'weather': 'OPEN_METEO',
  'sms': 'AWS_SNS',
  'maps': 'OPENSTREETMAP',
  'geocoding': 'NOMINATIM',
  'analytics': 'POSTHOG'
};

/**
 * Check if an API is configured
 */
export function isApiConfigured(apiId: string, config: Record<string, any>): boolean {
  const apiService = availableApiServices.find(s => s.id === apiId);
  
  if (!apiService) return false;
  
  const currentChoice = config[`${apiId}_choice`];
  
  if (currentChoice === 'free') {
    return apiService.free !== undefined;
  } else if (currentChoice === 'paid') {
    const keyName = `${apiId}_api_key`;
    return !!config[keyName];
  }
  
  return false;
}
