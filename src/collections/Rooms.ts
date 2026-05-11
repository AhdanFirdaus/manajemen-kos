import { isAdmin } from '@/access/isAdmin'
import { isTenantOrAdmin } from '@/access/isTenantOrAdmin'
import type { CollectionConfig } from 'payload'

export const Rooms: CollectionConfig = {
  slug: 'rooms',
  admin: { useAsTitle: 'roomNumber' },
  access: {
    admin: isAdmin,
    create: isAdmin,
    delete: isAdmin,
    read: isTenantOrAdmin,
    update: isAdmin,
  },
  fields: [
    { name: 'roomNumber', type: 'text', required: true },
    { name: 'price', type: 'number', required: true },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Tersedia', value: 'available' },
        { label: 'Terisi', value: 'occupied' },
      ],
      defaultValue: 'available',
    },
    {
      name: 'parentProperty',
      type: 'relationship',
      relationTo: 'properties',
    },
  ],
}
