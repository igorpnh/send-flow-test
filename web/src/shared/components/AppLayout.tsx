import { Link, Outlet, useMatches } from 'react-router'
import Button from '@mui/material/Button'
import LogoutIcon from '@mui/icons-material/Logout'
import { signOut } from '../../features/auth/api'
import { useCurrentUser } from '../../features/auth/useAuth'
import { InitialsAvatar } from './InitialsAvatar'
import { Logo } from './Logo'
import { ThemeToggle } from './ThemeToggle'

export type RouteHandle = { fullHeight?: boolean }

const isFullHeight = (handle: unknown): boolean =>
  typeof handle === 'object' && handle !== null && 'fullHeight' in handle && handle.fullHeight === true

export const AppLayout = () => {
  const user = useCurrentUser()
  const displayName = user.displayName || user.email || 'Você'
  const fullHeight = useMatches().some((match) => isFullHeight(match.handle))

  return (
    <div className={`flex min-h-screen flex-col ${fullHeight ? 'lg:h-dvh lg:min-h-0' : ''}`}>
      <header className="sticky top-0 z-10 border-b-[1.5px] border-dashed border-line bg-paper/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4">
          <Link to="/" className="no-underline" aria-label="Início">
            <Logo />
          </Link>
          <div className="flex-1" />
          <ThemeToggle />
          <div className="hidden items-center gap-2 rounded-full border-[1.5px] border-line bg-surface py-1 pr-3 pl-1 sm:flex">
            <InitialsAvatar id={user.uid} name={displayName} size="sm" />
            <span className="max-w-48 truncate text-sm font-medium">{displayName}</span>
          </div>
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={() => signOut()}>
            Sair
          </Button>
        </div>
      </header>
      <main className={`mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:py-10 ${fullHeight ? 'lg:min-h-0 lg:pb-4' : ''}`}>
        <Outlet />
      </main>
    </div>
  )
}
