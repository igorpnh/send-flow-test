import type { ReactNode } from 'react'

type PageHeaderProps = {
  eyebrow?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
}

export const PageHeader = ({ eyebrow, title, subtitle, action }: PageHeaderProps) => (
  <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
    <div className="flex flex-col gap-1">
      {eyebrow && <span className="font-mono text-xs tracking-widest text-muted uppercase">{eyebrow}</span>}
      <h1 className="m-0 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      {subtitle && <p className="m-0 max-w-xl text-muted">{subtitle}</p>}
    </div>
    {action}
  </div>
)
