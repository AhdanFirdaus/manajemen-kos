import Link from 'next/link'
import { redirect } from 'next/navigation'
import { headers as getHeaders } from 'next/headers'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getPayloadClient } from '@/lib/payload'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatMonthLabel(monthKey: string) {
  const [yearPart, monthPart] = monthKey.split('-').map(Number)
  if (!yearPart || !monthPart) return monthKey

  return new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(yearPart, monthPart - 1, 1))
}

function formatDate(value?: string | Date | null) {
  if (!value) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

export default async function TenantDashboard() {
  const payload = await getPayloadClient()
  const headers = await getHeaders()
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect('/login?next=/dashboard')
  }

  if (user.role === 'admin') {
    redirect('/admin')
  }

  const [{ docs: leases }, { docs: invoices }] = await Promise.all([
    payload.find({
      collection: 'leases',
      where: {
        tenant: { equals: user.id },
      },
      depth: 2,
      limit: 5,
    }),
    payload.find({
      collection: 'invoices',
      where: {
        tenant: { equals: user.id },
      },
      sort: '-createdAt',
      limit: 6,
      depth: 1,
    }),
  ])

  const currentLease = leases[0]
  const activeInvoices = invoices.filter((invoice) => invoice.status !== 'paid')
  const latestInvoice = invoices[0]
  const room = currentLease?.room as
    | { roomNumber?: string; price?: number; parentProperty?: { name?: string } }
    | string
    | undefined

  const roomNumber = typeof room === 'object' ? (room?.roomNumber ?? '-') : (room ?? '-')
  const roomPrice = typeof room === 'object' ? (room?.price ?? 0) : 0
  const propertyName =
    typeof room === 'object' && typeof room?.parentProperty === 'object'
      ? (room.parentProperty?.name ?? '-')
      : '-'

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-6 py-10 lg:px-8">
      <section className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm backdrop-blur md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Badge
              variant="secondary"
              className="rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em]"
            >
              Dashboard Tenant
            </Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Halo, {user.name || 'Tenant'}
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Ringkasan hunian aktif, status tagihan, dan akses cepat ke halaman billing.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/billing">Lihat Tagihan</Link>
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Card className="border-border/60 bg-background/70">
            <CardHeader>
              <CardDescription>Kamar aktif</CardDescription>
              <CardTitle className="text-2xl">{roomNumber}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              <p>{propertyName}</p>
              <p>Jatuh tempo setiap tanggal {currentLease?.dueDate ?? '-'}</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-background/70">
            <CardHeader>
              <CardDescription>Nilai sewa bulanan</CardDescription>
              <CardTitle className="text-2xl">{formatCurrency(roomPrice)}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Biaya dasar dari data kamar yang terhubung dengan lease aktif.
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-background/70">
            <CardHeader>
              <CardDescription>Tagihan terbuka</CardDescription>
              <CardTitle className="text-2xl">{activeInvoices.length}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {latestInvoice
                ? `Invoice terakhir: ${latestInvoice.invoiceNumber}`
                : 'Belum ada invoice yang dibuat.'}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur">
          <CardHeader>
            <CardTitle>Tagihan terbaru</CardTitle>
            <CardDescription>
              Invoice yang sudah disiapkan dari lease aktif tenant ini.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada tagihan yang dibuat.</p>
            ) : (
              <div className="space-y-4">
                {invoices.map((invoice) => {
                  const status = invoice.status || 'pending'
                  const amount = typeof invoice.amount === 'number' ? invoice.amount : 0

                  return (
                    <div
                      key={invoice.id}
                      className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-background/70 p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-foreground">{invoice.invoiceNumber}</p>
                          <Badge variant={status === 'paid' ? 'secondary' : 'outline'}>
                            {status === 'paid'
                              ? 'Lunas'
                              : status === 'overdue'
                                ? 'Terlambat'
                                : 'Menunggu'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Periode {formatMonthLabel(invoice.billingMonth)} · Jatuh tempo{' '}
                          {formatDate(invoice.dueOn)}
                        </p>
                      </div>

                      <div className="flex flex-col items-start gap-2 md:items-end">
                        <p className="text-lg font-semibold">{formatCurrency(amount)}</p>
                        <Button variant="outline" size="sm" className="rounded-full" disabled>
                          Siapkan pembayaran Xendit
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur">
          <CardHeader>
            <CardTitle>Ringkasan cepat</CardTitle>
            <CardDescription>Aksi yang sering dibutuhkan tenant.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full rounded-full">
              <Link href="/billing">Buka halaman billing</Link>
            </Button>
            <div className="rounded-2xl border border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Status koneksi</p>
              <p className="mt-1">
                Dashboard ini membaca data langsung dari Payload Local API, jadi data yang tampil
                selalu mengikuti database aktif.
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Akun saat ini</p>
              <p className="mt-1">Tenant ID: {user.id}</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
