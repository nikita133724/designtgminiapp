'use client';

import {CreditCard, LoaderCircle, RefreshCw, UserRound, UsersRound} from 'lucide-react';
import {AccountsView} from '@/components/AccountsView';
import {ProfileView} from '@/components/ProfileView';
import {TariffsView} from '@/components/TariffsView';
import {Button, Toast} from '@/components/ui';
import {useZoomaApp} from '@/hooks/useZoomaApp';
import {AppTab} from '@/types/zooma';

const tabs: Array<{id: AppTab; label: string; icon: typeof UserRound}> = [
  {id: 'profile', label: 'Профиль', icon: UserRound},
  {id: 'accounts', label: 'Аккаунты', icon: UsersRound},
  {id: 'tariffs', label: 'Тарифы', icon: CreditCard},
];

function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[#030612]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_1000px_at_15%_15%,rgba(30,64,175,.35)_0%,rgba(30,64,175,.10)_50%,transparent_100%),radial-gradient(circle_900px_at_85%_30%,rgba(139,92,246,.28)_0%,rgba(139,92,246,.08)_50%,transparent_100%),radial-gradient(circle_1000px_at_50%_65%,rgba(59,130,246,.25)_0%,rgba(59,130,246,.08)_50%,transparent_100%),radial-gradient(circle_900px_at_90%_85%,rgba(219,39,119,.22)_0%,rgba(219,39,119,.06)_50%,transparent_100%),radial-gradient(circle_800px_at_15%_80%,rgba(79,70,229,.28)_0%,rgba(79,70,229,.08)_50%,transparent_100%)]" />
      <div className="animate-float-1 absolute left-[80%] top-[15%] size-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(236,72,153,.25)_0%,transparent_70%)] opacity-30 blur-xl" />
      <div className="animate-float-2 absolute left-[12%] top-[35%] size-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(14,165,233,.3)_0%,transparent_70%)] opacity-35 blur-xl" />
      <div className="animate-float-3 absolute left-[85%] top-[65%] size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,.25)_0%,transparent_70%)] opacity-30 blur-xl" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.013)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.013)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:linear-gradient(to_bottom,black,transparent_78%)]" />
    </div>
  );
}

function LoadingScreen() {
  return (
    <main className="relative z-10 grid min-h-[100dvh] place-items-center px-5">
      <div className="text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-[24px] border border-sky-300/20 bg-slate-950/65 shadow-[0_0_60px_-20px_rgba(56,189,248,.8)] backdrop-blur-xl">
          <LoaderCircle className="size-7 animate-spin text-cyan-300" />
        </div>
        <div className="mt-5 text-lg font-black tracking-tight text-white">ZOOMA Client</div>
        <div className="mt-2 text-sm text-slate-500">Загружаем кабинет…</div>
      </div>
    </main>
  );
}

function ErrorScreen({message, onRetry}: {message: string; onRetry: () => void}) {
  return (
    <main className="relative z-10 grid min-h-[100dvh] place-items-center px-4">
      <section className="premium-card w-full max-w-sm rounded-[26px] border border-rose-300/15 bg-slate-950/75 p-5 text-center backdrop-blur-xl">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl border border-rose-300/20 bg-rose-400/10 text-rose-200">
          <UserRound className="size-6" />
        </div>
        <h1 className="mt-4 text-lg font-black text-white">Не удалось открыть кабинет</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">{message}</p>
        <Button className="mt-5 w-full" icon={<RefreshCw className="size-4" />} onClick={onRetry}>
          Повторить
        </Button>
      </section>
    </main>
  );
}

export default function TelegramMiniApp() {
  const app = useZoomaApp();

  if (app.loading) {
    return (
      <>
        <AmbientBackground />
        <LoadingScreen />
      </>
    );
  }

  if (!app.state) {
    return (
      <>
        <AmbientBackground />
        <ErrorScreen message={app.bootError || 'Не удалось загрузить кабинет.'} onRetry={() => window.location.reload()} />
      </>
    );
  }

  const state = app.state;

  return (
    <div className="relative min-h-[100dvh] text-slate-200">
      <AmbientBackground />
      <Toast toast={app.toast} onClose={() => app.setToast(null)} />

      <header className="fixed inset-x-0 top-0 z-50 border-b border-sky-300/[0.09] bg-[#030612]/75 pt-[env(safe-area-inset-top)] backdrop-blur-2xl">
        <div className="mx-auto max-w-[620px] px-3 py-2.5 sm:px-4">
          <nav className="premium-card grid grid-cols-3 gap-1 rounded-[20px] border border-sky-300/[0.12] bg-slate-950/55 p-1.5" aria-label="Разделы кабинета">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = app.activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => app.setActiveTab(tab.id)}
                  className={`flex min-h-12 items-center justify-center gap-2 rounded-2xl px-2 text-xs font-bold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 min-[380px]:text-sm ${active ? 'border border-sky-300/[0.12] bg-gradient-to-b from-white/[0.11] to-white/[0.055] text-white shadow-[0_10px_28px_-18px_rgba(56,189,248,.7)]' : 'border border-transparent text-slate-500 hover:bg-white/[0.035] hover:text-slate-200'}`}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className={`size-4 ${active ? 'text-cyan-300' : ''}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-[620px] px-3 pb-[calc(env(safe-area-inset-bottom)+20px)] pt-[calc(env(safe-area-inset-top)+82px)] sm:px-4 sm:pt-[calc(env(safe-area-inset-top)+86px)]">
        <div key={app.activeTab} className="animate-page-enter">
          {app.activeTab === 'profile' && (
            <ProfileView
              state={state}
              account={app.currentAccount}
              now={app.now}
              promoFlash={app.promoFlash}
              chatBusy={Boolean(app.currentAccount && app.isBusy(`chat-ai:${app.currentAccount.account_id}`))}
              onSupport={app.openSupport}
              onToggleChatAi={app.toggleChatAi}
              onSaveChatAi={app.saveChatAi}
            />
          )}

          {app.activeTab === 'accounts' && (
            <AccountsView
              state={state}
              isBusy={app.isBusy}
              onPromo={app.setAccountPromo}
              onMode={app.setActivationMode}
              onSaveProxy={app.saveProxy}
              onReset={app.resetAccount}
              onUnbind={app.unbindExtension}
              onReload={app.reloadExtension}
              onConnect={app.connectPrompt}
            />
          )}

          {app.activeTab === 'tariffs' && (
            <TariffsView
              state={state}
              tariffType={app.tariffType}
              addonConfig={app.addonConfig}
              invoice={app.currentInvoice}
              now={app.now}
              isBusy={app.isBusy}
              onTariffType={app.setTariffType}
              onBuy={app.buyTariff}
              onBuyAddon={app.createAddonInvoice}
              onCancelInvoice={app.cancelInvoice}
              onOpenPay={app.openPay}
              onCopyPay={app.copyPay}
            />
          )}
        </div>
      </main>
    </div>
  );
}
