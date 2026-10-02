import { FieldValue, type Firestore } from 'firebase-admin/firestore'
import { parseScheduledMessage, type Recipient, type ScheduledMessageData } from '../models.js'

type Change = { delete: true } | { contactIds: string[]; recipients?: Recipient[] } | null

const scheduledMessagesWith = (db: Firestore, tenantId: string, contactId: string) =>
  db
    .collection('messages')
    .where('tenantId', '==', tenantId)
    .where('status', '==', 'scheduled')
    .where('contactIds', 'array-contains', contactId)
    .get()

const updateScheduled = async (
  db: Firestore,
  tenantId: string,
  contactId: string,
  change: (message: ScheduledMessageData) => Change,
) => {
  const messages = await scheduledMessagesWith(db, tenantId, contactId)
  const writer = db.bulkWriter()
  writer.onWriteError(() => false)

  const writes = messages.docs.flatMap((message) => {
    const data = parseScheduledMessage(message.data())
    const result = data && change(data)
    if (!result) return []
    const precondition = { lastUpdateTime: message.updateTime }
    if ('delete' in result) return [writer.delete(message.ref, precondition)]
    return [
      writer.update(
        message.ref,
        {
          contactIds: result.contactIds,
          ...(result.recipients && { recipients: result.recipients }),
          updatedAt: FieldValue.serverTimestamp(),
        },
        precondition,
      ),
    ]
  })

  const settled = Promise.allSettled(writes)
  await writer.close()
  return (await settled).filter((write) => write.status === 'fulfilled').length
}

export const removeContactFromScheduled = (db: Firestore, tenantId: string, contactId: string) =>
  updateScheduled(db, tenantId, contactId, (message) => {
    const contactIds = message.contactIds.filter((id) => id !== contactId)
    if (contactIds.length === 0) return { delete: true }
    return { contactIds, recipients: message.recipients?.filter((recipient) => recipient.id !== contactId) }
  })

export const refreshContactInScheduled = (db: Firestore, tenantId: string, contact: Recipient) =>
  updateScheduled(db, tenantId, contact.id, (message) => {
    if (!message.recipients) return null
    return {
      contactIds: message.contactIds,
      recipients: message.recipients.map((recipient) => (recipient.id === contact.id ? contact : recipient)),
    }
  })
