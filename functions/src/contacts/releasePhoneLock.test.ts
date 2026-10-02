import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { beforeEach, describe, expect, it } from 'vitest'
import { releasePhoneLock } from './releasePhoneLock.js'

const db = getFirestore(initializeApp({ projectId: 'demo-sendflow' }, 'phone-lock-test'))

const lockRef = db.doc('contactPhones/conn_+5511999998888')
const contact = { id: 'ana', connectionId: 'conn', phone: '+5511999998888' }

describe('releasePhoneLock', () => {
  beforeEach(async () => {
    await db.recursiveDelete(db.collection('contactPhones'))
  })

  it('libera a trava do contato excluído', async () => {
    await lockRef.set({ tenantId: 'alice', contactId: 'ana' })

    expect(await releasePhoneLock(db, contact)).toBe(true)
    expect((await lockRef.get()).exists).toBe(false)
  })

  it('não mexe na trava que já pertence a outro contato', async () => {
    await lockRef.set({ tenantId: 'alice', contactId: 'bruno' })

    expect(await releasePhoneLock(db, contact)).toBe(false)
    expect((await lockRef.get()).get('contactId')).toBe('bruno')
  })
})
