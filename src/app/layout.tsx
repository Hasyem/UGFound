import type { Metadata, Viewport } from 'next'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1e3a8a',
}

export const metadata: Metadata = {
  title: 'UGFound — Lost & Found Universitas Gunadarma',
  description:
    'Sistem Pelaporan dan Pencarian Barang Hilang & Temuan Terpusat di Kampus Universitas Gunadarma (Kampus A, B, C, D, E). Cepat, transparan, dan terverifikasi.',
  keywords: [
    'UGFound',
    'Lost and Found',
    'Universitas Gunadarma',
    'Barang Hilang Kampus D Margonda',
    'Barang Hilang Kelapa Dua',
    'KTM Hilang Gunadarma',
  ],
  authors: [{ name: 'Tim Pengembang UGFound' }],
  openGraph: {
    title: 'UGFound — Sistem Lost & Found Universitas Gunadarma',
    description: 'Platform terpusat pelaporan barang hilang dan temuan di seluruh kampus Universitas Gunadarma.',
    siteName: 'UGFound',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0f172a',
              color: '#f8fafc',
              borderRadius: '16px',
              padding: '12px 18px',
              fontSize: '13px',
              fontWeight: 500,
              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.2)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#0f172a',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#0f172a',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
