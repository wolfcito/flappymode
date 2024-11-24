import type { Metadata, Viewport } from 'next'
import './globals.css'
import localFont from 'next/font/local'
import { NavMenu } from '@/components/nav-menu'

const quickZap = localFont({
  src: '/fonts/QuickZap.ttf',
  variable: '--font-quickzap',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'Flappy Mode',
  description: 'by Wolfcito',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${quickZap.variable} antialiased bg-black text-white`}>
        {children}
        <NavMenu />
      </body>
    </html>
  )
}
