import type { Contact, Message, Recipient } from '../../shared/types'

export const toRecipient = ({ id, name, phone }: Contact): Recipient => ({ id, name, phone })

export type RecipientView = Recipient & { deleted: boolean }

export const recipientsOf = (message: Message, contactsById: Map<string, Contact>): RecipientView[] =>
  (message.recipients ?? message.contactIds.map((id) => contactsById.get(id) ?? { id, name: 'Contato removido', phone: '' })).map(
    ({ id, name, phone }) => ({ id, name, phone, deleted: !contactsById.has(id) }),
  )
