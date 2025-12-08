import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DISTRICTS_COORDS: Record<string, { lat: number; lng: number }> = {
  'Colombo': { lat: 6.9271, lng: 79.8612 },
  'Gampaha': { lat: 7.0917, lng: 79.9942 },
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

function calculateFloodRisk(rainfall: number, humidity: number): string {
  if (rainfall > 100 || (rainfall > 50 && humidity > 90)) return 'CRITICAL';
  if (rainfall > 50 || (rainfall > 25 && humidity > 85)) return 'HIGH';
  if (rainfall > 25 || humidity > 80) return 'MEDIUM';
  return 'LOW';
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const results: any[] = [];

    for (const [district, coords] of Object.entries(DISTRICTS_COORDS)) {
      try {
        const params = new URLSearchParams({
          latitude: coords.lat.toString(),
          longitude: coords.lng.toString(),
          current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m',
          timezone: 'Asia/Colombo'
        });

        const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
        const data = await response.json();

        if (data.current) {
          const weatherData = {
            district,
            latitude: coords.lat,
            longitude: coords.lng,
            temperature: data.current.temperature_2m,
            humidity: data.current.relative_humidity_2m,
            rainfall: data.current.rain || 0,
            wind_speed: data.current.wind_speed_10m,
            wind_direction: data.current.wind_direction_10m,
            pressure: data.current.pressure_msl,
            cloud_cover: data.current.cloud_cover,
            feels_like: data.current.apparent_temperature,
            weather_code: data.current.weather_code,
            flood_risk_level: calculateFloodRisk(
              data.current.rain || 0,
              data.current.relative_humidity_2m
            ),
            recorded_at: new Date().toISOString()
          };

          const { error } = await supabase
            .from('weather_data')
            .insert(weatherData);

          if (!error) {
            results.push({ district, status: 'success' });
          } else {
            results.push({ district, status: 'error', error: error.message });
          }
        }
      } catch (err) {
        results.push({ district, status: 'error', error: err.message });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Synced weather data for ${results.filter(r => r.status === 'success').length} districts`,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error syncing weather:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
