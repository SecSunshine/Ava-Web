import type { HAEntity, HAConfig } from '../types/haTypes'

type MessageHandler = (data: unknown) => void

let globalService: HAWebSocketService | null = null

export function setGlobalService(svc: HAWebSocketService | null) {
  globalService = svc
}

export function callService(domain: string, service: string, entityId: string, data?: Record<string, unknown>) {
  globalService?.callService(domain, service, entityId, data)
}

export class HAWebSocketService {
  private ws: WebSocket | null = null
  private config: HAConfig
  private id = 1
  private handlers = new Map<number, MessageHandler>()
  private onStateChanged?: (entity: HAEntity) => void
  private onConnected?: () => void
  private onDisconnected?: () => void
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null

  constructor(config: HAConfig) {
    this.config = config
  }

  connect(
    onStateChanged: (entity: HAEntity) => void,
    onConnected: () => void,
    onDisconnected: () => void
  ) {
    this.onStateChanged = onStateChanged
    this.onConnected = onConnected
    this.onDisconnected = onDisconnected
    this.doConnect()
  }

  private doConnect() {
    const url = this.config.url.replace(/^http/, 'ws') + '/api/websocket'
    this.ws = new WebSocket(url)

    this.ws.onopen = () => {
      this.send({ type: 'auth', access_token: this.config.accessToken }, (data: any) => {
        if (data.type === 'auth_ok') {
          this.onConnected?.()
          this.subscribeStates()
          this.fetchStates()
        }
      })
    }

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.id && this.handlers.has(data.id)) {
        this.handlers.get(data.id)!(data)
        if (data.type !== 'event') this.handlers.delete(data.id)
      }
      if (data.type === 'event' && data.event?.data?.new_state) {
        this.onStateChanged?.(data.event.data.new_state)
      }
    }

    this.ws.onclose = () => {
      this.onDisconnected?.()
      this.reconnectTimer = setTimeout(() => this.doConnect(), 5000)
    }

    this.ws.onerror = () => {
      this.ws?.close()
    }
  }

  private send(msg: Record<string, unknown>, handler?: MessageHandler): number {
    const id = this.id++
    const payload = { ...msg, id }
    if (handler) this.handlers.set(id, handler)
    this.ws?.send(JSON.stringify(payload))
    return id
  }

  private subscribeStates() {
    this.send({ type: 'subscribe_events', event_type: 'state_changed' })
  }

  private fetchStates() {
    this.send({ type: 'get_states' }, (data: any) => {
      if (Array.isArray(data.result)) {
        const map: Record<string, HAEntity> = {}
        data.result.forEach((e: HAEntity) => (map[e.entity_id] = e))
        ;(window as any).__haStates = map
        window.dispatchEvent(new CustomEvent('ha-states-loaded', { detail: map }))
      }
    })
  }

  callService(domain: string, service: string, entityId: string, data?: Record<string, unknown>) {
    this.send({
      type: 'call_service',
      domain,
      service,
      target: { entity_id: entityId },
      service_data: data,
    })
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.ws?.close()
    this.ws = null
  }
}
