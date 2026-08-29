'use client';

import {ButtonHTMLAttributes, HTMLAttributes, ReactNode} from 'react';
import {LoaderCircle, X} from 'lucide-react';
import {ToastState} from '@/hooks/useZoomaApp';

const cx = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(' ');

export function Card({className, children, ...props}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'premium-card rounded-[22px] border border-sky-300/[0.14] bg-slate-950/65 p-4 shadow-[0_18px_55px_-28px_rgba(0,0,0,.9)] backdrop-blur-xl',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  busy?: boolean;
  icon?: ReactNode;
}

export function Button({
  className,
  variant = 'secondary',
  busy,
  icon,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'border-emerald-300/30 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-[0_12px_32px_-15px_rgba(16,185,129,.85)] hover:brightness-110',
    secondary: 'border-sky-300/15 bg-slate-800/70 text-slate-100 hover:border-sky-300/30 hover:bg-slate-800',
    danger: 'border-rose-300/20 bg-rose-500/10 text-rose-200 hover:bg-rose-500/18',
    ghost: 'border-transparent bg-transparent text-slate-400 hover:bg-white/5 hover:text-slate-100',
  };
  return (
    <button
      type="button"
      disabled={disabled || busy}
      className={cx(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 disabled:cursor-not-allowed disabled:opacity-55 active:scale-[.985]',
        variants[variant],
        className,
      )}
      {...props}
    >
      {busy ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  );
}

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label: string;
}

export function Switch({checked, onChange, disabled, label}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cx(
        'relative h-8 w-[54px] shrink-0 rounded-full border p-1 transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 disabled:cursor-wait disabled:opacity-55',
        checked
          ? 'border-emerald-300/35 bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-[0_0_22px_-7px_rgba(16,185,129,.8)]'
          : 'border-slate-500/25 bg-slate-800/90',
      )}
    >
      <span
        className={cx(
          'block size-[22px] rounded-full bg-white shadow-lg transition-transform duration-200',
          checked ? 'translate-x-[22px]' : 'translate-x-0',
        )}
      />
    </button>
  );
}

export function Row({label, children, className}: {label: ReactNode; children: ReactNode; className?: string}) {
  return (
    <div className={cx('flex min-h-10 items-center justify-between gap-4 border-b border-white/[0.055] py-2.5 last:border-b-0', className)}>
      <div className="min-w-0 text-sm text-slate-400">{label}</div>
      <div className="min-w-0 max-w-[62%] text-right text-sm font-semibold text-slate-100 [overflow-wrap:anywhere]">{children}</div>
    </div>
  );
}

export function Badge({children, tone = 'neutral'}: {children: ReactNode; tone?: 'ok' | 'warn' | 'danger' | 'neutral' | 'info'}) {
  const tones = {
    ok: 'border-emerald-300/20 bg-emerald-400/10 text-emerald-200',
    warn: 'border-amber-300/20 bg-amber-400/10 text-amber-200',
    danger: 'border-rose-300/20 bg-rose-400/10 text-rose-200',
    info: 'border-sky-300/20 bg-sky-400/10 text-sky-200',
    neutral: 'border-slate-300/10 bg-white/5 text-slate-300',
  };
  return <span className={cx('inline-flex rounded-full border px-2.5 py-1 text-xs font-bold', tones[tone])}>{children}</span>;
}

export function Field(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const {className, ...rest} = props;
  return (
    <input
      className={cx(
        'h-12 w-full rounded-2xl border border-sky-300/[0.14] bg-slate-950/70 px-3.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-300/45 focus:ring-2 focus:ring-cyan-400/10',
        className,
      )}
      {...rest}
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const {className, ...rest} = props;
  return (
    <textarea
      className={cx(
        'min-h-24 w-full resize-y rounded-2xl border border-sky-300/[0.14] bg-slate-950/70 px-3.5 py-3 text-sm leading-relaxed text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-300/45 focus:ring-2 focus:ring-cyan-400/10',
        className,
      )}
      {...rest}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const {className, children, ...rest} = props;
  return (
    <select
      className={cx(
        'h-12 w-full rounded-2xl border border-sky-300/[0.14] bg-slate-950/90 px-3.5 text-sm text-slate-100 outline-none focus:border-cyan-300/45 focus:ring-2 focus:ring-cyan-400/10',
        className,
      )}
      {...rest}
    >
      {children}
    </select>
  );
}

interface ModalProps {
  open: boolean;
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
  onClose: () => void;
}

export function Modal({open, title, children, actions, onClose}: ModalProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/75 p-3 backdrop-blur-sm sm:items-center"
      role="presentation"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="premium-card w-full max-w-md rounded-[26px] border border-sky-200/20 bg-[#0b1120]/95 p-4 shadow-2xl"
      >
        <header className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid size-11 place-items-center rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
            aria-label="Закрыть"
          >
            <X className="size-5" />
          </button>
        </header>
        {children && <div className="text-sm text-slate-300">{children}</div>}
        {actions && <footer className="mt-4 grid grid-cols-2 gap-2">{actions}</footer>}
      </section>
    </div>
  );
}

export function Toast({toast, onClose}: {toast: ToastState | null; onClose: () => void}) {
  if (!toast) return null;
  const tones = {
    ok: 'border-emerald-300/25 bg-emerald-950/90 text-emerald-100',
    err: 'border-rose-300/25 bg-rose-950/90 text-rose-100',
    info: 'border-sky-300/25 bg-slate-900/95 text-slate-100',
  };
  return (
    <button
      type="button"
      onClick={onClose}
      className={cx(
        'fixed left-3 right-3 top-[calc(env(safe-area-inset-top)+74px)] z-[120] mx-auto max-w-xl rounded-2xl border px-4 py-3 text-left text-sm font-bold shadow-2xl backdrop-blur-xl',
        tones[toast.type],
      )}
    >
      {toast.text}
    </button>
  );
}
