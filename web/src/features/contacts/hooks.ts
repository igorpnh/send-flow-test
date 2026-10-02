import { useCallback } from 'react'
import { useSubscription, type Subscribe } from '../../shared/hooks/useSubscription'
import type { Contact } from '../../shared/types'
import { useCurrentUser } from '../auth/useAuth'
import { subscribeContacts } from './api'

export const useContacts = (connectionId: string) => {
  const { uid } = useCurrentUser()
  const subscribe = useCallback<Subscribe<Contact[]>>(
    (onData, onError) => subscribeContacts(uid, connectionId, onData, onError),
    [uid, connectionId],
  )
  return useSubscription(subscribe)
}
