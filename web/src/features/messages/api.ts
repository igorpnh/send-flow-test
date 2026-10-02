import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  limit,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { subscribeList } from '../../lib/firestore'
import type { Message, MessageStatus, Recipient } from '../../shared/types'

export type MessageInput = {
  recipients: Recipient[]
  body: string
  scheduledAt: Date | null
}

const messagesRef = collection(db, 'messages')

export type MessagePageQuery = {
  status: MessageStatus | null
  pageSize: number
}

export type MessagePage = { messages: Message[]; hasMore: boolean }

const connectionMessages = (tenantId: string, connectionId: string) => [
  where('tenantId', '==', tenantId),
  where('connectionId', '==', connectionId),
]

export const subscribeMessages = (
  tenantId: string,
  connectionId: string,
  { status, pageSize }: MessagePageQuery,
  onData: (page: MessagePage) => void,
  onError: (error: Error) => void,
) =>
  subscribeList<Message>(
    query(
      messagesRef,
      ...connectionMessages(tenantId, connectionId),
      ...(status ? [where('status', '==', status)] : []),
      orderBy('createdAt', 'desc'),
      limit(pageSize + 1),
    ),
    (messages) => onData({ messages: messages.slice(0, pageSize), hasMore: messages.length > pageSize }),
    onError,
  )

export type MessageCounts = Record<'all' | MessageStatus, number>

export const countMessages = async (tenantId: string, connectionId: string): Promise<MessageCounts> => {
  const base = connectionMessages(tenantId, connectionId)
  const [all, scheduled] = await Promise.all([
    getCountFromServer(query(messagesRef, ...base)),
    getCountFromServer(query(messagesRef, ...base, where('status', '==', 'scheduled'))),
  ])
  const total = all.data().count
  const scheduledCount = scheduled.data().count
  return { all: total, scheduled: scheduledCount, sent: total - scheduledCount }
}

export const createMessage = (
  tenantId: string,
  connectionId: string,
  { recipients, body, scheduledAt }: MessageInput,
) =>
  addDoc(messagesRef, {
    tenantId,
    connectionId,
    contactIds: recipients.map((recipient) => recipient.id),
    recipients,
    body: body.trim(),
    ...(scheduledAt
      ? { status: 'scheduled', scheduledAt: Timestamp.fromDate(scheduledAt), sentAt: null }
      : { status: 'sent', scheduledAt: null, sentAt: serverTimestamp() }),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

export const updateScheduledMessage = (
  messageId: string,
  { recipients, body, scheduledAt }: MessageInput & { scheduledAt: Date },
) =>
  updateDoc(doc(messagesRef, messageId), {
    contactIds: recipients.map((recipient) => recipient.id),
    recipients,
    body: body.trim(),
    scheduledAt: Timestamp.fromDate(scheduledAt),
    updatedAt: serverTimestamp(),
  })

export const deleteMessage = (messageId: string) => deleteDoc(doc(messagesRef, messageId))
