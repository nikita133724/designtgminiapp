'use client';

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {getTelegramWebApp} from '@/lib/telegram';
import {requestZooma} from '@/lib/zooma-api';
import {buildZoomaWebSocketUrl, isZoomaWebSocketHealthy} from '@/lib/zooma-websocket';
import {
  AppTab,
  ChatAiSettingsPayload,
  emptyAddonConfig,
  Invoice,
  ProxyPayload,
  TariffType,
  ZoomaAccount,
  ZoomaState,
  ZoomaWsMessage,
} from '@/types/zooma';

export type ToastKind = 'info' | 'ok' | 'err';
export interface ToastState { text: string; type: ToastKind }

const TAB_KEY = 'zooma_app_tab_v1';
const TARIFF_TYPE_KEY = 'zooma_app_tariff_type_v1';
const INVOICE_KEY = 'zooma_app_invoice_v1';

function readTab(): AppTab {
  if (typeof window === 'undefined') return 'profile';
  const value = localStorage.getItem(TAB_KEY);
  return value === 'accounts' || value === 'tariffs' ? value : 'profile';
}

function readTariffType(): TariffType {
  if (typeof window === 'undefined') return 'main';
  return localStorage.getItem(TARIFF_TYPE_KEY) === 'addon' ? 'addon' : 'main';
}

function normalizeInvoice(value: Invoice | null | undefined): Invoice | null {
  if (!value) return null;
  const expires = Number(value.expires_at_ts || 0);
  if (!expires || expires <= Math.floor(Date.now() / 1000)) return null;
  return {
    ...value,
    invoice_id: String(value.invoice_id || ''),
    invoice_label: String(value.invoice_label || ''),
    pay_url: String(value.pay_url || ''),
    price_rub: Number(value.price_rub || 0),
    price_usdt: Number(value.price_usdt || 0),
    expires_at_ts: expires,
    is_addon: Boolean(value.is_addon),
  };
}

function activeAccount(state: ZoomaState | null): ZoomaAccount | null {
  const list = Array.isArray(state?.accounts) ? state.accounts : [];
  const id = String(state?.active_account_id || '');
  return list.find((account) => String(account.account_id) === id) || list[0] || null;
}

