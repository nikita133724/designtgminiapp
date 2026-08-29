import {requireTelegramInitData} from '@/lib/telegram';

export function buildZoomaWebSocketUrl(path = '/app/ws'): string {
  if (typeof window === 'undefined') {
    throw new Error('WebSocket доступен только в браузере.');
  }

  const initData = requireTelegramInitData();
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${protocol}://${window.location.host}${path}?init_data=${encodeURIComponent(initData)}`;
}

export function isZoomaWebSocketHealthy(
  socket: WebSocket | null,
  lastMessageAt: number,
  maxSilenceMs = 20_000,
): boolean {
  return !!(
    socket &&
    socket.readyState === WebSocket.OPEN &&
    Date.now() - lastMessageAt < maxSilenceMs
  );
}
