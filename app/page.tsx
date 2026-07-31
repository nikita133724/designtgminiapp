'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Settings, Key, Shield, Zap, CheckCircle, AlertCircle, RefreshCw, 
  Clock, Globe, Check, Copy, ExternalLink, Flame, Layers, Activity, X, 
  CreditCard, MessageCircle, TrendingUp, Cpu, Tv, HelpCircle, ChevronUp, ChevronDown, Palette
} from 'lucide-react';

const getDemoDefaultState = () => {
  const now = Math.floor(Date.now() / 1000);
  return {
    chat_id: 88410203,
    tg_username: "zooma_demo_user",
    subscription_tier: "VIP Premium",
    subscription_paused: false,
    subscription_until_ts: now + 30 * 24 * 3600,
    subscription_frozen_left_sec: 0,
    timezone_valid: true,
    timezone_name: "Europe/Moscow",
    proxy_set: true,
    effective_ping_ms: 42.5,
    effective_ping_source: "server",
    promo_activated_count: 127,
    promo_activated_total_amount: 14250.00,
    promo_month_label: "Июль 2026",
    promo_month_total_amount: 4250.00,
    active_account_id: "acc_1",
    accounts: [
      {
        account_id: "acc_1",
        slot: 1,
        port_user_id: "884102",
        port_user_name: "Иван Смирнов",
        auth_status: "подключен",
        promo_activation_mode: "server",
        promo_activation_paused: false,
        subscription_paused: false,
        subscription_until_ts: now + 30 * 24 * 3600,
        subscription_frozen_left_sec: 0,
        effective_ping_ms: 38.2,
        effective_ping_source: "server",
        proxy_ip: "185.22.174.11",
        proxy_port_socks5: "1080",
        proxy_login: "zooma_proxy",
        proxy_password: "securepassword"
      },
      {
        account_id: "acc_2",
        slot: 2,
        port_user_id: "993012",
        port_user_name: "Анна Кузнецова",
        auth_status: "подключен",
        promo_activation_mode: "extension",
        promo_activation_paused: true,
        subscription_paused: false,
        subscription_until_ts: now + 15 * 24 * 3600,
        subscription_frozen_left_sec: 0,
        effective_ping_ms: 52.4,
        effective_ping_source: "extension",
        proxy_ip: "185.22.174.12",
        proxy_port_socks5: "1080",
        proxy_login: "zooma_proxy",
        proxy_password: "securepassword"
      }
    ],
    tariffs: [
      {
        tariff_id: "main_30",
        label: "Основной 30 дней",
        price_rub: 450,
        price_usdt: 5.0,
        duration_days: 30,
        is_addon: false
      },
      {
        tariff_id: "main_90",
        label: "Основной 90 дней",
        price_rub: 1200,
        price_usdt: 13.5,
        duration_days: 90,
        is_addon: false
      }
    ],
    addon_config: {
      main_active: true,
      message: "",
      tariffs_addon: [
        {
          key: "addon_30",
          label: "Слот 30 дней",
          price_rub: 250,
          price_usdt: 2.8,
          duration_days: 30
        },
        {
          key: "addon_90",
          label: "Слот 90 дней",
          price_rub: 650,
          price_usdt: 7.2,
          duration_days: 90
        }
      ],
      accounts: [
        {
          account_id: "acc_3",
          port_user_name: "Свободный слот #3"
        }
      ]
    },
    pending_invoice: null
  };
};

const handleDemoApiCall = (state: any, path: string, method: string, body: any) => {
  const currentState = state || getDemoDefaultState();

  if (path.includes('/app/api/timezone')) {
    const updated = { ...currentState, timezone_name: body?.timezone || 'Europe/Moscow', timezone_valid: true };
    return { ok: true, data: { timezone_name: body?.timezone, timezone_valid: true }, nextState: updated };
  }

  if (path.includes('/app/api/addon/config')) {
    return { ok: true, data: currentState.addon_config, nextState: currentState };
  }

  if (path.includes('/app/api/promo-activation-pause')) {
    const aid = body?.account_id;
    const paused = !!body?.paused;
    const accounts = (currentState.accounts || []).map((a: any) => 
      String(a.account_id) === String(aid) ? { ...a, promo_activation_paused: paused } : a
    );
    const updated = { ...currentState, accounts };
    return { ok: true, nextState: updated };
  }

  if (path.includes('/app/api/promo-activation-mode')) {
    const aid = body?.account_id;
    const mode = body?.mode || 'server';
    const accounts = (currentState.accounts || []).map((a: any) => 
      String(a.account_id) === String(aid) ? { ...a, promo_activation_mode: mode, effective_ping_source: mode } : a
    );
    const updated = { ...currentState, accounts };
    return { ok: true, nextState: updated };
  }

  if (path.includes('/app/api/proxy/manual')) {
    const aid = body?.account_id;
    const accounts = (currentState.accounts || []).map((a: any) => 
      String(a.account_id) === String(aid) ? { 
        ...a, 
        proxy_ip: body?.host, 
        proxy_port_socks5: String(body?.port), 
        proxy_login: body?.login, 
        proxy_password: body?.password,
        effective_ping_ms: 45 + Math.random() * 30
      } : a
    );
    const updated = { ...currentState, proxy_set: true, accounts };
    return { ok: true, nextState: updated };
  }

  if (path.includes('/app/api/chat-ai/settings')) {
    const aid = body?.account_id;
    const accounts = (currentState.accounts || []).map((a: any) => 
      String(a.account_id) === String(aid) ? { ...a, ...body } : a
    );
    const updated = { ...currentState, accounts };
    return { ok: true, nextState: updated };
  }

  if (path.includes('/app/api/tariff/invoice')) {
    const key = body?.tariff_key;
    const tariff = (currentState.tariffs || []).find((t: any) => String(t.tariff_id) === String(key)) || (currentState.tariffs || [])[0];
    const inv = {
      invoice_id: "inv_demo_" + Math.floor(Math.random() * 100000),
      invoice_label: tariff?.label || "ZOOMA Premium (30 дней)",
      pay_url: "https://t.me/saxarok322",
      price_rub: tariff?.price_rub || 450,
      price_usdt: tariff?.price_usdt || 5.0,
      expires_at_ts: Math.floor(Date.now() / 1000) + 900,
      is_addon: false
    };
    const updated = { ...currentState, pending_invoice: inv };
    return { ok: true, data: inv, nextState: updated };
  }

  if (path.includes('/app/api/addon/invoice')) {
    const key = body?.tariff_key;
    const tariff = (currentState.addon_config?.tariffs_addon || []).find((t: any) => String(t.key) === String(key)) || (currentState.addon_config?.tariffs_addon || [])[0];
    const inv = {
      invoice_id: "inv_demo_" + Math.floor(Math.random() * 100000),
      invoice_label: `ZOOMA Addon: ${tariff?.label || "Слот 30 дней"}`,
      pay_url: "https://t.me/saxarok322",
      price_rub: tariff?.price_rub || 250,
      price_usdt: tariff?.price_usdt || 2.8,
      expires_at_ts: Math.floor(Date.now() / 1000) + 900,
      is_addon: true
    };
    const updated = { ...currentState, pending_invoice: inv };
    return { ok: true, data: inv, nextState: updated };
  }

  if (path.includes('/app/api/tariff/invoice/cancel')) {
    const updated = { ...currentState, pending_invoice: null };
    return { ok: true, nextState: updated };
  }

  if (path.includes('/app/api/account/reset-casino-data')) {
    return { ok: true, nextState: currentState };
  }

  if (path.includes('/app/api/extension-unbind')) {
    const aid = body?.account_id;
    const accounts = (currentState.accounts || []).map((a: any) => 
      String(a.account_id) === String(aid) ? { ...a, auth_status: 'не подключен', port_user_id: '', port_user_name: '' } : a
    );
    const updated = { ...currentState, accounts };
    return { ok: true, nextState: updated };
  }

  if (path.includes('/app/api/extension-reload')) {
    return { ok: true, nextState: currentState };
  }

  if (path.includes('/app/api/account/connect-prompt')) {
    return { ok: true, nextState: currentState };
  }

  return { ok: true, nextState: currentState };
};

