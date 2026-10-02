import type { ReactNode } from 'react'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded'
import ScheduleIcon from '@mui/icons-material/Schedule'
import { formatDateTime, formatRelative } from '../../lib/date'
import { InitialsAvatar } from '../../shared/components/InitialsAvatar'
import { useNow } from '../../shared/hooks/useNow'
import type { Contact, Message } from '../../shared/types'
import { fromE164 } from '../contacts/phone'
import { recipientsOf, type RecipientView } from './recipients'

const MAX_VISIBLE_RECIPIENTS = 4

const describeRecipient = ({ name, phone, deleted }: RecipientView) =>
  [name, phone && fromE164(phone), deleted && 'contato excluído'].filter(Boolean).join(' · ')

type StampVariant = 'sent' | 'scheduled' | 'dispatching'

const stamps: Record<StampVariant, { label: string; icon: ReactNode; className: string; bar: string }> = {
  sent: {
    label: 'Enviada',
    icon: <DoneAllIcon sx={{ fontSize: 14 }} />,
    className: 'border-ef-green bg-tint-green text-ef-green',
    bar: 'bg-ef-green',
  },
  scheduled: {
    label: 'Agendada',
    icon: <ScheduleIcon sx={{ fontSize: 14 }} />,
    className: 'border-ef-yellow bg-tint-yellow text-ef-yellow',
    bar: 'bg-ef-yellow',
  },
  dispatching: {
    label: 'Enviando…',
    icon: <HourglassTopRoundedIcon sx={{ fontSize: 14 }} />,
    className: 'border-ef-blue bg-tint-blue text-ef-blue animate-pulse',
    bar: 'bg-ef-blue',
  },
}

const Stamp = ({ variant }: { variant: StampVariant }) => {
  const stamp = stamps[variant]
  return (
    <span
      className={`inline-flex -rotate-2 items-center gap-1 rounded-md border-[1.5px] border-dashed px-2 py-0.5 font-mono text-[11px] font-semibold tracking-wider uppercase ${stamp.className}`}
    >
      {stamp.icon}
      {stamp.label}
    </span>
  )
}

type MessageCardProps = {
  message: Message
  contactsById: Map<string, Contact>
  now: Date
  onEdit: (message: Message) => void
  onDelete: (message: Message) => void
}

const MessageCard = ({ message, contactsById, now, onEdit, onDelete }: MessageCardProps) => {
  const recipients = recipientsOf(message, contactsById)
  const isDue = message.status === 'scheduled' && (message.scheduledAt?.toMillis() ?? 0) <= now.getTime()
  const variant: StampVariant = message.status === 'sent' ? 'sent' : isDue ? 'dispatching' : 'scheduled'
  const when = message.status === 'sent' ? message.sentAt : message.scheduledAt

  return (
    <article className="relative overflow-hidden rounded-[14px] border-[1.5px] border-ink bg-surface shadow-hard">
      <span aria-hidden className={`absolute inset-y-0 left-0 w-1.5 ${stamps[variant].bar}`} />
      <div className="flex flex-col gap-3 py-4 pr-3 pl-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Stamp variant={variant} />
          <span className="flex-1 font-mono text-xs text-muted">
            {message.status === 'sent' ? 'enviada ' : 'para '}
            {formatDateTime(when)}
            <span className="hidden sm:inline"> · {formatRelative(when, now)}</span>
          </span>
          <div className="-my-1 flex">
            {message.status === 'scheduled' && !isDue && (
              <Tooltip title="Editar">
                <IconButton size="small" aria-label="Editar" onClick={() => onEdit(message)}>
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Excluir">
              <IconButton size="small" color="error" aria-label="Excluir" onClick={() => onDelete(message)}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        <p className="m-0 pr-3 leading-relaxed break-words whitespace-pre-wrap">{message.body}</p>

        <div className="flex flex-wrap items-center gap-2 border-t-[1.5px] border-dashed border-line pt-3">
          <span className="font-mono text-[11px] tracking-wider text-muted uppercase">para</span>
          {recipients.length === 0 ? (
            <span className="text-xs text-muted">Nenhum destinatário</span>
          ) : (
            <>
              <div className="flex -space-x-1">
                {recipients.slice(0, MAX_VISIBLE_RECIPIENTS).map((recipient) => (
                  <Tooltip key={recipient.id} title={describeRecipient(recipient)}>
                    <span className={recipient.deleted ? 'opacity-50 grayscale' : undefined}>
                      <InitialsAvatar id={recipient.id} name={recipient.name} size="sm" />
                    </span>
                  </Tooltip>
                ))}
              </div>
              <span className="min-w-0 truncate text-sm text-muted">
                {recipients.slice(0, 2).map((recipient, index) => (
                  <span key={recipient.id}>
                    {index > 0 && ', '}
                    <span className={recipient.deleted ? 'italic' : undefined}>
                      {recipient.name}
                      {recipient.deleted && ' (excluído)'}
                    </span>
                  </span>
                ))}
                {recipients.length > 2 && (
                  <Tooltip
                    title={recipients
                      .slice(2)
                      .map((recipient) => recipient.name + (recipient.deleted ? ' (excluído)' : ''))
                      .join(', ')}
                  >
                    <span className="cursor-default font-semibold text-fg">
                      {' '}
                      +{recipients.length - 2}
                    </span>
                  </Tooltip>
                )}
              </span>
            </>
          )}
        </div>
      </div>
    </article>
  )
}

type MessageListProps = Omit<MessageCardProps, 'message' | 'now'> & { messages: Message[] }

export const MessageList = ({ messages, ...cardProps }: MessageListProps) => {
  const now = useNow()

  return (
    <div className="flex flex-col gap-4">
      {messages.map((message) => (
        <MessageCard key={message.id} message={message} now={now} {...cardProps} />
      ))}
    </div>
  )
}
