import { useEffect, useRef } from 'react'
import { HAWebSocketService, setGlobalService } from '../services/haWebSocket'
import { useAppStore } from '../stores/appStore'
import type { HAEntity, HAConfig } from '../types/haTypes'

export function useHAConnection() {
  const serviceRef = useRef<HAWebSocketService | null>(null)
  const config = useAppStore((s) => s.haConfig)
  const setEntities = useAppStore((s) => s.setEntities)
  const updateEntity = useAppStore((s) => s.updateEntity)
  const setConnected = useAppStore((s) => s.setConnected)
  const setConnecting = useAppStore((s) => s.setConnecting)
  const setError = useAppStore((s) => s.setError)

  const connect = (cfg: HAConfig) => {
    useAppStore.getState().setHAConfig(cfg)
  }

  useEffect(() => {
    if (!config) return
    setConnecting(true)
    setError(null)

    const svc = new HAWebSocketService(config)
    serviceRef.current = svc
    setGlobalService(svc)

    svc.connect(
      (entity) => updateEntity(entity),
      () => {
        setConnected(true)
        setConnecting(false)
      },
      () => {
        setConnected(false)
        setConnecting(false)
      }
    )

    const onStates = (e: Event) => {
      const detail = (e as CustomEvent<Record<string, HAEntity>>).detail
      setEntities(detail)
    }
    window.addEventListener('ha-states-loaded', onStates)

    return () => {
      svc.disconnect()
      setGlobalService(null)
      window.removeEventListener('ha-states-loaded', onStates)
    }
  }, [config])

  return { connect }
}
