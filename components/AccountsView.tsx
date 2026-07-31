'use client';

import {useState} from 'react';
import {Cable, CircleUserRound, ExternalLink, Gauge, KeyRound, RefreshCw, RotateCcw, Server, Shield, Unplug, Wifi} from 'lucide-react';
import {Badge, Button, Card, Field, Modal, Row, Switch} from '@/components/ui';
import {formatTimestamp, frozenLeft, pingSourceLabel, pingTone, pingValue} from '@/lib/format';
import {ProxyPayload, ZoomaAccount, ZoomaState} from '@/types/zooma';

interface Props {
  state: ZoomaState;
  isBusy: (key: string) => boolean;
  onPromo: (accountId: string, enabled: boolean) => void | Promise<unknown>;
  onMode: (accountId: string, mode: 'server' | 'extension') => void | Promise<unknown>;
  onSaveProxy: (payload: ProxyPayload) => void | Promise<unknown>;
  onReset: (accountId: string) => void | Promise<unknown>;
  onUnbind: (accountId: string) => void | Promise<unknown>;
  onReload: (accountId: string) => void | Promise<unknown>;
  onConnect: (accountId: string) => void | Promise<unknown>;
}

interface ProxyDraft {
  full: string;
  host: string;
  port: string;
  login: string;
  password: string;
}

function authTone(status?: string): 'ok' | 'warn' | 'danger' {
  const value = String(status || '').toLowerCase();
  if (value.includes('ожидает')) return 'warn';
  if (value.includes('подключен') && !value.includes('не подключен')) return 'ok';
  return 'danger';
}

function parseProxy(raw: string) {
  const value = raw.trim();
  if (!value) return null;
  if (value.includes('://') || value.includes('@')) {
    const url = new URL(value.includes('://') ? value : `socks5://${value}`);
    if (!url.protocol.toLowerCase().startsWith('socks5')) throw new Error('Поддерживается только SOCKS5');
    return {
      host: url.hostname,
      port: Number.parseInt(url.port || '0', 10),
      login: decodeURIComponent(url.username || ''),
      password: decodeURIComponent(url.password || ''),
    };
  }
  const parts = value.split(':');
  if (parts.length < 4) throw new Error('Формат: ip:port:login:password');
  return {
    host: parts[0].trim(),
    port: Number.parseInt(parts[1].trim(), 10),
    login: parts[2].trim(),
    password: parts.slice(3).join(':').trim(),
  };
}

function initialDraft(account: ZoomaAccount): ProxyDraft {
  return {
    full: '',
    host: String(account.proxy_ip || ''),
    port: String(account.proxy_port_socks5 || ''),
    login: String(account.proxy_login || ''),
    password: String(account.proxy_password || ''),
  };
}

