export interface HAEntity {
  entity_id: string
  state: string
  attributes: Record<string, unknown>
  last_changed: string
  last_updated: string
  context: { id: string; parent_id: string | null; user_id: string | null }
}

export interface HALightAttributes {
  brightness?: number
  color_temp?: number
  rgb_color?: [number, number, number]
  hs_color?: [number, number]
  effect_list?: string[]
  effect?: string
  friendly_name?: string
  supported_features?: number
}

export interface HAClimateAttributes {
  temperature?: number
  current_temperature?: number
  target_temp_high?: number
  target_temp_low?: number
  hvac_mode?: string
  hvac_modes?: string[]
  fan_mode?: string
  fan_modes?: string[]
  preset_mode?: string
  preset_modes?: string[]
  friendly_name?: string
}

export interface HAMediaPlayerAttributes {
  volume_level?: number
  is_volume_muted?: boolean
  media_content_type?: string
  media_duration?: number
  media_position?: number
  media_title?: string
  media_artist?: string
  media_album_name?: string
  entity_picture?: string
  friendly_name?: string
  supported_features?: number
}

export interface HACameraAttributes {
  entity_picture?: string
  friendly_name?: string
}

export interface HAConfig {
  url: string
  accessToken: string
}

export type EntityDomain =
  | 'light'
  | 'switch'
  | 'sensor'
  | 'climate'
  | 'media_player'
  | 'camera'
  | 'binary_sensor'
  | 'fan'
  | 'cover'
