import Link from 'next/link'

import { Button } from '@/components/ui/button'

interface BackButtonProps {
  href?: string
  label?: string
}

export function BackButton({ href = '/dashboard', label = '← Kembali' }: BackButtonProps) {
  return (
    <Button asChild variant="ghost" size="sm" className="rounded-full px-2.5">
      <Link href={href}>{label}</Link>
    </Button>
  )
}
