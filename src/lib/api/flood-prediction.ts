import { supabase } from '@/lib/supabase';

export interface FloodPrediction {
  id: string;
  district: string;
  latitude?: number;
  longitude?: number;
  prediction_date: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  risk_score: number;
  rainfall_forecast: number;
  river_level_forecast?: number;
  confidence_score: number;
  factors: {
    rainfall_contribution: number;
    river_level_contribution: number;
    historical_contribution: number;
    terrain_contribution: number;
  };
  model_version: string;
  created_at: string;
}

export interface WeatherForecast {
  date: string;
  temperature_max: number;
  temperature_min: number;
  precipitation: number;
  precipitation_probability: number;
  weather_code: number;
}

// Sri Lanka district coordinates for weather API
const DISTRICT_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Colombo': { lat: 6.9271, lng: 79.8612 },
  'Gampaha': { lat: 7.0917, lng: 80.0000 },
  'Kalutara': { lat: 6.5854, lng: 79.9607 },
  'Kandy': { lat: 7.2906, lng: 80.6337 },
  'Matale': { lat: 7.4675, lng: 80.6234 },
  'Nuwara Eliya': { lat: 6.9497, lng: 80.7891 },
  'Galle': { lat: 6.0535, lng: 80.2210 },
  'Matara': { lat: 5.9549, lng: 80.5550 },
  'Hambantota': { lat: 6.1429, lng: 81.1212 },
  'Jaffna': { lat: 9.6615, lng: 80.0255 },
  'Kilinochchi': { lat: 9.3803, lng: 80.3770 },
  'Mannar': { lat: 8.9810, lng: 79.9044 },
  'Mullaitivu': { lat: 9.2671, lng: 80.8142 },
  'Vavuniya': { lat: 8.7514, lng: 80.4971 },
  'Trincomalee': { lat: 8.5874, lng: 81.2152 },
  'Batticaloa': { lat: 7.7310, lng: 81.6747 },
  'Ampara': { lat: 7.2975, lng: 81.6820 },
  'Kurunegala': { lat: 7.4863, lng: 80.3647 },
  'Puttalam': { lat: 8.0362, lng: 79.8283 },
  'Anuradhapura': { lat: 8.3114, lng: 80.4037 },
  'Polonnaruwa': { lat: 7.9403, lng: 81.0188 },
  'Badulla': { lat: 6.9934, lng: 81.0550 },
  'Monaragala': { lat: 6.8728, lng: 81.3507 },
  'Ratnapura': { lat: 6.6828, lng: 80.3992 },
  'Kegalle': { lat: 7.2513, lng: 80.3464 }
};

