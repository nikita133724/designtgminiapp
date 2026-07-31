'use client';

import {useEffect, useMemo, useState} from 'react';
import {BadgeCheck, Banknote, Check, Clock3, Copy, CreditCard, Crown, ExternalLink, Layers3, Rocket, ShieldCheck, Star} from 'lucide-react';
import {Badge, Button, Card, Modal, Select} from '@/components/ui';
import {formatCountdown} from '@/lib/format';
import {AddonAccountOption, AddonConfig, Invoice, Tariff, TariffType, ZoomaState, tariffDays, tariffKey, tariffTitle} from '@/types/zooma';

interface Props {
  state: ZoomaState;
  tariffType: TariffType;
  addonConfig: AddonConfig;
  invoice: Invoice | null;
  now: number;
  isBusy: (key: string) => boolean;
  onTariffType: (type: TariffType) => void | Promise<unknown>;
  onBuy: (key: string) => void | Promise<unknown>;
  onBuyAddon: (key: string, accountId: string) => void | Promise<unknown>;
  onCancelInvoice: () => void | Promise<unknown>;
  onOpenPay: () => void;
  onCopyPay: () => void | Promise<unknown>;
}

const tariffIcons = [Star, ShieldCheck, Rocket, Crown];
const tariffGradients = [
  'from-blue-500/20 via-sky-500/[0.08] to-transparent',
  'from-indigo-500/22 via-violet-500/[0.08] to-transparent',
  'from-fuchsia-500/20 via-violet-500/[0.08] to-transparent',
  'from-emerald-500/20 via-cyan-500/[0.07] to-transparent',
];

function optionLabel(option: AddonAccountOption): string {
  if (option.label) return option.label;
  if (option.account_id === 'new') return `Новый доп. аккаунт #${option.slot || '—'}`;
  const name = option.name || option.port_user_name || 'Доп. аккаунт';
  return `#${option.slot || '—'} · ${name}${option.casino_id ? ` | ID ${option.casino_id}` : ''}`;
}

