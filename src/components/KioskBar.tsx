import { useEffect, useState } from 'react'
import { Box, IconButton, Typography } from '@mui/material'
import { Maximize2, Minimize2, Sun, Moon, Battery, Wifi, WifiOff } from 'lucide-react'
import { useAppStore } from '../stores/appStore'
import { useConnectionStatus } from '../hooks/useConnectionStatus'
import { useFullscreen } from '../hooks/useFullscreen'
import { useScreenWakeLock } from '../hooks/useScreenWakeLock'
import SettingsDialog from './SettingsDialog'

export default function KioskBar() {
  const { theme, setTheme, kioskMode, setKioskMode } = useAppStore()
  const connectionStatus = useConnectionStatus()
  const { isFullscreen, toggle } = useFullscreen()
  const { isLocked, request, release } = useScreenWakeLock()
  const [time, setTime] = useState(new Date())
  const [batteryLevel, setBatteryLevel] = useState(100)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as unknown as { getBattery: () => Promise<{ level: number }> }).getBattery().then((bat) => {
        setBatteryLevel(Math.round(bat.level * 100))
      })
    }
  }, [])

  const toggleKiosk = () => {
    if (!kioskMode) {
      toggle()
      request()
      setKioskMode(true)
    } else {
      toggle()
      release()
      setKioskMode(false)
    }
  }

  return (
    <Box
      className="kiosk-bar"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        zIndex: 1200,
        background: theme === 'dark'
          ? 'rgba(10,10,10,0.8)'
          : 'rgba(255,255,255,0.8)',
        borderBottom: '1px solid rgba(128,128,128,0.15)'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 1 }}>
          AVA
        </Typography>
        {connectionStatus === 'connected' ? (
          <Wifi size={18} color="#81c784" />
        ) : (
          <WifiOff size={18} color="#ef5350" />
        )}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography variant="body2" sx={{ opacity: 0.7, mr: 1 }}>
          {time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', opacity: 0.6, mr: 1 }}>
          <Battery size={16} />
          <Typography variant="caption" sx={{ ml: 0.3 }}>
            {batteryLevel}%
          </Typography>
        </Box>
        <IconButton size="small" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </IconButton>
        <SettingsDialog />
        <IconButton size="small" onClick={toggleKiosk}>
          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </IconButton>
        {isLocked && (
          <Typography variant="caption" sx={{ color: '#81c784', ml: 0.5 }}>
            常亮
          </Typography>
        )}
      </Box>
    </Box>
  )
}
