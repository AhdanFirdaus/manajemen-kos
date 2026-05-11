'use client'
import { useState, type FormEvent, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function isSafeRedirectPath(value: string) {
  return value.startsWith('/') && !value.startsWith('//')
}

export function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter()
  const emailRef = useRef<HTMLInputElement>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Auto focus email
  useEffect(() => {
    setTimeout(() => {
      emailRef.current?.focus()
    }, 100)
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const payload = (await response.json().catch(() => null)) as {
        message?: string
        errors?: Array<{ message?: string }>
      } | null

      if (!response.ok) {
        const details =
          payload?.errors?.[0]?.message || payload?.message || 'Email atau password tidak valid.'
        setErrorMessage(details)
        return
      }

      router.replace(isSafeRedirectPath(nextPath) ? nextPath : '/dashboard')
      router.refresh()
    } catch {
      setErrorMessage('Gagal terhubung ke server. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      {/* Email Field */}
      <div className="space-y-2">
        <label 
          htmlFor="email" 
          className="block text-sm font-medium text-foreground/90"
        >
          Email
        </label>
        <Input
          ref={emailRef}
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nama@kosdadan.com"
          required
          className="h-14 rounded-2xl border border-border/60 bg-white/50 dark:bg-zinc-900/50 
                     px-5 text-base placeholder:text-muted-foreground/70
                     focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
        />
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <label 
          htmlFor="password" 
          className="block text-sm font-medium text-foreground/90"
        >
          Password
        </label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          className="h-14 rounded-2xl border border-border/60 bg-white/50 dark:bg-zinc-900/50 
                     px-5 text-base placeholder:text-muted-foreground/70
                     focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
        />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 p-4 text-sm text-red-600 dark:text-red-400">
          {errorMessage}
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-14 rounded-2xl text-base font-semibold 
                   bg-primary hover:bg-primary/90 transition-all duration-200
                   shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30
                   disabled:opacity-70"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Memproses...
          </span>
        ) : (
          'Masuk ke Dashboard'
        )}
      </Button>
    </form>
  )
}