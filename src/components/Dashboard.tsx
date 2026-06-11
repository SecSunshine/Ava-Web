import { Box, Typography, TextField, InputAdornment } from '@mui/material'
import { Search } from 'lucide-react'
import { useAppStore } from '../stores/appStore'
import { useConnectionStatus } from '../hooks/useConnectionStatus'
import DeviceCard from './DeviceCard'
import { useState } from 'react'

export default function Dashboard() {
  const { entities, selectedDomains } = useAppStore()
  const connectionStatus = useConnectionStatus()
  const [search, setSearch] = useState('')

  const filtered = Object.values(entities).filter((entity) => {
    const domain = entity.entity_id.split('.')[0]
    if (!selectedDomains.includes(domain)) return false
    if (search) {
      const name = (entity.attributes.friendly_name as string) || entity.entity_id
      return name.toLowerCase().includes(search.toLowerCase())
    }
    return true
  })

  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, entity) => {
    const domain = entity.entity_id.split('.')[0]
    if (!acc[domain]) acc[domain] = []
    acc[domain].push(entity)
    return acc
  }, {})

  const domainOrder = ['light', 'switch', 'climate', 'media_player', 'camera', 'sensor', 'binary_sensor', 'fan', 'cover']
  const sortedDomains = Object.keys(grouped).sort(
    (a, b) => domainOrder.indexOf(a) - domainOrder.indexOf(b)
  )

  const domainLabels: Record<string, string> = {
    light: '灯光',
    switch: '开关',
    climate: '温控',
    media_player: '媒体',
    camera: '摄像头',
    sensor: '传感器',
    binary_sensor: '状态',
    fan: '风扇',
    cover: '窗帘'
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, pt: 10, pb: 4 }}>
      <TextField
        placeholder="搜索设备..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        fullWidth
        size="small"
        sx={{ mb: 3, maxWidth: 400 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search size={18} />
            </InputAdornment>
          )
        }}
      />

      {connectionStatus !== 'connected' && (
        <Box sx={{ mb: 3, p: 2, borderRadius: 2, bgcolor: 'rgba(239,83,80,0.1)', border: '1px solid rgba(239,83,80,0.2)' }}>
          <Typography variant="body2" sx={{ color: '#ef5350' }}>
            {connectionStatus === 'connecting' ? '正在连接 Home Assistant...' : '未连接到 Home Assistant，请在设置中配置连接。'}
          </Typography>
        </Box>
      )}

      {filtered.length === 0 && connectionStatus === 'connected' && (
        <Box sx={{ textAlign: 'center', py: 8, opacity: 0.5 }}>
          <Typography variant="h6">暂无设备</Typography>
          <Typography variant="body2">请在设置中选择要显示的实体类型</Typography>
        </Box>
      )}

      {sortedDomains.map((domain) => (
        <Box key={domain} sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600, opacity: 0.85 }}>
            {domainLabels[domain] || domain}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {grouped[domain].map((entity) => (
              <DeviceCard key={entity.entity_id} entity={entity} />
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  )
}
