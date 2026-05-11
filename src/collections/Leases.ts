import { isAdmin } from '@/access/isAdmin'
import { isTenantOrAdmin } from '@/access/isTenantOrAdmin'
import { ensureMonthlyInvoiceForLease } from '@/lib/billing'
import type { CollectionConfig } from 'payload'

export const Leases: CollectionConfig = {
  slug: 'leases',
  admin: {
    useAsTitle: 'id',
  },
  access: {
    admin: isAdmin,
    read: isTenantOrAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [
      async ({ doc, req }) => {
        await ensureMonthlyInvoiceForLease({
          payload: req.payload as Parameters<typeof ensureMonthlyInvoiceForLease>[0]['payload'],
          lease: doc,
        })

        return doc
      },
    ],
  },
  fields: [
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'room',
      type: 'relationship',
      relationTo: 'rooms',
      required: true,
    },
    {
      name: 'startDate',
      type: 'date',
      required: true,
    },
    {
      name: 'dueDate',
      type: 'number',
      label: 'Tanggal Jatuh Tempo (1-31)',
      required: true,
      min: 1,
      max: 31,
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
