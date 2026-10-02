import { initializeApp } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { beforeEach, describe, expect, it } from 'vitest'
import type { Recipient } from '../models.js'
import { refreshContactInScheduled, removeContactFromScheduled } from './syncScheduledRecipients.js'

const db = getFirestore(initializeApp({ projectId: 'demo-sendflow' }, 'recipients-test'))

const ana: Recipient = { id: 'ana', name: 'Ana', phone: '+5511999998888' }
const bruno: Recipient = { id: 'bruno', name: 'Bruno', phone: '+5521988887777' }

const seed = (id: string, status: 'scheduled' | 'sent', recipients: Recipient[], tenantId = 'alice') =>
  db.doc(`messages/${id}`).set({
    tenantId,
    connectionId: 'conn',
    contactIds: recipients.map((recipient) => recipient.id),
    recipients,
    body: id,
    status,
    scheduledAt: status === 'scheduled' ? Timestamp.fromMillis(Date.now() + 60_000) : null,
    sentAt: status === 'sent' ? Timestamp.now() : null,
  })

const read = async (id: string) => (await db.doc(`messages/${id}`).get()).data()

describe('retrato dos destinatários', () => {
  beforeEach(async () => {
    await db.recursiveDelete(db.collection('messages'))
  })

  it('ao excluir um contato, só as agendadas perdem o destinatário', async () => {
    await Promise.all([
      seed('sent', 'sent', [ana, bruno]),
      seed('scheduled', 'scheduled', [ana, bruno]),
      seed('only-ana', 'scheduled', [ana]),
      seed('other-tenant', 'scheduled', [ana], 'bob'),
    ])

    expect(await removeContactFromScheduled(db, 'alice', 'ana')).toBe(2)

    expect((await read('sent'))?.recipients).toEqual([ana, bruno])
    expect(await read('scheduled')).toMatchObject({ contactIds: ['bruno'], recipients: [bruno] })
    expect(await read('only-ana')).toBeUndefined()
    expect((await read('other-tenant'))?.recipients).toEqual([ana])
  })

  it('mensagens antigas sem retrato só perdem o id', async () => {
    await db.doc('messages/legacy').set({
      tenantId: 'alice',
      contactIds: ['ana', 'bruno'],
      status: 'scheduled',
    })

    await removeContactFromScheduled(db, 'alice', 'ana')

    const legacy = await read('legacy')
    expect(legacy?.contactIds).toEqual(['bruno'])
    expect(legacy?.recipients).toBeUndefined()
  })

  it('ao editar um contato, só as agendadas recebem o nome/telefone novo', async () => {
    await Promise.all([seed('sent', 'sent', [ana, bruno]), seed('scheduled', 'scheduled', [ana, bruno])])
    const renamed = { ...ana, name: 'Ana Souza' }

    await refreshContactInScheduled(db, 'alice', renamed)

    expect((await read('sent'))?.recipients).toEqual([ana, bruno])
    expect((await read('scheduled'))?.recipients).toEqual([renamed, bruno])
  })
})
