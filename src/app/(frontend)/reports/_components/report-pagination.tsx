import Link from 'next/link'

import { Button } from '@/components/ui/button'

interface Props {
  currentPage: number
  totalPages: number
}

export function ReportPagination({ currentPage, totalPages }: Props) {
  if (totalPages <= 1) return null

  const prevPage = Math.max(1, currentPage - 1)
  const nextPage = Math.min(totalPages, currentPage + 1)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
      <p className="text-sm text-muted-foreground">
        Halaman {currentPage} dari {totalPages}
      </p>

      <div className="flex items-center gap-2">
        {currentPage === 1 ? (
          <Button variant="outline" className="rounded-full" disabled>
            Sebelumnya
          </Button>
        ) : (
          <Button asChild variant="outline" className="rounded-full">
            <Link href={`/reports?page=${prevPage}`}>Sebelumnya</Link>
          </Button>
        )}

        {currentPage === totalPages ? (
          <Button variant="outline" className="rounded-full" disabled>
            Berikutnya
          </Button>
        ) : (
          <Button asChild variant="outline" className="rounded-full">
            <Link href={`/reports?page=${nextPage}`}>Berikutnya</Link>
          </Button>
        )}
      </div>
    </div>
  )
}
