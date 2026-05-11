'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from './button'

type User = { id?: string; name?: string; role?: string }

export default function TenantNav() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    fetch('/api/users/me')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return
        setUser(data?.user ?? null)
      })
      .catch(() => {})

    return () => {
      mounted = false
    }
  }, [])

  if (!user) return null
  if (user.role === 'admin') return null

  async function handleLogout() {
    setLoading(true)
    try {
      await fetch('/api/users/logout', { method: 'POST' })
    } catch (e) {
      // ignore
    }
    router.push('/')
  }

  return (
    <div className="flex items-center gap-3">
      <div className="hidden items-center gap-2 sm:flex">
        <span className="text-sm font-medium">{user.name ?? 'Tenant'}</span>
      </div>
      <Button size="sm" variant="outline" onClick={handleLogout} disabled={loading}>
        Keluar
      </Button>
    </div>
  )
}
