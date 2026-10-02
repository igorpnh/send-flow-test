import { logger } from 'firebase-functions'
import { onDocumentDeleted } from 'firebase-functions/v2/firestore'
import { db } from '../config.js'
import { parseTenantId } from '../models.js'

const CHILD_COLLECTIONS = ['contacts', 'messages'] as const

export const onConnectionDeleted = onDocumentDeleted('connections/{connectionId}', async (event) => {
  const { connectionId } = event.params
  const tenantId = parseTenantId(event.data?.data())
  if (!tenantId) return

  const writer = db.bulkWriter()
  const snapshots = await Promise.all(
    CHILD_COLLECTIONS.map((collection) =>
      db
        .collection(collection)
        .where('tenantId', '==', tenantId)
        .where('connectionId', '==', connectionId)
        .select()
        .get(),
    ),
  )
  snapshots.flatMap((snapshot) => snapshot.docs).forEach((doc) => writer.delete(doc.ref))
  await writer.close()

  logger.info(`Conexão ${connectionId} removida`, {
    contacts: snapshots[0].size,
    messages: snapshots[1].size,
  })
})
