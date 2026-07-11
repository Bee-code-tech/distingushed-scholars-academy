import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import ThemeProvider from '@/components/ui/ThemeProvider'
import AOSProvider from '@/components/AOSProvider' // Import the provider

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Distinguished Scholars Academy',
  description:
    'Official website of Distinguished Scholars Academy — nurturing excellence and leadership.',
  icons: {
    icon: '/imges/DSA.jpg',
    shortcut: '/imges/DSA.jpg',
    apple: '/imges/DSA.jpg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-neutralWhite dark:bg-neutralBlack text-neutralBlack dark:text-neutralWhite`}
      >
        {/* Wrap the content with AOSProvider */}
        <AOSProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AOSProvider>
      </body>
    </html>
  )
}
