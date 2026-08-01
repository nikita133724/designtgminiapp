import { NextRequest, NextResponse } from 'next/server';

// In-memory state storage per chat_id / session
const stateStore = new Map<string, any>();

function getDefaultState(chatId = 88410203, username = 'zooma_user') {
  const now = Math.floor(Date.now() / 1000);
  return {
    chat_id: chatId,
    tg_username: username,
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
        port_user_id: String(chatId),
        port_user_name: username,
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
        proxy_password: "securepassword",
        chat_ai_enabled: true,
        chat_ai_has_api_key: true,
        chat_ai_api_key_masked: "gsk_...x89a",
        chat_ai_key_count: 1,
        chat_ai_interval_min_sec: 600,
        chat_ai_interval_max_sec: 1500,
        chat_ai_rain_miss_messages: ["Эх, мимо", "В следующий раз повезет", "Мимо"],
        chat_ai_recent_messages: [
          { sent_at_ts: now - 300, text: "Удачи в розыгрыше!" },
          { sent_at_ts: now - 1200, text: "Спасибо за промокод" }
        ]
      },
      {
        account_id: "acc_2",
        slot: 2,
        port_user_id: "993012",
        port_user_name: "Доп Аккаунт #2",
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
        proxy_password: "securepassword",
        chat_ai_enabled: false,
        chat_ai_has_api_key: false,
        chat_ai_key_count: 0
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
}

function parseTgUserFromInitData(initDataStr: string) {
  if (!initDataStr) return null;
  try {
    const params = new URLSearchParams(initDataStr);
    const userJson = params.get('user');
    if (userJson) {
      const u = JSON.parse(userJson);
      return {
        chat_id: u.id || 88410203,
        tg_username: u.username || u.first_name || 'zooma_tg_user'
      };
    }
  } catch (_) {}
  return null;
}

function getOrCreateState(initDataStr: string) {
  const tgUser = parseTgUserFromInitData(initDataStr);
  const key = tgUser ? String(tgUser.chat_id) : 'default';
  if (!stateStore.has(key)) {
    const initial = getDefaultState(
      tgUser ? tgUser.chat_id : 88410203,
      tgUser ? tgUser.tg_username : 'zooma_user'
    );
    stateStore.set(key, initial);
  }
  const state = stateStore.get(key);
  if (tgUser) {
    state.chat_id = tgUser.chat_id;
    state.tg_username = tgUser.tg_username;
  }
  return { state, key };
}

export async function handleApiRouteRequest(req: NextRequest, params: Promise<{ slug: string[] }>) {
  const resolvedParams = await params;
  const pathSlug = resolvedParams.slug ? resolvedParams.slug.join('/') : '';
  const searchParams = req.nextUrl.searchParams;
  const initDataStr = searchParams.get('init_data') || '';

  let body: any = null;
  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      body = await req.json();
    } catch (_) {
      body = {};
    }
  }

  const { state } = getOrCreateState(initDataStr);

  if (pathSlug === 'state') {
    return NextResponse.json({ ok: true, data: state });
  }

  if (pathSlug === 'timezone') {
    if (body?.timezone) {
      state.timezone_name = body.timezone;
      state.timezone_valid = true;
    }
    return NextResponse.json({ ok: true, data: { timezone_name: state.timezone_name, timezone_valid: true } });
  }

  if (pathSlug === 'addon/config') {
    return NextResponse.json({ ok: true, data: state.addon_config });
  }

  if (pathSlug === 'promo-activation-pause') {
    const aid = body?.account_id;
    const paused = !!body?.paused;
    if (aid) {
      const acc = (state.accounts || []).find((a: any) => String(a.account_id) === String(aid));
      if (acc) acc.promo_activation_paused = paused;
    }
    return NextResponse.json({ ok: true, data: { promo_activation_paused: paused } });
  }

  if (pathSlug === 'promo-activation-mode') {
    const aid = body?.account_id;
    const mode = body?.mode || 'server';
    if (aid) {
      const acc = (state.accounts || []).find((a: any) => String(a.account_id) === String(aid));
      if (acc) {
        acc.promo_activation_mode = mode;
        acc.effective_ping_source = mode;
      }
    }
    return NextResponse.json({ ok: true, data: { promo_activation_mode: mode } });
  }

  if (pathSlug === 'proxy/manual') {
    const aid = body?.account_id;
    if (aid) {
      const acc = (state.accounts || []).find((a: any) => String(a.account_id) === String(aid));
      if (acc) {
        acc.proxy_ip = body?.host || '';
        acc.proxy_port_socks5 = String(body?.port || '');
        acc.proxy_login = body?.login || '';
        acc.proxy_password = body?.password || '';
        acc.effective_ping_ms = 40 + Math.random() * 25;
      }
      state.proxy_set = true;
    }
    return NextResponse.json({ ok: true, data: { ok: true } });
  }

  if (pathSlug === 'chat-ai/settings') {
    const aid = body?.account_id;
    if (aid) {
      const acc = (state.accounts || []).find((a: any) => String(a.account_id) === String(aid));
      if (acc) {
        if (body.enabled !== undefined) acc.chat_ai_enabled = !!body.enabled;
        if (body.interval_min_sec) acc.chat_ai_interval_min_sec = body.interval_min_sec;
        if (body.interval_max_sec) acc.chat_ai_interval_max_sec = body.interval_max_sec;
        if (body.rain_miss_messages !== undefined) {
          acc.chat_ai_rain_miss_messages = Array.isArray(body.rain_miss_messages)
            ? body.rain_miss_messages
            : String(body.rain_miss_messages).split(';').map(x => x.trim()).filter(Boolean);
        }
        if (body.api_key) {
          acc.chat_ai_has_api_key = true;
          acc.chat_ai_api_key_masked = "gsk_..." + String(body.api_key).slice(-4);
          acc.chat_ai_key_count = (acc.chat_ai_key_count || 0) + 1;
        }
      }
    }
    return NextResponse.json({ ok: true, data: { ok: true } });
  }

  if (pathSlug === 'tariff/invoice') {
    const key = body?.tariff_key;
    const tariff = (state.tariffs || []).find((t: any) => String(t.tariff_id) === String(key)) || (state.tariffs || [])[0];
    const inv = {
      invoice_id: "inv_" + Math.floor(Math.random() * 899999 + 100000),
      invoice_label: tariff?.label || "ZOOMA Premium (30 дней)",
      pay_url: "https://t.me/saxarok322",
      price_rub: tariff?.price_rub || 450,
      price_usdt: tariff?.price_usdt || 5.0,
      expires_at_ts: Math.floor(Date.now() / 1000) + 900,
      is_addon: false
    };
    state.pending_invoice = inv;
    return NextResponse.json({ ok: true, data: inv });
  }

  if (pathSlug === 'addon/invoice') {
    const key = body?.tariff_key;
    const tariff = (state.addon_config?.tariffs_addon || []).find((t: any) => String(t.key) === String(key)) || (state.addon_config?.tariffs_addon || [])[0];
    const inv = {
      invoice_id: "inv_addon_" + Math.floor(Math.random() * 899999 + 100000),
      invoice_label: `ZOOMA Addon: ${tariff?.label || "Слот 30 дней"}`,
      pay_url: "https://t.me/saxarok322",
      price_rub: tariff?.price_rub || 250,
      price_usdt: tariff?.price_usdt || 2.8,
      expires_at_ts: Math.floor(Date.now() / 1000) + 900,
      is_addon: true
    };
    state.pending_invoice = inv;
    return NextResponse.json({ ok: true, data: inv });
  }

  if (pathSlug === 'tariff/invoice/cancel') {
    state.pending_invoice = null;
    return NextResponse.json({ ok: true, data: { ok: true } });
  }

  if (pathSlug === 'account/reset-casino-data') {
    const aid = body?.account_id;
    if (aid) {
      const acc = (state.accounts || []).find((a: any) => String(a.account_id) === String(aid));
      if (acc) {
        acc.proxy_ip = "";
        acc.proxy_port_socks5 = "";
        acc.proxy_login = "";
        acc.proxy_password = "";
      }
    }
    return NextResponse.json({ ok: true, data: { ok: true } });
  }

  if (pathSlug === 'extension-unbind') {
    const aid = body?.account_id;
    if (aid) {
      const acc = (state.accounts || []).find((a: any) => String(a.account_id) === String(aid));
      if (acc) {
        acc.auth_status = "не подключен";
        acc.port_user_id = "";
        acc.port_user_name = "";
      }
    }
    return NextResponse.json({ ok: true, data: { ok: true } });
  }

  if (pathSlug === 'extension-reload' || pathSlug === 'account/connect-prompt') {
    return NextResponse.json({ ok: true, data: { ok: true } });
  }

  return NextResponse.json({ ok: true, data: state });
}
