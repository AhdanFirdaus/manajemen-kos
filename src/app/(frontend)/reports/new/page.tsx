import { redirect } from 'next/navigation'
import { headers as getHeaders } from 'next/headers'

import { Card } from '@/components/ui/card'
import { getPayloadClient } from '@/lib/payload'
import { ReportForm } from '../_components/report-form'

export default async function NewReportPage() {
  const payload = await getPayloadClient()
  const headers = await getHeaders()
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect('/login?next=/reports/new')
  }

  if (user.role === 'admin') {
    redirect('/admin')
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-10 lg:px-8">
      <section className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Lapor Masalah
          </h1>
          <p className="text-sm text-muted-foreground">
            Beri tahu kami tentang kerusakan atau masalah di kos Anda
          </p>
        </div>

        {/* Form Card */}
        <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur p-6 sm:p-8">
          <ReportForm />
        </Card>
      </section>
    </main>
  )
}
