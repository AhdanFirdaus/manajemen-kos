import Link from 'next/link'
import { redirect } from 'next/navigation'
import { headers as getHeaders } from 'next/headers'

import { Button } from '@/components/ui/button'

import { getPayloadClient } from '@/lib/payload'

import { getDashboardData } from './_actions/get-dashboard-data'

import { DashboardStats } from './_components/dashboard-stats'
import { LogoutButton } from './_components/logout-button'

import { PageHeader } from '@/components/layout/page-header'

export default async function DashboardPage() {
  const payload = await getPayloadClient()
  const headers = await getHeaders()

  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect('/login?next=/dashboard')
  }

  if (user.role === 'admin') {
    redirect('/admin')
  }

  const data = await getDashboardData(user.id)

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-6 py-10 lg:px-8">
      <PageHeader
        badge="Dashboard Tenant"
        title={`Halo, ${user.name || 'Tenant'}`}
        description="Ringkasan hunian aktif, status tagihan, dan akses cepat ke halaman billing."
        actions={
          <>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/billing">Lihat Tagihan</Link>
            </Button>

            <Button asChild variant="outline" className="rounded-full">
              <Link href="/reports">Lihat Laporan</Link>
            </Button>

            <LogoutButton />
          </>
        }
      />

      <DashboardStats room={data.room} lease={data.currentLease} invoices={data.invoices} />
    </main>
  )
}
