import { useState, useEffect } from 'react';

export interface HourlyForecast {
  time: string; // e.g. "3 PM"
  temp: number;
  condition: string;
  icon: string;
  precipChance: number;
}

export interface DailyForecast {
  day: string; // e.g. "Mon"
  date: string; // e.g. "Mar 23"
  high: number;
  low: number;
  condition: string;
  icon: string;
  precipChance: number;
}

export interface WeatherData {
  temp: number;
  feelsLike: number;
  condition: string;
  icon: string;
  high: number;
  low: number;
  wind: string;
  windSpeed: number;
  humidity: number;
  uvIndex: number;
  precipChance: number;
  visibility: number;
  dewPoint: number;
  pressure: number;
  sunrise: string;
  sunset: string;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
}

const FALLBACK_WEATHER: WeatherData = {
  temp: 58,
  feelsLike: 55,
  condition: 'Partly Cloudy',
  icon: '⛅',
  high: 64,
  low: 41,
  wind: 'NW 8 mph',
  windSpeed: 8,
  humidity: 52,
  uvIndex: 4,
  precipChance: 10,
  visibility: 10,
  dewPoint: 39,
  pressure: 30.12,
  sunrise: '7:12 AM',
  sunset: '7:24 PM',
  hourly: [],
  daily: [],
};

// WMO Weather interpretation codes to descriptions
const wmoToCondition = (code: number): string => {
  if (code === 0) return 'Clear';
  if (code <= 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code <= 48) return 'Foggy';
  if (code <= 55) return 'Drizzle';
  if (code <= 57) return 'Freezing Drizzle';
  if (code <= 65) return 'Rain';
  if (code <= 67) return 'Freezing Rain';
  if (code <= 75) return 'Snow';
  if (code === 77) return 'Snow Grains';
  if (code <= 82) return 'Rain Showers';
  if (code <= 86) return 'Snow Showers';
  if (code === 95) return 'Thunderstorm';
  if (code <= 99) return 'Thunderstorm w/ Hail';
  return 'Unknown';
};

const wmoToIcon = (code: number, isDay: boolean = true): string => {
  if (code === 0) return isDay ? '☀️' : '🌙';
  if (code <= 2) return isDay ? '⛅' : '☁️';
  if (code === 3) return '☁️';
  if (code <= 48) return '🌫️';
  if (code <= 57) return '🌦️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌧️';
  if (code <= 86) return '🌨️';
  if (code <= 99) return '⛈️';
  return '🌤️';
};

const degToDir = (deg: number): string => {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
};

const formatHour = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
};

const formatSunTime = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

const formatDay = (isoString: string): { day: string; date: string } => {
  const date = new Date(isoString + 'T12:00:00');
  return {
    day: date.toLocaleDateString('en-US', { weekday: 'short' }),
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  };
};

export const useDCWeather = () => {
  const [weather, setWeather] = useState<WeatherData>(FALLBACK_WEATHER);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Washington DC coordinates: 38.9072, -77.0369
        const res = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=38.9072&longitude=-77.0369' +
          '&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,relative_humidity_2m,surface_pressure,is_day' +
          '&hourly=temperature_2m,weather_code,precipitation_probability' +
          '&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max,uv_index_max,sunrise,sunset' +
          '&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America/New_York&forecast_days=7'
        );

        if (!res.ok) throw new Error('Weather API error');

        const data = await res.json();
        const current = data.current;
        const daily = data.daily;
        const hourly = data.hourly;

        // Build next 12 hours of hourly forecast starting from current hour
        const now = new Date();
        const currentHourIndex = hourly.time.findIndex((t: string) => {
          const hour = new Date(t);
          return hour >= now;
        });

        const hourlyForecast: HourlyForecast[] = [];
        for (let i = 0; i < 12 && currentHourIndex + i < hourly.time.length; i++) {
          const idx = currentHourIndex + i;
          hourlyForecast.push({
            time: formatHour(hourly.time[idx]),
            temp: Math.round(hourly.temperature_2m[idx]),
            condition: wmoToCondition(hourly.weather_code[idx]),
            icon: wmoToIcon(hourly.weather_code[idx]),
            precipChance: hourly.precipitation_probability[idx] ?? 0,
          });
        }

        // Build 7-day daily forecast
        const dailyForecast: DailyForecast[] = [];
        for (let i = 0; i < daily.time.length; i++) {
          const { day, date } = formatDay(daily.time[i]);
          dailyForecast.push({
            day: i === 0 ? 'Today' : day,
            date,
            high: Math.round(daily.temperature_2m_max[i]),
            low: Math.round(daily.temperature_2m_min[i]),
            condition: wmoToCondition(daily.weather_code[i]),
            icon: wmoToIcon(daily.weather_code[i]),
            precipChance: daily.precipitation_probability_max[i] ?? 0,
          });
        }

        // Convert surface pressure from hPa to inHg
        const pressureInHg = current.surface_pressure ? (current.surface_pressure * 0.02953).toFixed(2) : '30.00';

        setWeather({
          temp: Math.round(current.temperature_2m),
          feelsLike: Math.round(current.apparent_temperature),
          condition: wmoToCondition(current.weather_code),
          icon: wmoToIcon(current.weather_code, current.is_day === 1),
          high: Math.round(daily.temperature_2m_max[0]),
          low: Math.round(daily.temperature_2m_min[0]),
          wind: `${degToDir(current.wind_direction_10m)} ${Math.round(current.wind_speed_10m)} mph`,
          windSpeed: Math.round(current.wind_speed_10m),
          humidity: Math.round(current.relative_humidity_2m),
          uvIndex: Math.round(daily.uv_index_max[0]),
          precipChance: daily.precipitation_probability_max[0] ?? 0,
          visibility: 10, // Open-Meteo doesn't provide visibility in free tier
          dewPoint: Math.round(current.temperature_2m - ((100 - current.relative_humidity_2m) / 5)),
          pressure: parseFloat(pressureInHg),
          sunrise: formatSunTime(daily.sunrise[0]),
          sunset: formatSunTime(daily.sunset[0]),
          hourly: hourlyForecast,
          daily: dailyForecast,
        });
      } catch (err) {
        console.error('Weather fetch failed:', err);
        // Keep fallback
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();

    // Refresh weather every 15 minutes
    const interval = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { weather, loading };
};
