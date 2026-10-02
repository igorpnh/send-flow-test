import { initializeApp } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { beforeEach, describe, expect, it } from 'vitest'
import { dispatchDueMessages } from './dispatchDueMessages.js'

const db = getFirestore(initializeApp({ projectId: 'demo-sendflow' }, 'dispatch-test'))

const MINUTE = 60 * 1000

const seedMessage = (id: string, status: 'scheduled' | 'sent', scheduledAtOffset: number) =>
  db.doc(`messages/${id}`).set({
    tenantId: 'alice',
    connectionId: 'conn',
    contactIds: ['c1'],
    body: id,
    status,
    scheduledAt: Timestamp.fromMillis(Date.now() + scheduledAtOffset),
    sentAt: null,
  })

const statusOf = async (id: string) => (await db.doc(`messages/${id}`).get()).get('status')

describe('dispatchDueMessages', () => {
  beforeEach(async () => {
    await db.recursiveDelete(db.collection('messages'))
  })

  it('marca como enviadas apenas as mensagens agendadas que já venceram', async () => {
    await Promise.all([
      seedMessage('due', 'scheduled', -MINUTE),
      seedMessage('future', 'scheduled', 10 * MINUTE),
      seedMessage('already-sent', 'sent', -MINUTE),
    ])

    const dispatched = await dispatchDueMessages(db)

    expect(dispatched).toBe(1)
    expect(await statusOf('due')).toBe('sent')
    expect(await statusOf('future')).toBe('scheduled')
    expect((await db.doc('messages/due').get()).get('sentAt')).toBeInstanceOf(Timestamp)
  })

  it('é idempotente', async () => {
    await seedMessage('due', 'scheduled', -MINUTE)

    expect(await dispatchDueMessages(db)).toBe(1)
    expect(await dispatchDueMessages(db)).toBe(0)
  })
})
