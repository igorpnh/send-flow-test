import { useCallback, useEffect, useState } from 'react'
import { useSubscription, type Subscribe } from '../../shared/hooks/useSubscription'
import { useCurrentUser } from '../auth/useAuth'
import { countMessages, subscribeMessages, type MessageCounts, type MessagePage, type MessagePageQuery } from './api'

export const useMessages = (connectionId: string, { status, pageSize }: MessagePageQuery) => {
  const { uid } = useCurrentUser()
  const subscribe = useCallback<Subscribe<MessagePage>>(
    (onData, onError) => subscribeMessages(uid, connectionId, { status, pageSize }, onData, onError),
    [uid, connectionId, status, pageSize],
  )
  return useSubscription(subscribe, { keepPreviousData: true })
}

export const useMessageCounts = (connectionId: string, refreshKey: unknown) => {
  const { uid } = useCurrentUser()
  const [counts, setCounts] = useState<MessageCounts | null>(null)

  useEffect(() => {
    let active = true
    countMessages(uid, connectionId)
      .then((result) => active && setCounts(result))
      .catch(() => active && setCounts(null))
    return () => {
      active = false
    }
  }, [uid, connectionId, refreshKey])

  return counts
}
