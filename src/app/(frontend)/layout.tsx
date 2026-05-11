import { Plus_Jakarta_Sans } from 'next/font/google'
import { ReactNode } from 'react'
import './styles.css'
import TenantNav from '../../components/ui/tenant-nav'
import Footer from '../../components/ui/footer'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
})

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning className={plusJakartaSans.variable}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.04),transparent_24rem)]">
          <header className="border-b border-border/60 bg-background/50">
            {/* <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8"> */}
            {/* <div className="text-lg font-semibold">Manajemen Kos</div> */}
            <div className="flex items-center gap-4">
              <TenantNav />
            </div>
            {/* </div> */}
          </header>

          <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">{children}</main>

          <Footer />
        </div>
      </body>
    </html>
  )
}