export function AccountsView({
  state,
  isBusy,
  onPromo,
  onMode,
  onSaveProxy,
  onReset,
  onUnbind,
  onReload,
  onConnect,
}: Props) {
  const [proxyOpen, setProxyOpen] = useState<Record<string, boolean>>({});
  const [drafts, setDrafts] = useState<Record<string, ProxyDraft>>({});
  const [confirm, setConfirm] = useState<{type: 'reset' | 'unbind'; account: ZoomaAccount} | null>(null);
  const [localError, setLocalError] = useState('');

  const updateDraft = (account: ZoomaAccount, patch: Partial<ProxyDraft>) => {
    const id = String(account.account_id);
    setDrafts((previous) => ({
      ...previous,
      [id]: {...(previous[id] || initialDraft(account)), ...patch},
    }));
  };

  const submitProxy = async (account: ZoomaAccount) => {
    const id = String(account.account_id);
    const draft = drafts[id] || initialDraft(account);
    try {
      const parsed = draft.full.trim() ? parseProxy(draft.full) : null;
      const host = parsed?.host || draft.host.trim();
      const port = parsed?.port || Number.parseInt(draft.port || '0', 10);
      const login = parsed?.login || draft.login.trim();
      const password = parsed?.password || draft.password.trim();
      if (!host || !port || !login || !password) throw new Error('Заполни SOCKS5 прокси: ip:port:login:password');
      setLocalError('');
      await onSaveProxy({account_id: id, host, port, login, password});
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Неверный формат прокси');
    }
  };

  const accounts = state.accounts || [];
  if (!accounts.length) {
    return <Card className="text-sm text-slate-400">Аккаунтов пока нет.</Card>;
  }

  return (
    <div className="space-y-3">
      {accounts.map((account) => {
        const id = String(account.account_id || '');
        const mode = account.promo_activation_mode === 'extension' ? 'extension' : 'server';
        const promoEnabled = !account.promo_activation_paused;
        const frozen = Boolean(account.subscription_paused);
        const ping = pingValue(account);
        const draft = drafts[id] || initialDraft(account);
        const bound = Boolean(account.extension_bound_chat_id);

        return (
          <Card key={id} className="relative overflow-hidden p-0">
            <div className="pointer-events-none absolute -right-20 -top-24 size-60 rounded-full bg-sky-500/[0.08] blur-3xl" />
            <div className="relative flex items-center gap-3 px-4 pb-3 pt-4">
              <div className="grid size-11 shrink-0 place-items-center rounded-2xl border border-violet-300/20 bg-violet-400/10 text-violet-200">
                <CircleUserRound className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="truncate font-bold text-white">{account.port_user_name || 'Аккаунт не подключён'}</div>
                  {Number(account.slot || 1) > 1 && <Badge tone="info">Доп. аккаунт {account.slot}</Badge>}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  {account.port_user_id && <span>ID {account.port_user_id}</span>}
                  <Badge tone={authTone(account.auth_status)}>{account.auth_status || 'не подключен'}</Badge>
                </div>
              </div>
            </div>

            <div className="relative border-y border-white/[0.055] bg-slate-950/25 px-4">
              <div className="flex min-h-[66px] items-center justify-between gap-4 border-b border-white/[0.055] py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
                    {mode === 'extension' ? <Cable className="size-4 text-violet-300" /> : <Server className="size-4 text-cyan-300" />}
                    Режим активации
                  </div>
                  <div className="mt-1 text-xs text-slate-500">{mode === 'extension' ? 'Расширение' : 'Сервер'}</div>
                </div>
                <Switch
                  checked={mode === 'extension'}
                  disabled={isBusy(`mode:${id}`) || frozen}
                  onChange={(checked) => onMode(id, checked ? 'extension' : 'server')}
                  label="Режим активации"
                />
              </div>

              <div className="flex min-h-[66px] items-center justify-between gap-4 py-3">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
                  <Shield className="size-4 text-emerald-300" />
                  Активация промо
                </div>
                <Switch
                  checked={promoEnabled}
                  disabled={isBusy(`promo:${id}`) || frozen}
                  onChange={(checked) => onPromo(id, checked)}
                  label="Активация промо"
                />
              </div>
            </div>

            <div className="relative px-4 py-2">
              {frozen ? (
                <>
                  <Row label="Подписка"><Badge tone="warn">заморожена</Badge></Row>
                  <Row label="Остаток"><span className="text-amber-200">{frozenLeft(account.subscription_frozen_left_sec)}</span></Row>
                </>
              ) : (
                <Row label="Подписка до">{formatTimestamp(account.subscription_until_ts, state)}</Row>
              )}
              <Row label={<span className="flex items-center gap-2"><Gauge className="size-4 text-sky-300" /> {pingSourceLabel(account)}</span>}>
                <Badge tone={pingTone(ping)}>{ping == null ? '—' : `${ping.toFixed(1)} мс`}</Badge>
              </Row>
            </div>

            <div className="relative space-y-2 px-4 pb-4 pt-2">
              {frozen ? (
                <div className="rounded-2xl border border-amber-300/15 bg-amber-400/[0.07] px-3.5 py-3 text-xs leading-relaxed text-amber-100/75">
                  Аккаунт заморожен. Действия временно недоступны.
                </div>
              ) : (
                <>
                  <Button
                    variant="primary"
                    className="w-full"
                    busy={isBusy(`connect:${id}`)}
                    icon={<ExternalLink className="size-4" />}
                    onClick={() => onConnect(id)}
                  >
                    Подключить / переподключить
                  </Button>

                  {mode === 'extension' ? (
                    <Button
                      className="w-full"
                      busy={isBusy(`reload:${id}`)}
                      icon={<RefreshCw className="size-4" />}
                      onClick={() => onReload(id)}
                    >
                      Обновить страницу ПК
                    </Button>
                  ) : (
                    <>
                      <Button
                        className="w-full"
                        icon={<Wifi className="size-4" />}
                        onClick={() => {
                          setProxyOpen((previous) => ({...previous, [id]: !previous[id]}));
                          if (!drafts[id]) setDrafts((previous) => ({...previous, [id]: initialDraft(account)}));
                        }}
                      >
                        {proxyOpen[id] ? 'Скрыть прокси' : 'Прокси'}
                      </Button>

                      {proxyOpen[id] && (
                        <div className="rounded-[20px] border border-sky-300/[0.12] bg-slate-950/45 p-3">
                          <div className="mb-3 text-xs leading-relaxed text-slate-500">
                            SOCKS5 прокси. Можно вставить целиком: ip:port:login:password или socks5://login:password@ip:port
                          </div>
                          <Field
                            value={draft.full}
                            placeholder="ip:port:login:password"
                            onChange={(event) => updateDraft(account, {full: event.target.value})}
                          />
                          <div className="mt-2 grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
                            <Field value={draft.host} placeholder="host" onChange={(event) => updateDraft(account, {host: event.target.value})} />
                            <Field value={draft.port} placeholder="port" inputMode="numeric" onChange={(event) => updateDraft(account, {port: event.target.value})} />
                            <Field value={draft.login} placeholder="login" onChange={(event) => updateDraft(account, {login: event.target.value})} />
                            <Field type="password" value={draft.password} placeholder="password" onChange={(event) => updateDraft(account, {password: event.target.value})} />
                          </div>
                          {localError && <div className="mt-2 text-xs text-rose-300">{localError}</div>}
                          <Button
                            className="mt-3 w-full"
                            busy={isBusy(`proxy:${id}`)}
                            icon={<KeyRound className="size-4" />}
                            onClick={() => submitProxy(account)}
                          >
                            Сохранить SOCKS5
                          </Button>
                        </div>
                      )}

                      <Button
                        variant="danger"
                        className="w-full"
                        icon={<RotateCcw className="size-4" />}
                        onClick={() => setConfirm({type: 'reset', account})}
                      >
                        Сбросить данные аккаунта
                      </Button>
                    </>
                  )}

                  {bound && (
                    <Button
                      variant="danger"
                      className="w-full"
                      icon={<Unplug className="size-4" />}
                      onClick={() => setConfirm({type: 'unbind', account})}
                    >
                      Отвязать расширение
                    </Button>
                  )}
                </>
              )}
            </div>
          </Card>
        );
      })}

      <Modal
        open={Boolean(confirm)}
        title={confirm?.type === 'reset' ? 'Очистить данные аккаунта?' : 'Отвязать расширение?'}
        onClose={() => setConfirm(null)}
        actions={confirm ? (
          <>
            <Button variant="danger" busy={isBusy(`${confirm.type}:${confirm.account.account_id}`)} onClick={async () => {
              const value = confirm;
              setConfirm(null);
              if (value.type === 'reset') await onReset(String(value.account.account_id));
              else await onUnbind(String(value.account.account_id));
            }}>
              {confirm.type === 'reset' ? 'Очистить' : 'Отвязать'}
            </Button>
            <Button onClick={() => setConfirm(null)}>Отмена</Button>
          </>
        ) : null}
      >
        {confirm?.type === 'reset'
          ? `Будут очищены данные казино и прокси слота #${Number(confirm.account.slot || 1)}. Слот, подписка и настройки Chat AI останутся.`
          : 'После отвязки потребуется повторно подключить расширение.'}
      </Modal>
    </div>
  );
}