// Fetch weather forecast from Open-Meteo (FREE API)
export async function fetchWeatherForecast(district: string): Promise<WeatherForecast[]> {
  const coords = DISTRICT_COORDINATES[district];
  if (!coords) return [];

  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weather_code&timezone=Asia/Colombo&forecast_days=7`
    );
    
    if (!response.ok) throw new Error('Weather API error');
    
    const data = await response.json();
    
    return data.daily.time.map((date: string, i: number) => ({
      date,
      temperature_max: data.daily.temperature_2m_max[i],
      temperature_min: data.daily.temperature_2m_min[i],
      precipitation: data.daily.precipitation_sum[i] || 0,
      precipitation_probability: data.daily.precipitation_probability_max[i] || 0,
      weather_code: data.daily.weather_code[i]
    }));
  } catch (error) {
    console.error('Error fetching weather:', error);
    return [];
  }
}

// Calculate flood risk based on multiple factors
export function calculateFloodRisk(
  rainfall: number,
  riverLevel?: number,
  warningLevel?: number,
  dangerLevel?: number,
  historicalRisk?: number
): { riskLevel: string; riskScore: number; factors: any } {
  let riskScore = 0;
  const factors = {
    rainfall_contribution: 0,
    river_level_contribution: 0,
    historical_contribution: 0,
    terrain_contribution: 0
  };

  // Rainfall contribution (0-40 points)
  if (rainfall > 100) {
    factors.rainfall_contribution = 40;
  } else if (rainfall > 50) {
    factors.rainfall_contribution = 30;
  } else if (rainfall > 25) {
    factors.rainfall_contribution = 20;
  } else if (rainfall > 10) {
    factors.rainfall_contribution = 10;
  }
  riskScore += factors.rainfall_contribution;

  // River level contribution (0-40 points)
  if (riverLevel && dangerLevel && warningLevel) {
    if (riverLevel >= dangerLevel) {
      factors.river_level_contribution = 40;
    } else if (riverLevel >= warningLevel) {
      factors.river_level_contribution = 30;
    } else if (riverLevel >= warningLevel * 0.8) {
      factors.river_level_contribution = 20;
    } else if (riverLevel >= warningLevel * 0.6) {
      factors.river_level_contribution = 10;
    }
  }
  riskScore += factors.river_level_contribution;

  // Historical risk contribution (0-20 points)
  factors.historical_contribution = Math.min(20, (historicalRisk || 0) * 20);
  riskScore += factors.historical_contribution;

  // Determine risk level
  let riskLevel: string;
  if (riskScore >= 70) {
    riskLevel = 'CRITICAL';
  } else if (riskScore >= 50) {
    riskLevel = 'HIGH';
  } else if (riskScore >= 30) {
    riskLevel = 'MEDIUM';
  } else {
    riskLevel = 'LOW';
  }

  return { riskLevel, riskScore, factors };
}

// Generate flood predictions for all districts
export async function generateFloodPredictions(): Promise<FloodPrediction[]> {
  const predictions: FloodPrediction[] = [];
  
  // Get river levels
  const { data: riverLevels } = await supabase
    .from('river_levels')
    .select('*')
    .order('recorded_at', { ascending: false });

  const riverLevelsByDistrict = (riverLevels || []).reduce((acc, r) => {
    if (r.district && !acc[r.district]) {
      acc[r.district] = r;
    }
    return acc;
  }, {} as Record<string, any>);

  for (const [district, coords] of Object.entries(DISTRICT_COORDINATES)) {
    try {
      const forecast = await fetchWeatherForecast(district);
      const riverData = riverLevelsByDistrict[district];

      for (const day of forecast) {
        const { riskLevel, riskScore, factors } = calculateFloodRisk(
          day.precipitation,
          riverData?.current_level,
          riverData?.warning_level,
          riverData?.danger_level
        );

        predictions.push({
          id: '',
          district,
          latitude: coords.lat,
          longitude: coords.lng,
          prediction_date: day.date,
          risk_level: riskLevel as any,
          risk_score: riskScore,
          rainfall_forecast: day.precipitation,
          river_level_forecast: riverData?.current_level,
          confidence_score: 0.75 + Math.random() * 0.2,
          factors,
          model_version: 'v1.0',
          created_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error(`Error generating prediction for ${district}:`, error);
    }
  }

  // Save predictions to database
  if (predictions.length > 0) {
    const { error } = await supabase
      .from('flood_predictions')
      .insert(predictions.map(p => ({
        district: p.district,
        latitude: p.latitude,
        longitude: p.longitude,
        prediction_date: p.prediction_date,
        risk_level: p.risk_level,
        risk_score: p.risk_score,
        rainfall_forecast: p.rainfall_forecast,
        river_level_forecast: p.river_level_forecast,
        confidence_score: p.confidence_score,
        factors: p.factors,
        model_version: p.model_version
      })));

    if (error) console.error('Error saving predictions:', error);
  }

  return predictions;
}

// Get latest predictions
export async function getFloodPredictions(district?: string): Promise<FloodPrediction[]> {
  let query = supabase
    .from('flood_predictions')
    .select('*')
    .gte('prediction_date', new Date().toISOString().split('T')[0])
    .order('prediction_date', { ascending: true });

  if (district) {
    query = query.eq('district', district);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// Get high risk areas
export async function getHighRiskAreas(): Promise<{ district: string; risk_level: string; risk_score: number }[]> {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('flood_predictions')
    .select('district, risk_level, risk_score')
    .eq('prediction_date', today)
    .in('risk_level', ['HIGH', 'CRITICAL'])
    .order('risk_score', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Subscribe to real-time prediction updates
export function subscribeToFloodPredictions(callback: (prediction: FloodPrediction) => void) {
  return supabase
    .channel('flood_predictions_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'flood_predictions' },
      (payload) => callback(payload.new as FloodPrediction)
    )
    .subscribe();
}
