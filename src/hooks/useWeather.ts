import { useState, useEffect, useCallback } from 'react';
import { WeatherConditions, HourlyForecast, DailyForecast, FloodRiskAssessment, Location } from '@/lib/types';
import { WEATHER_CODES } from '@/lib/constants';

const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1';

interface UseWeatherReturn {
  weather: WeatherConditions | null;
  hourlyForecast: HourlyForecast[];
  dailyForecast: DailyForecast[];
  floodRisk: FloodRiskAssessment | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function getWeatherDescription(code: number): string {
  return WEATHER_CODES[code]?.description || 'Unknown';
}

function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return directions[Math.round(degrees / 22.5) % 16];
}

export function useWeather(location: Location | null): UseWeatherReturn {
  const [weather, setWeather] = useState<WeatherConditions | null>(null);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>([]);
  const [dailyForecast, setDailyForecast] = useState<DailyForecast[]>([]);
  const [floodRisk, setFloodRisk] = useState<FloodRiskAssessment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateFloodRisk = useCallback((
    currentWeather: WeatherConditions,
    hourly: HourlyForecast[]
  ): FloodRiskAssessment => {
    const rainfall24h = hourly.slice(0, 24).reduce((sum, h) => sum + h.rainfall, 0);
    const rainfall72h = hourly.slice(0, 72).reduce((sum, h) => sum + h.rainfall, 0);
    const highPrecipHours = hourly.slice(0, 24).filter(h => h.precipitationProbability > 70).length;

    const factors = {
      rainfall24h: Math.min(rainfall24h / 100 * 100, 100),
      rainfall72h: Math.min(rainfall72h / 200 * 100, 100),
      soilSaturation: Math.min(currentWeather.humidity / 100 * 80, 80),
      riverLevels: 0,
      forecast: (highPrecipHours / 24) * 100
    };

    const score = (
      factors.rainfall24h * 0.3 +
      factors.rainfall72h * 0.25 +
      factors.soilSaturation * 0.2 +
      factors.forecast * 0.25
    );

    let level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    let recommendations: string[] = [];

    if (score >= 75) {
      level = 'CRITICAL';
      recommendations = [
        'Evacuate to higher ground immediately',
        'Avoid all flood-prone areas',
        'Keep emergency supplies ready',
        'Monitor official alerts continuously'
      ];
    } else if (score >= 50) {
      level = 'HIGH';
      recommendations = [
        'Prepare for possible evacuation',
        'Move valuables to higher floors',
        'Stock up on emergency supplies',
        'Stay informed about weather updates'
      ];
    } else if (score >= 25) {
      level = 'MEDIUM';
      recommendations = [
        'Monitor weather conditions closely',
        'Avoid low-lying areas during heavy rain',
        'Keep emergency contacts handy'
      ];
    } else {
      level = 'LOW';
      recommendations = [
        'Normal precautions advised',
        'Stay updated on weather forecasts'
      ];
    }

    return { level, score, factors, recommendations };
  }, []);

  const fetchWeather = useCallback(async () => {
    if (!location) return;

    setIsLoading(true);
    setError(null);

    try {
      const { latitude, longitude } = location;

      // Fetch current weather
      const currentParams = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        current: [
          'temperature_2m',
          'relative_humidity_2m',
          'apparent_temperature',
          'precipitation',
          'rain',
          'weather_code',
          'cloud_cover',
          'pressure_msl',
          'wind_speed_10m',
          'wind_direction_10m',
          'visibility'
        ].join(','),
        timezone: 'Asia/Colombo'
      });

      const currentResponse = await fetch(`${OPEN_METEO_BASE_URL}/forecast?${currentParams}`);
      const currentData = await currentResponse.json();

      const weatherConditions: WeatherConditions = {
        temperature: currentData.current.temperature_2m,
        humidity: currentData.current.relative_humidity_2m,
        rainfall: currentData.current.rain || 0,
        windSpeed: currentData.current.wind_speed_10m,
        windDirection: getWindDirection(currentData.current.wind_direction_10m),
        pressure: currentData.current.pressure_msl,
        cloudCover: currentData.current.cloud_cover,
        visibility: (currentData.current.visibility || 10000) / 1000,
        uvIndex: 0,
        feelsLike: currentData.current.apparent_temperature,
        weatherCode: currentData.current.weather_code,
        weatherDescription: getWeatherDescription(currentData.current.weather_code)
      };

      setWeather(weatherConditions);

      // Fetch hourly forecast
      const hourlyParams = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        hourly: [
          'temperature_2m',
          'relative_humidity_2m',
          'precipitation_probability',
          'precipitation',
          'rain',
          'weather_code',
          'wind_speed_10m'
        ].join(','),
        timezone: 'Asia/Colombo',
        forecast_hours: '72'
      });

      const hourlyResponse = await fetch(`${OPEN_METEO_BASE_URL}/forecast?${hourlyParams}`);
      const hourlyData = await hourlyResponse.json();

      const hourly: HourlyForecast[] = hourlyData.hourly.time.map((time: string, i: number) => ({
        time,
        temperature: hourlyData.hourly.temperature_2m[i],
        rainfall: hourlyData.hourly.rain?.[i] || 0,
        precipitationProbability: hourlyData.hourly.precipitation_probability[i],
        windSpeed: hourlyData.hourly.wind_speed_10m[i],
        humidity: hourlyData.hourly.relative_humidity_2m[i],
        weatherCode: hourlyData.hourly.weather_code[i],
        weatherDescription: getWeatherDescription(hourlyData.hourly.weather_code[i])
      }));

      setHourlyForecast(hourly);

      // Fetch daily forecast
      const dailyParams = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        daily: [
          'temperature_2m_max',
          'temperature_2m_min',
          'precipitation_sum',
          'precipitation_probability_max',
          'weather_code',
          'sunrise',
          'sunset'
        ].join(','),
        timezone: 'Asia/Colombo',
        forecast_days: '7'
      });

      const dailyResponse = await fetch(`${OPEN_METEO_BASE_URL}/forecast?${dailyParams}`);
      const dailyData = await dailyResponse.json();

      const daily: DailyForecast[] = dailyData.daily.time.map((date: string, i: number) => ({
        date,
        tempMax: dailyData.daily.temperature_2m_max[i],
        tempMin: dailyData.daily.temperature_2m_min[i],
        rainfallSum: dailyData.daily.precipitation_sum[i],
        precipitationProbability: dailyData.daily.precipitation_probability_max[i],
        sunrise: dailyData.daily.sunrise[i],
        sunset: dailyData.daily.sunset[i],
        weatherCode: dailyData.daily.weather_code[i],
        weatherDescription: getWeatherDescription(dailyData.daily.weather_code[i])
      }));

      setDailyForecast(daily);

      // Calculate flood risk
      const risk = calculateFloodRisk(weatherConditions, hourly);
      setFloodRisk(risk);

    } catch (err) {
      setError('Failed to fetch weather data');
      console.error('Weather fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [location, calculateFloodRisk]);

  useEffect(() => {
    fetchWeather();
    
    // Refresh every 15 minutes
    const interval = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  return {
    weather,
    hourlyForecast,
    dailyForecast,
    floodRisk,
    isLoading,
    error,
    refetch: fetchWeather
  };
}
