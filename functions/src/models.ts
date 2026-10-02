import type { DocumentData } from 'firebase-admin/firestore'

export type Recipient = { id: string; name: string; phone: string }

export type ContactData = { tenantId: string; connectionId: string; name: string; phone: string }

export type ScheduledMessageData = { contactIds: string[]; recipients?: Recipient[] }

type Fields = Record<string, unknown>

const isString = (value: unknown): value is string => typeof value === 'string'

const isStringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every(isString)

const isRecipient = (value: unknown): value is Recipient =>
  typeof value === 'object' &&
  value !== null &&
  'id' in value &&
  'name' in value &&
  'phone' in value &&
  isString(value.id) &&
  isString(value.name) &&
  isString(value.phone)

export const parseTenantId = (data: DocumentData | undefined): string | null => {
  const fields: Fields | undefined = data
  return isString(fields?.tenantId) ? fields.tenantId : null
}

export const parseContact = (data: DocumentData | undefined): ContactData | null => {
  const fields: Fields | undefined = data
  if (!fields) return null
  const { tenantId, connectionId, name, phone } = fields
  if (!isString(tenantId) || !isString(connectionId) || !isString(name) || !isString(phone)) return null
  return { tenantId, connectionId, name, phone }
}

export const parseScheduledMessage = (data: DocumentData): ScheduledMessageData | null => {
  const fields: Fields = data
  const { contactIds, recipients } = fields
  if (!isStringArray(contactIds)) return null
  if (recipients === undefined) return { contactIds }
  if (!Array.isArray(recipients) || !recipients.every(isRecipient)) return null
  return { contactIds, recipients }
}
