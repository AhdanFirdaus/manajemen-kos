import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import StepGuide from '@/components/ui/step-guide'

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-8 lg:px-8">
      <div className="w-full max-w-5xl">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center space-y-8">
          <Badge
            variant="secondary"
            className="rounded-full px-4 py-1 text-sm uppercase tracking-[0.2em]"
          >
            Sistem Pengelolaan Kos
          </Badge>

          <div className="space-y-5">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-tight">
              Kelola operasional{' '}
              <span className="text-primary">Kos Dadan</span>{' '}
              lebih mudah dan terorganisir.
            </h1>

            <p className="mx-auto max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
              Pantau data penghuni, status kamar, pembayaran bulanan,
              hingga laporan kos dalam satu dashboard yang simpel dan modern.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded-full px-8">
              <Link href="/login">Masuk Dashboard</Link>
            </Button>
          </div>

          <div className="w-full flex justify-center">
            <StepGuide />
          </div>
        </div>
      </div>
    </main>
  )
}