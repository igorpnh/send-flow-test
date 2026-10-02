import { useMemo, useState } from 'react'
import { FirebaseError } from 'firebase/app'
import { Link as RouterLink, useOutletContext } from 'react-router'
import Button from '@mui/material/Button'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import ContactsOutlinedIcon from '@mui/icons-material/ContactsOutlined'
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined'
import { ConfirmDialog } from '../../shared/components/ConfirmDialog'
import { EmptyState } from '../../shared/components/EmptyState'
import { ErrorState, LoadingState } from '../../shared/components/PageState'
import { useNotify } from '../../shared/notifier/context'
import type { Message, MessageStatus } from '../../shared/types'
import { useCurrentUser } from '../auth/useAuth'
import type { ConnectionOutletContext } from '../connections/ConnectionPage'
import { useContacts } from '../contacts/hooks'
import { createMessage, deleteMessage, updateScheduledMessage, type MessageInput } from './api'
import { useMessageCounts, useMessages } from './hooks'
import { MessageEditDialog } from './MessageEditDialog'
import { MessageForm } from './MessageForm'
import { MessageList } from './MessageList'

const PAGE_SIZE = 10

const messagesErrorText = (error: Error) =>
  error instanceof FirebaseError && error.code === 'failed-precondition'
    ? 'O índice deste filtro ainda está sendo criado no banco. Tente novamente em alguns minutos.'
    : 'Não foi possível carregar as mensagens.'

type StatusFilter = 'all' | MessageStatus

const STATUS_FILTERS: StatusFilter[] = ['all', 'sent', 'scheduled']

const filterLabels: Record<StatusFilter, string> = {
  all: 'Todas',
  sent: 'Enviadas',
  scheduled: 'Agendadas',
}

const emptyTitles: Record<StatusFilter, string> = {
  all: 'Nenhuma mensagem por enquanto',
  sent: 'Nada enviado ainda',
  scheduled: 'Nada agendado',
}

export const BroadcastPage = () => {
  const { connection } = useOutletContext<ConnectionOutletContext>()
  const { uid } = useCurrentUser()
  const contactsState = useContacts(connection.id)
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [pageSize, setPageSize] = useState(PAGE_SIZE)
  const messagesState = useMessages(connection.id, { status: filter === 'all' ? null : filter, pageSize })
  const counts = useMessageCounts(connection.id, messagesState.data)
  const [editing, setEditing] = useState<Message | null>(null)
  const [deleting, setDeleting] = useState<Message | null>(null)
  const notify = useNotify()

  const contacts = useMemo(() => contactsState.data ?? [], [contactsState.data])
  const contactsById = useMemo(() => new Map(contacts.map((contact) => [contact.id, contact])), [contacts])
  const messages = messagesState.data?.messages ?? []
  const hasMore = messagesState.data?.hasMore ?? false
  const total = counts?.[filter]

  const changeFilter = (value: StatusFilter) => {
    setFilter(value)
    setPageSize(PAGE_SIZE)
  }

  const handleCreate = async (input: MessageInput) => {
    try {
      await createMessage(uid, connection.id, input)
      notify(input.scheduledAt ? 'Mensagem agendada.' : 'Mensagem enviada.')
      return true
    } catch {
      notify('Não foi possível salvar a mensagem.', 'error')
      return false
    }
  }

  const handleUpdate = async (input: MessageInput) => {
    if (!editing || !input.scheduledAt) return false
    try {
      await updateScheduledMessage(editing.id, { ...input, scheduledAt: input.scheduledAt })
      notify('Mensagem atualizada.')
      setEditing(null)
      return true
    } catch {
      notify('Não foi possível atualizar. A mensagem pode já ter sido enviada.', 'error')
      return false
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    try {
      await deleteMessage(deleting.id)
      notify('Mensagem excluída.')
    } catch {
      notify('Não foi possível excluir a mensagem.', 'error')
    }
  }

  if (contactsState.error) return <ErrorState />
  if (contactsState.loading || (!messagesState.data && !messagesState.error)) return <LoadingState />

  return (
    <div className="grid grid-cols-1 gap-6 lg:min-h-0 lg:flex-1 lg:grid-cols-5 lg:grid-rows-[minmax(0,1fr)]">
      <section className="h-fit rounded-2xl border-[1.5px] border-ink bg-surface p-5 shadow-hard scrollbar-ef lg:col-span-2 lg:max-h-full lg:overflow-y-auto">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="m-0 font-display text-2xl font-semibold">Nova mensagem</h2>
          <span className="max-w-40 rotate-3 truncate rounded-md border-[1.5px] border-dashed border-line px-2 py-0.5 font-mono text-[11px] tracking-wider text-muted uppercase">
            {connection.name}
          </span>
        </div>
        {contacts.length === 0 ? (
          <EmptyState
            icon={<ContactsOutlinedIcon />}
            title="Falta gente pra receber"
            description="Cadastre contatos nesta conexão para começar a disparar."
            action={
              <Button component={RouterLink} to={`/conexoes/${connection.id}/contatos`} variant="outlined">
                Ir para contatos
              </Button>
            }
          />
        ) : (
          <MessageForm contacts={contacts} onSubmit={handleCreate} />
        )}
      </section>

      <section className="flex flex-col lg:col-span-3 lg:min-h-96">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="m-0 font-display text-2xl font-semibold">Mensagens</h2>
          <ToggleButtonGroup
            exclusive
            size="small"
            color="primary"
            value={filter}
            onChange={(_, value: StatusFilter | null) => value && changeFilter(value)}
          >
            {STATUS_FILTERS.map((key) => (
              <ToggleButton key={key} value={key}>
                {filterLabels[key]}
                {counts && <span className="ml-1.5 font-mono text-xs opacity-70">{counts[key]}</span>}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </div>
        <div
          className={`scrollbar-ef pt-2 pb-4 transition-opacity lg:-mr-3 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-3 lg:scroll-fade ${messagesState.loading ? 'opacity-60' : ''}`}
        >
          {messagesState.error ? (
            <ErrorState message={messagesErrorText(messagesState.error)} />
          ) : messages.length === 0 ? (
            <EmptyState
              icon={<ForumOutlinedIcon />}
              title={emptyTitles[filter]}
              description="Assim que você enviar ou agendar algo, aparece aqui na hora — sem recarregar."
            />
          ) : (
            <>
              <MessageList
                messages={messages}
                contactsById={contactsById}
                onEdit={setEditing}
                onDelete={setDeleting}
              />
              <div className="mt-5 flex flex-col items-center gap-3">
                <span className="font-mono text-xs text-muted">
                  mostrando {messages.length}
                  {total !== undefined && ` de ${total}`}
                </span>
                {hasMore && (
                  <Button
                    variant="outlined"
                    loading={messagesState.loading}
                    onClick={() => setPageSize((size) => size + PAGE_SIZE)}
                  >
                    Carregar mais
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      <MessageEditDialog
        message={editing}
        contacts={contacts}
        onSubmit={handleUpdate}
        onClose={() => setEditing(null)}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Excluir mensagem"
        description="A mensagem será excluída permanentemente."
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  )
}
