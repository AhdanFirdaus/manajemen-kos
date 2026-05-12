import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

interface Props {
  room?: {
    roomNumber?: string
    price?: number
    parentProperty?: {
      name?: string
    }
  }

  lease?: {
    dueDate?: number
  }

  invoices: any[]
}

export function DashboardStats({ room, lease, invoices }: Props) {
  const activeInvoices = invoices.filter((invoice) => invoice.status !== 'paid')

  const latestInvoice = invoices[0]

  return (
    <section className="mt-8 grid gap-4 md:grid-cols-3">
      <Card className="border-border/60 bg-background/70">
        <CardHeader>
          <CardDescription>Kamar aktif</CardDescription>

          <CardTitle className="text-2xl">{room?.roomNumber || '-'}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-1 text-sm text-muted-foreground">
          <p>{room?.parentProperty?.name || '-'}</p>

          <p>Jatuh tempo setiap tanggal {lease?.dueDate || '-'}</p>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-background/70">
        <CardHeader>
          <CardDescription>Nilai sewa bulanan</CardDescription>

          <CardTitle className="text-2xl">{formatCurrency(room?.price || 0)}</CardTitle>
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
    </section>
  )
}
