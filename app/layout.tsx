import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Iza Yunus Andhika — The Creative Voyage',
  description: 'Software engineering, website design, and videography. Step aboard the creative voyage of Iza Yunus Andhika.',
  icons: { icon: '/favicon.svg', shortcut: '/favicon.svg' },
  openGraph: { title: 'Iza Yunus Andhika — The Creative Voyage', description: 'A curious mind with a creative compass. Explore software, design, and stories in motion.', type: 'website' },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
