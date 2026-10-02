import { useState } from 'react'
import { Link as RouterLink } from 'react-router'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import HubOutlinedIcon from '@mui/icons-material/HubOutlined'
import { formatDateTime } from '../../lib/date'
import { ConfirmDialog } from '../../shared/components/ConfirmDialog'
import { EmptyState } from '../../shared/components/EmptyState'
import { InitialsAvatar } from '../../shared/components/InitialsAvatar'
import { PageHeader } from '../../shared/components/PageHeader'
import { ErrorState, LoadingState } from '../../shared/components/PageState'
import { useNotify } from '../../shared/notifier/context'
import type { Connection } from '../../shared/types'
import { useCurrentUser } from '../auth/useAuth'
import { createConnection, deleteConnection, updateConnection, type ConnectionInput } from './api'
import { ConnectionFormDialog } from './ConnectionFormDialog'
import { useConnections } from './hooks'

type DialogState = { type: 'create' } | { type: 'edit' | 'delete'; connection: Connection } | null

export const ConnectionsPage = () => {
  const { uid } = useCurrentUser()
  const { data: connections, loading, error } = useConnections()
  const [dialog, setDialog] = useState<DialogState>(null)
  const notify = useNotify()
  const closeDialog = () => setDialog(null)

  const handleSave = async (values: ConnectionInput) => {
    try {
      if (dialog?.type === 'edit') {
        await updateConnection(dialog.connection.id, values)
        notify('Conexão atualizada.')
      } else {
        await createConnection(uid, values)
        notify('Conexão criada.')
      }
      closeDialog()
    } catch {
      notify('Não foi possível salvar a conexão.', 'error')
    }
  }

  const handleDelete = async () => {
    if (dialog?.type !== 'delete') return
    try {
      await deleteConnection(dialog.connection.id)
      notify('Conexão excluída.')
    } catch {
      notify('Não foi possível excluir a conexão.', 'error')
    }
  }

  const createButton = (
    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog({ type: 'create' })}>
      Nova conexão
    </Button>
  )

  const renderContent = () => {
    if (loading) return <LoadingState />
    if (error || !connections) return <ErrorState />
    if (connections.length === 0)
      return (
        <EmptyState
          icon={<HubOutlinedIcon />}
          title="Tudo quietinho por aqui"
          description="Crie sua primeira conexão para começar a cadastrar contatos e disparar mensagens."
          action={createButton}
        />
      )

    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {connections.map((connection) => (
          <Card
            key={connection.id}
            className="group flex flex-col transition-transform duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5"
          >
            <CardActionArea component={RouterLink} to={`/conexoes/${connection.id}`} className="flex-1">
              <CardContent className="flex items-start gap-3 p-5">
                <InitialsAvatar id={connection.id} name={connection.name} size="lg" square />
                <div className="min-w-0 flex-1">
                  <h2 className="m-0 truncate font-display text-xl font-semibold">{connection.name}</h2>
                  <p className="m-0 mt-1 font-mono text-xs text-muted">
                    desde {formatDateTime(connection.createdAt)}
                  </p>
                </div>
              </CardContent>
            </CardActionArea>
            <CardActions className="justify-between border-t-[1.5px] border-dashed border-line px-3">
              <Button component={RouterLink} to={`/conexoes/${connection.id}`} size="small">
                Abrir
                <span className="ml-1 inline-block transition-transform group-hover:translate-x-1">→</span>
              </Button>
              <div>
                <Tooltip title="Editar">
                  <IconButton aria-label="Editar" onClick={() => setDialog({ type: 'edit', connection })}>
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Excluir">
                  <IconButton
                    aria-label="Excluir"
                    color="error"
                    onClick={() => setDialog({ type: 'delete', connection })}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </div>
            </CardActions>
          </Card>
        ))}
        <button
          type="button"
          onClick={() => setDialog({ type: 'create' })}
          className="flex min-h-36 cursor-pointer flex-col items-center justify-center gap-1 rounded-[14px] border-[1.5px] border-dashed border-line bg-transparent font-sans text-muted transition-colors hover:border-ink hover:bg-surface/60 hover:text-fg"
        >
          <AddIcon />
          <span className="font-semibold">Nova conexão</span>
        </button>
      </div>
    )
  }

  return (
    <>
      <PageHeader
        eyebrow="seu espaço"
        title="Conexões"
        subtitle="Cada conexão é um cantinho com seus próprios contatos e mensagens."
        action={createButton}
      />
      {renderContent()}
      <ConnectionFormDialog
        open={dialog?.type === 'create' || dialog?.type === 'edit'}
        initialValues={dialog?.type === 'edit' ? { name: dialog.connection.name } : undefined}
        onSubmit={handleSave}
        onClose={closeDialog}
      />
      <ConfirmDialog
        open={dialog?.type === 'delete'}
        title="Excluir conexão"
        description={`A conexão "${dialog?.type === 'delete' ? dialog.connection.name : ''}" e todos os seus contatos e mensagens serão excluídos. Essa ação não pode ser desfeita.`}
        onConfirm={handleDelete}
        onClose={closeDialog}
      />
    </>
  )
}
