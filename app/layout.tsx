import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'x-digest',
  description: 'Daily X (Twitter) digest powered by AI',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="bg-slate-50 text-slate-900 min-h-full flex flex-col">
        <header className="border-b border-slate-200 bg-white">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-slate-800">
              x-digest
            </a>
            <a href="/admin" className="text-sm text-slate-500 hover:text-slate-700">
              管理
            </a>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-8 w-full">{children}</main>
      </body>
    </html>
  )
}
