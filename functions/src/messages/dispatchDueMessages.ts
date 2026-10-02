import { FieldValue, Timestamp, type Firestore } from 'firebase-admin/firestore'

const PAGE_SIZE = 500
const MAX_PAGES = 20

export const dispatchDueMessages = async (db: Firestore, now: Timestamp = Timestamp.now()) => {
  const dueMessagesQuery = db
    .collection('messages')
    .where('status', '==', 'scheduled')
    .where('scheduledAt', '<=', now)
    .orderBy('scheduledAt')
    .limit(PAGE_SIZE)

  let dispatched = 0

  for (let page = 0; page < MAX_PAGES; page++) {
    const snapshot = await dueMessagesQuery.get()
    if (snapshot.empty) break

    const writer = db.bulkWriter()
    writer.onWriteError(() => false)
    const writes = snapshot.docs.map((message) =>
      writer
        .update(
          message.ref,
          { status: 'sent', sentAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() },
          { lastUpdateTime: message.updateTime },
        )
        .then(
          () => true,
          () => false,
        ),
    )
    await writer.close()
    const results = await Promise.all(writes)
    const succeeded = results.filter(Boolean).length
    dispatched += succeeded

    if (snapshot.size < PAGE_SIZE || succeeded === 0) break
  }

  return dispatched
}
