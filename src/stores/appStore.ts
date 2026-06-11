import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { HAEntity, HAConfig } from '../types/haTypes'

interface AppState {
  theme: 'dark' | 'light'
  kioskMode: boolean
  haConfig: HAConfig | null
  entities: Record<string, HAEntity>
  connected: boolean
  connecting: boolean
  error: string | null
  selectedDomains: string[]
  setTheme: (theme: 'dark' | 'light') => void
  setKioskMode: (mode: boolean) => void
  setHAConfig: (config: HAConfig | null) => void
  setEntities: (entities: Record<string, HAEntity>) => void
  updateEntity: (entity: HAEntity) => void
  setConnected: (connected: boolean) => void
  setConnecting: (connecting: boolean) => void
  setError: (error: string | null) => void
  setSelectedDomains: (domains: string[]) => void
  getEntitiesByDomain: (domain: string) => HAEntity[]
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      kioskMode: false,
      haConfig: null,
      entities: {},
      connected: false,
      connecting: false,
      error: null,
      selectedDomains: ['light', 'switch', 'climate', 'media_player', 'sensor', 'camera', 'binary_sensor', 'fan', 'cover'],
      setTheme: (theme) => set({ theme }),
      setKioskMode: (kioskMode) => set({ kioskMode }),
      setHAConfig: (haConfig) => set({ haConfig }),
      setEntities: (entities) => set({ entities }),
      updateEntity: (entity) =>
        set((state) => ({
          entities: { ...state.entities, [entity.entity_id]: entity }
        })),
      setConnected: (connected) => set({ connected }),
      setConnecting: (connecting) => set({ connecting }),
      setError: (error) => set({ error }),
      setSelectedDomains: (selectedDomains) => set({ selectedDomains }),
      getEntitiesByDomain: (domain) =>
        Object.values(get().entities).filter((e) => e.entity_id.startsWith(domain + '.')),
    }),
    {
      name: 'ava-web-storage',
      partialize: (state) => ({
        theme: state.theme,
        haConfig: state.haConfig,
        selectedDomains: state.selectedDomains
      })
    }
  )
)
