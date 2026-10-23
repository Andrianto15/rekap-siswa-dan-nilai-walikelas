import type { Metadata, Viewport } from 'next';
import { Public_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';
import { ConfirmProvider } from '@/components/ui/ConfirmDialog';

const publicSans = Public_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Rekap Siswa & Nilai Wali Kelas',
  description: 'Sistem Informasi Rekap Kehadiran dan Penilaian Siswa untuk Wali Kelas dan Guru Mata Pelajaran',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#4682b4',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${publicSans.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans antialiased selection:bg-[#4682b4] selection:text-white">
        <ConfirmProvider>
          <ToastProvider>{children}</ToastProvider>
        </ConfirmProvider>
      </body>
    </html>
  );
}
