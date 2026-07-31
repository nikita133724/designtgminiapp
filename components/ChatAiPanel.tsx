'use client';

import {useEffect, useMemo, useState} from 'react';
import {Bot, ChevronDown, ChevronUp, Clock3, KeyRound, MessageCircle} from 'lucide-react';
import {chatAiStatus, formatTimestamp} from '@/lib/format';
import {ChatAiSettingsPayload, ZoomaAccount, ZoomaState} from '@/types/zooma';
import {Button, Card, Field, Switch, TextArea} from '@/components/ui';

interface Props {
  account: ZoomaAccount | null;
  state: ZoomaState;
  now: number;
  busy: boolean;
  onToggle: (accountId: string, enabled: boolean) => void | Promise<unknown>;
  onSave: (payload: ChatAiSettingsPayload) => void | Promise<unknown>;
}

export function ChatAiPanel({account, state, now, busy, onToggle, onSave}: Props) {
  const accountId = String(account?.account_id || '');
  const storageKey = `zooma_chat_ai_open_${accountId || 'default'}`;
  const [expanded, setExpanded] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [minMinutes, setMinMinutes] = useState('10');
  const [maxMinutes, setMaxMinutes] = useState('25');
  const [rainMessages, setRainMessages] = useState('');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!accountId) return;
    setExpanded(localStorage.getItem(storageKey) === '1');
  }, [accountId, storageKey]);

  useEffect(() => {
    if (!account || dirty) return;
    setMinMinutes(String(Math.max(1, Math.round(Number(account.chat_ai_interval_min_sec || 600) / 60))));
    setMaxMinutes(String(Math.max(1, Math.round(Number(account.chat_ai_interval_max_sec || 1500) / 60))));
    setRainMessages((account.chat_ai_rain_miss_messages || []).join('; '));
  }, [account, dirty]);

  const status = useMemo(() => chatAiStatus(account, now), [account, now]);
  if (!account) return null;

  const setOpen = (value: boolean) => {
    setExpanded(value);
    localStorage.setItem(storageKey, value ? '1' : '0');
  };

  const toggle = async (enabled: boolean) => {
    if (enabled && !account.chat_ai_has_api_key) {
      setOpen(true);
      setDirty(true);
      return;
    }
    await onToggle(accountId, enabled);
  };

  const save = async () => {
    const min = Math.max(1, Number.parseInt(minMinutes || '10', 10) || 10);
    const max = Math.max(1, Number.parseInt(maxMinutes || '25', 10) || 25);
    if (min > max) return;
    const payload: ChatAiSettingsPayload = {
      account_id: accountId,
      interval_min_sec: min * 60,
      interval_max_sec: max * 60,
      rain_miss_messages: rainMessages,
    };
    if (apiKey.trim()) payload.api_key = apiKey.trim();
    if (!account.chat_ai_has_api_key) payload.enabled = true;
    await onSave(payload);
    setApiKey('');
    setDirty(false);
  };

  const recent = [...(account.chat_ai_recent_messages || [])].reverse().slice(0, 8);
  const keyCount = Number(account.chat_ai_key_count || 0);
  const keyPlaceholder = account.chat_ai_has_api_key
    ? (keyCount > 1 ? `${keyCount} ключей сохранено` : account.chat_ai_api_key_masked || 'API-ключ сохранён')
    : 'API-ключи Groq через пробел';

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex min-h-[72px] items-center gap-3 px-4 py-3">
        <div className="grid size-11 shrink-0 place-items-center rounded-2xl border border-violet-300/20 bg-violet-400/10 text-violet-200">
          <Bot className="size-5" />
        </div>
        <button
          type="button"
          onClick={() => setOpen(!expanded)}
          className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
        >
          <div className="font-bold text-white">Chat AI</div>
          <div className="mt-0.5 truncate text-xs text-slate-400">{status}</div>
        </button>
        <button
          type="button"
          onClick={() => setOpen(!expanded)}
          className="grid size-11 place-items-center rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
          aria-label={expanded ? 'Свернуть настройки Chat AI' : 'Развернуть настройки Chat AI'}
        >
          {expanded ? <ChevronUp className="size-6" /> : <ChevronDown className="size-6" />}
        </button>
        <Switch
          checked={Boolean(account.chat_ai_enabled)}
          disabled={busy}
          onChange={toggle}
          label="Chat AI"
        />
      </div>

      {expanded && (
        <div className="border-t border-white/[0.06] px-4 pb-4 pt-4">
          <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.16em] text-slate-500">
            <KeyRound className="size-3.5" /> API-ключ
          </label>
          <Field
            type="password"
            autoComplete="off"
            value={apiKey}
            placeholder={keyPlaceholder}
            onChange={(event) => { setApiKey(event.target.value); setDirty(true); }}
          />

          <div className="mt-3 grid grid-cols-2 gap-2">
            <label>
              <span className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Clock3 className="size-3.5" /> От, мин
              </span>
              <Field
                type="number"
                min={1}
                inputMode="numeric"
                value={minMinutes}
                onChange={(event) => { setMinMinutes(event.target.value); setDirty(true); }}
              />
            </label>
            <label>
              <span className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Clock3 className="size-3.5" /> До, мин
              </span>
              <Field
                type="number"
                min={1}
                inputMode="numeric"
                value={maxMinutes}
                onChange={(event) => { setMaxMinutes(event.target.value); setDirty(true); }}
              />
            </label>
          </div>

          <label className="mb-2 mt-3 block text-xs leading-relaxed text-slate-500">
            Сообщения после дождя, если не выиграл. Разделяйте варианты символом ;
          </label>
          <TextArea
            rows={3}
            value={rainMessages}
            placeholder="Мимо; не повезло; эх"
            onChange={(event) => { setRainMessages(event.target.value); setDirty(true); }}
          />

          <div className="mt-3 rounded-2xl border border-sky-300/[0.1] bg-slate-950/45 px-3.5 py-3 text-xs leading-relaxed text-slate-400">
            {status}
          </div>

          {(dirty || !account.chat_ai_has_api_key) && (
            <Button
              variant="primary"
              className="mt-3 w-full"
              busy={busy}
              onClick={save}
            >
              Сохранить
            </Button>
          )}

          <div className="mt-4 border-t border-white/[0.06] pt-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-200">
              <MessageCircle className="size-4 text-cyan-300" /> Последние сообщения
            </div>
            {recent.length ? (
              <div className="space-y-2">
                {recent.map((message, index) => (
                  <div key={`${message.sent_at_ts || 0}-${index}`} className="rounded-2xl bg-white/[0.035] px-3 py-2.5 text-xs leading-relaxed text-slate-400">
                    <span className="mr-2 text-slate-600">{formatTimestamp(message.sent_at_ts, state)}</span>
                    {message.text || '—'}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-500">Последних сообщений пока нет</div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
