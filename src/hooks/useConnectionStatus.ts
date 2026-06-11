import { useAppStore } from '../stores/appStore'

export function useConnectionStatus() {
  return useAppStore((s) => {
    if (s.error) return 'error' as const
    if (s.connecting) return 'connecting' as const
    if (s.connected) return 'connected' as const
    return 'disconnected' as const
  })
}
