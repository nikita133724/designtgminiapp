import {requireTelegramInitData} from '@/lib/telegram';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ZoomaApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  detail?: string;
  message?: string;
  error?: string;
}

export class ZoomaApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly payload?: unknown,
  ) {
    super(message);
    this.name = 'ZoomaApiError';
  }
}

export async function requestZooma<T = any>(
  path: string,
  options: {method?: HttpMethod; body?: unknown; signal?: AbortSignal} = {},
): Promise<ZoomaApiResponse<T>> {
  const initData = requireTelegramInitData();
  const separator = path.includes('?') ? '&' : '?';
  const url = `${path}${separator}init_data=${encodeURIComponent(initData)}`;

  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers: {'Content-Type': 'application/json'},
    body: options.body == null ? undefined : JSON.stringify(options.body),
    credentials: 'same-origin',
    cache: 'no-store',
    signal: options.signal,
  });

  let payload: ZoomaApiResponse<T>;
  try {
    payload = await response.json();
  } catch (_) {
    throw new ZoomaApiError(
      `Сервер вернул некорректный ответ (HTTP ${response.status})`,
      response.status,
    );
  }

  if (!response.ok || !payload?.ok) {
    throw new ZoomaApiError(
      payload?.detail || payload?.message || payload?.error || `request_failed_${response.status}`,
      response.status,
      payload,
    );
  }

  return payload;
}
