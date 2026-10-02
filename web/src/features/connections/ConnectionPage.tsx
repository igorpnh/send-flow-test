import { Link as RouterLink, Outlet, useLocation, useParams } from 'react-router'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import ContactsOutlinedIcon from '@mui/icons-material/ContactsOutlined'
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined'
import { InitialsAvatar } from '../../shared/components/InitialsAvatar'
import { ErrorState, LoadingState } from '../../shared/components/PageState'
import type { Connection } from '../../shared/types'
import { useConnection } from './hooks'

export type ConnectionOutletContext = { connection: Connection }

export const ConnectionPage = () => {
  const { connectionId = '' } = useParams()
  const { pathname } = useLocation()
  const { data: connection, loading, error } = useConnection(connectionId)

  if (loading) return <LoadingState />
  if (error || !connection) return <ErrorState message="Conexão não encontrada." />

  const basePath = `/conexoes/${connection.id}`
  const currentTab = pathname.endsWith('/broadcast') ? 'broadcast' : 'contatos'

  return (
    <div key={connection.id} className="flex min-h-0 flex-1 flex-col">
      <RouterLink
        to="/"
        className="mb-4 inline-flex items-center gap-1 font-mono text-xs tracking-widest text-muted uppercase no-underline hover:text-fg"
      >
        <ArrowBackRoundedIcon sx={{ fontSize: 14 }} /> conexões
      </RouterLink>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <InitialsAvatar id={connection.id} name={connection.name} size="lg" square />
        <h1 className="m-0 min-w-0 flex-1 truncate font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {connection.name}
        </h1>
      </div>
      <Tabs value={currentTab} className="mb-6 shrink-0" variant="scrollable" scrollButtons={false}>
        <Tab
          value="contatos"
          label="Contatos"
          icon={<ContactsOutlinedIcon fontSize="small" />}
          iconPosition="start"
          component={RouterLink}
          to={`${basePath}/contatos`}
        />
        <Tab
          value="broadcast"
          label="Broadcast"
          icon={<CampaignOutlinedIcon fontSize="small" />}
          iconPosition="start"
          component={RouterLink}
          to={`${basePath}/broadcast`}
        />
      </Tabs>
      <Outlet context={{ connection } satisfies ConnectionOutletContext} />
    </div>
  )
}
