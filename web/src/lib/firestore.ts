import {
  onSnapshot,
  type DocumentReference,
  type DocumentSnapshot,
  type Query,
  type Unsubscribe,
} from 'firebase/firestore'

export type WithId<T> = T & { id: string }

type OnError = (error: Error) => void

const toEntity = <T>(snapshot: DocumentSnapshot): WithId<T> =>
  ({ id: snapshot.id, ...snapshot.data({ serverTimestamps: 'estimate' }) }) as WithId<T>

const logged =
  (onError: OnError): OnError =>
  (error) => {
    console.error(error)
    onError(error)
  }

export const subscribeList = <T>(
  query: Query,
  onData: (items: WithId<T>[]) => void,
  onError: OnError,
): Unsubscribe => onSnapshot(query, (snapshot) => onData(snapshot.docs.map(toEntity<T>)), logged(onError))

export const subscribeDoc = <T>(
  ref: DocumentReference,
  onData: (item: WithId<T> | null) => void,
  onError: OnError,
): Unsubscribe =>
  onSnapshot(ref, (snapshot) => onData(snapshot.exists() ? toEntity<T>(snapshot) : null), logged(onError))
