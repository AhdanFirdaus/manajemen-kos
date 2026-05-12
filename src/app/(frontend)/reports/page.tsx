import Link from 'next/link'
import { redirect } from 'next/navigation'
import { headers as getHeaders } from 'next/headers'

import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/back-button'
import { getPayloadClient } from '@/lib/payload'
import { ReportList } from './_components/report-list'
import { ReportPagination } from './_components/report-pagination'
import { PageHeader } from '@/components/layout/page-header'

const REPORTS_PER_PAGE = 5

export default async function ReportsPage({ searchParams }: { searchParams?: { page?: string } }) {
  const payload = await getPayloadClient()
  const headers = await getHeaders()
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect('/login?next=/reports')
  }

  if (user.role === 'admin') {
    redirect('/admin')
  }

  const currentPage = Math.max(1, Number.parseInt(searchParams?.page ?? '1', 10) || 1)

  const reportsResult = await payload.find({
    collection: 'maintenance-reports',
    where: {
      tenant: { equals: user.id },
    },
    sort: '-createdAt',
    limit: REPORTS_PER_PAGE,
    page: currentPage,
    depth: 1,
  })

  const reports = reportsResult.docs
  const totalPages = reportsResult.totalPages || 1

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10 lg:px-8">
      <section className="space-y-6">
        <PageHeader
          badge="Reports"
          title="Laporan Pemeliharaan"
          description="Laporkan kerusakan atau masalah di kos Anda."
          actions={
            <>
              <Button asChild className="rounded-full" size="lg">
                <Link href="/reports/new">+ Lapor Masalah</Link>
              </Button>

              <BackButton href="/dashboard" label="← Kembali" />
            </>
          }
        />

        <ReportList reports={reports} />

        <ReportPagination currentPage={currentPage} totalPages={totalPages} />
      </section>
    </main>
  )
}
