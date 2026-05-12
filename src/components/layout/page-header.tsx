import type { ReactNode } from 'react'

import { Badge } from '@/components/ui/badge'

interface PageHeaderProps {
  badge?: string
  title: string
  description?: string
  actions?: ReactNode
}

export function PageHeader({
  badge,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <section className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm backdrop-blur md:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          {badge && (
            <Badge
              variant="secondary"
              className="rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em]"
            >
              {badge}
            </Badge>
          )}

          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {title}
            </h1>

            {description && (
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                {description}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </section>
  )
}