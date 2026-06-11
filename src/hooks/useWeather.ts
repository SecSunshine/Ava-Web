import { useState, useEffect } from 'react'

interface WeatherData {
  temperature: number
  humidity: number
  windSpeed: number
  condition: string
  icon: string
}

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchWeather = async (lat: number, lon: number) => {
    setLoading(true)
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`
      )
      const data = await res.json()
      const current = data.current
      setWeather({
        temperature: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        condition: codeToCondition(current.weather_code),
        icon: codeToIcon(current.weather_code)
      })
    } catch (err) {
      console.error('Weather fetch failed:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // 默认北京坐标
    fetchWeather(39.9, 116.4)
    const timer = setInterval(() => fetchWeather(39.9, 116.4), 600000)
    return () => clearInterval(timer)
  }, [])

  return { weather, loading, fetchWeather }
}

function codeToCondition(code: number): string {
  const map: Record<number, string> = {
    0: '晴朗', 1: '大部晴朗', 2: '多云', 3: '阴天',
    45: '雾', 48: '雾凇',
    51: '毛毛雨', 53: '中雨', 55: '大雨',
    61: '小雨', 63: '中雨', 65: '大雨',
    71: '小雪', 73: '中雪', 75: '大雪',
    95: '雷雨', 96: '雷雨伴冰雹', 99: '强雷雨伴冰雹'
  }
  return map[code] || '未知'
}

function codeToIcon(code: number): string {
  if (code === 0 || code === 1) return 'Sun'
  if (code === 2 || code === 3) return 'Cloud'
  if (code >= 51 && code <= 67) return 'CloudRain'
  if (code >= 71 && code <= 77) return 'Snowflake'
  if (code >= 95) return 'CloudLightning'
  return 'Cloud'
}
