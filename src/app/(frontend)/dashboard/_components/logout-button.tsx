'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'

export function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)

    try {
      await fetch('/api/users/logout', { method: 'POST', credentials: 'include' })
    } catch {
      // ignore logout errors and still leave the page
    }

    router.push('/')
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="rounded-full cursor-pointer"
      onClick={handleLogout}
      disabled={loading}
    >
      {loading ? 'Keluar...' : 'Logout'}
    </Button>
  )
}
