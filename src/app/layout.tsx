import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import './globals.css'
import { LenisProvider } from '@/components/providers/LenisProvider'
import NoiseOverlay from '@/components/ui/NoiseOverlay'
import CustomCursor from '@/components/ui/CustomCursor'
import WaFloat from '@/components/ui/WaFloat'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Imora | Photography, Film & Studio Services',
  description:
    'Imora — an independent studio in India. Photography and film for weddings, portraits, product, events and brands, plus a treated podcast studio for hire.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body>
        <LenisProvider>
          <NoiseOverlay />
          <CustomCursor />
          <WaFloat />
          {children}
        </LenisProvider>
      </body>
    </html>
  )
}
