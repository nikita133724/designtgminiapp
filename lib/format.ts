import {ZoomaAccount, ZoomaState} from '@/types/zooma';

export function formatTimestamp(timestamp?: number, state?: ZoomaState | null): string {
  const value = Number(timestamp || 0);
  if (!value) return '—';
  const date = new Date(value * 1000);
  const options: Intl.DateTimeFormatOptions = {
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  };
  try {
    if (state?.timezone_valid && state.timezone_name) {
      return date.toLocaleString('ru-RU', {...options, timeZone: state.timezone_name});
    }
    return `${date.toLocaleString('ru-RU', {...options, timeZone: 'Europe/Moscow'})} МСК`;
  } catch (_) {
    return date.toLocaleString('ru-RU', {hour12: false});
  }
}

export function formatCountdown(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds || 0));
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`;
}

export function formatDuration(seconds: number): string {
  const safe = Math.max(0, Math.floor(Number(seconds || 0)));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const rest = safe % 60;
  if (hours) return `${hours} ч ${minutes} мин`;
  if (minutes) return `${minutes} мин ${rest} сек`;
  return `${rest} сек`;
}

export function frozenLeft(seconds?: number): string {
  const days = Math.floor(Math.max(0, Number(seconds || 0)) / 86400);
  return days > 0 ? `${days} дн.` : 'меньше 1 дн.';
}

export function pingValue(value: ZoomaState | ZoomaAccount): number | null {
  const raw = value.effective_ping_ms != null ? value.effective_ping_ms : value.proxy_ping_ms;
  const number = Number(raw);
  return Number.isFinite(number) ? number : null;
}

export function pingSourceLabel(value: ZoomaState | ZoomaAccount): string {
  const source = String(value.effective_ping_source || value.proxy_ping_source || '').toLowerCase();
  if (source === 'extension') return 'Пинг расширения';
  if (source === 'server') return 'Пинг сервера';
  return 'Пинг прокси';
}

export function pingTone(milliseconds: number | null): 'ok' | 'warn' | 'danger' | 'neutral' {
  if (milliseconds == null) return 'neutral';
  if (milliseconds < 450) return 'ok';
  if (milliseconds < 900) return 'warn';
  return 'danger';
}

export function chatAiStatus(account: ZoomaAccount | null, now: number): string {
  if (!account?.chat_ai_enabled) return 'Chat AI выключен';
  if (account.server_session_stale) return 'Приостановлено: требуется новая сессия';

  const rest = Number(account.chat_ai_rest_until_ts || 0);
  const next = Number(account.chat_ai_next_run_ts || 0);
  const code = String(account.chat_ai_last_error || '').trim();
  const labels: Record<string, string> = {
    extension_offline: 'Приостановлено: расширение не подключено',
    extension_manager_unavailable: 'Приостановлено: расширение не подключено',
    managed_tab_not_ready: 'Вкладка казино недоступна',
    chat_ai_api_key_missing: 'Не настроен API-ключ',
    no_proxy: 'Приостановлено: не настроен прокси',
    proxy_unavailable: 'Приостановлено: прокси недоступен',
    proxy_site_unreachable: 'Приостановлено: сайт недоступен через прокси',
    proxy_recovering: 'Приостановлено: проверяется восстановление прокси',
    no_buffered_messages: 'В чате пока нет сообщений',
    no_unprocessed_messages: 'Нет новых сообщений для ответа',
    groq_no_valid_choice: 'Groq не выбрал подходящее сообщение',
    stale_pending_task: 'Предыдущая незавершённая задача сброшена',
  };

  if (code === 'groq_tpd_limit' && next > now) {
    return `Лимит токенов Groq за 24 часа · повтор через ${formatDuration(next - now)}`;
  }
  if (code === 'groq_rate_limited' && next > now) {
    return `Временный лимит Groq · повтор через ${formatDuration(next - now)}`;
  }
  if (labels[code]) return labels[code];
  if (code.startsWith('invalid_ai_response:')) return 'Groq вернул неподходящий ответ';
  if (code) return code;
  if (rest > now) return `Отдых завершится через ${formatDuration(rest - now)}`;
  if (next > now) return `Следующее сообщение через ${formatDuration(next - now)}`;
  if (account.chat_ai_pending_status) return 'Сообщение отправляется';
  return 'Ожидание следующего запуска';
}
