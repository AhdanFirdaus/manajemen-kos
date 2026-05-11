import { isAdmin } from '@/access/isAdmin'
import { isTenantOrAdmin } from '@/access/isTenantOrAdmin'
import type { CollectionConfig } from 'payload'

export const Invoices: CollectionConfig = {
  slug: 'invoices',
  admin: {
    useAsTitle: 'invoiceNumber',
  },
  access: {
    admin: isAdmin,
    read: isTenantOrAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'invoiceNumber',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'lease',
      type: 'relationship',
      relationTo: 'leases',
      required: true,
    },
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
      name: 'billingMonth',
      type: 'text',
      required: true,
      admin: {
        description: 'Format YYYY-MM, dipakai untuk mencegah invoice duplikat per bulan.',
      },
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'dueOn',
      type: 'date',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Menunggu', value: 'pending' },
        { label: 'Lunas', value: 'paid' },
        { label: 'Terlambat', value: 'overdue' },
        { label: 'Dibatalkan', value: 'void' },
      ],
      required: true,
    },
    {
      name: 'paymentProvider',
      type: 'select',
      defaultValue: 'xendit',
      options: [{ label: 'Xendit', value: 'xendit' }],
    },
    {
      name: 'xenditInvoiceId',
      type: 'text',
    },
    {
      name: 'paymentUrl',
      type: 'text',
    },
    {
      name: 'paidAt',
      type: 'date',
    },
    {
      name: 'notes',
      type: 'textarea',
    },
  ],
}
