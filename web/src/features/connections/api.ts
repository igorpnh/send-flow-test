import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { subscribeDoc, subscribeList } from '../../lib/firestore'
import type { Connection } from '../../shared/types'

export type ConnectionInput = { name: string }

const connectionsRef = collection(db, 'connections')

export const subscribeConnections = (
  tenantId: string,
  onData: (connections: Connection[]) => void,
  onError: (error: Error) => void,
) =>
  subscribeList<Connection>(
    query(connectionsRef, where('tenantId', '==', tenantId), orderBy('createdAt', 'desc')),
    onData,
    onError,
  )

export const subscribeConnection = (
  connectionId: string,
  onData: (connection: Connection | null) => void,
  onError: (error: Error) => void,
) => subscribeDoc<Connection>(doc(connectionsRef, connectionId), onData, onError)

export const createConnection = (tenantId: string, { name }: ConnectionInput) =>
  addDoc(connectionsRef, {
    tenantId,
    name: name.trim(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

export const updateConnection = (connectionId: string, { name }: ConnectionInput) =>
  updateDoc(doc(connectionsRef, connectionId), { name: name.trim(), updatedAt: serverTimestamp() })

export const deleteConnection = (connectionId: string) => deleteDoc(doc(connectionsRef, connectionId))
