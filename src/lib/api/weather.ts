// Open-Meteo Weather API Integration
const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1';

export interface WeatherData {
  current: {
    temperature: number;
    humidity: number;
    rainfall: number;
    windSpeed: number;
    windDirection: number;
    pressure: number;
    cloudCover: number;
    visibility: number;
    feelsLike: number;
    weatherCode: number;
  };
  hourly: {
    time: string[];
    temperature: number[];
    humidity: number[];
    precipitation: number[];
    precipitationProbability: number[];
    windSpeed: number[];
    weatherCode: number[];
  };
  daily: {
    time: string[];
    tempMax: number[];
    tempMin: number[];
    precipitationSum: number[];
    precipitationProbability: number[];
    sunrise: string[];
    sunset: string[];
    weatherCode: number[];
  };
}

export async function fetchWeatherData(latitude: number, longitude: number): Promise<WeatherData> {
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
    hourly: [
      'temperature_2m',
      'relative_humidity_2m',
      'precipitation_probability',
      'precipitation',
      'weather_code',
      'wind_speed_10m'
    ].join(','),
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
    forecast_days: '7',
    forecast_hours: '72'
  });

  const response = await fetch(`${OPEN_METEO_BASE_URL}/forecast?${currentParams}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }

  const data = await response.json();

  return {
    current: {
      temperature: data.current.temperature_2m,
      humidity: data.current.relative_humidity_2m,
      rainfall: data.current.rain || 0,
      windSpeed: data.current.wind_speed_10m,
      windDirection: data.current.wind_direction_10m,
      pressure: data.current.pressure_msl,
      cloudCover: data.current.cloud_cover,
      visibility: (data.current.visibility || 10000) / 1000,
      feelsLike: data.current.apparent_temperature,
      weatherCode: data.current.weather_code
    },
    hourly: {
      time: data.hourly.time,
      temperature: data.hourly.temperature_2m,
      humidity: data.hourly.relative_humidity_2m,
      precipitation: data.hourly.precipitation,
      precipitationProbability: data.hourly.precipitation_probability,
      windSpeed: data.hourly.wind_speed_10m,
      weatherCode: data.hourly.weather_code
    },
    daily: {
      time: data.daily.time,
      tempMax: data.daily.temperature_2m_max,
      tempMin: data.daily.temperature_2m_min,
      precipitationSum: data.daily.precipitation_sum,
      precipitationProbability: data.daily.precipitation_probability_max,
      sunrise: data.daily.sunrise,
      sunset: data.daily.sunset,
      weatherCode: data.daily.weather_code
    }
  };
}

// Historical rainfall for flood risk calculation
export async function fetchHistoricalRainfall(
  latitude: number,
  longitude: number,
  days: number = 7
): Promise<{ date: string; rainfall: number }[]> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    start_date: startDate.toISOString().split('T')[0],
    end_date: endDate.toISOString().split('T')[0],
    daily: 'precipitation_sum',
    timezone: 'Asia/Colombo'
  });

  try {
    const response = await fetch(`${OPEN_METEO_BASE_URL}/archive?${params}`);
    const data = await response.json();

    return data.daily.time.map((date: string, i: number) => ({
      date,
      rainfall: data.daily.precipitation_sum[i] || 0
    }));
  } catch {
    return [];
  }
}
