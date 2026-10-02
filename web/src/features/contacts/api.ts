import { FirebaseError } from 'firebase/app'
import { collection, doc, orderBy, query, serverTimestamp, where, writeBatch } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { subscribeList } from '../../lib/firestore'
import type { Contact } from '../../shared/types'
import { toE164 } from './phone'

export type ContactInput = { name: string; phone: string }

const contactsRef = collection(db, 'contacts')

const phoneLockRef = (connectionId: string, phone: string) => doc(db, 'contactPhones', `${connectionId}_${phone}`)

const toContactData = ({ name, phone }: ContactInput) => ({ name: name.trim(), phone: toE164(phone) })

export const subscribeContacts = (
  tenantId: string,
  connectionId: string,
  onData: (contacts: Contact[]) => void,
  onError: (error: Error) => void,
) =>
  subscribeList<Contact>(
    query(
      contactsRef,
      where('tenantId', '==', tenantId),
      where('connectionId', '==', connectionId),
      orderBy('name'),
    ),
    onData,
    onError,
  )

export const createContact = (tenantId: string, connectionId: string, input: ContactInput) => {
  const contactRef = doc(contactsRef)
  const data = toContactData(input)
  const batch = writeBatch(db)
  batch.set(contactRef, {
    tenantId,
    connectionId,
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  batch.set(phoneLockRef(connectionId, data.phone), { tenantId, contactId: contactRef.id })
  return batch.commit()
}

export const updateContact = (contact: Contact, input: ContactInput) => {
  const data = toContactData(input)
  const batch = writeBatch(db)
  batch.update(doc(contactsRef, contact.id), { ...data, updatedAt: serverTimestamp() })
  if (data.phone !== contact.phone) {
    batch.delete(phoneLockRef(contact.connectionId, contact.phone))
    batch.set(phoneLockRef(contact.connectionId, data.phone), { tenantId: contact.tenantId, contactId: contact.id })
  }
  return batch.commit()
}

export const deleteContact = (contact: Contact) => {
  const batch = writeBatch(db)
  batch.delete(doc(contactsRef, contact.id))
  batch.delete(phoneLockRef(contact.connectionId, contact.phone))
  return batch.commit()
}

export const isPhoneTakenError = (error: unknown) =>
  error instanceof FirebaseError && error.code === 'permission-denied'
