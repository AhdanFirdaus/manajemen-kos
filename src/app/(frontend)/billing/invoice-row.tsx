'use client'

import { useState } from 'react'
import { TableRow, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Invoice } from '@/payload-types'

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

export function InvoiceRow({ invoice }: { invoice: Invoice }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const amount = typeof invoice.amount === 'number' ? invoice.amount : 0
  const status = invoice.status || 'pending'
  const canPayNow = status === 'pending'

  async function handlePayment() {
    setError('')
    setIsLoading(true)
    const paymentWindow = window.open('about:blank', '_blank', 'noopener,noreferrer')

    try {
      const resp = await fetch('/api/xendit/create-invoice', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: invoice.id }),
      })

      const data = await resp.json()

      if (!resp.ok) {
        setError(data.error || 'Gagal membuat invoice pembayaran')
        return
      }

      if (data.paymentUrl) {
        if (paymentWindow) {
          paymentWindow.location.href = data.paymentUrl
          paymentWindow.focus()
        } else {
          window.location.href = data.paymentUrl
        }
      } else if (paymentWindow) {
        paymentWindow.close()
      }
    } catch (err) {
      if (paymentWindow) {
        paymentWindow.close()
      }
      setError('Terjadi kesalahan saat memproses pembayaran')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
      <TableCell>{invoice.billingMonth}</TableCell>
      <TableCell>{formatDate(invoice.dueOn)}</TableCell>
      <TableCell>
        <Badge variant={status === 'paid' ? 'secondary' : 'outline'}>{statusLabel(status)}</Badge>
      </TableCell>
      <TableCell className="text-right">{formatCurrency(amount)}</TableCell>
      <TableCell className="text-right">
        {error && <p className="text-xs text-destructive mb-2">{error}</p>}
        <Button
          variant="default"
          size="sm"
          className="rounded-full"
          disabled={!canPayNow || isLoading}
          onClick={handlePayment}
        >
          {isLoading ? 'Memproses...' : canPayNow ? 'Bayar Sekarang' : statusLabel(status)}
        </Button>
      </TableCell>
    </TableRow>
  )
}
