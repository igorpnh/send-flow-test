import dayjs from 'dayjs'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import type { Contact, Message } from '../../shared/types'
import type { MessageInput } from './api'
import { MessageForm } from './MessageForm'

type MessageEditDialogProps = {
  message: Message | null
  contacts: Contact[]
  onSubmit: (input: MessageInput) => Promise<boolean>
  onClose: () => void
}

export const MessageEditDialog = ({ message, contacts, onSubmit, onClose }: MessageEditDialogProps) => (
  <Dialog open={Boolean(message)} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Editar mensagem agendada</DialogTitle>
    <DialogContent className="pt-2!">
      {message && (
        <MessageForm
          key={message.id}
          contacts={contacts}
          allowSendNow={false}
          defaultValues={{
            contactIds: message.contactIds,
            body: message.body,
            mode: 'schedule',
            scheduledAt: message.scheduledAt ? dayjs(message.scheduledAt.toDate()) : null,
          }}
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      )}
    </DialogContent>
  </Dialog>
)
