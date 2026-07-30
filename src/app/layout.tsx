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
  title:
    'Distinguished Scholars Academy | JAMB, WAEC & Post-UTME Tutorial in Nigeria',
  description:
    'Distinguished Scholars Academy helps Nigerian students prepare for JAMB (UTME), WAEC and Post-UTME with structured lessons, CBT practice, weekly assessments and mentorship — online and on-campus in Ibadan.',
  keywords: [
    'JAMB tutorial in Nigeria',
    'WAEC lessons',
    'Post-UTME preparation',
    'Post-UTME coaching',
    'online JAMB classes',
    'CBT practice',
    'UTME preparation',
    'university tutorials',
    '100-level tutorials',
    'JAMB WAEC Post-UTME Ibadan',
  ],
  openGraph: {
    title:
      'Distinguished Scholars Academy | JAMB, WAEC & Post-UTME Tutorial in Nigeria',
    description:
      'Structured lessons, CBT practice, weekly assessments and mentorship to help students score higher in JAMB, WAEC and Post-UTME and secure university admission.',
    type: 'website',
  },
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
