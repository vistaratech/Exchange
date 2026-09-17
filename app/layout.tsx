import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { LayoutWrapper } from '@/components/LayoutWrapper';

export const metadata: Metadata = {
  title: 'EXCHANGE — What you have. What you need.',
  description: 'A community for item-to-item barter exchange. No prices. No payments. Just exchange.',
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
      </head>
      <body>
        <a className="skip-link" href="#app">
          Skip to content
        </a>
        <AppProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </AppProvider>
      </body>
    </html>
  );
}
