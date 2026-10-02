import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { event } from '@/lib/event'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: `${event.name} | ${event.edition} | ${event.cohort}`,
  description:
    `Join ${event.name}, ${event.edition}, ${event.cohort}. Product experience, business training, founder stories, and a venture showcase. ${event.date}, ${event.time} on ${event.venue}.`,
  icons: {
    icon: [
      {
        url: '/images/brand/eea-icon-32-v1.png',
        type: 'image/png',
        sizes: '32x32',
      },
      {
        url: '/images/brand/eea-icon-192-v1.png',
        type: 'image/png',
        sizes: '192x192',
      },
    ],
    apple: [{ url: '/images/brand/eea-apple-icon-v1.png', type: 'image/png', sizes: '180x180' }],
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#923e2b',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="light" style={{ colorScheme: 'light' }}>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster richColors position="top-center" />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
