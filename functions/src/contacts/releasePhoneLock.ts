import type { Firestore } from 'firebase-admin/firestore'
import type { ContactData } from '../models.js'

type DeletedContact = Pick<ContactData, 'connectionId' | 'phone'> & { id: string }

export const releasePhoneLock = (db: Firestore, { id, connectionId, phone }: DeletedContact): Promise<boolean> =>
  db.runTransaction(async (transaction) => {
    const lockRef = db.doc(`contactPhones/${connectionId}_${phone}`)
    const lock = await transaction.get(lockRef)
    const owner: unknown = lock.get('contactId')
    if (owner !== id) return false
    transaction.delete(lockRef)
    return true
  })
