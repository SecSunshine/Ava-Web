import { useEffect, useState } from 'react'
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Moon } from 'lucide-react'

export default function WeatherClock() {
  const [time, setTime] = useState(new Date())
  const [weather, setWeather] = useState<any>(null)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('weather-lat') && localStorage.getItem('weather-lon')
    if (!saved) {
      navigator.geolocation?.getCurrentPosition((pos) => {
        localStorage.setItem('weather-lat', String(pos.coords.latitude))
        localStorage.setItem('weather-lon', String(pos.coords.longitude))
        fetchWeather(pos.coords.latitude, pos.coords.longitude)
      })
    } else {
      fetchWeather(parseFloat(localStorage.getItem('weather-lat')!), parseFloat(localStorage.getItem('weather-lon')!))
    }
    const wTimer = setInterval(() => {
      const lat = localStorage.getItem('weather-lat')
      const lon = localStorage.getItem('weather-lon')
      if (lat && lon) fetchWeather(parseFloat(lat), parseFloat(lon))
    }, 600000)
    return () => clearInterval(wTimer)
  }, [])

  const fetchWeather = async (lat: number, lon: number) => {
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`)
      const data = await res.json()
      setWeather(data)
    } catch {
      // ignore
    }
  }

  const weatherIcon = (code?: number, isDay = true) => {
    if (!code) return <Cloud size={32} />
    if (code <= 1) return isDay ? <Sun size={32} className="text-amber-400" /> : <Moon size={32} className="text-slate-300" />
    if (code <= 3) return <Cloud size={32} className="text-slate-400" />
    if (code <= 48) return <Cloud size={32} className="text-gray-400" />
    if (code <= 67) return <CloudRain size={32} className="text-blue-400" />
    if (code <= 77) return <CloudSnow size={32} className="text-cyan-200" />
    if (code <= 99) return <CloudLightning size={32} className="text-yellow-300" />
    return <Cloud size={32} />
  }

  const hours = String(time.getHours()).padStart(2, '0')
  const minutes = String(time.getMinutes()).padStart(2, '0')
  const dateStr = time.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })

  return (
    <div className="flex items-center gap-6">
      <div>
        <div className="text-5xl font-light tabular-nums tracking-tight">{hours}:{minutes}</div>
        <div className="text-[#666] text-sm mt-1">{dateStr}</div>
      </div>
      {weather?.current && (
        <div className="flex items-center gap-3">
          {weatherIcon(weather.current.weather_code)}
          <div>
            <div className="text-2xl font-light">{weather.current.temperature_2m}°C</div>
            {weather.daily && (
              <div className="text-xs text-[#666]">
                {weather.daily.temperature_2m_min[0]}° / {weather.daily.temperature_2m_max[0]}°
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
