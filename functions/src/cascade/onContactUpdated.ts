import { onDocumentUpdated } from 'firebase-functions/v2/firestore'
import { db } from '../config.js'
import { refreshContactInScheduled } from '../contacts/syncScheduledRecipients.js'
import { parseContact } from '../models.js'

export const onContactUpdated = onDocumentUpdated('contacts/{contactId}', async (event) => {
  const before = parseContact(event.data?.before.data())
  const after = parseContact(event.data?.after.data())
  if (!before || !after || (before.name === after.name && before.phone === after.phone)) return

  await refreshContactInScheduled(db, after.tenantId, {
    id: event.params.contactId,
    name: after.name,
    phone: after.phone,
  })
})
