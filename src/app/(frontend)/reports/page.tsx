import Link from 'next/link'
import { redirect } from 'next/navigation'
import { headers as getHeaders } from 'next/headers'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getPayloadClient } from '@/lib/payload'

function formatDate(value?: string | Date | null) {
  if (!value) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function getStatusColor(status: string) {
  switch (status) {
    case 'reported':
      return 'outline'
    case 'in-progress':
      return 'secondary'
    case 'resolved':
      return 'default'
    default:
      return 'outline'
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'reported':
      return 'Dilaporkan'
    case 'in-progress':
      return 'Dalam Proses'
    case 'resolved':
      return 'Selesai'
    default:
      return status
  }
}

export default async function ReportsPage() {
  const payload = await getPayloadClient()
  const headers = await getHeaders()
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect('/login?next=/reports')
  }

  if (user.role === 'admin') {
    redirect('/admin')
  }

  const { docs: reports } = await payload.find({
    collection: 'maintenance-reports',
    where: {
      tenant: { equals: user.id },
    },
    sort: '-createdAt',
    limit: 100,
    depth: 1,
  })

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10 lg:px-8">
      <section className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Laporan Pemeliharaan
            </h1>
            <p className="text-sm text-muted-foreground">
              Laporkan kerusakan atau masalah di kos Anda
            </p>
          </div>
          <Button asChild className="rounded-full" size="lg">
            <Link href="/reports/new">+ Lapor Masalah</Link>
          </Button>
        </div>

        {/* Reports List */}
        {reports.length === 0 ? (
          <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur">
            <CardContent className="flex flex-col items-center justify-center gap-4 py-16">
              <div className="text-center space-y-2">
                <p className="text-lg font-medium text-foreground">Belum ada laporan</p>
                <p className="text-sm text-muted-foreground">
                  Buat laporan pertama Anda untuk memulai
                </p>
              </div>
              <Button asChild className="rounded-full">
                <Link href="/reports/new">Buat Laporan</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {reports.map((report) => (
              <Card
                key={report.id}
                className="border-border/60 bg-card/80 shadow-sm backdrop-blur hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-xl">{report.title}</CardTitle>
                        <Badge variant={getStatusColor(report.status ?? 'reported')}>
                          {getStatusLabel(report.status ?? 'reported')}
                        </Badge>
                      </div>
                      <CardDescription>
                        Lokasi: <span className="text-foreground">{report.location}</span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Description */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Deskripsi:</p>
                    <p className="text-sm text-foreground">{report.description}</p>
                  </div>

                  {/* Images */}
                  {report.images && report.images.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Foto:</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {report.images.map((img: any, idx: number) => {
                          const imageUrl =
                            typeof img.image === 'object' ? img.image?.url : img.image
                          return imageUrl ? (
                            <a
                              key={idx}
                              href={imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                            >
                              <img
                                src={imageUrl}
                                alt={`Bukti ${idx + 1}`}
                                className="w-full h-32 object-cover"
                              />
                            </a>
                          ) : null
                        })}
                      </div>
                    </div>
                  )}

                  {/* Admin Notes */}
                  {report.adminNotes && (
                    <div className="rounded-lg bg-background/50 p-3">
                      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                        Catatan Admin
                      </p>
                      <p className="text-sm text-foreground">{report.adminNotes}</p>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="flex flex-col gap-1 text-xs text-muted-foreground pt-2 border-t border-border/60">
                    <p>Dilaporkan: {formatDate(report.createdAt)}</p>
                    {report.resolvedAt && (
                      <p className="text-green-600 dark:text-green-400">
                        Selesai: {formatDate(report.resolvedAt)}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
