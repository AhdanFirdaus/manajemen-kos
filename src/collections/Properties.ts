import { isAdmin } from '@/access/isAdmin'
import { isTenantOrAdmin } from '@/access/isTenantOrAdmin'
import type { CollectionConfig } from 'payload'

export const Properties: CollectionConfig = {
  slug: 'properties',
  admin: { useAsTitle: 'name' },
  access: {
    admin: isAdmin,
    create: isAdmin,
    delete: isAdmin,
    read: isTenantOrAdmin,
    update: isAdmin,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'address', type: 'textarea' },
    { name: 'image', type: 'upload', relationTo: 'media' },
  ],
}
