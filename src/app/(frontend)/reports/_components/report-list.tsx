import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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

interface Props {
  reports: any[]
}

export function ReportList({ reports }: Props) {
  if (reports.length === 0) {
    return (
      <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur">
        <CardContent className="flex flex-col items-center justify-center gap-4 py-16">
          <div className="text-center space-y-2">
            <p className="text-lg font-medium text-foreground">Belum ada laporan</p>
            <p className="text-sm text-muted-foreground">Buat laporan pertama Anda untuk memulai</p>
          </div>
          <Link href="/reports/new" className="inline-flex">
            <span className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground">
              Buat Laporan
            </span>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
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
            <div>
              <p className="mb-1 text-sm text-muted-foreground">Deskripsi:</p>
              <p className="text-sm text-foreground">{report.description}</p>
            </div>

            {report.images && report.images.length > 0 && (
              <div>
                <p className="mb-2 text-sm text-muted-foreground">Foto:</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {report.images.map((img: any, idx: number) => {
                    const imageUrl = typeof img.image === 'object' ? img.image?.url : img.image
                    return imageUrl ? (
                      <a
                        key={idx}
                        href={imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="overflow-hidden rounded-lg transition-opacity hover:opacity-80"
                      >
                        <img
                          src={imageUrl}
                          alt={`Bukti ${idx + 1}`}
                          className="h-32 w-full object-cover"
                        />
                      </a>
                    ) : null
                  })}
                </div>
              </div>
            )}

            {report.adminNotes && (
              <div className="rounded-lg bg-background/50 p-3">
                <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">
                  Catatan Admin
                </p>
                <p className="text-sm text-foreground">{report.adminNotes}</p>
              </div>
            )}

            <div className="flex flex-col gap-1 border-t border-border/60 pt-2 text-xs text-muted-foreground">
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
  )
}
