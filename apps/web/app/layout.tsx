import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BTRMe - AI-Powered NoCode Builder',
  description: 'Transform prompts into deployed apps instantly',
  keywords: ['ai', 'nocode', 'builder', 'code generation', 'nextjs'],
  authors: [{ name: 'BTRMe Team' }],
  openGraph: {
    title: 'BTRMe - AI-Powered NoCode Builder',
    description: 'Transform prompts into deployed apps instantly',
    url: 'https://btrme.com',
    siteName: 'BTRMe',
    locale: 'en_US',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
