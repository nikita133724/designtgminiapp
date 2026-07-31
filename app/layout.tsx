import type {Metadata} from 'next';
import { Playfair_Display, Manrope } from 'next/font/google';
import './globals.css'; // Global styles

const playfair = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-serif',
  weight: ['400', '600', '700'],
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Привет! — Элегантные пожелания',
  description: 'Создайте и отправьте красивое, персонализированное приветствие с теплыми пожеланиями.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ru" className={`${playfair.variable} ${manrope.variable}`}>
      <body className="font-sans antialiased bg-slate-50 text-slate-800 selection:bg-rose-100 selection:text-rose-900" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
