import type { ReactNode } from 'react'
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import ScheduleSendOutlinedIcon from '@mui/icons-material/ScheduleSendOutlined'
import { Logo } from '../../shared/components/Logo'
import { ThemeToggle } from '../../shared/components/ThemeToggle'

type AuthLayoutProps = { title: string; subtitle: string; children: ReactNode; footer: ReactNode }

const highlights = [
  {
    icon: <ScheduleSendOutlinedIcon fontSize="small" />,
    text: 'Agende e pode fechar a aba: a mensagem sai no horário certo.',
  },
  { icon: <BoltOutlinedIcon fontSize="small" />, text: 'Tudo em tempo real, sem apertar F5.' },
  { icon: <LockOutlinedIcon fontSize="small" />, text: 'Seus contatos ficam só com você.' },
]

export const AuthLayout = ({ title, subtitle, children, footer }: AuthLayoutProps) => (
  <div className="relative grid min-h-screen lg:grid-cols-2">
    <div className="absolute top-4 right-4">
      <ThemeToggle />
    </div>

    <aside className="hidden flex-col justify-between border-r-[1.5px] border-dashed border-line bg-surface-2/60 p-12 lg:flex">
      <Logo size="lg" />
      <div className="max-w-md">
        <p className="m-0 mb-3 font-mono text-xs tracking-widest text-muted uppercase">broadcast sem drama</p>
        <h2 className="m-0 font-display text-5xl leading-[1.05] font-semibold tracking-tight">
          Mensagens em massa, com <span className="italic text-ef-green">cara de bilhete</span>.
        </h2>
        <ul className="m-0 mt-8 flex list-none flex-col gap-3 p-0">
          {highlights.map(({ icon, text }) => (
            <li key={text} className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-lg border-[1.5px] border-ink bg-accent text-on-accent">
                {icon}
              </span>
              <span className="text-muted">{text}</span>
            </li>
          ))}
        </ul>
      </div>
      <span className="font-mono text-xs text-muted">feito à mão, servido pelo Firebase 🌲</span>
    </aside>

    <section className="flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 lg:hidden">
          <Logo />
        </div>
        <div className="rounded-2xl border-[1.5px] border-ink bg-surface p-6 shadow-hard sm:p-8">
          <h1 className="m-0 font-display text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="m-0 mt-1 mb-6 text-muted">{subtitle}</p>
          {children}
        </div>
        <div className="mt-6 text-center text-sm text-muted">{footer}</div>
      </div>
    </section>
  </div>
)
