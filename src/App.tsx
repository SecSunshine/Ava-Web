import { Box, Typography, Paper } from '@mui/material'
import KioskBar from './components/KioskBar'
import WeatherClock from './components/WeatherClock'
import Dashboard from './components/Dashboard'
import SettingsDialog from './components/SettingsDialog'
import { useAppStore } from './stores/appStore'
import { useHAConnection } from './hooks/useHAConnection'
import { useConnectionStatus } from './hooks/useConnectionStatus'

export default function App() {
  const { haConfig } = useAppStore()
  const { connect } = useHAConnection()
  const connectionStatus = useConnectionStatus()

  if (!haConfig) {
    return (
      <Box sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        bgcolor: 'background.default'
      }}>
        <Paper sx={{ p: 4, maxWidth: 480, width: '100%', textAlign: 'center', borderRadius: 4 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              AVA
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.6 }}>
              智能家居中控屏
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mb: 3, opacity: 0.7 }}>
            欢迎使用 Ava Web！请先配置 Home Assistant 连接信息。
          </Typography>
          <SettingsDialog />
        </Paper>
      </Box>
    )
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <KioskBar />
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <WeatherClock />
        <Dashboard />
      </Box>
    </Box>
  )
}
