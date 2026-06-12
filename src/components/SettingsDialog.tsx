import { useState } from 'react'
import {
  Box, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, FormGroup, FormControlLabel,
  Checkbox, Typography, IconButton
} from '@mui/material'
import { Settings, X } from 'lucide-react'
import { useAppStore } from '../stores/appStore'

interface SettingsDialogProps {
  showAsButton?: boolean
}

export default function SettingsDialog({ showAsButton = false }: SettingsDialogProps) {
  const [open, setOpen] = useState(false)
  const { haConfig, setHAConfig, selectedDomains, setSelectedDomains } = useAppStore()
  const [url, setUrl] = useState(haConfig?.url || '')
  const [token, setToken] = useState(haConfig?.accessToken || '')

  const domains = ['light', 'switch', 'sensor', 'climate', 'media_player', 'camera', 'binary_sensor', 'fan', 'cover']

  const handleSave = () => {
    if (url && token) {
      setHAConfig({ url: url.replace(/\/$/, ''), accessToken: token })
    }
    setOpen(false)
  }

  const toggleDomain = (domain: string) => {
    if (selectedDomains.includes(domain)) {
      setSelectedDomains(selectedDomains.filter((d) => d !== domain))
    } else {
      setSelectedDomains([...selectedDomains, domain])
    }
  }

  const trigger = showAsButton ? (
    <Button
      variant="contained"
      size="large"
      startIcon={<Settings size={20} />}
      onClick={() => setOpen(true)}
      sx={{ px: 4, py: 1.5, borderRadius: 3 }}
    >
      配置连接
    </Button>
  ) : (
    <IconButton onClick={() => setOpen(true)} size="small">
      <Settings size={20} />
    </IconButton>
  )

  return (
    <>
      {trigger}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          设置
          <IconButton onClick={() => setOpen(false)}><X size={20} /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            Home Assistant 连接
          </Typography>
          <TextField
            label="HA 地址"
            placeholder="https://homeassistant.local:8123"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            fullWidth
            size="small"
          />
          <TextField
            label="Access Token"
            placeholder="eyJ0eXAiOiJKV1QiLCJhbGc..."
            value={token}
            onChange={(e) => setToken(e.target.value)}
            fullWidth
            size="small"
            type="password"
          />
          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            显示实体类型
          </Typography>
          <FormGroup row>
            {domains.map((domain) => (
              <FormControlLabel
                key={domain}
                control={
                  <Checkbox
                    checked={selectedDomains.includes(domain)}
                    onChange={() => toggleDomain(domain)}
                    size="small"
                  />
                }
                label={<Typography variant="body2">{domain}</Typography>}
              />
            ))}
          </FormGroup>
          {haConfig && (
            <Button
              color="error"
              variant="outlined"
              size="small"
              onClick={() => { setHAConfig(null); setUrl(''); setToken(''); setOpen(false) }}
              sx={{ mt: 1 }}
            >
              断开连接 / 清除配置
            </Button>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleSave} disabled={!url || !token}>保存</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
