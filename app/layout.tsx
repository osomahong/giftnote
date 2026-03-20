import type { Metadata } from 'next'
import { Noto_Serif_KR, Noto_Sans_KR, Caveat } from 'next/font/google'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { GTMScript } from '@/components/analytics/GTMScript'
import { TrackClickProvider } from '@/components/analytics/TrackClickProvider'
import './globals.css'

const notoSerifKR = Noto_Serif_KR({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-serif',
  display: 'swap',
})

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-sans',
  display: 'swap',
})

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-hand',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://giftnote.kr'),
  title: {
    default: '기프트노트 — 마음을 전하는 선물 큐레이션',
    template: '%s — 기프트노트',
  },
  description: '받는 사람, 예산, 상황에 꼭 맞는 선물 추천. 기프트노트가 엄선한 큐레이션으로 센스 있는 선물을 찾아보세요.',
  verification: {
    google: 'nrAvP2pjHO_uWjlLkipDEmhSZn4KqhWm4uOcYHsDlCI',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={`${notoSerifKR.variable} ${notoSansKR.variable} ${caveat.variable}`}>
      <body className="min-h-screen flex flex-col">
        <GTMScript />
        <TrackClickProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </TrackClickProvider>
      </body>
    </html>
  )
}
