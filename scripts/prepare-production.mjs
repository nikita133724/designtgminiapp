import {readFileSync, writeFileSync} from 'node:fs';

const pagePath = 'app/page.tsx';
let source = readFileSync(pagePath, 'utf8');

const replaceRequired = (pattern, replacement, label) => {
  if (!pattern.test(source)) {
    throw new Error(`prepare-production: cannot find ${label}`);
  }
  source = source.replace(pattern, replacement);
};

if (source.includes('getDemoDefaultState')) {
  replaceRequired(
    /const getDemoDefaultState = \(\) => \{[\s\S]*?\n\};\n\nconst handleDemoApiCall = \(state: any, path: string, method: string, body: any\) => \{[\s\S]*?\n\};\n\nexport default function TelegramMiniApp\(\) \{/,
    'export default function TelegramMiniApp() {',
    'demo state and fake API block',
  );

  replaceRequired(
    /\} from 'lucide-react';/,
    `} from 'lucide-react';\nimport {getTelegramWebApp} from '@/lib/telegram';\nimport {requestZooma} from '@/lib/zooma-api';\nimport {buildZoomaWebSocketUrl, isZoomaWebSocketHealthy} from '@/lib/zooma-websocket';`,
    'application imports',
  );

  source = source.replace(
    /\n  const \[selectedBg, setSelectedBg\] = useState<string>\(\(\) => \{[\s\S]*?\n  \}\);\n/,
    '\n',
  );

  source = source.replace(
    /\n  const handleBgChange = \(bgId: string\) => \{[\s\S]*?\n  \};\n\n  const \[isDemoMode, setIsDemoMode\] = useState<boolean>\(\(\) => \{[\s\S]*?\n  \}\);\n/,
    '\n',
  );

  replaceRequired(
    /  const \[loadingStep, setLoadingStep\] = useState\(0\);/,
    "  const [loadingStep, setLoadingStep] = useState(0);\n  const [bootError, setBootError] = useState('');",
    'loading state',
  );

  replaceRequired(
    /  \/\/ Telegram helper\n  const getTg = \(\) => \{[\s\S]*?\n  \};\n\n  \/\/ Toast notifier/,
    `  // Telegram adapter\n  const getTg = getTelegramWebApp;\n\n  // Toast notifier`,
    'Telegram helper',
  );

  replaceRequired(
    /  \/\/ API handler\n  const api = async \(path: string, method = 'GET', body: any = null\) => \{[\s\S]*?\n  \};\n\n  \/\/ Timezone Sync/,
    `  // Real FastAPI client. There is intentionally no demo or mock fallback.\n  const api = async (path: string, method = 'GET', body: any = null) =>\n    requestZooma(path, {method: method as any, body});\n\n  // Timezone Sync`,
    'API handler',
  );

  replaceRequired(
    /  async function fetchInitialState\(\) \{[\s\S]*?\n  \}\n\n  \/\/ Loading step sequence effect/,
    `  async function fetchInitialState() {\n    try {\n      const tg = getTg();\n      if (!tg.initData) {\n        throw new Error('Откройте этот кабинет из Telegram-бота ZOOMA.');\n      }\n\n      const res = await api('/app/api/state');\n      applySnapshotState(res.data, false);\n      setBootError('');\n\n      await syncTimezone();\n      if (!res.data?.addon_config) await loadAddonConfig(true);\n      else setAddonConfig(res.data.addon_config);\n\n      const savedStr = localStorage.getItem('zooma_app_invoice_v1');\n      if (savedStr && !res.data?.pending_invoice) {\n        try {\n          const saved = JSON.parse(savedStr);\n          if (saved && Number(saved.chat_id || 0) === Number(res.data?.chat_id || 0) && saved.invoice) {\n            const inv = normalizeInvoice(saved.invoice);\n            if (inv) {\n              setAppState((prev: any) => prev\n                ? {...prev, pending_invoice: inv}\n                : {...res.data, pending_invoice: inv});\n            }\n          }\n        } catch (_) {\n          localStorage.removeItem('zooma_app_invoice_v1');\n        }\n      }\n    } catch (error: any) {\n      setAppState(null);\n      setBootError(error?.message || 'Не удалось загрузить кабинет.');\n      setLoadingComplete(true);\n    }\n  }\n\n  // Loading step sequence effect`,
    'initial state loader',
  );

  replaceRequired(
    /  \/\/ Mounting & initial boot\n  useEffect\(\(\) => \{[\s\S]*?\n  \}, \[\]\);/,
    `  // Mounting & initial boot\n  useEffect(() => {\n    setMounted(true);\n    const tg = getTg();\n    try { tg.ready(); tg.expand(); } catch (_) {}\n\n    let refreshTimer = 0;\n    void (async () => {\n      await fetchInitialState();\n      if (tg.initData) {\n        wsConnect();\n        refreshTimer = window.setInterval(() => {\n          void refreshState(false);\n        }, 5000);\n      }\n    })();\n\n    const handleVisibility = () => {\n      if (!document.hidden && tg.initData) void refreshState(true);\n    };\n    document.addEventListener('visibilitychange', handleVisibility);\n\n    return () => {\n      if (refreshTimer) window.clearInterval(refreshTimer);\n      document.removeEventListener('visibilitychange', handleVisibility);\n      if (wsTimerRef.current) clearInterval(wsTimerRef.current);\n      if (wsReconnectTimerRef.current) clearTimeout(wsReconnectTimerRef.current);\n      if (wsRef.current) wsRef.current.close();\n    };\n    // eslint-disable-next-line react-hooks/exhaustive-deps\n  }, []);`,
    'initial boot effect',
  );

  source = source.replace(
    /    const tg = getTg\(\);\n    const initData = tg\.initData \|\| '';\n    const proto = window\.location\.protocol === 'https:' \? 'wss' : 'ws';\n    const url = `\$\{proto\}:\/\/\$\{window\.location\.host\}\/app\/ws\?init_data=\$\{encodeURIComponent\(initData\)\}`;/,
    "    const url = buildZoomaWebSocketUrl('/app/ws');",
  );

  source = source.replace(
    /const wsIsHealthy = \(\) => wsRef\.current && wsRef\.current\.readyState === WebSocket\.OPEN && \(currentTime \* 1000 - wsLastMessageTsRef\.current\) < 20000;/,
    'const wsIsHealthy = () => isZoomaWebSocketHealthy(wsRef.current, wsLastMessageTsRef.current);',
  );

  source = source.replace(
    '            Пожалуйста, откройте этот личный кабинет внутри Telegram бота ZOOMA.',
    "            {bootError || 'Пожалуйста, откройте этот личный кабинет внутри Telegram-бота ZOOMA.'}",
  );

  source = source.replace(
    '<h2 className="text-md font-bold text-slate-200">Доступ ограничен</h2>',
    '<h2 className="text-md font-bold text-slate-200">Не удалось открыть кабинет</h2>',
  );
}

const forbidden = [
  'getDemoDefaultState',
  'handleDemoApiCall',
  'zooma_app_mock_state_v1',
  'zooma_demo_user',
  'inv_demo_',
  'isDemoMode',
  'setIsDemoMode',
  '@google/genai',
  'AI Studio',
];

for (const token of forbidden) {
  if (source.includes(token)) {
    throw new Error(`prepare-production: forbidden development token remains: ${token}`);
  }
}

writeFileSync(pagePath, source, 'utf8');
console.log('prepare-production: app/page.tsx is production-only');
