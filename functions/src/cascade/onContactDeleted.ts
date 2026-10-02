import { logger } from 'firebase-functions'
import { onDocumentDeleted } from 'firebase-functions/v2/firestore'
import { db } from '../config.js'
import { releasePhoneLock } from '../contacts/releasePhoneLock.js'
import { removeContactFromScheduled } from '../contacts/syncScheduledRecipients.js'
import { parseContact } from '../models.js'

export const onContactDeleted = onDocumentDeleted('contacts/{contactId}', async (event) => {
  const { contactId } = event.params
  const contact = parseContact(event.data?.data())
  if (!contact) return

  const [changed] = await Promise.all([
    removeContactFromScheduled(db, contact.tenantId, contactId),
    releasePhoneLock(db, { id: contactId, connectionId: contact.connectionId, phone: contact.phone }),
  ])
  logger.info(`Contato ${contactId} removido de ${changed} mensagem(ns) agendada(s)`)
})
