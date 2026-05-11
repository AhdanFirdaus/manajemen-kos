import { AuthenticationError } from 'payload'

import { isAdmin } from '@/access/isAdmin'
import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true, // Mengaktifkan fitur login
  admin: {
    useAsTitle: 'name',
  },
  access: {
    admin: isAdmin,
    create: isAdmin,
    delete: isAdmin,
    read: isAdmin,
    update: isAdmin,
  },
  hooks: {
    beforeLogin: [
      ({ req, user }) => {
        const isAdminLogin =
          req.headers.get('referer')?.includes('/admin') ||
          req.headers.get('origin')?.includes('/admin')

        if (isAdminLogin && user.role !== 'admin') {
          throw new AuthenticationError(req.t)
        }

        return user
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'tenant',
      saveToJWT: true,
      options: [
        { label: 'Admin / Owner', value: 'admin' },
        { label: 'Penghuni', value: 'tenant' },
      ],
      access: {
        update: isAdmin,
      },
    },
    {
      name: 'phoneNumber',
      type: 'text',
      label: 'Nomor WhatsApp',
      required: true,
    },
  ],
}
