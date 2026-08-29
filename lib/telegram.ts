export interface TelegramWebApp {
  initData: string;
  ready(): void;
  expand(): void;
  close(): void;
  openTelegramLink(url: string): void;
}

const browserFallback: TelegramWebApp = {
  initData: '',
  ready() {},
  expand() {},
  close() {},
  openTelegramLink(url: string) {
    if (typeof window !== 'undefined') window.location.href = url;
  },
};

export function getTelegramWebApp(): TelegramWebApp {
  if (typeof window === 'undefined') return browserFallback;
  return window.Telegram?.WebApp ?? browserFallback;
}

export function requireTelegramInitData(): string {
  const initData = getTelegramWebApp().initData || '';
  if (!initData) {
    throw new Error('Откройте этот кабинет из Telegram-бота ZOOMA.');
  }
  return initData;
}
