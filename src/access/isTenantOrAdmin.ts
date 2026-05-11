import { Access } from 'payload'

export const isTenantOrAdmin: Access = ({ req: { user } }) => {
  if (user?.role === 'admin') return true
  
  return {
    tenant: {
      equals: user?.id,
    },
  }
}