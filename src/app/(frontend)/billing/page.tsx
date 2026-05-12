import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'

import { PageHeader } from '@/components/layout/page-header'
import { BackButton } from '@/components/ui/back-button'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { getPayloadClient } from '@/lib/payload'

import { InvoiceRow } from './invoice-row'
import { formatCurrency } from './_lib/invoice-utils'

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
      tenant: {
        equals: user.id,
      },
    },
    sort: '-createdAt',
    limit: 20,
    depth: 1,
  })

  const totalOutstanding = invoices
    .filter((invoice) => invoice.status !== 'paid')
    .reduce((sum, invoice) => {
      return sum + (typeof invoice.amount === 'number' ? invoice.amount : 0)
    }, 0)

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-10 lg:px-8">
      <section className="space-y-8">
        <PageHeader
          badge="Billing"
          title="Tagihan Kos"
          description="Lihat status tagihan dan lakukan pembayaran invoice."
          actions={<BackButton href="/dashboard" label="← Kembali" />}
        />

        <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur">
          <CardHeader className="space-y-2">
            <CardDescription>Total tagihan terbuka</CardDescription>

            <CardTitle className="text-2xl">{formatCurrency(totalOutstanding)}</CardTitle>
          </CardHeader>

          <CardContent className="text-sm text-muted-foreground">
            Klik tombol "Bayar Sekarang" untuk melanjutkan pembayaran via Xendit.
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur">
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
                  {invoices.map((invoice) => (
                    <InvoiceRow key={invoice.id} invoice={invoice} />
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
