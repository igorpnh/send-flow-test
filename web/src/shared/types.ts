import type { Timestamp } from 'firebase/firestore'
import type { WithId } from '../lib/firestore'

type TenantOwned = {
  tenantId: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type Connection = WithId<TenantOwned & { name: string }>

export type Contact = WithId<
  TenantOwned & {
    connectionId: string
    name: string
    phone: string
  }
>

export type MessageStatus = 'scheduled' | 'sent'

export type Recipient = { id: string; name: string; phone: string }

export type Message = WithId<
  TenantOwned & {
    connectionId: string
    contactIds: string[]
    recipients?: Recipient[]
    body: string
    status: MessageStatus
    scheduledAt: Timestamp | null
    sentAt: Timestamp | null
  }
>
