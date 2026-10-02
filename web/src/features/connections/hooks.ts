import { useCallback } from 'react'
import { useSubscription, type Subscribe } from '../../shared/hooks/useSubscription'
import type { Connection } from '../../shared/types'
import { useCurrentUser } from '../auth/useAuth'
import { subscribeConnection, subscribeConnections } from './api'

export const useConnections = () => {
  const { uid } = useCurrentUser()
  const subscribe = useCallback<Subscribe<Connection[]>>(
    (onData, onError) => subscribeConnections(uid, onData, onError),
    [uid],
  )
  return useSubscription(subscribe)
}

export const useConnection = (connectionId: string) => {
  const subscribe = useCallback<Subscribe<Connection | null>>(
    (onData, onError) => subscribeConnection(connectionId, onData, onError),
    [connectionId],
  )
  return useSubscription(subscribe)
}
