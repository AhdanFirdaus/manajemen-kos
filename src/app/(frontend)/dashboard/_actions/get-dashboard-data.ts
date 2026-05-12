import { getPayloadClient } from '@/lib/payload'

export async function getDashboardData(userId: string) {
  const payload = await getPayloadClient()

  const [{ docs: leases }, { docs: invoices }] = await Promise.all([
    payload.find({
      collection: 'leases',
      where: {
        tenant: {
          equals: userId,
        },
      },
      depth: 2,
      limit: 5,
    }),

    payload.find({
      collection: 'invoices',
      where: {
        tenant: {
          equals: userId,
        },
      },
      sort: '-createdAt',
      limit: 100,
      depth: 1,
    }),
  ])

  const currentLease = leases[0]

  const room = currentLease?.room as
    | {
        roomNumber?: string
        price?: number
        parentProperty?: {
          name?: string
        }
      }
    | undefined

  return {
    currentLease,
    invoices,
    room,
  }
}