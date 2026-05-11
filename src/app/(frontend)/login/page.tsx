import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { getPayloadClient } from '@/lib/payload'
import { LoginForm } from './login-form'
import { ArrowLeft } from 'lucide-react'

function getSafeNextPath(value?: string) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/dashboard'
  }
  return value
}

export default async function LoginPage({ searchParams }: { searchParams?: { next?: string } }) {
  const payload = await getPayloadClient()
  const headers = await getHeaders()
  const { user } = await payload.auth({ headers })

  if (user) {
    if (user.role === 'admin') {
      redirect('/admin')
    }
    redirect('/dashboard')
  }

  const nextPath = getSafeNextPath(searchParams?.next)

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12 lg:px-8 bg-gradient-to-br from-background to-muted/30">
      <div className="w-full max-w-5xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side - Hero Content */}
          <div className="flex flex-col justify-center space-y-8 lg:space-y-10 text-center lg:text-left">
            <div className="flex justify-center lg:justify-start">
              <Badge
                variant="secondary"
                className="rounded-full px-4 py-1.5 text-sm uppercase tracking-[0.2em]"
              >
                Tenant Access
              </Badge>
            </div>

            <div className="space-y-5">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight text-foreground">
                Selamat datang kembali di <span className="text-primary">Kos Dadan</span>
              </h1>

              <p className="max-w-md mx-auto lg:mx-0 text-base sm:text-lg text-muted-foreground">
                Masuk ke dashboard tenant untuk mengelola kamar, pembayaran, dan informasi penghuni.
              </p>
            </div>

            <div className="flex justify-center lg:justify-start">
              <Button asChild variant="ghost" size="lg" className="rounded-full group">
                <Link href="/" className="flex items-center gap-2">
                  <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                  Kembali ke Beranda
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Side - Login Card */}
          <div className="flex justify-center">
            <Card className="w-full max-w-[420px] border-border/60 shadow-xl bg-card/95 backdrop-blur-lg">
              <CardHeader className="space-y-3 pb-8">
                <CardTitle className="text-2xl">Login Penghuni</CardTitle>
                <CardDescription>
                  Gunakan email dan password yang diberikan oleh admin
                </CardDescription>
              </CardHeader>

              <CardContent>
                <LoginForm nextPath={nextPath} />
              </CardContent>

              <div className="px-6 pb-6 text-center">
                <p className="text-xs text-muted-foreground">
                  Belum punya akun? Hubungi admin untuk ditambahkan.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