function InvoiceCard({
  invoice,
  now,
  busy,
  onOpenPay,
  onCopyPay,
  onCancel,
}: {
  invoice: Invoice;
  now: number;
  busy: boolean;
  onOpenPay: () => void;
  onCopyPay: () => void | Promise<unknown>;
  onCancel: () => void | Promise<unknown>;
}) {
  const seconds = Math.max(0, Number(invoice.expires_at_ts || 0) - now);
  const addonAction = invoice.kind === 'account_renew' ? 'Продление' : 'Покупка';
  return (
    <Card className="relative overflow-hidden p-0">
      <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="relative border-b border-white/[0.06] px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-[.16em] text-cyan-300/70">Активный счёт</div>
            <div className="mt-1 text-lg font-black text-white">{invoice.invoice_label || `Счёт ${invoice.invoice_id || ''}`}</div>
          </div>
          <div className="grid size-11 place-items-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-200">
            <CreditCard className="size-5" />
          </div>
        </div>
      </div>

      <div className="relative space-y-2 px-4 py-4 text-sm">
        {invoice.is_addon && (
          <div className="rounded-2xl border border-violet-300/15 bg-violet-400/[0.07] p-3 text-slate-300">
            <div className="flex justify-between gap-3"><span className="text-slate-500">Тип</span><b>Доп. аккаунт</b></div>
            <div className="mt-2 flex justify-between gap-3"><span className="text-slate-500">Действие</span><b>{addonAction}</b></div>
            <div className="mt-2 flex justify-between gap-3"><span className="text-slate-500">Аккаунт</span><b className="text-right">{invoice.account_label || `доп. аккаунт #${invoice.account_slot || '—'}`}</b></div>
            {(invoice.tariff_title || invoice.tariff_key) && (
              <div className="mt-2 flex justify-between gap-3"><span className="text-slate-500">Тариф</span><b className="text-right">{invoice.tariff_title || invoice.tariff_key}{invoice.tariff_days ? ` · ${invoice.tariff_days} дней` : ''}</b></div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/[0.035] px-3.5 py-3">
          <span className="flex items-center gap-2 text-slate-500"><Banknote className="size-4" /> Сумма</span>
          <b className="text-right text-white">{Number(invoice.price_rub || 0)} ₽ / {Number(invoice.price_usdt || 0).toFixed(2)} USDT</b>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/[0.035] px-3.5 py-3">
          <span className="flex items-center gap-2 text-slate-500"><Clock3 className="size-4" /> Время на оплату</span>
          <b className="font-mono text-base text-cyan-200">{formatCountdown(seconds)}</b>
        </div>
      </div>

      <div className="relative grid grid-cols-2 gap-2 px-4 pb-4">
        <Button variant="primary" icon={<ExternalLink className="size-4" />} onClick={onOpenPay}>Открыть оплату</Button>
        <Button icon={<Copy className="size-4" />} onClick={onCopyPay}>Копировать ссылку</Button>
        <Button variant="danger" className="col-span-2" busy={busy} onClick={onCancel}>Отмена оплаты</Button>
      </div>
    </Card>
  );
}

export function TariffsView({
  state,
  tariffType,
  addonConfig,
  invoice,
  now,
  isBusy,
  onTariffType,
  onBuy,
  onBuyAddon,
  onCancelInvoice,
  onOpenPay,
  onCopyPay,
}: Props) {
  const [selectedTariff, setSelectedTariff] = useState<Tariff | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState('');

  const options = addonConfig.accounts || [];
  useEffect(() => {
    if (!options.length) setSelectedAccountId('');
    else if (!options.some((option) => String(option.account_id) === selectedAccountId)) {
      setSelectedAccountId(String(options[0].account_id));
    }
  }, [options, selectedAccountId]);

  const selectedOption = useMemo(
    () => options.find((option) => String(option.account_id) === selectedAccountId) || options[0] || null,
    [options, selectedAccountId],
  );

  if (invoice) {
    return (
      <InvoiceCard
        invoice={invoice}
        now={now}
        busy={isBusy('invoice:cancel')}
        onOpenPay={onOpenPay}
        onCopyPay={onCopyPay}
        onCancel={onCancelInvoice}
      />
    );
  }

  const mainActive = Number(state.subscription_until_ts || 0) > now;
  const list = tariffType === 'addon' ? addonConfig.tariffs_addon || [] : state.tariffs || [];

  const buy = (tariff: Tariff) => {
    const key = tariffKey(tariff);
    if (tariffType === 'main') return onBuy(key);
    if (addonConfig.main_active === false || state.main_subscription_active === false) return;
    setSelectedTariff(tariff);
  };

  return (
    <div className="space-y-3">
      <div className="premium-card grid grid-cols-2 gap-1 rounded-[20px] border border-sky-300/[0.12] bg-slate-950/60 p-1.5 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => onTariffType('main')}
          className={`min-h-11 rounded-2xl px-2 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 ${tariffType === 'main' ? 'bg-white/[0.09] text-white shadow-lg' : 'text-slate-500 hover:text-slate-200'}`}
        >
          Основной аккаунт
        </button>
        <button
          type="button"
          onClick={() => onTariffType('addon')}
          className={`min-h-11 rounded-2xl px-2 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 ${tariffType === 'addon' ? 'bg-white/[0.09] text-white shadow-lg' : 'text-slate-500 hover:text-slate-200'}`}
        >
          Доп. аккаунт
        </button>
      </div>

      {tariffType === 'addon' && (addonConfig.main_active === false || state.main_subscription_active === false) && (
        <Card className="border-amber-300/15 bg-amber-400/[0.06] text-sm leading-relaxed text-amber-100/80">
          {addonConfig.message || 'Дополнительные аккаунты доступны только при активной подписке основного аккаунта.'}
        </Card>
      )}

      {!list.length ? (
        <Card className="text-center text-sm text-slate-500">
          {tariffType === 'addon' ? 'Тарифы для доп. аккаунта пока не настроены' : 'Тарифы пока не настроены'}
        </Card>
      ) : list.map((tariff, index) => {
        const Icon = tariffIcons[index % tariffIcons.length];
        const key = tariffKey(tariff);
        const disabled = tariffType === 'addon' && (addonConfig.main_active === false || state.main_subscription_active === false);
        return (
          <Card key={key || index} className="relative overflow-hidden p-0">
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${tariffGradients[index % tariffGradients.length]}`} />
            <div className="relative flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid size-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.055] text-cyan-200">
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0">
                  <div className="truncate font-bold text-white">{tariffTitle(tariff)}</div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <Layers3 className="size-3.5" /> {tariffDays(tariff)} дней{tariffType === 'addon' ? ' · доп. аккаунт' : ''}
                  </div>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-2xl font-black tracking-tight text-white">{Number(tariff.price_rub || 0)} ₽</div>
                {Number(tariff.price_usdt || 0) > 0 && <div className="mt-0.5 text-xs text-slate-500">{Number(tariff.price_usdt).toFixed(2)} USDT</div>}
              </div>
            </div>
            <div className="relative px-4 py-4">
              <Button
                variant="primary"
                className="w-full"
                disabled={disabled}
                busy={isBusy('invoice:create') || isBusy('invoice:addon')}
                icon={tariffType === 'main' ? <BadgeCheck className="size-4" /> : <Check className="size-4" />}
                onClick={() => buy(tariff)}
              >
                {tariffType === 'main' && mainActive ? 'Продлить' : 'Купить'}
              </Button>
            </div>
          </Card>
        );
      })}

      <Modal
        open={Boolean(selectedTariff)}
        title="Доп. аккаунт"
        onClose={() => setSelectedTariff(null)}
        actions={selectedTariff && selectedOption ? (
          <>
            <Button
              variant="primary"
              busy={isBusy('invoice:addon')}
              onClick={async () => {
                const tariff = selectedTariff;
                const account = selectedOption;
                await onBuyAddon(tariffKey(tariff), String(account.account_id));
                setSelectedTariff(null);
              }}
            >
              {selectedOption.active ? 'Продлить' : 'Купить'}
            </Button>
            <Button onClick={() => setSelectedTariff(null)}>Отмена</Button>
          </>
        ) : null}
      >
        {selectedTariff && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-sky-300/[0.1] bg-white/[0.035] p-3.5 leading-relaxed">
              <b className="text-white">{tariffTitle(selectedTariff)}</b><br />
              Цена: <b className="text-white">{Number(selectedTariff.price_rub || 0)} ₽</b> · срок: <b className="text-white">{tariffDays(selectedTariff)} дней</b>
            </div>
            {options.length ? (
              <Select value={selectedAccountId} onChange={(event) => setSelectedAccountId(event.target.value)}>
                {options.map((option) => <option key={option.account_id} value={option.account_id}>{optionLabel(option)}</option>)}
              </Select>
            ) : (
              <div className="rounded-2xl border border-rose-300/15 bg-rose-400/[0.06] p-3 text-rose-200">Нет свободных слотов для дополнительного аккаунта.</div>
            )}
            {selectedOption && (
              <div className="rounded-2xl border border-violet-300/[0.12] bg-violet-400/[0.055] p-3.5 text-sm leading-relaxed text-slate-300">
                <b className="text-white">Проверь перед оплатой:</b><br />
                {selectedOption.active ? 'Продлить' : 'Купить'}: <b className="text-white">{optionLabel(selectedOption)}</b><br />
                Тариф: <b className="text-white">{tariffTitle(selectedTariff)}</b><br />
                Срок: <b className="text-white">{tariffDays(selectedTariff)} дней</b><br />
                Цена: <b className="text-white">{Number(selectedTariff.price_rub || 0)} ₽</b>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
