import './globals.css';
import { Inter } from 'next/font/google';
import AppShell from '@/components/AppShell';
import { UIProvider } from '@/context/UIContext';
import { ThemeProvider } from '@/context/ThemeContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'Ops Platform',
  description: 'Powering teams through an all-in-one ops platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} antialiased font-sans`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <UIProvider>
            <AppShell>{children}</AppShell>
          </UIProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
