import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/pt-br'
import type { Timestamp } from 'firebase/firestore'

dayjs.extend(relativeTime)
dayjs.locale('pt-br')

export const formatDateTime = (timestamp: Timestamp | null | undefined) =>
  timestamp ? dayjs(timestamp.toDate()).format('DD/MM/YYYY [às] HH:mm') : '—'

export const formatRelative = (timestamp: Timestamp | null | undefined, now: Date) =>
  timestamp ? dayjs(timestamp.toDate()).from(now) : ''
