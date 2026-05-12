import { CollectionConfig } from 'payload'
import { isTenantOrAdmin } from '@/access/isTenantOrAdmin'

export const MaintenanceReports: CollectionConfig = {
  slug: 'maintenance-reports',
  labels: {
    singular: 'Laporan Pemeliharaan',
    plural: 'Laporan Pemeliharaan',
  },
  access: {
    read: isTenantOrAdmin,
    create: isTenantOrAdmin,
    update: ({ req: { user } }) => Boolean(user?.role === 'admin'),
    delete: ({ req: { user } }) => Boolean(user?.role === 'admin'),
  },
  hooks: {
    beforeValidate: [
      ({ data, req }) => {
        // Otomatis isi tenant jika user login dan data tenant kosong
        if (req.user && !data.tenant) {
          data.tenant = req.user.id
        }

        // Pastikan images adalah array yang bersih hanya berisi { image: "ID" }
        if (data.images && Array.isArray(data.images)) {
          data.images = data.images
            .map((item: any) => {
              if (typeof item === 'string') return { image: item }
              if (item && typeof item === 'object') {
                const id = item.image?.id || item.image // Handle populated object or ID string
                return { image: id }
              }
              return item
            })
            .filter((item: any) => item.image)
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Judul Laporan',
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      label: 'Deskripsi Masalah',
    },
    {
      name: 'location',
      type: 'text',
      required: true,
      label: 'Lokasi (kamar/area)',
    },
    {
      name: 'images',
      type: 'array',
      label: 'Foto/Bukti',
      minRows: 1,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Dilaporkan', value: 'reported' },
        { label: 'Dalam Proses', value: 'in-progress' },
        { label: 'Selesai', value: 'resolved' },
      ],
      defaultValue: 'reported',
      admin: { position: 'sidebar' },
    },
    {
      name: 'adminNotes',
      type: 'textarea',
      label: 'Catatan Admin',
      access: {
        read: ({ req: { user } }) => Boolean(user?.role === 'admin'),
        create: ({ req: { user } }) => Boolean(user?.role === 'admin'),
        update: ({ req: { user } }) => Boolean(user?.role === 'admin'),
      },
    },
    {
      name: 'resolvedAt',
      type: 'date',
      label: 'Tanggal Selesai',
      access: {
        read: ({ req: { user } }) => Boolean(user?.role === 'admin' || user),
        create: ({ req: { user } }) => Boolean(user?.role === 'admin'),
        update: ({ req: { user } }) => Boolean(user?.role === 'admin'),
      },
    },
  ],
  timestamps: true,
}
