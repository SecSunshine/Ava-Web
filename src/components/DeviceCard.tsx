import { useAppStore } from '../stores/appStore'
import { Box, Card, CardContent, Typography, Switch, Slider, IconButton } from '@mui/material'
import {
  Lightbulb, Power, Thermometer, Play, Pause, SkipForward, SkipBack,
  Volume2, VolumeX, Camera, Droplets, Eye, Music, Fan, Blinds
} from 'lucide-react'
import { callService } from '../services/haWebSocket'
import type { HAEntity } from '../types/haTypes'

const domainIcons: Record<string, React.ElementType> = {
  light: Lightbulb,
  switch: Power,
  climate: Thermometer,
  media_player: Music,
  camera: Camera,
  sensor: Droplets,
  binary_sensor: Eye,
  fan: Fan,
  cover: Blinds
}

function getFriendlyName(entity: HAEntity): string {
  return (entity.attributes.friendly_name as string) || entity.entity_id
}

export default function DeviceCard({ entity }: { entity: HAEntity }) {
  const domain = getDomain(entity.entity_id)

  switch (domain) {
    case 'light':
      return <LightCard entity={entity} />
    case 'switch':
      return <SwitchCard entity={entity} />
    case 'climate':
      return <ClimateCard entity={entity} />
    case 'media_player':
      return <MediaPlayerCard entity={entity} />
    case 'sensor':
    case 'binary_sensor':
      return <SensorCard entity={entity} />
    case 'camera':
      return <CameraCard entity={entity} />
    default:
      return <GenericCard entity={entity} />
  }
}

