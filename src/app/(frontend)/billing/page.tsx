import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getPayloadClient } from '@/lib/payload'
import { InvoiceRow } from './invoice-row'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(value?: string | Date | null) {
  if (!value) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

function statusLabel(status?: string | null) {
  if (status === 'paid') return 'Lunas'
  if (status === 'overdue') return 'Terlambat'
  if (status === 'void') return 'Dibatalkan'
  return 'Menunggu'
}

export default async function BillingPage() {
  const payload = await getPayloadClient()
  const headers = await getHeaders()
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect('/login?next=/billing')
  }

  if (user.role === 'admin') {
    redirect('/admin')
  }

  const { docs: invoices } = await payload.find({
    collection: 'invoices',
    where: {
      tenant: { equals: user.id },
    },
    sort: '-createdAt',
    limit: 20,
    depth: 1,
  })

  const totalOutstanding = invoices
    .filter((invoice) => invoice.status !== 'paid')
    .reduce((sum, invoice) => sum + (typeof invoice.amount === 'number' ? invoice.amount : 0), 0)

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-6 py-10 lg:px-8">
      <section className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm backdrop-blur md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Badge
              variant="secondary"
              className="rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em]"
            >
              Billing
            </Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Tagihan kos
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Halaman ini akan menjadi pusat invoice tenant. Integrasi Xendit akan diaktifkan
                setelah env disiapkan.
              </p>
            </div>
          </div>

          <Card className="w-full max-w-sm border-border/60 bg-background/70">
            <CardHeader>
              <CardDescription>Total tagihan terbuka</CardDescription>
              <CardTitle className="text-2xl">{formatCurrency(totalOutstanding)}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Klik tombol "Bayar Sekarang" untuk melanjutkan pembayaran via Xendit.
            </CardContent>
          </Card>
        </div>
      </section>

      <Card className="mt-8 border-border/60 bg-card/80 shadow-sm backdrop-blur">
        <CardHeader>
          <CardTitle>Daftar invoice</CardTitle>
          <CardDescription>Semua invoice milik tenant yang sedang login.</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada invoice yang tersedia.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Periode</TableHead>
                  <TableHead>Jatuh tempo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Nominal</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => {
                  const amount = typeof invoice.amount === 'number' ? invoice.amount : 0
                  return (
                    <InvoiceRow key={invoice.id} invoice={invoice} />
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