export function useZoomaApp() {
  const [state, setState] = useState<ZoomaState | null>(null);
  const [loading, setLoading] = useState(true);
  const [bootError, setBootError] = useState('');
  const [activeTab, setActiveTabState] = useState<AppTab>(readTab);
  const [tariffType, setTariffTypeState] = useState<TariffType>(readTariffType);
  const [addonConfig, setAddonConfig] = useState(emptyAddonConfig);
  const [busyKeys, setBusyKeys] = useState<Set<string>>(() => new Set());
  const [toast, setToast] = useState<ToastState | null>(null);
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  const [promoFlash, setPromoFlash] = useState(false);

  const stateRef = useRef<ZoomaState | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const socketPingTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const socketReconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSocketMessage = useRef(0);
  const refreshBusy = useRef(false);
  const mounted = useRef(true);

  const commitState = useCallback((next: ZoomaState | null | ((previous: ZoomaState | null) => ZoomaState | null)) => {
    setState((previous) => {
      const result = typeof next === 'function' ? next(previous) : next;
      stateRef.current = result;
      return result;
    });
  }, []);

  const showToast = useCallback((text: string, type: ToastKind = 'info', duration?: number) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({text, type});
    toastTimer.current = setTimeout(
      () => setToast(null),
      duration ?? (type === 'err' ? 5000 : 2700),
    );
  }, []);

  const setBusy = useCallback((key: string, value: boolean) => {
    setBusyKeys((previous) => {
      const next = new Set(previous);
      if (value) next.add(key);
      else next.delete(key);
      return next;
    });
  }, []);

  const isBusy = useCallback((key: string) => busyKeys.has(key), [busyKeys]);

  const syncInvoiceStorage = useCallback((nextState: ZoomaState | null) => {
    if (typeof window === 'undefined') return;
    const invoice = normalizeInvoice(nextState?.pending_invoice);
    if (!invoice || !nextState?.chat_id) {
      localStorage.removeItem(INVOICE_KEY);
      return;
    }
    localStorage.setItem(INVOICE_KEY, JSON.stringify({
      chat_id: Number(nextState.chat_id),
      invoice,
    }));
  }, []);

  const applyFullState = useCallback((incoming: ZoomaState, flash = true) => {
    const previous = stateRef.current;
    if (flash && previous) {
      const countIncreased = Number(incoming.promo_activated_count || 0) > Number(previous.promo_activated_count || 0);
      const totalIncreased = Number(incoming.promo_activated_total_amount || 0) > Number(previous.promo_activated_total_amount || 0);
      if (countIncreased || totalIncreased) {
        setPromoFlash(true);
        setTimeout(() => mounted.current && setPromoFlash(false), 3000);
      }
    }
    const normalized: ZoomaState = {
      ...incoming,
      pending_invoice: normalizeInvoice(incoming.pending_invoice),
    };
    stateRef.current = normalized;
    setState(normalized);
    setAddonConfig(incoming.addon_config || emptyAddonConfig());
    syncInvoiceStorage(normalized);
  }, [syncInvoiceStorage]);

  const applyWsMessage = useCallback((message: ZoomaWsMessage) => {
    if (!message || typeof message !== 'object') return;
    const data = message.data || {};
    switch (message.type) {
      case 'bootstrap':
        applyFullState(data, false);
        return;
      case 'state':
        applyFullState(data, true);
        return;
      case 'profile_patch':
      case 'promo_patch':
        commitState((previous) => previous ? {...previous, ...data} : data);
        return;
      case 'accounts_patch':
        commitState((previous) => previous ? {
          ...previous,
          active_account_id: String(data.active_account_id || previous.active_account_id || ''),
          accounts: Array.isArray(data.accounts) ? data.accounts : [],
        } : previous);
        return;
      case 'account_patch':
        commitState((previous) => {
          if (!previous) return previous;
          const id = String(data.account_id || '');
          const accounts = [...(previous.accounts || [])];
          const index = accounts.findIndex((account) => String(account.account_id) === id);
          if (index >= 0) accounts[index] = {...accounts[index], ...data};
          else if (id) accounts.push(data);
          return {...previous, accounts};
        });
        return;
      case 'invoice_patch':
        commitState((previous) => previous ? {
          ...previous,
          pending_invoice: normalizeInvoice(data.pending_invoice),
        } : previous);
        return;
      case 'tariffs_patch':
        commitState((previous) => previous ? {
          ...previous,
          tariffs: Array.isArray(data.tariffs) ? data.tariffs : [],
        } : previous);
        return;
      case 'addon_config_patch': {
        const config = data.addon_config || emptyAddonConfig();
        setAddonConfig(config);
        commitState((previous) => previous ? {...previous, addon_config: config} : previous);
        return;
      }
    }
  }, [applyFullState, commitState]);

  const refreshState = useCallback(async (force = false) => {
    if (refreshBusy.current || (typeof document !== 'undefined' && document.hidden)) return;
    if (!force && isZoomaWebSocketHealthy(socketRef.current, lastSocketMessage.current)) return;
    refreshBusy.current = true;
    try {
      const response = await requestZooma<ZoomaState>('/app/api/state');
      if (response.data) applyFullState(response.data, true);
    } catch (_) {
      // A reconnect or the next poll will retry. User actions surface their own errors.
    } finally {
      refreshBusy.current = false;
    }
  }, [applyFullState]);

  const connectSocket = useCallback(() => {
    if (typeof window === 'undefined' || !getTelegramWebApp().initData) return;
    if (socketReconnectTimer.current) clearTimeout(socketReconnectTimer.current);
    if (socketRef.current) {
      try { socketRef.current.close(); } catch (_) {}
    }

    let socket: WebSocket;
    try {
      socket = new WebSocket(buildZoomaWebSocketUrl('/app/ws'));
    } catch (_) {
      return;
    }
    socketRef.current = socket;

    socket.onopen = () => {
      lastSocketMessage.current = Date.now();
      if (socketPingTimer.current) clearInterval(socketPingTimer.current);
      socketPingTimer.current = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) socket.send('ping');
      }, 15_000);
    };

    socket.onmessage = (event) => {
      lastSocketMessage.current = Date.now();
      if (event.data === 'pong') return;
      try { applyWsMessage(JSON.parse(event.data)); } catch (_) {}
    };

    socket.onerror = () => {
      try { socket.close(); } catch (_) {}
    };

    socket.onclose = () => {
      if (socketPingTimer.current) clearInterval(socketPingTimer.current);
      if (!mounted.current) return;
      socketReconnectTimer.current = setTimeout(connectSocket, 1200);
    };
  }, [applyWsMessage]);

  const syncTimezone = useCallback(async () => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (!timezone) return;
      const response = await requestZooma<Partial<ZoomaState>>('/app/api/timezone', {
        method: 'POST',
        body: {
          timezone,
          offset_min: new Date().getTimezoneOffset(),
          locale: navigator.language || '',
        },
      });
      if (response.data) commitState((previous) => previous ? {...previous, ...response.data} : previous);
    } catch (_) {}
  }, [commitState]);

  const loadAddonConfig = useCallback(async (forceRemote = false) => {
    const current = stateRef.current;
    if (!forceRemote && current?.addon_config) {
      setAddonConfig(current.addon_config);
      return current.addon_config;
    }
    try {
      const response = await requestZooma('/app/api/addon/config');
      const config = response.data || emptyAddonConfig();
      setAddonConfig(config);
      commitState((previous) => previous ? {...previous, addon_config: config} : previous);
      return config;
    } catch (_) {
      const empty = emptyAddonConfig();
      setAddonConfig(empty);
      return empty;
    }
  }, [commitState]);

  useEffect(() => {
    mounted.current = true;
    const telegram = getTelegramWebApp();
    try { telegram.ready(); telegram.expand(); } catch (_) {}

    if (!telegram.initData) {
      setBootError('Откройте этот кабинет из Telegram-бота ZOOMA.');
      setLoading(false);
      return () => { mounted.current = false; };
    }

    void (async () => {
      try {
        const response = await requestZooma<ZoomaState>('/app/api/state');
        if (!response.data) throw new Error('Сервер не вернул состояние кабинета.');
        let initial = response.data;

        if (!initial.pending_invoice && typeof window !== 'undefined') {
          try {
            const saved = JSON.parse(localStorage.getItem(INVOICE_KEY) || 'null');
            if (saved && Number(saved.chat_id || 0) === Number(initial.chat_id || 0)) {
              const invoice = normalizeInvoice(saved.invoice);
              if (invoice) initial = {...initial, pending_invoice: invoice};
            }
          } catch (_) { localStorage.removeItem(INVOICE_KEY); }
        }

        applyFullState(initial, false);
        await syncTimezone();
        if (!initial.addon_config) await loadAddonConfig(true);
        connectSocket();
      } catch (error) {
        setBootError(error instanceof Error ? error.message : 'Не удалось загрузить кабинет.');
      } finally {
        setLoading(false);
      }
    })();

    const tick = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    const poll = setInterval(() => void refreshState(false), 5000);
    const visibility = () => { if (!document.hidden) void refreshState(true); };
    document.addEventListener('visibilitychange', visibility);

    return () => {
      mounted.current = false;
      clearInterval(tick);
      clearInterval(poll);
      document.removeEventListener('visibilitychange', visibility);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      if (socketPingTimer.current) clearInterval(socketPingTimer.current);
      if (socketReconnectTimer.current) clearTimeout(socketReconnectTimer.current);
      try { socketRef.current?.close(); } catch (_) {}
    };
  }, [applyFullState, connectSocket, loadAddonConfig, refreshState, syncTimezone]);

  useEffect(() => {
    syncInvoiceStorage(state);
  }, [state?.pending_invoice, state?.chat_id, state, syncInvoiceStorage]);

  const runAction = useCallback(async <T,>(key: string, task: () => Promise<T>): Promise<T | undefined> => {
    if (busyKeys.has(key)) return undefined;
    setBusy(key, true);
    try {
      return await task();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Не удалось выполнить действие.', 'err');
      return undefined;
    } finally {
      setBusy(key, false);
    }
  }, [busyKeys, setBusy, showToast]);

  const setActiveTab = useCallback((tab: AppTab) => {
    setActiveTabState(tab);
    localStorage.setItem(TAB_KEY, tab);
  }, []);

  const setTariffType = useCallback(async (value: TariffType) => {
    setTariffTypeState(value);
    localStorage.setItem(TARIFF_TYPE_KEY, value);
    if (value === 'addon') await loadAddonConfig(false);
  }, [loadAddonConfig]);

  const setAccountPromo = useCallback((accountId: string, enabled: boolean) =>
    runAction(`promo:${accountId}`, async () => {
      await requestZooma('/app/api/promo-activation-pause', {
        method: 'POST', body: {account_id: accountId, paused: !enabled},
      });
      await refreshState(true);
      showToast(enabled ? 'Активация промо включена' : 'Активация промо на паузе', 'ok');
    }), [refreshState, runAction, showToast]);

  const setActivationMode = useCallback((accountId: string, mode: 'server' | 'extension') =>
    runAction(`mode:${accountId}`, async () => {
      await requestZooma('/app/api/promo-activation-mode', {
        method: 'POST', body: {account_id: accountId, mode},
      });
      await refreshState(true);
      showToast(mode === 'extension' ? 'Включена работа через расширение' : 'Включена работа через сервер', 'ok');
    }), [refreshState, runAction, showToast]);

  const saveProxy = useCallback((payload: ProxyPayload) =>
    runAction(`proxy:${payload.account_id}`, async () => {
      await requestZooma('/app/api/proxy/manual', {method: 'POST', body: payload});
      await refreshState(true);
      showToast('Прокси сохранён. Пинг обновится после проверки.', 'ok');
    }), [refreshState, runAction, showToast]);

  const saveChatAi = useCallback((payload: ChatAiSettingsPayload) =>
    runAction(`chat-ai:${payload.account_id}`, async () => {
      await requestZooma('/app/api/chat-ai/settings', {method: 'POST', body: payload});
      await refreshState(true);
      showToast('Настройки Chat AI сохранены', 'ok');
    }), [refreshState, runAction, showToast]);

  const toggleChatAi = useCallback((accountId: string, enabled: boolean) =>
    runAction(`chat-ai:${accountId}`, async () => {
      await requestZooma('/app/api/chat-ai/settings', {
        method: 'POST', body: {account_id: accountId, enabled},
      });
      await refreshState(true);
      showToast(enabled ? 'Chat AI включён' : 'Chat AI выключен', 'ok');
    }), [refreshState, runAction, showToast]);

  const buyTariff = useCallback((tariffKey: string) =>
    runAction('invoice:create', async () => {
      const response = await requestZooma<Invoice>('/app/api/tariff/invoice', {
        method: 'POST', body: {tariff_key: tariffKey},
      });
      commitState((previous) => previous ? {...previous, pending_invoice: normalizeInvoice(response.data)} : previous);
      setActiveTab('tariffs');
      showToast('Счёт создан', 'ok');
    }), [commitState, runAction, setActiveTab, showToast]);

  const createAddonInvoice = useCallback((tariffKey: string, accountId: string) =>
    runAction('invoice:addon', async () => {
      const response = await requestZooma<Invoice>('/app/api/addon/invoice', {
        method: 'POST', body: {tariff_key: tariffKey, account_id: accountId},
      });
      commitState((previous) => previous ? {...previous, pending_invoice: normalizeInvoice(response.data)} : previous);
      setActiveTab('tariffs');
      showToast('Счёт создан', 'ok');
    }), [commitState, runAction, setActiveTab, showToast]);

  const cancelInvoice = useCallback(() => runAction('invoice:cancel', async () => {
    const invoiceId = String(stateRef.current?.pending_invoice?.invoice_id || '') || null;
    await requestZooma('/app/api/tariff/invoice/cancel', {
      method: 'POST', body: {invoice_id: invoiceId},
    });
    commitState((previous) => previous ? {...previous, pending_invoice: null} : previous);
    localStorage.removeItem(INVOICE_KEY);
    showToast('Оплата отменена', 'info');
  }), [commitState, runAction, showToast]);

  const resetAccount = useCallback((accountId: string) => runAction(`reset:${accountId}`, async () => {
    await requestZooma('/app/api/account/reset-casino-data', {
      method: 'POST', body: {account_id: accountId},
    });
    await refreshState(true);
    showToast('Данные казино и прокси очищены', 'ok');
  }), [refreshState, runAction, showToast]);

  const unbindExtension = useCallback((accountId: string) => runAction(`unbind:${accountId}`, async () => {
    await requestZooma('/app/api/extension-unbind', {
      method: 'POST', body: {account_id: accountId},
    });
    await refreshState(true);
    showToast('Расширение отвязано', 'ok');
  }), [refreshState, runAction, showToast]);

  const reloadExtension = useCallback((accountId: string) => runAction(`reload:${accountId}`, async () => {
    await requestZooma('/app/api/extension-reload', {
      method: 'POST', body: {account_id: accountId},
    });
    showToast('Страница на ПК обновлена', 'ok');
  }), [runAction, showToast]);

  const connectPrompt = useCallback((accountId: string) => runAction(`connect:${accountId}`, async () => {
    await requestZooma('/app/api/account/connect-prompt', {
      method: 'POST', body: {account_id: accountId},
    });
    showToast('Дальнейшие действия — в сообщениях бота', 'info', 3500);
    setTimeout(() => { try { getTelegramWebApp().close(); } catch (_) {} }, 4000);
  }), [runAction, showToast]);

  const openSupport = useCallback(() => {
    const url = 'https://t.me/saxarok322';
    try { getTelegramWebApp().openTelegramLink(url); }
    catch (_) { window.location.href = url; }
  }, []);

  const openPay = useCallback(() => {
    const url = String(stateRef.current?.pending_invoice?.pay_url || '');
    if (!url) return showToast('Ссылка оплаты не найдена', 'err');
    getTelegramWebApp().openTelegramLink(url);
  }, [showToast]);

  const copyPay = useCallback(async () => {
    const url = String(stateRef.current?.pending_invoice?.pay_url || '');
    if (!url) return showToast('Ссылка оплаты не найдена', 'err');
    try {
      await navigator.clipboard.writeText(url);
      showToast('Ссылка скопирована', 'ok');
    } catch (_) {
      showToast('Не удалось скопировать ссылку', 'err');
    }
  }, [showToast]);

  const currentInvoice = useMemo(() => normalizeInvoice(state?.pending_invoice), [state?.pending_invoice, now]);
  const currentAccount = useMemo(() => activeAccount(state), [state]);

  return {
    state,
    loading,
    bootError,
    activeTab,
    setActiveTab,
    tariffType,
    setTariffType,
    addonConfig,
    toast,
    setToast,
    now,
    promoFlash,
    currentInvoice,
    currentAccount,
    isBusy,
    refreshState,
    setAccountPromo,
    setActivationMode,
    saveProxy,
    saveChatAi,
    toggleChatAi,
    buyTariff,
    createAddonInvoice,
    cancelInvoice,
    resetAccount,
    unbindExtension,
    reloadExtension,
    connectPrompt,
    openSupport,
    openPay,
    copyPay,
  };
}