function LightCard({ entity }: { entity: HAEntity }) {
  const isOn = entity.state === 'on'
  const brightness = (entity.attributes.brightness as number) || 0
  const friendlyName = getFriendlyName(entity)

  const toggle = () => {
    callService('light', isOn ? 'turn_off' : 'turn_on', entity.entity_id)
  }

  const setBrightness = (event: Event | React.SyntheticEvent, value: number | number[]) => {
    callService('light', 'turn_on', entity.entity_id, { brightness: value as number })
  }

  return (
    <Card className="device-card" sx={{ minWidth: 220, maxWidth: 280, flex: '1 1 220px' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Lightbulb size={22} color={isOn ? '#ffd54f' : '#9e9e9e'} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>
              {friendlyName}
            </Typography>
          </Box>
          <Switch checked={isOn} onChange={toggle} size="small" />
        </Box>
        {isOn && (
          <Slider
            value={brightness}
            min={0}
            max={255}
            onChangeCommitted={setBrightness}
            size="small"
            sx={{ mt: 0.5 }}
          />
        )}
        <Typography variant="caption" sx={{ opacity: 0.5, mt: 0.5, display: 'block' }}>
          {isOn ? `亮度 ${Math.round((brightness / 255) * 100)}%` : '已关闭'}
        </Typography>
      </CardContent>
    </Card>
  )
}

function SwitchCard({ entity }: { entity: HAEntity }) {
  const isOn = entity.state === 'on'
  const friendlyName = getFriendlyName(entity)

  return (
    <Card className="device-card" sx={{ minWidth: 220, maxWidth: 280, flex: '1 1 220px' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Power size={22} color={isOn ? '#81c784' : '#9e9e9e'} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>
              {friendlyName}
            </Typography>
          </Box>
          <Switch checked={isOn} onChange={() => callService('switch', isOn ? 'turn_off' : 'turn_on', entity.entity_id)} size="small" />
        </Box>
        <Typography variant="caption" sx={{ opacity: 0.5, mt: 0.5, display: 'block' }}>
          {isOn ? '开启' : '关闭'}
        </Typography>
      </CardContent>
    </Card>
  )
}

function ClimateCard({ entity }: { entity: HAEntity }) {
  const attrs = entity.attributes
  const currentTemp = (attrs.current_temperature as number) || 0
  const targetTemp = (attrs.temperature as number) || currentTemp
  const hvacMode = (attrs.hvac_mode as string) || 'off'
  const friendlyName = getFriendlyName(entity)

  const setTemp = (event: Event | React.SyntheticEvent, value: number | number[]) => {
    callService('climate', 'set_temperature', entity.entity_id, { temperature: value as number })
  }

  const modes = (attrs.hvac_modes as string[]) || ['off', 'heat', 'cool']

  return (
    <Card className="device-card" sx={{ minWidth: 220, maxWidth: 280, flex: '1 1 220px' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Thermometer size={22} color={hvacMode === 'off' ? '#9e9e9e' : '#ff8a65'} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>
            {friendlyName}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 300 }}>
            {currentTemp}°
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.6 }}>
            当前
          </Typography>
        </Box>
        <Slider
          value={targetTemp}
          min={16}
          max={30}
          step={0.5}
          onChangeCommitted={setTemp}
          size="small"
        />
        <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
          {modes.map((mode) => (
            <Box
              key={mode}
              onClick={() => callService('climate', 'set_hvac_mode', entity.entity_id, { hvac_mode: mode })}
              sx={{
                px: 1.2,
                py: 0.3,
                borderRadius: 1,
                fontSize: '0.75rem',
                cursor: 'pointer',
                background: hvacMode === mode ? 'rgba(79,195,247,0.2)' : 'rgba(128,128,128,0.1)',
                color: hvacMode === mode ? '#4fc3f7' : 'inherit',
                border: '1px solid',
                borderColor: hvacMode === mode ? 'rgba(79,195,247,0.4)' : 'rgba(128,128,128,0.15)'
              }}
            >
              {mode}
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  )
}

function MediaPlayerCard({ entity }: { entity: HAEntity }) {
  const attrs = entity.attributes
  const state = entity.state
  const isPlaying = state === 'playing'
  const volume = ((attrs.volume_level as number) || 0) * 100
  const title = (attrs.media_title as string) || '未知'
  const artist = (attrs.media_artist as string) || ''
  const picture = (attrs.entity_picture as string) || ''
  const friendlyName = getFriendlyName(entity)

  return (
    <Card className="device-card" sx={{ minWidth: 280, maxWidth: 380, flex: '1 1 280px' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Music size={22} color={isPlaying ? '#ba68c8' : '#9e9e9e'} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>
            {friendlyName}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
          {picture && (
            <Box
              component="img"
              src={picture.startsWith('/') ? useAppStore.getState().haConfig?.url + picture : picture}
              sx={{ width: 64, height: 64, borderRadius: 1, objectFit: 'cover', flexShrink: 0 }}
            />
          )}
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
              {title}
            </Typography>
            {artist && (
              <Typography variant="caption" sx={{ opacity: 0.6 }} noWrap>
                {artist}
              </Typography>
            )}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 1 }}>
          <IconButton size="small" onClick={() => callService('media_player', 'media_previous_track', entity.entity_id)}>
            <SkipBack size={18} />
          </IconButton>
          <IconButton size="small" onClick={() => callService('media_player', isPlaying ? 'media_pause' : 'media_play', entity.entity_id)}>
            {isPlaying ? <Pause size={22} /> : <Play size={22} />}
          </IconButton>
          <IconButton size="small" onClick={() => callService('media_player', 'media_next_track', entity.entity_id)}>
            <SkipForward size={18} />
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <VolumeX size={14} />
          <Slider
            value={volume}
            min={0}
            max={100}
            onChangeCommitted={(event: Event | React.SyntheticEvent, v: number | number[]) => callService('media_player', 'volume_set', entity.entity_id, { volume_level: (v as number) / 100 })}
            size="small"
            sx={{ flex: 1 }}
          />
          <Volume2 size={14} />
        </Box>
      </CardContent>
    </Card>
  )
}

function SensorCard({ entity }: { entity: HAEntity }) {
  const friendlyName = getFriendlyName(entity)
  const unit = (entity.attributes.unit_of_measurement as string) || ''

  return (
    <Card className="device-card" sx={{ minWidth: 160, maxWidth: 220, flex: '1 1 160px' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Droplets size={20} color="#4fc3f7" />
          <Typography variant="caption" sx={{ opacity: 0.6 }} noWrap>
            {friendlyName}
          </Typography>
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {entity.state}
          {unit && <Typography component="span" variant="body2" sx={{ ml: 0.5, opacity: 0.6 }}>{unit}</Typography>}
        </Typography>
      </CardContent>
    </Card>
  )
}

function CameraCard({ entity }: { entity: HAEntity }) {
  const friendlyName = getFriendlyName(entity)
  const picture = (entity.attributes.entity_picture as string) || ''
  const baseUrl = useAppStore.getState().haConfig?.url || ''

  return (
    <Card className="device-card" sx={{ minWidth: 280, maxWidth: 400, flex: '1 1 280px' }}>
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Typography variant="caption" sx={{ opacity: 0.6, mb: 0.5, display: 'block' }}>
          {friendlyName}
        </Typography>
        {picture ? (
          <Box
            component="img"
            src={baseUrl + picture}
            sx={{ width: '100%', height: 180, borderRadius: 1, objectFit: 'cover' }}
            alt={friendlyName}
          />
        ) : (
          <Box sx={{ width: '100%', height: 180, borderRadius: 1, bgcolor: 'rgba(128,128,128,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Camera size={40} color="#616161" />
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

function GenericCard({ entity }: { entity: HAEntity }) {
  const domain = getDomain(entity.entity_id)
  const Icon = domainIcons[domain] || Power
  const friendlyName = getFriendlyName(entity)

  return (
    <Card className="device-card" sx={{ minWidth: 200, maxWidth: 260, flex: '1 1 200px' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Icon size={20} color="#9e9e9e" />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>
            {friendlyName}
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ mt: 1, opacity: 0.7 }}>
          {entity.state}
        </Typography>
      </CardContent>
    </Card>
  )
}
function getDomain(entityId: string): string {
  return entityId.split('.')[0]
}