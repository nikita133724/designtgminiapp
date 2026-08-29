import type {Metadata, Viewport} from 'next';
import Script from 'next/script';
import {Playfair_Display, Manrope} from 'next/font/google';
import './globals.css';

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
  title: 'ZOOMA Client',
  description: 'Личный кабинет ZOOMA в Telegram.',
  applicationName: 'ZOOMA Client',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#030612',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ru" className={`${playfair.variable} ${manrope.variable}`}>
      <body
        className="font-sans antialiased bg-[#030612] text-slate-200 selection:bg-sky-500/20 selection:text-sky-200"
        suppressHydrationWarning
      >
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        {children}
      </body>
    </html>
  );
}
