'use client';

import {Activity, CalendarDays, CircleDollarSign, Headphones, ShieldCheck, Sparkles, UserRound, Wifi} from 'lucide-react';
import {ChatAiPanel} from '@/components/ChatAiPanel';
import {Badge, Button, Card, Row} from '@/components/ui';
import {formatTimestamp, frozenLeft, pingSourceLabel, pingTone, pingValue} from '@/lib/format';
import {ChatAiSettingsPayload, ZoomaAccount, ZoomaState} from '@/types/zooma';

interface Props {
  state: ZoomaState;
  account: ZoomaAccount | null;
  now: number;
  promoFlash: boolean;
  chatBusy: boolean;
  onSupport: () => void;
  onToggleChatAi: (accountId: string, enabled: boolean) => void | Promise<unknown>;
  onSaveChatAi: (payload: ChatAiSettingsPayload) => void | Promise<unknown>;
}

export function ProfileView({
  state,
  account,
  now,
  promoFlash,
  chatBusy,
  onSupport,
  onToggleChatAi,
  onSaveChatAi,
}: Props) {
  const ping = pingValue(state);
  const frozen = Boolean(state.subscription_paused);

  return (
    <div className="space-y-3">
      <Card className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="relative mb-3 flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-2xl border border-sky-300/20 bg-gradient-to-br from-sky-400/15 to-violet-400/15 text-sky-200">
            <UserRound className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-lg font-bold text-white">{state.tg_username || 'Пользователь ZOOMA'}</div>
            <div className="mt-0.5 text-xs text-slate-500">chat_id {state.chat_id || '—'}</div>
          </div>
        </div>

        <div className="relative rounded-2xl border border-white/[0.055] bg-slate-950/35 px-3">
          <Row label={<span className="flex items-center gap-2"><ShieldCheck className="size-4 text-violet-300" /> Подписка</span>}>
            {frozen
              ? <Badge tone="warn">заморожена</Badge>
              : <Badge tone="ok">{state.subscription_tier || 'активна'}</Badge>}
          </Row>
          {frozen ? (
            <Row label="Остаток"><span className="text-amber-200">{frozenLeft(state.subscription_frozen_left_sec)}</span></Row>
          ) : (
            <Row label={<span className="flex items-center gap-2"><CalendarDays className="size-4 text-sky-300" /> Активна до</span>}>
              {formatTimestamp(state.subscription_until_ts, state)}
            </Row>
          )}
          <Row label={<span className="flex items-center gap-2"><Wifi className="size-4 text-cyan-300" /> Прокси</span>}>
            {state.proxy_set ? <Badge tone="ok">настроен</Badge> : <Badge tone="danger">не настроен</Badge>}
          </Row>
          <Row label={<span className="flex items-center gap-2"><Activity className="size-4 text-emerald-300" /> {pingSourceLabel(state)}</span>}>
            <Badge tone={pingTone(ping)}>{ping == null ? '—' : `${ping.toFixed(1)} мс`}</Badge>
          </Row>
        </div>

        <Button
          className="relative mt-3 w-full"
          variant="secondary"
          icon={<Headphones className="size-4" />}
          onClick={onSupport}
        >
          Поддержка / Support
        </Button>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="relative min-h-32 overflow-hidden p-4">
          <div className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-emerald-400/10 blur-2xl" />
          <div className="relative flex items-center justify-between text-xs font-semibold text-slate-500">
            Активировано промо
            <Sparkles className="size-4 text-emerald-300" />
          </div>
          <div className={`relative mt-5 text-3xl font-black tracking-tight text-white transition ${promoFlash ? 'scale-[1.04] text-emerald-200 drop-shadow-[0_0_16px_rgba(52,211,153,.45)]' : ''}`}>
            {Number(state.promo_activated_count || 0)}
          </div>
        </Card>

        <Card className="relative min-h-32 overflow-hidden p-4">
          <div className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-sky-400/10 blur-2xl" />
          <div className="relative flex items-center justify-between text-xs font-semibold text-slate-500">
            Сумма промо
            <CircleDollarSign className="size-4 text-sky-300" />
          </div>
          <div className={`relative mt-5 text-2xl font-black tracking-tight text-white transition ${promoFlash ? 'scale-[1.04] text-emerald-200' : ''}`}>
            {Number(state.promo_activated_total_amount || 0).toFixed(2)}
          </div>
          <div className="relative mt-1 text-xs text-slate-500">
            {state.promo_month_label ? `За ${state.promo_month_label}` : 'За месяц'}: {Number(state.promo_month_total_amount || 0).toFixed(2)}
          </div>
        </Card>
      </div>

      <ChatAiPanel
        account={account}
        state={state}
        now={now}
        busy={chatBusy}
        onToggle={onToggleChatAi}
        onSave={onSaveChatAi}
      />
    </div>
  );
}
