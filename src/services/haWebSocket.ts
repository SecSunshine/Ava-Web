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
    // https:// → wss://, http:// → ws://
    const wsUrl = this.config.url.replace(/^https/, 'wss').replace(/^http(?!s)/, 'ws') + '/api/websocket'
    this.ws = new WebSocket(wsUrl)
    let authenticated = false

    this.ws.onopen = () => {
      // HA WebSocket 协议：onopen 后等待服务器先发 auth_required，再发送 auth 消息
      // 不在这里发送任何消息
    }

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data)

      // 步骤1：服务器发来 auth_required，我们回复 auth
      if (data.type === 'auth_required') {
        this.ws?.send(JSON.stringify({
          type: 'auth',
          access_token: this.config.accessToken
        }))
        return
      }

      // 步骤2：服务器确认 auth_ok，开始订阅
      if (data.type === 'auth_ok' && !authenticated) {
        authenticated = true
        this.onConnected?.()
        this.subscribeStates()
        this.fetchStates()
        return
      }

      // 步骤3：认证失败
      if (data.type === 'auth_invalid') {
        console.error('[HA] Auth invalid:', data.message)
        this.ws?.close()
        return
      }

      // 处理普通消息（带 id 的响应）
      if (data.id && this.handlers.has(data.id)) {
        this.handlers.get(data.id)!(data)
        if (data.type !== 'event') this.handlers.delete(data.id)
      }

      // 处理实体状态变化事件
      if (data.type === 'event' && data.event?.data?.new_state) {
        this.onStateChanged?.(data.event.data.new_state)
      }
    }

    this.ws.onclose = () => {
      authenticated = false
      this.onDisconnected?.()
      this.reconnectTimer = setTimeout(() => this.doConnect(), 5000)
    }

    this.ws.onerror = (err) => {
      console.error('[HA] WebSocket error:', err)
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
