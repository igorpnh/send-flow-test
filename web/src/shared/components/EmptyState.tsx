import type { ReactNode } from 'react'

type EmptyStateProps = {
  icon: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center gap-3 rounded-2xl border-[1.5px] border-dashed border-line bg-surface/60 px-6 py-14 text-center">
    <div className="mb-1 flex size-16 rotate-3 items-center justify-center rounded-[40%_60%_55%_45%] border-[1.5px] border-ink bg-tint-green text-ef-green shadow-hard-sm [&_svg]:text-3xl">
      {icon}
    </div>
    <h2 className="m-0 font-display text-xl font-semibold">{title}</h2>
    {description && <p className="m-0 max-w-md text-sm text-muted">{description}</p>}
    {action && <div className="mt-2">{action}</div>}
  </div>
)
