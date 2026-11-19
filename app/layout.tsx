import type { Metadata } from 'next';
import {VoyageSound} from '@/components/voyage-sound';
import './globals.css';
import './readability.css';
import './voyage-transitions.css';
import './voyage-prologue.css';
import './prologue-pirate.css';
import './prologue-portrait.css';
import './prologue-gate.css';

export const metadata: Metadata = {
  title: 'Iza Yunus Andhika — The Creative Voyage',
  description: 'Iza Yunus Andhika, a Computer Science undergraduate at Diponegoro University building intuitive web applications with clean code and thoughtful design.',
  icons: { icon: '/favicon.svg', shortcut: '/favicon.svg' },
  openGraph: { title: 'Iza Yunus Andhika — The Creative Voyage', description: 'Iza Yunus Andhika, a Computer Science undergraduate at Diponegoro University building intuitive web applications with clean code and thoughtful design.', type: 'website' },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><head><link rel="preload" href="/images/prologue/harbor-opening-desktop.jpg" as="image" media="(min-width:701px)"/><link rel="preload" href="/images/prologue/harbor-opening-phone.jpg" as="image" media="(max-width:700px)"/><link rel="preload" href="/fonts/dm-sans-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/><link rel="preload" href="/fonts/dm-serif-display-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/><link rel="preload" href="/fonts/dm-serif-display-italic-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/><link rel="preload" href="/images/prologue/iza-red-cutout.webp" as="image"/><link rel="preload" href="/fonts/ringbearer.ttf" as="font" type="font/ttf" crossOrigin="anonymous"/></head><body><VoyageSound/>{children}</body></html>;
}
