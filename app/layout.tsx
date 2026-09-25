import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { LayoutWrapper } from '@/components/LayoutWrapper';
import { PWAInstaller } from '@/components/PWAInstaller';

export const metadata: Metadata = {
  title: 'EXCHANGE — What you have. What you need.',
  description: 'A community for item-to-item barter exchange. No prices. No payments. Just exchange.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'EXCHANGE',
  },
};

export const viewport: Viewport = {
  themeColor: '#0f372d',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <a className="skip-link" href="#app">
          Skip to content
        </a>
        <AppProvider>
          <LayoutWrapper>
            {children}
            <PWAInstaller />
          </LayoutWrapper>
        </AppProvider>
      </body>
    </html>
  );
}
