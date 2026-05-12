export function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(value?: string | Date | null) {
  if (!value) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

export function statusLabel(status?: string | null) {
  if (status === 'paid') return 'Lunas'
  if (status === 'overdue') return 'Terlambat'
  if (status === 'void') return 'Dibatalkan'

  return 'Menunggu'
}
