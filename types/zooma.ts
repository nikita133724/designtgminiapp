export type AppTab = 'profile' | 'accounts' | 'tariffs';
export type TariffType = 'main' | 'addon';
export type ActivationMode = 'server' | 'extension';

export interface Invoice {
  invoice_id?: string;
  invoice_label?: string;
  pay_url?: string;
  price_rub?: number;
  price_usdt?: number;
  expires_at_ts?: number;
  is_addon?: boolean;
  kind?: string;
  account_label?: string;
  account_slot?: number;
  tariff_title?: string;
  tariff_key?: string;
  tariff_days?: number;
}

export interface Tariff {
  key?: string;
  tariff_id?: string;
  title?: string;
  label?: string;
  price_rub?: number;
  price_usdt?: number;
  days?: number;
  duration_days?: number;
  [key: string]: unknown;
}

export interface AddonAccountOption {
  account_id: string;
  label?: string;
  active?: boolean;
  slot?: number;
  name?: string;
  casino_id?: string;
  port_user_name?: string;
}

export interface AddonConfig {
  main_active?: boolean;
  message?: string;
  tariffs_addon: Tariff[];
  accounts: AddonAccountOption[];
}

export interface ChatAiMessage {
  text?: string;
  sent_at_ts?: number;
}

export interface ZoomaAccount {
  account_id: string;
  slot?: number;
  port_user_id?: string;
  port_user_name?: string;
  auth_status?: string;
  extension_bound_chat_id?: number | string | null;
  promo_activation_mode?: ActivationMode | string;
  promo_activation_paused?: boolean;
  subscription_paused?: boolean;
  subscription_tier?: string;
  subscription_until_ts?: number;
  subscription_frozen_left_sec?: number;
  effective_ping_ms?: number | null;
  effective_ping_source?: string;
  proxy_ping_ms?: number | null;
  proxy_ping_source?: string;
  proxy_ip?: string;
  proxy_port_socks5?: number | string;
  proxy_login?: string;
  proxy_password?: string;
  chat_ai_enabled?: boolean;
  chat_ai_has_api_key?: boolean;
  chat_ai_api_key_masked?: string;
  chat_ai_key_count?: number;
  chat_ai_interval_min_sec?: number;
  chat_ai_interval_max_sec?: number;
  chat_ai_rain_miss_messages?: string[];
  chat_ai_recent_messages?: ChatAiMessage[];
  chat_ai_next_run_ts?: number;
  chat_ai_cycle_started_ts?: number;
  chat_ai_rest_until_ts?: number;
  chat_ai_pending_status?: boolean;
  chat_ai_last_error?: string;
  server_session_stale?: boolean;
  [key: string]: unknown;
}

export interface ZoomaState {
  chat_id?: number;
  tg_username?: string;
  subscription_tier?: string;
  subscription_paused?: boolean;
  subscription_until_ts?: number;
  subscription_frozen_left_sec?: number;
  timezone_valid?: boolean;
  timezone_name?: string;
  timezone_offset_min?: number | null;
  locale?: string;
  proxy_set?: boolean;
  proxy_ip?: string;
  proxy_ping_ms?: number | null;
  effective_ping_ms?: number | null;
  effective_ping_source?: string;
  main_subscription_active?: boolean;
  promo_activation_paused?: boolean;
  promo_activation_mode?: string;
  promo_activated_count?: number;
  promo_activated_total_amount?: number;
  promo_month_key?: string;
  promo_month_label?: string;
  promo_month_total_amount?: number;
  active_account_id?: string;
  accounts?: ZoomaAccount[];
  tariffs?: Tariff[];
  addon_config?: AddonConfig;
  pending_invoice?: Invoice | null;
  [key: string]: unknown;
}

export interface ProxyPayload {
  account_id: string;
  host: string;
  port: number;
  login: string;
  password: string;
}

export interface ChatAiSettingsPayload {
  account_id: string;
  enabled?: boolean;
  api_key?: string;
  interval_min_sec?: number;
  interval_max_sec?: number;
  rain_miss_messages?: string;
}

export interface ZoomaWsMessage {
  type?: string;
  data?: any;
}

export const emptyAddonConfig = (): AddonConfig => ({
  tariffs_addon: [],
  accounts: [],
});

export const tariffKey = (tariff: Tariff): string =>
  String(tariff.key ?? tariff.tariff_id ?? '');

export const tariffTitle = (tariff: Tariff): string =>
  String(tariff.title ?? tariff.label ?? tariffKey(tariff));

export const tariffDays = (tariff: Tariff): number =>
  Number(tariff.days ?? tariff.duration_days ?? 0);
