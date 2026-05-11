type BillingMonthInput = Date | string | number | undefined

type LeaseSnapshot = {
  id: string
  isActive?: boolean | null
  dueDate?: number | null
  room?: string | { id: string; price?: number | null; roomNumber?: string | null } | null
  tenant?: string | { id: string } | null
}

type PayloadLike = {
  find: (options: {
    collection: string
    where?: Record<string, unknown>
    limit?: number
    depth?: number
    sort?: string
  }) => Promise<{ docs: Array<Record<string, any>> }>
  findByID: (options: {
    collection: string
    id: string
    depth?: number
  }) => Promise<Record<string, any> | null>
  create: (options: {
    collection: string
    data: Record<string, unknown>
  }) => Promise<Record<string, any>>
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

export function getBillingMonthKey(input: BillingMonthInput = new Date()) {
  const date = input instanceof Date ? input : new Date(input ?? Date.now())
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`
}

export function getMonthDueDate(referenceDate: Date, dueDay: number) {
  const year = referenceDate.getFullYear()
  const month = referenceDate.getMonth()
  const lastDay = new Date(year, month + 1, 0).getDate()
  const normalizedDay = Math.min(Math.max(dueDay, 1), lastDay)

  return new Date(year, month, normalizedDay, 12, 0, 0, 0)
}

export function buildInvoiceNumber(leaseId: string, monthKey: string) {
  const suffix = leaseId
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(-6)
    .toUpperCase()
    .padStart(6, '0')
  return `INV-${monthKey.replace('-', '')}-${suffix}`
}

export async function ensureMonthlyInvoiceForLease({
  payload,
  lease,
  referenceDate = new Date(),
}: {
  payload: PayloadLike
  lease: LeaseSnapshot
  referenceDate?: Date
}) {
  if (!lease.isActive) {
    return null
  }

  const tenantId = typeof lease.tenant === 'string' ? lease.tenant : lease.tenant?.id
  const roomId = typeof lease.room === 'string' ? lease.room : lease.room?.id

  if (!tenantId || !roomId) {
    return null
  }

  const billingMonth = getBillingMonthKey(referenceDate)
  const existingInvoices = await payload.find({
    collection: 'invoices',
    where: {
      and: [{ lease: { equals: lease.id } }, { billingMonth: { equals: billingMonth } }],
    },
    limit: 1,
    depth: 0,
  })

  if (existingInvoices.docs.length > 0) {
    return existingInvoices.docs[0]
  }

  const room =
    typeof lease.room === 'object' && lease.room
      ? lease.room
      : await payload.findByID({ collection: 'rooms', id: roomId, depth: 0 })

  const amount = typeof room?.price === 'number' ? room.price : null

  if (amount === null) {
    return null
  }

  const invoiceNumber = buildInvoiceNumber(lease.id, billingMonth)
  const dueDate = getMonthDueDate(referenceDate, lease.dueDate ?? 1)

  return payload.create({
    collection: 'invoices',
    data: {
      invoiceNumber,
      lease: lease.id,
      tenant: tenantId,
      room: roomId,
      billingMonth,
      amount,
      dueOn: dueDate.toISOString(),
      status: 'pending',
      paymentProvider: 'xendit',
    },
  })
}