export default function TelegramMiniApp() {
  const [mounted, setMounted] = useState(false);
  const [appState, setAppState] = useState<any>(null);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [activeTab, setActiveTab] = useState<'profile' | 'accounts' | 'tariffs'>(() => {
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('zooma_app_tab_v1') as any;
      if (['profile', 'accounts', 'tariffs'].includes(savedTab)) return savedTab;
    }
    return 'profile';
  });
  const [tariffType, setTariffType] = useState<'main' | 'addon'>(() => {
    if (typeof window !== 'undefined') {
      const savedType = localStorage.getItem('zooma_app_tariff_type_v1') as any;
      if (['main', 'addon'].includes(savedType)) return savedType;
    }
    return 'main';
  });
  const [addonConfig, setAddonConfig] = useState<any>({ tariffs_addon: [], accounts: [] });
  const [selectedBg, setSelectedBg] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('zooma_bg_theme_v1') || 'space-blue';
    }
    return 'space-blue';
  });

  const backgroundThemes = [
    {
      id: 'space-blue',
      name: 'Космический Боке',
      baseBg: '#030612',
      bgStyle: {
        backgroundColor: '#030612',
        backgroundImage: `
          radial-gradient(circle 1000px at 15% 15%, rgba(30, 64, 175, 0.35) 0%, rgba(30, 64, 175, 0.10) 50%, transparent 100%),
          radial-gradient(circle 900px at 85% 30%, rgba(139, 92, 246, 0.28) 0%, rgba(139, 92, 246, 0.08) 50%, transparent 100%),
          radial-gradient(circle 1000px at 50% 65%, rgba(59, 130, 246, 0.25) 0%, rgba(59, 130, 246, 0.08) 50%, transparent 100%),
          radial-gradient(circle 900px at 90% 85%, rgba(219, 39, 119, 0.22) 0%, rgba(219, 39, 119, 0.06) 50%, transparent 100%),
          radial-gradient(circle 800px at 15% 80%, rgba(79, 70, 229, 0.28) 0%, rgba(79, 70, 229, 0.08) 50%, transparent 100%)
        `
      },
      bokehCircles: [
        { size: '240px', top: '15%', left: '80%', color: 'radial-gradient(circle, rgba(236, 72, 153, 0.25) 0%, transparent 70%)', opacity: 0.3, animClass: 'animate-float-1' },
        { size: '180px', top: '35%', left: '12%', color: 'radial-gradient(circle, rgba(14, 165, 233, 0.3) 0%, transparent 70%)', opacity: 0.35, animClass: 'animate-float-2' },
        { size: '280px', top: '65%', left: '85%', color: 'radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, transparent 70%)', opacity: 0.32, animClass: 'animate-float-3' },
        { size: '150px', top: '80%', left: '20%', color: 'radial-gradient(circle, rgba(6, 182, 212, 0.28) 0%, transparent 70%)', opacity: 0.3, animClass: 'animate-float-1' },
        { size: '210px', top: '50%', left: '45%', color: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)', opacity: 0.25, animClass: 'animate-float-2' },
        { size: '170px', top: '25%', left: '60%', color: 'radial-gradient(circle, rgba(37, 99, 235, 0.28) 0%, transparent 70%)', opacity: 0.3, animClass: 'animate-float-3' }
      ]
    }
  ];

  const currentTheme = backgroundThemes[0];

  const handleBgChange = (bgId: string) => {
    // Left as a stub since themes are no longer switchable
  };

  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return !(window as any).Telegram?.WebApp?.initData;
    }
    return false;
  });

  // Impurity and rendering state (React pure rules)
  const [currentTime, setCurrentTime] = useState<number>(() => Math.floor(Date.now() / 1000));
  const [busyKeys, setBusyKeys] = useState<string[]>([]);

  // Dynamic computed values (eliminating redundant states to prevent cascading renders)
  const lastInvoice = (() => {
    const raw = appState?.pending_invoice;
    if (!raw) return null;
    const exp = Number(raw.expires_at_ts || 0);
    if (exp <= currentTime) return null;
    return {
      ...raw,
      invoice_id: String(raw.invoice_id || ''),
      invoice_label: String(raw.invoice_label || ''),
      pay_url: String(raw.pay_url || ''),
      price_rub: Number(raw.price_rub || 0),
      price_usdt: Number(raw.price_usdt || 0),
      expires_at_ts: exp,
      is_addon: !!raw.is_addon
    };
  })();

  const countdownText = (() => {
    if (!lastInvoice?.expires_at_ts) return '--:--';
    const left = Number(lastInvoice.expires_at_ts) - currentTime;
    if (left <= 0) return '--:--';
    const mins = Math.floor(left / 60);
    const secs = left % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  })();

  const getInvoiceTheme = () => {
    if (!lastInvoice) return null;
    const label = String(lastInvoice.invoice_label || '').toLowerCase();
    const is90Days = label.includes('90') || String(lastInvoice.tariff_days).includes('90') || Number(lastInvoice.price_rub) > 800;
    const isAddon = !!lastInvoice.is_addon;

    if (isAddon) {
      return {
        title: "Дополнительный слот",
        bgGradient: "from-emerald-950/45 via-slate-900/90 to-slate-950/80",
        borderColor: "border-emerald-500/40 shadow-emerald-950/50",
        accentColor: "text-emerald-400",
        badgeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        buttonBg: "bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-emerald-500/10 text-white",
        icon: <Layers className="w-5 h-5 text-emerald-400 animate-pulse" />
      };
    }

    if (is90Days) {
      return {
        title: "Премиум 90 дней (VIP)",
        bgGradient: "from-amber-950/30 via-slate-900/90 to-slate-950/80",
        borderColor: "border-amber-500/40 shadow-amber-950/40",
        accentColor: "text-amber-400",
        badgeBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        buttonBg: "bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/10 text-slate-950 font-black",
        icon: <Zap className="w-5 h-5 text-amber-400 animate-pulse" />
      };
    }

    // Default: Main 30 days
    return {
      title: "Основной 30 дней",
      bgGradient: "from-[#111e3b]/50 via-slate-900/90 to-slate-950/80",
      borderColor: "border-sky-500/40 shadow-sky-950/40",
      accentColor: "text-sky-400",
      badgeBg: "bg-sky-500/10 text-sky-400 border-sky-500/20",
      buttonBg: "bg-gradient-to-r from-sky-500 to-indigo-500 shadow-sky-500/10 text-white",
      icon: <Shield className="w-5 h-5 text-sky-400 animate-pulse" />
    };
  };

  // UI Open States
  const [proxyOpen, setProxyOpen] = useState<Record<string, boolean>>({});
  const [chatAiSetupOpen, setChatAiSetupOpen] = useState<Record<string, boolean>>({});
  const [chatAiPanelOpen, setChatAiPanelOpen] = useState<Record<string, boolean>>({});

  // Draft States
  const [proxyDrafts, setProxyDrafts] = useState<Record<string, any>>({});
  const [chatAiDrafts, setChatAiDrafts] = useState<Record<string, any>>({});

  // Modals
  const [addonModalOpen, setAddonModalOpen] = useState(false);
  const [selectedAddonTariff, setSelectedAddonTariff] = useState<any>(null);
  const [selectedAddonAccountId, setSelectedAddonAccountId] = useState<string>('');

  const [unbindModalOpen, setUnbindModalOpen] = useState(false);
  const [pendingUnbindAccountId, setPendingUnbindAccountId] = useState('');

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [pendingResetAccountId, setPendingResetAccountId] = useState('');

  // Toast
  const [toast, setToast] = useState<{ text: string; type: 'info' | 'ok' | 'err' } | null>(null);
  const [promoFlash, setPromoFlash] = useState(false);

  // Refs & WebSocket
  const wsRef = useRef<WebSocket | null>(null);
  const wsReconnectTimerRef = useRef<any>(null);
  const wsLastMessageTsRef = useRef<number>(0);
  const wsTimerRef = useRef<any>(null);
  const toastTimerRef = useRef<any>(null);
  const stateRefreshBusyRef = useRef(false);

  // Time ticks
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Telegram helper
  const getTg = () => {
    if (typeof window !== 'undefined') {
      return (window as any).Telegram?.WebApp || {
        initData: "", ready() {}, expand() {}, close() {},
        openTelegramLink(url: string) { window.location.href = url; }
      };
    }
    return { initData: "", ready() {}, expand() {}, close() {}, openTelegramLink() {} };
  };

  // Toast notifier
  const showToast = (text: string, type: 'info' | 'ok' | 'err' = 'info', duration = 2600) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ text, type });
    toastTimerRef.current = setTimeout(() => setToast(null), duration);
  };

  // API handler
  const api = async (path: string, method = 'GET', body: any = null) => {
    const tg = getTg();
    const initData = tg.initData || '';
    if (!initData) {
      return new Promise<any>((resolve, reject) => {
        setTimeout(() => {
          try {
            const res = handleDemoApiCall(appState, path, method, body);
            if (res.nextState) {
              setAppState(res.nextState);
              if (typeof window !== 'undefined') {
                localStorage.setItem('zooma_app_mock_state_v1', JSON.stringify(res.nextState));
              }
            }
            resolve(res);
          } catch (e) {
            reject(e);
          }
        }, 150);
      });
    }
    const url = `${path}${path.includes('?') ? '&' : '?'}init_data=${encodeURIComponent(initData)}`;
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : null
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.detail || json.message || json.error || 'request_failed');
    return json;
  };

  // Timezone Sync
  const syncTimezone = async () => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      const locale = navigator.language || '';
      const offset_min = new Date().getTimezoneOffset();
      if (!timezone) return;
      const res = await api('/app/api/timezone', 'POST', { timezone, offset_min, locale });
      if (res.data) {
        setAppState((prev: any) => prev ? { ...prev, ...res.data } : res.data);
      }
    } catch (_) {}
  };

  const getActiveChatAiAccount = (s = appState) => {
    const list = Array.isArray(s?.accounts) ? s.accounts : [];
    const aid = String(s?.active_account_id || 'acc_1');
    return list.find((a: any) => String(a?.account_id || '') === aid) || list[0] || null;
  };

  // Normalizing invoice
  const normalizeInvoice = (data: any) => {
    if (!data) return null;
    const exp = Number(data.expires_at_ts || 0);
    if (exp <= currentTime) return null;
    return {
      ...data,
      invoice_id: String(data.invoice_id || ''),
      invoice_label: String(data.invoice_label || ''),
      pay_url: String(data.pay_url || ''),
      price_rub: Number(data.price_rub || 0),
      price_usdt: Number(data.price_usdt || 0),
      expires_at_ts: exp,
      is_addon: !!data.is_addon
    };
  };

  // Sync state helpers
  const applySnapshotState = (nextState: any, flash = true) => {
    setAppState((prev: any) => {
      if (flash && prev) {
        const oldCount = Number(prev?.promo_activated_count || 0);
        const oldTotal = Number(prev?.promo_activated_total_amount || 0);
        const newCount = Number(nextState?.promo_activated_count || 0);
        const newTotal = Number(nextState?.promo_activated_total_amount || 0);
        if (newCount > oldCount || newTotal > oldTotal) {
          setPromoFlash(true);
          setTimeout(() => setPromoFlash(false), 3000);
        }
      }
      return { ...prev, ...nextState };
    });
  };

  const applyWsPayload = (msg: any) => {
    if (!msg || typeof msg !== 'object') return;
    if (msg.type === 'bootstrap' || msg.type === 'state') {
      applySnapshotState(msg.data || {}, msg.type !== 'bootstrap');
      return;
    }
    if (msg.type === 'profile_patch') {
      setAppState((prev: any) => prev ? { ...prev, ...msg.data } : msg.data);
      return;
    }
    if (msg.type === 'accounts_patch') {
      setAppState((prev: any) => prev ? {
        ...prev,
        active_account_id: String(msg.data?.active_account_id || prev.active_account_id || ''),
        accounts: Array.isArray(msg.data?.accounts) ? msg.data.accounts : []
      } : prev);
      return;
    }
    if (msg.type === 'account_patch') {
      setAppState((prev: any) => {
        if (!prev) return prev;
        const aid = String(msg.data?.account_id || '');
        const list = Array.isArray(prev.accounts) ? [...prev.accounts] : [];
        const idx = list.findIndex(x => String(x.account_id || '') === aid);
        if (idx >= 0) list[idx] = { ...list[idx], ...msg.data };
        else list.push(msg.data);
        return { ...prev, accounts: list };
      });
      return;
    }
    if (msg.type === 'invoice_patch') {
      setAppState((prev: any) => prev ? { ...prev, pending_invoice: msg.data?.pending_invoice ?? null } : prev);
      return;
    }
    if (msg.type === 'promo_patch') {
      setAppState((prev: any) => {
        if (!prev) return prev;
        const oldCount = Number(prev.promo_activated_count || 0);
        const oldTotal = Number(prev.promo_activated_total_amount || 0);
        if (Number(msg.data?.promo_activated_count || 0) > oldCount || Number(msg.data?.promo_activated_total_amount || 0) > oldTotal) {
          setPromoFlash(true);
          setTimeout(() => setPromoFlash(false), 3000);
        }
        return { ...prev, ...msg.data };
      });
      return;
    }
    if (msg.type === 'tariffs_patch') {
      setAppState((prev: any) => prev ? { ...prev, tariffs: Array.isArray(msg.data?.tariffs) ? msg.data.tariffs : [] } : prev);
      return;
    }
    if (msg.type === 'addon_config_patch') {
      const config = msg.data?.addon_config || { tariffs_addon: [], accounts: [] };
      setAddonConfig(config);
      setAppState((prev: any) => prev ? { ...prev, addon_config: config } : prev);
      return;
    }
  };

  const loadAddonConfig = async (forceRemote = false) => {
    if (!forceRemote && appState?.addon_config) {
      setAddonConfig(appState.addon_config);
      return appState.addon_config;
    }
    try {
      const res = await api('/app/api/addon/config');
      const freshConfig = res.data || { tariffs_addon: [], accounts: [] };
      setAddonConfig(freshConfig);
      setAppState((prev: any) => prev ? { ...prev, addon_config: freshConfig } : prev);
      return freshConfig;
    } catch (_) {
      return { tariffs_addon: [], accounts: [] };
    }
  };

  function wsConnect() {
    if (wsReconnectTimerRef.current) clearTimeout(wsReconnectTimerRef.current);
    if (wsRef.current) {
      try { wsRef.current.close(); } catch (_) {}
    }
    const tg = getTg();
    const initData = tg.initData || '';
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const url = `${proto}://${window.location.host}/app/ws?init_data=${encodeURIComponent(initData)}`;
    
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      wsLastMessageTsRef.current = Date.now();
      if (wsTimerRef.current) clearInterval(wsTimerRef.current);
      wsTimerRef.current = setInterval(() => {
        try {
          if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send('ping');
        } catch (_) {}
      }, 15000);
    };

    ws.onmessage = (ev) => {
      if (ev.data === 'pong') {
        wsLastMessageTsRef.current = Date.now();
        return;
      }
      try {
        const msg = JSON.parse(ev.data);
        wsLastMessageTsRef.current = Date.now();
        applyWsPayload(msg);
      } catch (_) {}
    };

    ws.onclose = () => {
      if (wsTimerRef.current) clearInterval(wsTimerRef.current);
      wsReconnectTimerRef.current = setTimeout(wsConnect, 1200);
    };

    ws.onerror = () => {
      try { wsRef.current?.close(); } catch (_) {}
    };
  }

  const wsIsHealthy = () => wsRef.current && wsRef.current.readyState === WebSocket.OPEN && (currentTime * 1000 - wsLastMessageTsRef.current) < 20000;

  const refreshState = async (force = false) => {
    if (stateRefreshBusyRef.current || document.hidden) return;
    if (!force && wsIsHealthy()) return;
    stateRefreshBusyRef.current = true;
    try {
      const res = await api('/app/api/state');
      applySnapshotState(res.data, true);
    } catch (_) {}
    finally { stateRefreshBusyRef.current = false; }
  };

  // Toggle operations state helpers (pure renders)
  const toggleOpBusy = (key: string) => busyKeys.includes(key);
  
  const beginToggleOp = (key: string) => {
    if (!key || busyKeys.includes(key)) return false;
    setBusyKeys(prev => [...prev, key]);
    setTimeout(async () => {
      setBusyKeys(prev => prev.filter(k => k !== key));
      await refreshState(true);
    }, 15000);
    return true;
  };

  const endToggleOp = (key: string) => {
    setTimeout(() => {
      setBusyKeys(prev => prev.filter(k => k !== key));
    }, 1200);
  };

  async function fetchInitialState() {
    const tg = getTg();
    const isDemo = !tg.initData;

    if (isDemo) {
      let defaultState: any = null;
      if (typeof window !== 'undefined') {
        const savedMock = localStorage.getItem('zooma_app_mock_state_v1');
        if (savedMock) {
          try { defaultState = JSON.parse(savedMock); } catch (_) {}
        }
      }
      if (!defaultState) {
        defaultState = getDemoDefaultState();
      }
      setAppState(defaultState);
      setAddonConfig(defaultState.addon_config);
      return;
    }

    try {
      const res = await api('/app/api/state');
      applySnapshotState(res.data, false);
      await syncTimezone();
      if (!res.data?.addon_config) await loadAddonConfig(true);
      else setAddonConfig(res.data.addon_config);
      
      // Hydrate saved invoice
      const savedStr = localStorage.getItem('zooma_app_invoice_v1');
      if (savedStr && !res.data?.pending_invoice) {
        const saved = JSON.parse(savedStr);
        if (saved && Number(saved.chat_id || 0) === Number(res.data?.chat_id || 0) && saved.invoice) {
          const inv = normalizeInvoice(saved.invoice);
          if (inv) {
            setAppState((prev: any) => prev ? { ...prev, pending_invoice: inv } : { ...res.data, pending_invoice: inv });
          }
        }
      }
    } catch (_) {}
  }

  // Loading step sequence effect
  useEffect(() => {
    if (mounted && appState) {
      let current = 0;
      const interval = setInterval(() => {
        current += 1;
        if (current < 4) {
          setLoadingStep(current);
        } else {
          clearInterval(interval);
          setLoadingComplete(true);
        }
      }, 350);
      return () => clearInterval(interval);
    }
  }, [mounted, appState]);

  // Mounting & initial boot
  useEffect(() => {
    Promise.resolve().then(() => {
      setMounted(true);
      fetchInitialState();
    });
    const tg = getTg();
    try { tg.ready(); tg.expand(); } catch (_) {}

    wsConnect();

    return () => {
      if (wsTimerRef.current) clearInterval(wsTimerRef.current);
      if (wsReconnectTimerRef.current) clearTimeout(wsReconnectTimerRef.current);
      if (wsRef.current) wsRef.current.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Invoice & timing sync side effects
  useEffect(() => {
    const raw = appState?.pending_invoice;
    if (!raw) {
      localStorage.removeItem('zooma_app_invoice_v1');
      return;
    }
    const exp = Number(raw.expires_at_ts || 0);
    if (exp <= currentTime) {
      localStorage.removeItem('zooma_app_invoice_v1');
      Promise.resolve().then(() => {
        setAppState((prev: any) => {
          if (!prev || !prev.pending_invoice) return prev;
          return { ...prev, pending_invoice: null };
        });
      });
    } else if (appState?.chat_id) {
      localStorage.setItem('zooma_app_invoice_v1', JSON.stringify({
        chat_id: Number(appState.chat_id),
        invoice: raw
      }));
    }
  }, [appState?.pending_invoice, appState?.chat_id, currentTime]);

  // Tab switching
  const handleTabChange = (tab: 'profile' | 'accounts' | 'tariffs') => {
    setActiveTab(tab);
    localStorage.setItem('zooma_app_tab_v1', tab);
  };

  const handleTariffTypeChange = async (type: 'main' | 'addon') => {
    setTariffType(type);
    localStorage.setItem('zooma_app_tariff_type_v1', type);
    if (type === 'addon') await loadAddonConfig();
  };

  // Account operations
  const setAccountPromo = async (accountId: string, enabled: boolean) => {
    const aid = String(accountId || '');
    const op = `promo:${aid}`;
    if (!beginToggleOp(op)) return;

    setAppState((prev: any) => {
      if (!prev) return prev;
      const list = Array.isArray(prev.accounts) ? [...prev.accounts] : [];
      const idx = list.findIndex(x => String(x.account_id || '') === aid);
      if (idx >= 0) list[idx] = { ...list[idx], promo_activation_paused: !enabled };
      return { ...prev, accounts: list };
    });

    try {
      const res = await api('/app/api/promo-activation-pause', 'POST', { account_id: aid, paused: !enabled });
      setAppState((prev: any) => {
        if (!prev) return prev;
        const list = Array.isArray(prev.accounts) ? [...prev.accounts] : [];
        const idx = list.findIndex(x => String(x.account_id || '') === aid);
        if (idx >= 0) list[idx] = { ...list[idx], promo_activation_paused: !!res.data?.promo_activation_paused };
        return { ...prev, accounts: list };
      });
      showToast(enabled ? 'Активация промо включена' : 'Активация промо на паузе', 'ok');
    } catch (err: any) {
      showToast(err.message || 'Ошибка настройки промо', 'err');
    } finally {
      endToggleOp(op);
    }
  };

  const setActivationMode = async (accountId: string, mode: 'server' | 'extension') => {
    const aid = String(accountId || '');
    const op = `mode:${aid}`;
    if (!beginToggleOp(op)) return;

    setAppState((prev: any) => {
      if (!prev) return prev;
      const list = Array.isArray(prev.accounts) ? [...prev.accounts] : [];
      const idx = list.findIndex(x => String(x.account_id || '') === aid);
      if (idx >= 0) list[idx] = { ...list[idx], promo_activation_mode: mode };
      return { ...prev, accounts: list };
    });

    try {
      await api('/app/api/promo-activation-mode', 'POST', { account_id: aid, mode });
      await refreshState(true);
      showToast(mode === 'extension' ? 'Включена работа через расширение' : 'Включена работа через сервер', 'ok');
    } catch (err: any) {
      await refreshState(true);
      showToast(err.message || 'Ошибка переключения режима', 'err');
    } finally {
      endToggleOp(op);
    }
  };

  // Manual proxy operations
  const getProxyDraft = (aid: string, a: any) => {
    if (!proxyDrafts[aid]) {
      return {
        full: '',
        host: String(a.proxy_ip || ''),
        port: String(a.proxy_port_socks5 || ''),
        login: String(a.proxy_login || ''),
        password: String(a.proxy_password || '')
      };
    }
    return proxyDrafts[aid];
  };

  const handleProxyDraftChange = (aid: string, field: string, value: string) => {
    setProxyDrafts(prev => ({
      ...prev,
      [aid]: { ...(prev[aid] || { full: '', host: '', port: '', login: '', password: '' }), [field]: value }
    }));
  };

  const saveProxy = async (accountId: string) => {
    try {
      const aid = String(accountId || '');
      const draft = getProxyDraft(aid, {});
      let host = String(draft.host || '').trim();
      let port = parseInt(String(draft.port || '0').trim() || '0', 10);
      let login = String(draft.login || '').trim();
      let password = String(draft.password || '').trim();
      const full = String(draft.full || '').trim();
      
      if (full) {
        const parsed = parseSocks5ProxyInput(full);
        if (parsed) {
          host = parsed.host;
          port = parsed.port;
          login = parsed.login;
          password = parsed.password;
        }
      }
      
      if (!host || !port || !login || !password) {
        throw new Error('Заполните SOCKS5 прокси: ip:port:login:password');
      }
      
      await api('/app/api/proxy/manual', 'POST', { account_id: aid, host, port, login, password });
      setProxyDrafts(prev => ({
        ...prev,
        [aid]: { full: '', host, port: String(port), login, password }
      }));
      showToast('Прокси сохранён. Пинг обновится после проверки.', 'ok');
      if (!wsIsHealthy()) setTimeout(() => refreshState(true), 700);
    } catch (err: any) {
      showToast(err.message || 'Не удалось сохранить прокси', 'err');
    }
  };

  const parseSocks5ProxyInput = (raw: string) => {
    raw = String(raw || '').trim();
    if (!raw) return null;
    try {
      if (raw.includes('://')) {
        const u = new URL(raw);
        if (!String(u.protocol || '').toLowerCase().startsWith('socks5')) throw new Error('Только SOCKS5');
        return {
          host: u.hostname,
          port: parseInt(u.port || '0', 10),
          login: decodeURIComponent(u.username || ''),
          password: decodeURIComponent(u.password || '')
        };
      }
      if (raw.includes('@')) {
        const u = new URL('socks5://' + raw);
        return {
          host: u.hostname,
          port: parseInt(u.port || '0', 10),
          login: decodeURIComponent(u.username || ''),
          password: decodeURIComponent(u.password || '')
        };
      }
      const parts = raw.split(':');
      if (parts.length !== 4) throw new Error('Формат: ip:port:login:password');
      return {
        host: parts[0].trim(),
        port: parseInt(parts[1].trim(), 10),
        login: parts[2].trim(),
        password: parts.slice(3).join(':').trim()
      };
    } catch (e: any) {
      throw new Error(e.message || 'Неверный формат прокси');
    }
  };

  // Chat AI state operations
  const getChatAiDraft = (a: any) => {
    const aid = String(a?.account_id || 'acc_1');
    if (!chatAiDrafts[aid]) {
      const savedRain = (Array.isArray(a?.chat_ai_rain_miss_messages) ? a.chat_ai_rain_miss_messages : [])
        .map((x: any) => String(x || '').trim())
        .filter(Boolean)
        .join('; ');
      return {
        key: '',
        min: String(Math.round(Number(a?.chat_ai_interval_min_sec || 600) / 60)),
        max: String(Math.round(Number(a?.chat_ai_interval_max_sec || 1500) / 60)),
        rainMiss: savedRain,
        dirty: false
      };
    }
    return chatAiDrafts[aid];
  };

  const handleChatAiDraftChange = (aid: string, field: string, value: string) => {
    setChatAiDrafts(prev => {
      const current = prev[aid] || { key: '', min: '', max: '', rainMiss: '', dirty: false };
      let processedValue = value;
      if (field === 'rainMiss') {
        processedValue = value.split(';').map(part => {
          const match = part.match(/^\s*/);
          const leading = match ? match[0] : '';
          return leading + part.slice(leading.length).replace(/\u00a0/g, ' ').replace(/ /g, '\u00a0');
        }).join(';');
      }
      return { ...prev, [aid]: { ...current, [field]: processedValue, dirty: true } };
    });
  };

  const toggleChatAi = async (accountId: string, enabled: boolean) => {
    const a = getActiveChatAiAccount();
    const aid = String(accountId || 'acc_1');
    if (enabled && !a?.chat_ai_has_api_key) {
      setChatAiSetupOpen(prev => ({ ...prev, [aid]: true }));
      setChatAiPanelOpen(prev => ({ ...prev, [aid]: true }));
      return;
    }
    const op = `chat-ai:${aid}`;
    if (!beginToggleOp(op)) return;

    setAppState((prev: any) => {
      if (!prev) return prev;
      const list = Array.isArray(prev.accounts) ? [...prev.accounts] : [];
      const idx = list.findIndex(x => String(x.account_id || '') === aid);
      if (idx >= 0) list[idx] = { ...list[idx], chat_ai_enabled: !!enabled };
      return { ...prev, accounts: list };
    });

    try {
      await api('/app/api/chat-ai/settings', 'POST', { account_id: aid, enabled: !!enabled });
      setChatAiSetupOpen(prev => ({ ...prev, [aid]: false }));
      await refreshState(true);
      showToast(enabled ? 'Chat AI включён' : 'Chat AI выключен', 'ok');
    } catch (err: any) {
      await refreshState(true);
      showToast(err.message || 'Ошибка включения Chat AI', 'err');
    } finally {
      endToggleOp(op);
    }
  };

  const saveChatAi = async (accountId: string) => {
    const a = getActiveChatAiAccount();
    const aid = String(accountId || 'acc_1');
    const d = getChatAiDraft(a);
    const min = Math.max(1, parseInt(d.min || '10', 10) || 10);
    const max = Math.max(1, parseInt(d.max || '25', 10) || 25);
    if (min > max) {
      showToast('Минимальный интервал больше максимального', 'err');
      return;
    }
    const rainMissPlain = String(d.rainMiss || '').replace(/\u00a0/g, ' ');
    const body: any = {
      account_id: aid,
      interval_min_sec: min * 60,
      interval_max_sec: max * 60,
      rain_miss_messages: rainMissPlain.split(';').map(x => x.trim()).filter(Boolean)
    };
    if (String(d.key || '').trim()) body.api_key = String(d.key).trim();
    if (chatAiSetupOpen[aid]) body.enabled = true;

    try {
      await api('/app/api/chat-ai/settings', 'POST', body);
      setChatAiDrafts(prev => {
        const current = prev[aid];
        if (current) return { ...prev, [aid]: { ...current, key: '', dirty: false } };
        return prev;
      });
      setChatAiSetupOpen(prev => ({ ...prev, [aid]: false }));
      await refreshState(true);
      showToast('Настройки Chat AI сохранены', 'ok');
    } catch (err: any) {
      showToast(err.message || 'Ошибка сохранения настроек', 'err');
    }
  };

  // Tariff Billing operations
  const buyTariff = async (key: string) => {
    try {
      const res = await api('/app/api/tariff/invoice', 'POST', { tariff_key: key });
      setAppState((prev: any) => prev ? { ...prev, pending_invoice: res.data || null } : prev);
      handleTabChange('tariffs');
      showToast('Счёт создан', 'ok');
    } catch (err: any) {
      showToast(err.message || 'Ошибка создания счёта', 'err');
    }
  };

  const getAddonAccountsOptions = () => addonConfig.accounts || [];
  const selectedAddonOption = () => {
    const options = getAddonAccountsOptions();
    return options.find((o: any) => String(o.account_id) === selectedAddonAccountId) || options[0] || null;
  };

  const hasMainSubscriptionForAddon = () => {
    if (appState?.main_subscription_active === false) return false;
    if (addonConfig?.main_active === false) return false;
    return true;
  };

  const openAddonBuy = (key: string) => {
    if (!hasMainSubscriptionForAddon()) {
      showToast(addonConfig?.message || 'Доп. аккаунты доступны только при активной подписке.', 'err', 5000);
      return;
    }
    const t = (addonConfig.tariffs_addon || []).find((x: any) => String(x.key) === String(key));
    if (!t) {
      showToast('Тариф не найден', 'err');
      return;
    }
    const options = addonConfig.accounts || [];
    if (!options.length) {
      showToast('Нет свободных слотов для доп. аккаунта', 'err');
      return;
    }
    setSelectedAddonTariff(t);
    setSelectedAddonAccountId(options[0]?.account_id || '');
    setAddonModalOpen(true);
  };

  const createAddonInvoice = async () => {
    try {
      const o = selectedAddonOption();
      if (!selectedAddonTariff || !o) {
        showToast('Выбери аккаунт', 'err');
        return;
      }
      const res = await api('/app/api/addon/invoice', 'POST', {
        tariff_key: selectedAddonTariff.key,
        account_id: o.account_id
      });
      setAppState((prev: any) => prev ? { ...prev, pending_invoice: res.data || null } : prev);
      setAddonModalOpen(false);
      handleTabChange('tariffs');
      showToast('Счёт создан', 'ok');
      if (!wsIsHealthy()) setTimeout(() => refreshState(true), 700);
    } catch (err: any) {
      showToast(err.message || 'Ошибка создания счёта', 'err');
    }
  };

  const cancelInvoice = async () => {
    try {
      const invId = String(lastInvoice?.invoice_id || '').trim();
      await api('/app/api/tariff/invoice/cancel', 'POST', { invoice_id: invId || null });
      setAppState((prev: any) => prev ? { ...prev, pending_invoice: null } : prev);
      localStorage.removeItem('zooma_app_invoice_v1');
      showToast('Оплата отменена', 'info');
      if (!wsIsHealthy()) setTimeout(() => refreshState(true), 700);
    } catch (err: any) {
      showToast(err.message || 'Не удалось отменить оплату', 'err');
    }
  };

  // Generic utility functions
  const openSupport = () => {
    const url = 'https://t.me/saxarok322';
    const tg = getTg();
    try { tg.openTelegramLink(url); } catch (_) {
      try { window.location.href = url; } catch (__) {}
    }
    setTimeout(() => { try { tg.close(); } catch (_) {} }, 120);
  };

  const openPay = () => {
    if (!lastInvoice?.pay_url) {
      showToast('Ссылка оплаты не найдена', 'err');
      return;
    }
    const tg = getTg();
    tg.openTelegramLink(lastInvoice.pay_url);
  };

  const copyPay = async () => {
    try {
      if (!lastInvoice?.pay_url) {
        showToast('Ссылка оплаты не найдена', 'err');
        return;
      }
      await navigator.clipboard.writeText(lastInvoice.pay_url);
      showToast('Ссылка скопирована', 'ok');
    } catch (_) {
      showToast('Не удалось скопировать', 'err');
    }
  };

  const tzOffsetLabel = (ts?: number) => {
    const tz = appState?.timezone_name || '';
    if (!tz) return '';
    const d = new Date((ts || currentTime) * 1000);
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: tz, timeZoneName: 'longOffset', hour: '2-digit', minute: '2-digit', hour12: false
      }).formatToParts(d);
      let raw = (parts.find(p => p.type === 'timeZoneName') || {}).value || '';
      raw = raw.replace('GMT', 'UTC');
      const m = raw.match(/^UTC([+-])(\d{1,2})(?::?(\d{2}))?$/);
      if (m) return `UTC${m[1]}${String(m[2]).padStart(2, '0')}:${String(m[3] || '00').padStart(2, '0')}`;
      if (raw) return raw;
    } catch (_) {}
    return '';
  };

  const fmtTs = (ts?: number) => {
    const n = Number(ts || 0);
    if (!n) return '-';
    const d = new Date(n * 1000);
    const base: Intl.DateTimeFormatOptions = {
      hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    };
    try {
      if (appState?.timezone_valid && appState?.timezone_name) {
        return d.toLocaleString('ru-RU', { ...base, timeZone: appState.timezone_name });
      }
      return d.toLocaleString('ru-RU', { ...base, timeZone: 'Europe/Moscow' }) + ' МСК';
    } catch (_) {
      return d.toLocaleString('ru-RU', { hour12: false });
    }
  };

  const pingColor = (ms: number) => {
    if (!Number.isFinite(ms)) return 'text-slate-400';
    if (ms < 450) return 'text-emerald-400';
    if (ms < 900) return 'text-amber-400';
    return 'text-rose-400';
  };

  const pingMs = (o: any) => {
    const raw = (o?.effective_ping_ms != null ? o.effective_ping_ms : o?.proxy_ping_ms);
    const v = Number(raw);
    return Number.isFinite(v) ? v : null;
  };

  const pingSource = (o: any) => String(o?.effective_ping_source || o?.proxy_ping_source || '').toLowerCase();
  const pingLabel = (o: any) => {
    const s = pingSource(o);
    if (s === 'extension') return 'Пинг расширения';
    if (s === 'server') return 'Пинг сервера';
    return 'Пинг прокси';
  };

  const confirmResetAccount = async () => {
    const aid = pendingResetAccountId;
    setResetModalOpen(false);
    setPendingResetAccountId('');
    if (!aid) return;
    try {
      await api('/app/api/account/reset-casino-data', 'POST', { account_id: aid });
      setProxyDrafts(prev => { const next = { ...prev }; delete next[aid]; return next; });
      setProxyOpen(prev => ({ ...prev, [aid]: false }));
      await refreshState(true);
      showToast('Данные казино и прокси очищены', 'ok');
    } catch (err: any) {
      showToast(err.message || 'Не удалось очистить данные', 'err');
    }
  };

  const confirmUnbindExtension = async () => {
    const aid = pendingUnbindAccountId;
    setUnbindModalOpen(false);
    setPendingUnbindAccountId('');
    if (!aid) return;
    try {
      await api('/app/api/extension-unbind', 'POST', { account_id: aid });
      await refreshState(true);
      showToast('Расширение отвязано', 'ok');
    } catch (err: any) {
      showToast(err.message || 'Не удалось отвязать расширение', 'err');
    }
  };

  const reloadExtensionPage = async (accountId: string) => {
    try {
      showToast('Отправляем команду расширению...', 'info', 1800);
      await api('/app/api/extension-reload', 'POST', { account_id: String(accountId || '') });
      showToast('Страница на ПК обновлена', 'ok');
    } catch (err: any) {
      showToast(err.message || 'Не удалось обновить страницу ПК', 'err');
    }
  };

  const connectPrompt = async (accountId: string) => {
    try {
      await api('/app/api/account/connect-prompt', 'POST', { account_id: accountId });
      showToast('Дальнейшие действия в боте сообщениями', 'info', 3500);
      setTimeout(() => { try { getTg().close(); } catch (_) {} }, 4000);
    } catch (err: any) {
      showToast(err.message || 'Не удалось открыть авторизацию', 'err');
    }
  };

  const chatAiStatusText = (a: any) => {
    if (!a?.chat_ai_enabled) return 'Chat AI выключен';
    if (a?.server_session_stale) return 'Приостановлено: требуется новая сессия';
    const rest = Number(a?.chat_ai_rest_until_ts || 0);
    const next = Number(a?.chat_ai_next_run_ts || 0);
    const code = String(a?.chat_ai_last_error || '').trim();
    if (code === 'groq_tpd_limit' && next > currentTime) return `Лимит токенов Groq за 24 часа · повтор через ${Math.ceil((next - currentTime) / 60)} мин`;
    if (code === 'groq_rate_limited' && next > currentTime) return `Временный лимит Groq · повтор через ${Math.ceil((next - currentTime) / 60)} мин`;
    const err = chatAiErrorLabel(code);
    if (err) return err;
    if (rest > currentTime) return `Отдых завершится через ${Math.ceil((rest - currentTime) / 60)} мин`;
    if (next > currentTime) return `Следующее сообщение через ${Math.ceil((next - currentTime) / 60)} мин`;
    if (a?.chat_ai_pending_status) return 'Сообщение отправляется';
    return 'Ожидание следующего запуска';
  };

  const chatAiErrorLabel = (code: string) => {
    const raw = String(code || '').trim();
    const map: any = {
      server_session_stale: 'Приостановлено: требуется новая сессия',
      extension_offline: 'Приостановлено: расширение не подключено',
      extension_manager_unavailable: 'Приостановлено: расширение не подключено',
      managed_tab_not_ready: 'Вкладка казино недоступна',
      groq_tpd_limit: 'Лимит токенов Groq за 24 часа',
      groq_rate_limited: 'Временный лимит Groq',
      chat_ai_api_key_missing: 'Не настроен API-ключ',
      groq_no_valid_choice: 'Groq не выбрал подходящее сообщение',
      no_buffered_messages: 'В чате пока нет сообщений',
      no_unprocessed_messages: 'Нет новых сообщений для ответа',
      no_proxy: 'Приостановлено: не настроен прокси',
      proxy_unavailable: 'Приостановлено: прокси недоступен',
      proxy_site_unreachable: 'Приостановлено: сайт недоступен через прокси',
      proxy_recovering: 'Приостановлено: проверяется восстановление прокси',
      stale_pending_task: 'Предыдущая задача сброшена'
    };
    if (map[raw]) return map[raw];
    if (raw.startsWith('invalid_ai_response:')) return 'Groq вернул неподходящий ответ';
    return raw;
  };

  const authBadgeStyle = (status: string) => {
    const v = String(status || '').toLowerCase();
    if (v.includes('не подключен')) return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    if (v.includes('ожидает')) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    if (v.includes('подключен')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  };

  if (!mounted || !loadingComplete) {
    const loadingSteps = [
      "Подключение к серверу...",
      "Инициализация профиля...",
      "Синхронизация модулей...",
      "Запуск интерфейса..."
    ];
    return (
      <div className="min-h-screen bg-[#050914] flex flex-col items-center justify-center p-6 text-slate-400 select-none">
        <div className="text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="relative flex items-center justify-center mx-auto">
            {/* Glow behind the spinner */}
            <div className="absolute w-20 h-20 rounded-full bg-emerald-500/10 blur-2xl animate-pulse" />
            <svg className="w-16 h-16 animate-spin" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="spinner-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="#1e293b"
                strokeWidth="3.5"
                fill="none"
                className="opacity-20"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="url(#spinner-grad)"
                strokeWidth="3.5"
                strokeDasharray="160 260"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
          <div className="space-y-1">
            <h3 className="text-md font-bold text-slate-200 tracking-wide">ZOOMA</h3>
            <p className="text-xs text-slate-400 font-medium tracking-wide h-4 transition-all duration-300">
              {loadingSteps[loadingStep] || loadingSteps[0]}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!appState) {
    return (
      <div className="min-h-screen bg-[#050914] flex items-center justify-center p-6 text-center">
        <div className="max-w-xs space-y-4 premium-card p-6 rounded-2xl">
          <AlertCircle className="w-10 h-10 mx-auto text-rose-500" />
          <h2 className="text-md font-bold text-slate-200">Доступ ограничен</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Пожалуйста, откройте этот личный кабинет внутри Telegram бота ZOOMA.
          </p>
        </div>
      </div>
    );
  }

  const activeAiAcc = getActiveChatAiAccount();
  const activeAiAccId = activeAiAcc ? String(activeAiAcc.account_id) : 'acc_1';
  const chatAiExpanded = activeAiAcc ? (chatAiSetupOpen[activeAiAccId] || chatAiPanelOpen[activeAiAccId] || localStorage.getItem('zooma_chat_ai_open_' + activeAiAccId) === '1') : false;

  return (
    <div 
      className="min-h-screen text-slate-200 font-sans pb-28 relative overflow-x-hidden selection:bg-sky-500/20 selection:text-sky-300 transition-colors duration-500"
      style={{ backgroundColor: currentTheme.baseBg }}
    >
      
      {/* Dynamic, subtle ambient layers */}
      <div className="absolute inset-0 pointer-events-none transition-all duration-500" style={currentTheme.bgStyle} />

      {/* Floating Animated Bokeh Spheres */}
      {currentTheme.bokehCircles && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-screen">
          {currentTheme.bokehCircles.map((circle, idx) => (
            <div
              key={idx}
              className={`absolute rounded-full transition-all duration-700 ${circle.animClass}`}
              style={{
                width: circle.size,
                height: circle.size,
                top: circle.top,
                left: circle.left,
                background: circle.color,
                filter: 'blur(35px)',
                opacity: circle.opacity,
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>
      )}

      {/* Floating Status Toast */}
      {toast && (
        <div className="fixed top-16 left-4 right-4 z-50 flex justify-center animate-in fade-in slide-in-from-top-4 duration-200">
          <div className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md text-sm font-semibold border min-w-[280px] md:min-w-[340px] text-center justify-center transition-all ${
            toast.type === 'ok' ? 'bg-emerald-950/95 text-emerald-300 border-emerald-500/40 shadow-emerald-950/40' :
            toast.type === 'err' ? 'bg-red-600 text-white border-red-400 shadow-red-950/50 font-bold' :
            'bg-[#0e172a]/95 text-sky-300 border-sky-500/30'
          }`}>
            {toast.type === 'ok' && <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
            {toast.type === 'err' && <AlertCircle className="w-5 h-5 text-white flex-shrink-0" />}
            {toast.type === 'info' && <RefreshCw className="w-5 h-5 text-sky-400 animate-spin flex-shrink-0" />}
            <span>{toast.text}</span>
          </div>
        </div>
      )}

      {/* Fixed Premium Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md border-b border-slate-900/40 py-3" style={{ backgroundColor: `${currentTheme.baseBg}d9` }}>
        <div className="max-w-lg mx-auto px-4">
          <div className="flex items-center justify-between bg-[#0e172a] p-1.5 border border-slate-800/90 rounded-2xl shadow-lg shadow-black/60">
            <button 
              onClick={() => handleTabChange('profile')}
              className={`flex-1 py-2.5 text-center text-xs font-black rounded-xl transition-all duration-150 flex items-center justify-center gap-1.5 ${
                activeTab === 'profile' 
                  ? 'bg-[#1e2d5a] text-sky-400 border border-sky-500/30 shadow-md shadow-sky-950/40 scale-[1.02]' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
              }`}
            >
              <User className={`w-3.5 h-3.5 ${activeTab === 'profile' ? 'text-sky-400' : 'text-slate-400'}`} />
              <span>Профиль</span>
            </button>
            <button 
              onClick={() => handleTabChange('accounts')}
              className={`flex-1 py-2.5 text-center text-xs font-black rounded-xl transition-all duration-150 flex items-center justify-center gap-1.5 ${
                activeTab === 'accounts' 
                  ? 'bg-[#1e2d5a] text-sky-400 border border-sky-500/30 shadow-md shadow-sky-950/40 scale-[1.02]' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
              }`}
            >
              <Cpu className={`w-3.5 h-3.5 ${activeTab === 'accounts' ? 'text-sky-400' : 'text-slate-400'}`} />
              <span>Аккаунты</span>
            </button>
            <button 
              onClick={() => handleTabChange('tariffs')}
              className={`flex-1 py-2.5 text-center text-xs font-black rounded-xl transition-all duration-150 flex items-center justify-center gap-1.5 ${
                activeTab === 'tariffs' 
                  ? 'bg-[#1e2d5a] text-sky-400 border border-sky-500/30 shadow-md shadow-sky-950/40 scale-[1.02]' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
              }`}
            >
              <CreditCard className={`w-3.5 h-3.5 ${activeTab === 'tariffs' ? 'text-sky-400' : 'text-slate-400'}`} />
              <span>Тарифы</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container with offset for fixed header */}
      <main className="max-w-lg mx-auto px-4 pt-20 space-y-4">
        
        {/* VIEW: PROFILE */}
        {activeTab === 'profile' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            
            {/* Main Profile Info Card */}
            <div className="premium-card rounded-2xl p-5 shadow-lg space-y-3.5 relative overflow-hidden group">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800/40">
                <span className="text-xs text-slate-400 font-medium">Пользователь</span>
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 bg-slate-950/40 px-2.5 py-1 rounded-lg">
                  <User className="w-3.5 h-3.5 text-sky-400" />
                  {appState.tg_username || '-'}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Telegram Chat ID</span>
                <span className="font-mono font-bold text-slate-300">{appState.chat_id}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Уровень подписки</span>
                <span className="font-bold">
                  {appState.subscription_paused ? (
                    <span className="px-2 py-0.5 text-[10px] rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium uppercase tracking-wider">Заморожен</span>
                  ) : (
                    <span className="text-sky-300 bg-sky-500/5 px-2.5 py-0.5 rounded border border-sky-500/10 font-semibold">{appState.subscription_tier || '-'}</span>
                  )}
                </span>
              </div>

              {appState.subscription_paused ? (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Оставшийся срок</span>
                  <span className="text-amber-400 font-bold">
                    {Math.floor(Math.max(0, Number(appState.subscription_frozen_left_sec)) / 86400) > 0 
                      ? `${Math.floor(Math.max(0, Number(appState.subscription_frozen_left_sec)) / 86400)} дн.` 
                      : 'меньше 1 дн.'}
                  </span>
                </div>
              ) : (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Активна до</span>
                  <span className="text-slate-300 font-semibold">{fmtTs(appState.subscription_until_ts)}</span>
                </div>
              )}

              {/* Timezone label if valid */}
              {appState.timezone_valid && appState.timezone_name && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Часовой пояс</span>
                  <span className="text-slate-300 font-medium flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                    {appState.timezone_name} {tzOffsetLabel(appState.subscription_until_ts)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Прокси</span>
                <span className={`font-bold ${appState.proxy_set ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {appState.proxy_set ? 'Подключен' : 'Отсутствует'}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">{pingLabel(appState)}</span>
                <span className={`font-mono font-black ${pingColor(Number(pingMs(appState)))}`}>
                  {pingMs(appState) != null ? `${Number(pingMs(appState)).toFixed(1)} мс` : '-'}
                </span>
              </div>

              <button 
                onClick={openSupport}
                className="w-full mt-2 py-2.5 text-xs font-bold text-slate-300 bg-slate-950/40 hover:bg-slate-950/80 rounded-xl border border-slate-800 hover:border-slate-700 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-slate-400" />
                Служба поддержки / Support
              </button>
            </div>

            {/* Promo Stats Grid Card */}
            <div className="grid grid-cols-2 gap-3">
              <div className={`premium-card rounded-2xl py-1.5 px-3 text-center transition-all duration-300 ${
                promoFlash ? 'promo-flashing' : ''
              }`}>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Активировано промо</span>
                <p className={`text-xl font-black mt-0.5 transition-all ${promoFlash ? 'text-emerald-400 scale-105' : 'text-slate-200'}`}>
                  {Number(appState.promo_activated_count || 0)}
                </p>
              </div>

              <div className={`premium-card rounded-2xl py-1.5 px-3 text-center transition-all duration-300 ${
                promoFlash ? 'promo-flashing' : ''
              }`}>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Сумма промо</span>
                <p className={`text-xl font-black mt-0.5 transition-all ${promoFlash ? 'text-emerald-400 scale-105' : 'text-sky-300'}`}>
                  {Number(appState.promo_activated_total_amount || 0).toFixed(2)} ₽
                </p>
                <p className="text-[9px] text-slate-500 mt-0.5 font-medium">
                  {appState.promo_month_label ? `За ${appState.promo_month_label}` : 'За месяц'}: {Number(appState.promo_month_total_amount || 0).toFixed(2)} ₽
                </p>
              </div>
            </div>

            {/* Chat AI Box */}
            {activeAiAcc && (
              <div className="premium-card rounded-2xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-sm font-black text-slate-200 flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 text-sky-400" />
                      Chat AI
                    </span>
                    {!chatAiExpanded && (
                      <p className="text-[10px] text-slate-400 font-medium">
                        {chatAiStatusText(activeAiAcc)}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-5">
                    <button 
                      onClick={() => {
                        const nextVal = !chatAiExpanded;
                        setChatAiPanelOpen(prev => ({ ...prev, [activeAiAccId]: nextVal }));
                        localStorage.setItem('zooma_chat_ai_open_' + activeAiAccId, nextVal ? '1' : '0');
                      }}
                      className="text-slate-400 hover:text-slate-200 p-1.5 hover:bg-slate-800/40 rounded-lg transition-colors"
                      title="Развернуть настройки"
                    >
                      {chatAiExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>

                    {/* Styled Switch iOS-like */}
                    <label className={`relative inline-flex items-center cursor-pointer transition-opacity duration-150 ${toggleOpBusy(`chat-ai:${activeAiAccId}`) ? 'opacity-40 pointer-events-none cursor-not-allowed' : ''}`}>
                      <input 
                        type="checkbox" 
                        checked={!!activeAiAcc.chat_ai_enabled}
                        disabled={toggleOpBusy(`chat-ai:${activeAiAccId}`)}
                        onChange={(e) => toggleChatAi(activeAiAccId, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                </div>

                {chatAiExpanded && (
                  <div className="space-y-3.5 pt-3 border-t border-slate-800/40 animate-in fade-in duration-200">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ключи Groq API</label>
                      <input 
                        type="password"
                        placeholder={activeAiAcc.chat_ai_has_api_key ? 'API-ключ сохранён (введите новый для замены)' : 'Введите API-ключи Groq через пробел'}
                        value={getChatAiDraft(activeAiAcc).key}
                        onChange={(e) => handleChatAiDraftChange(activeAiAccId, 'key', e.target.value)}
                        className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 outline-none focus:border-[#4da3ff]/50 focus:ring-2 focus:ring-[#4da3ff]/10"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Интервал от (мин)</label>
                        <input 
                          type="number"
                          min="1"
                          placeholder="Мин"
                          value={getChatAiDraft(activeAiAcc).min}
                          onChange={(e) => handleChatAiDraftChange(activeAiAccId, 'min', e.target.value)}
                          className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 outline-none focus:border-[#4da3ff]/50 focus:ring-2 focus:ring-[#4da3ff]/10"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Интервал до (мин)</label>
                        <input 
                          type="number"
                          min="1"
                          placeholder="Макс"
                          value={getChatAiDraft(activeAiAcc).max}
                          onChange={(e) => handleChatAiDraftChange(activeAiAccId, 'max', e.target.value)}
                          className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 outline-none focus:border-[#4da3ff]/50 focus:ring-2 focus:ring-[#4da3ff]/10"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ответы после дождя</label>
                        <span className="text-[9px] text-slate-500 font-medium">Разделяйте через ;</span>
                      </div>
                      <textarea 
                        rows={2}
                        placeholder="Мимо; не повезло; эх; в следующий раз точно повезет"
                        value={getChatAiDraft(activeAiAcc).rainMiss}
                        onChange={(e) => handleChatAiDraftChange(activeAiAccId, 'rainMiss', e.target.value)}
                        className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 outline-none focus:border-[#4da3ff]/50 focus:ring-2 focus:ring-[#4da3ff]/10 resize-none"
                      />
                    </div>

                    <div className="text-[10px] text-slate-400 bg-slate-950/30 p-2.5 rounded-lg border border-slate-800/30 font-medium leading-relaxed">
                      <Activity className="w-3.5 h-3.5 text-sky-400 inline mr-1.5" />
                      {chatAiStatusText(activeAiAcc)}
                    </div>

                    {getChatAiDraft(activeAiAcc).dirty && (
                      <button 
                        onClick={() => saveChatAi(activeAiAccId)}
                        className="w-full py-2.5 text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-500 rounded-xl hover:opacity-95 transition-all shadow-md shadow-sky-500/10 cursor-pointer"
                      >
                        Сохранить настройки AI
                      </button>
                    )}

                    {/* Recent message logs */}
                    <div className="space-y-2 pt-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">История сообщений AI</span>
                      <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                        {Array.isArray(activeAiAcc.chat_ai_recent_messages) && activeAiAcc.chat_ai_recent_messages.length > 0 ? (
                          [...activeAiAcc.chat_ai_recent_messages].reverse().map((m: any, idx: number) => (
                            <div key={idx} className="bg-slate-950/40 p-2 rounded-lg border border-slate-900 text-[10px] flex justify-between gap-3 font-medium">
                              <span className="text-slate-300 break-words">{m.text}</span>
                              <span className="text-slate-500 whitespace-nowrap">{fmtTs(m.sent_at_ts)}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-[10px] text-slate-500 italic">Сообщений в логе пока нет</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* VIEW: ACCOUNTS */}
        {activeTab === 'accounts' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {Array.isArray(appState.accounts) && appState.accounts.length > 0 ? (
              appState.accounts.map((acc: any) => {
                const aid = String(acc.account_id || '');
                const isAddon = Number(acc.slot || 1) > 1;
                const isModeExtension = String(acc.promo_activation_mode || 'server') === 'extension';
                const isPromoActive = !acc.promo_activation_paused;
                const proxyShown = !!proxyOpen[aid];

                return (
                  <div key={aid} className="premium-card rounded-2xl p-5 shadow-lg space-y-4 relative overflow-hidden">
                    
                    {/* Header Slot Label */}
                    <div className="flex justify-between items-center pb-2.5 border-b border-slate-800/40">
                      <span className="text-xs font-black text-slate-200 flex items-center gap-1.5">
                        <Cpu className="w-4 h-4 text-sky-400" />
                        {isAddon ? `Дополнительный слот #${acc.slot}` : 'Основной аккаунт'}
                      </span>
                      <div className="flex items-center gap-2">
                        {acc.port_user_id && <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-950/50 px-2 py-0.5 rounded border border-slate-800/50">ID {acc.port_user_id}</span>}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${authBadgeStyle(acc.auth_status)}`}>
                          {acc.auth_status || 'не подключен'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Имя профиля</span>
                        <span className="font-bold text-slate-200">{acc.port_user_name || '-'}</span>
                      </div>

                      {/* Mode switch */}
                      <div className="flex justify-between items-center text-xs">
                        <div className="space-y-0.5">
                          <span className="text-slate-400 font-medium">Режим активации</span>
                          <p className="text-[9px] text-slate-500 font-medium">{isModeExtension ? 'Работает через расширение на ПК' : 'Работает через облачный сервер'}</p>
                        </div>
                        <label className={`relative inline-flex items-center cursor-pointer transition-opacity duration-150 ${toggleOpBusy(`mode:${aid}`) ? 'opacity-40 pointer-events-none cursor-not-allowed' : ''}`}>
                          <input 
                            type="checkbox" 
                            checked={isModeExtension}
                            disabled={toggleOpBusy(`mode:${aid}`)}
                            onChange={(e) => setActivationMode(aid, e.target.checked ? 'extension' : 'server')}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                        </label>
                      </div>

                      {/* Promo Pause Switch */}
                      <div className="flex justify-between items-center text-xs">
                        <div className="space-y-0.5">
                          <span className="text-slate-400 font-medium">Авто-активация промо</span>
                          <p className="text-[9px] text-slate-500 font-medium">{isPromoActive ? 'Промокод будет вводиться автоматически' : 'Автоматический ввод приостановлен'}</p>
                        </div>
                        <label className={`relative inline-flex items-center cursor-pointer transition-opacity duration-150 ${toggleOpBusy(`promo:${aid}`) ? 'opacity-40 pointer-events-none cursor-not-allowed' : ''}`}>
                          <input 
                            type="checkbox" 
                            checked={isPromoActive}
                            disabled={toggleOpBusy(`promo:${aid}`)}
                            onChange={(e) => setAccountPromo(aid, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#39c07f]"></div>
                        </label>
                      </div>

                      {/* Subscription */}
                      {acc.subscription_paused ? (
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Срок подписки</span>
                          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 uppercase tracking-wide">заморожен</span>
                            <span>{Math.floor(Math.max(0, Number(acc.subscription_frozen_left_sec)) / 86400) > 0 ? `${Math.floor(Math.max(0, Number(acc.subscription_frozen_left_sec)) / 86400)} дн.` : 'меньше 1 дн.'}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Подписка активна до</span>
                          <span className="text-slate-300 font-bold">{fmtTs(acc.subscription_until_ts)}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">{pingLabel(acc)}</span>
                        <span className={`font-mono font-black ${pingColor(Number(pingMs(acc)))}`}>
                          {pingMs(acc) != null ? `${Number(pingMs(acc)).toFixed(1)} мс` : '-'}
                        </span>
                      </div>
                    </div>

                    {/* Unbind button if bound */}
                    {acc.extension_bound_chat_id && (
                      <button 
                        onClick={() => { setPendingUnbindAccountId(aid); setUnbindModalOpen(true); }}
                        className="w-full py-2 text-xs font-bold text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 rounded-xl border border-rose-500/10 transition-all active:scale-[0.98]"
                      >
                        Отвязать ПК расширение
                      </button>
                    )}

                    {/* Frozen disclaimer or CTA actions */}
                    {acc.subscription_paused ? (
                      <div className="text-[10px] text-center text-amber-400 font-semibold bg-amber-500/5 p-2 rounded-xl border border-amber-500/10">
                        Аккаунт временно заморожен. Разморозка доступна в боте.
                      </div>
                    ) : (
                      <div className="space-y-2 pt-2">
                        <button 
                          onClick={() => connectPrompt(aid)}
                          className="w-full py-2.5 text-xs font-black text-white bg-gradient-to-r from-[#4da3ff] to-sky-600 hover:opacity-95 rounded-xl transition-all shadow-md shadow-sky-500/10 active:scale-[0.98] flex items-center justify-center gap-1 cursor-pointer"
                        >
                          Подключить / переподключить профиль
                        </button>

                        {/* Mode actions */}
                        {isModeExtension ? (
                          <button 
                            onClick={() => reloadExtensionPage(aid)}
                            className="w-full py-2 text-xs font-semibold text-slate-300 bg-slate-950/40 hover:bg-slate-950/80 rounded-xl border border-slate-800 transition-all active:scale-[0.98] flex items-center justify-center gap-1"
                          >
                            <Tv className="w-4 h-4 text-slate-400" />
                            Обновить страницу в расширении
                          </button>
                        ) : (
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <button 
                                onClick={() => setProxyOpen(prev => ({ ...prev, [aid]: !prev[aid] }))}
                                className={`py-2 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                                  proxyShown ? 'bg-[#151f3c] text-sky-400 border-sky-500/30' : 'bg-slate-950/40 text-slate-300 border-slate-800 hover:border-slate-700'
                                }`}
                              >
                                {proxyShown ? 'Скрыть прокси' : 'Настроить прокси'}
                              </button>

                              <button 
                                onClick={() => { setPendingResetAccountId(aid); setResetModalOpen(true); }}
                                className="py-2 text-xs font-semibold text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 rounded-xl border border-rose-500/10 transition-all active:scale-[0.98]"
                              >
                                Удалить данные аккаунта
                              </button>
                            </div>

                            {/* Proxy Drawer Config */}
                            {proxyShown && (
                              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 space-y-3 animate-in slide-in-from-top-2 duration-150">
                                <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                                  Поддерживаются только <strong className="text-slate-200">SOCKS5</strong> прокси. Рекомендуется использовать формат <code className="bg-slate-900 px-1 py-0.5 rounded border border-slate-800 text-[9px] text-[#4da3ff]">ip:port:login:password</code> или вставить поля отдельно.
                                </p>
                                
                                <div className="space-y-2.5">
                                  <input 
                                    type="text"
                                    placeholder="Вставить прокси целиком (ip:port:login:password)"
                                    value={getProxyDraft(aid, acc).full}
                                    onChange={(e) => handleProxyDraftChange(aid, 'full', e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-sky-500/50"
                                  />
                                  
                                  <div className="grid grid-cols-2 gap-2">
                                    <input 
                                      type="text"
                                      placeholder="IP / Хост"
                                      value={getProxyDraft(aid, acc).host}
                                      onChange={(e) => handleProxyDraftChange(aid, 'host', e.target.value)}
                                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-sky-500/50"
                                    />
                                    <input 
                                      type="text"
                                      placeholder="Порт"
                                      value={getProxyDraft(aid, acc).port}
                                      onChange={(e) => handleProxyDraftChange(aid, 'port', e.target.value)}
                                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-sky-500/50"
                                    />
                                  </div>

                                  <div className="grid grid-cols-2 gap-2">
                                    <input 
                                      type="text"
                                      placeholder="Логин"
                                      value={getProxyDraft(aid, acc).login}
                                      onChange={(e) => handleProxyDraftChange(aid, 'login', e.target.value)}
                                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-sky-500/50"
                                    />
                                    <input 
                                      type="password"
                                      placeholder="Пароль"
                                      value={getProxyDraft(aid, acc).password}
                                      onChange={(e) => handleProxyDraftChange(aid, 'password', e.target.value)}
                                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-sky-500/50"
                                    />
                                  </div>

                                  <button 
                                    onClick={() => saveProxy(aid)}
                                    className="w-full py-2 text-xs font-bold text-sky-400 bg-sky-500/10 hover:bg-sky-500/15 rounded-lg border border-sky-500/20 transition-all cursor-pointer"
                                  >
                                    Сохранить SOCKS5 прокси
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="premium-card rounded-2xl p-6 text-center text-slate-400">
                Активные аккаунты отсутствуют
              </div>
            )}
          </div>
        )}

        {/* VIEW: TARIFFS & BILLING */}
        {activeTab === 'tariffs' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            
            {/* INVOICE ACTIVE CARD */}
            {lastInvoice ? (() => {
              const theme = getInvoiceTheme() || {
                title: "Счёт на оплату",
                bgGradient: "from-sky-950/40 via-slate-900/90 to-slate-950/80",
                borderColor: "border-sky-500/30 shadow-sky-950/40",
                accentColor: "text-sky-400",
                badgeBg: "bg-sky-500/10 text-sky-400 border-sky-500/20",
                buttonBg: "bg-gradient-to-r from-sky-500 to-indigo-500 shadow-sky-500/10 text-white",
                icon: <Shield className="w-5 h-5 text-sky-400" />
              };

              return (
                <div className={`bg-gradient-to-b ${theme.bgGradient} border ${theme.borderColor} rounded-2xl p-5 shadow-2xl backdrop-blur-md space-y-4 relative overflow-hidden`}>
                  <div className={`absolute top-0 right-0 ${theme.badgeBg} border-b border-l px-3 py-1 rounded-bl-xl text-[9px] font-black uppercase tracking-wider`}>
                    Ожидает оплаты
                  </div>

                  <div className="pb-1 border-b border-slate-800/40 flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-slate-950/40 border border-slate-800/50">
                      {theme.icon}
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{theme.title}</span>
                      <h3 className="text-sm font-bold text-slate-200 mt-0.5">
                        {lastInvoice.invoice_label || `#${lastInvoice.invoice_id}`}
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Назначение платежа</span>
                      <span className="font-bold text-slate-200">{lastInvoice.is_addon ? 'Слот доп. аккаунта' : 'Основной аккаунт'}</span>
                    </div>

                    {lastInvoice.is_addon && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Действие</span>
                          <span className="font-bold text-slate-200">{lastInvoice.kind === 'account_renew' ? 'Продление слота' : 'Покупка нового слота'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Получатель (Слот)</span>
                          <span className={`font-bold ${theme.accentColor}`}>{lastInvoice.account_label || `Слот #${lastInvoice.account_slot}`}</span>
                        </div>
                      </>
                    )}

                    {lastInvoice.tariff_title && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Тариф</span>
                        <span className="font-bold text-slate-200">{lastInvoice.tariff_title} {lastInvoice.tariff_days ? `· ${lastInvoice.tariff_days} дней` : ''}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Сумма к оплате</span>
                      <span className="font-bold text-slate-200">{lastInvoice.price_rub} ₽</span>
                    </div>

                    <div className="flex justify-between items-center bg-slate-950/60 p-3 rounded-xl border border-slate-850/50">
                      <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                        <Clock className={`w-4 h-4 ${theme.accentColor} animate-pulse`} />
                        Срок действия счёта
                      </span>
                      <span className={`font-mono font-black text-sm ${theme.accentColor}`}>{countdownText}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button 
                      onClick={openPay}
                      className={`py-2.5 text-xs font-black rounded-xl hover:opacity-95 transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer ${theme.buttonBg}`}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Оплатить
                    </button>
                    <button 
                      onClick={copyPay}
                      className="py-2.5 text-xs font-bold text-slate-300 bg-slate-950/40 hover:bg-slate-950/80 rounded-xl border border-slate-800 hover:border-slate-700 transition-all active:scale-[0.98] flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      Ссылка
                    </button>
                  </div>

                  <button 
                    onClick={cancelInvoice}
                    className="w-full py-2 text-xs font-bold text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 rounded-xl border border-rose-500/10 transition-all cursor-pointer"
                  >
                    Отменить неоплаченный счёт
                  </button>
                </div>
              );
            })() : (
              // TARIFF SELECTOR GRID
              <div className="space-y-4 animate-in fade-in duration-200">
                
                {/* Switch Main vs Addon tariffs */}
                <div className="flex bg-[#0e172a] p-1 border border-slate-800/60 rounded-xl">
                  <button 
                    onClick={() => handleTariffTypeChange('main')}
                    className={`flex-1 py-2 text-center text-xs font-black rounded-lg transition-all ${
                      tariffType === 'main' ? 'bg-[#1e2d5a] text-sky-400 shadow-inner' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Тарифы аккаунта
                  </button>
                  <button 
                    onClick={() => handleTariffTypeChange('addon')}
                    className={`flex-1 py-2 text-center text-xs font-black rounded-lg transition-all ${
                      tariffType === 'addon' ? 'bg-[#1e2d5a] text-sky-400 shadow-inner' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Дополнительные слоты
                  </button>
                </div>

                {tariffType === 'addon' ? (
                  Array.isArray(addonConfig?.tariffs_addon) && addonConfig.tariffs_addon.length > 0 ? (
                    addonConfig.tariffs_addon.map((t: any) => (
                      <div key={t.key} className="premium-card premium-card-hover rounded-2xl p-5 shadow-lg relative overflow-hidden group transition-all duration-300 space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">Дополнительный слот</span>
                            <h4 className="text-base font-black text-slate-200 mt-1">{t.label || t.title}</h4>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-black text-emerald-400">{t.price_rub} ₽</p>
                          </div>
                        </div>

                        <button 
                          onClick={() => openAddonBuy(t.key)}
                          className="w-full py-2.5 text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 rounded-xl transition-all shadow-md shadow-emerald-950/50 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          Приобрести слот
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="premium-card rounded-2xl p-6 text-center text-slate-400">
                      Тарифы для доп. аккаунтов временно недоступны
                    </div>
                  )
                ) : (
                  Array.isArray(appState.tariffs) && appState.tariffs.length > 0 ? (
                    appState.tariffs.map((t: any, idx: number) => {
                      const is90 = String(t.tariff_id || t.key || '').includes('90') || String(t.duration_days || t.days).includes('90');
                      const icon = is90 ? <Flame className="w-5 h-5 text-amber-400" /> : <Shield className="w-5 h-5 text-sky-400" />;
                      const subActive = Number(appState.subscription_until_ts) > currentTime;
                      
                      return (
                        <div key={t.tariff_id || t.key} className={`premium-card premium-card-hover-slate rounded-2xl p-5 shadow-lg relative overflow-hidden group transition-all duration-300 space-y-4 ${
                          is90 ? 'border-amber-500/30 shadow-amber-950/20' : ''
                        }`}>
                          {is90 && (
                            <div className="absolute top-0 right-0 bg-amber-500/10 border-b border-l border-amber-500/20 px-3 py-1 rounded-bl-xl text-[9px] font-black uppercase text-amber-400 tracking-wider">
                              Выгодный VIP
                            </div>
                          )}
                          
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className={`p-2.5 rounded-xl border ${
                                is90 ? 'bg-amber-500/5 border-amber-500/20' : 'bg-sky-500/5 border-sky-500/20'
                              }`}>
                                {icon}
                              </div>
                              <div>
                                <h4 className="text-base font-black text-slate-200">{t.label || t.title}</h4>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`text-2xl font-black ${is90 ? 'text-amber-400' : 'text-sky-400'}`}>{t.price_rub} ₽</p>
                            </div>
                          </div>

                          <button 
                            onClick={() => buyTariff(t.tariff_id || t.key)}
                            className={`w-full py-2.5 text-xs font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer ${
                              is90 
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black' 
                                : 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white'
                            }`}
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            {subActive ? 'Продлить подписку' : 'Приобрести подписку'}
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="premium-card rounded-2xl p-6 text-center text-slate-400">
                      Основные тарифы временно недоступны
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </main>



      {/* MODAL: BUY ADDON ACCOUNT */}
      {addonModalOpen && selectedAddonTariff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm premium-card rounded-2xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-2 border-b border-slate-850">
              <h3 className="text-sm font-black text-slate-200">Покупка слота</h3>
              <button onClick={() => setAddonModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-850/60 space-y-1.5">
              <p className="text-xs font-bold text-[#4da3ff]">{selectedAddonTariff.title}</p>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Длительность</span>
                <span className="font-bold text-slate-200">{selectedAddonTariff.days} дней</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Стоимость</span>
                <span className="font-bold text-slate-200">{selectedAddonTariff.price_rub} ₽</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Выберите аккаунт / Слот</label>
              <select 
                value={selectedAddonAccountId}
                onChange={(e) => setSelectedAddonAccountId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-sky-500/50"
              >
                {getAddonAccountsOptions().map((opt: any) => (
                  <option key={opt.account_id} value={opt.account_id}>{opt.label}</option>
                ))}
              </select>
            </div>

            {selectedAddonOption() && (
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850/40 space-y-1 text-xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Итоговое действие:</p>
                <p className="text-slate-200 font-medium">
                  {selectedAddonOption().active ? 'Продление' : 'Купить'}: <span className="text-[#4da3ff] font-bold">{selectedAddonOption().account_id === 'new' ? `Новый доп. слот #${selectedAddonOption().slot}` : `Слот #${selectedAddonOption().slot}`}</span>
                </p>
                <p className="text-slate-400 text-[10px]">Тариф {selectedAddonTariff.title} ({selectedAddonTariff.price_rub} ₽ за {selectedAddonTariff.days} дн.)</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button 
                onClick={createAddonInvoice}
                className="py-2 text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-500 rounded-lg hover:opacity-95 shadow-md shadow-sky-500/10 cursor-pointer"
              >
                Оформить счёт
              </button>
              <button 
                onClick={() => setAddonModalOpen(false)}
                className="py-2 text-xs font-semibold text-slate-400 bg-slate-950/40 hover:bg-slate-950/80 border border-slate-800 rounded-lg"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: UNBIND PC EXTENSION */}
      {unbindModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm premium-card rounded-2xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="text-sm font-black text-slate-200">Отвязать расширение?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Вы действительно хотите отвязать PC-расширение от этого аккаунта? Потребуется повторное сопряжение.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={confirmUnbindExtension}
                className="py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
              >
                Отвязать
              </button>
              <button 
                onClick={() => { setUnbindModalOpen(false); setPendingUnbindAccountId(''); }}
                className="py-2 text-xs font-semibold text-slate-400 bg-slate-950/40 hover:bg-slate-950/80 border border-slate-800 rounded-lg"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RESET ACCOUNT DATA */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm premium-card rounded-2xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="text-sm font-black text-slate-200">Удалить данные аккаунта?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Будут полностью очищены авторизационные данные казино и прокси для этого слота. Слот подписки и настройки Chat AI останутся активными. Это действие необратимо.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={confirmResetAccount}
                className="py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
              >
                Удалить данные
              </button>
              <button 
                onClick={() => { setResetModalOpen(false); setPendingResetAccountId(''); }}
                className="py-2 text-xs font-semibold text-slate-400 bg-slate-950/40 hover:bg-slate-950/80 border border-slate-800 rounded-lg"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}



    </div>
  );
}
