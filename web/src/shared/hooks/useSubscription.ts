import { useEffect, useState } from 'react'
import type { Unsubscribe } from 'firebase/firestore'

export type Subscribe<T> = (onData: (data: T) => void, onError: (error: Error) => void) => Unsubscribe

type SubscriptionState<T> = {
  data: T | undefined
  error: Error | null
  source: Subscribe<T> | null
}

type SubscriptionOptions = {
  keepPreviousData?: boolean
}

export const useSubscription = <T>(
  subscribe: Subscribe<T> | null,
  { keepPreviousData = false }: SubscriptionOptions = {},
) => {
  const [state, setState] = useState<SubscriptionState<T>>({
    data: undefined,
    error: null,
    source: null,
  })

  useEffect(() => {
    if (!subscribe) return
    return subscribe(
      (data) => setState({ data, error: null, source: subscribe }),
      (error) => setState({ data: undefined, error, source: subscribe }),
    )
  }, [subscribe])

  const isCurrent = state.source === subscribe
  return {
    data: isCurrent || keepPreviousData ? state.data : undefined,
    error: isCurrent ? state.error : null,
    loading: Boolean(subscribe) && !isCurrent,
  }
}
