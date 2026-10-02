import { readFileSync } from 'node:fs'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  type Firestore,
} from 'firebase/firestore'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

let env: RulesTestEnvironment

const ALICE = 'alice'
const BOB = 'bob'

const dbFor = (uid: string | null) =>
  (uid ? env.authenticatedContext(uid) : env.unauthenticatedContext()).firestore() as unknown as Firestore

const inOneHour = () => Timestamp.fromMillis(Date.now() + 60 * 60 * 1000)
const oneHourAgo = () => Timestamp.fromMillis(Date.now() - 60 * 60 * 1000)

const newConnection = (tenantId: string) => ({
  tenantId,
  name: 'Loja',
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
})

const SEEDED_PHONE = '+5511999998888'

const newContact = (tenantId: string, connectionId: string, phone = '+5521988887777') => ({
  tenantId,
  connectionId,
  name: 'Maria',
  phone,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
})

const lockPath = (connectionId: string, phone: string) => `contactPhones/${connectionId}_${phone}`

const createContact = (
  db: Firestore,
  contact: ReturnType<typeof newContact>,
  lock: { path?: string; contactId?: string } = {},
) => {
  const contactRef = doc(collection(db, 'contacts'))
  const batch = writeBatch(db)
  batch.set(contactRef, contact)
  batch.set(doc(db, lock.path ?? lockPath(contact.connectionId, contact.phone)), {
    tenantId: contact.tenantId,
    contactId: lock.contactId ?? contactRef.id,
  })
  return batch.commit()
}

const newScheduledMessage = (tenantId: string, connectionId: string, scheduledAt = inOneHour()) => ({
  tenantId,
  connectionId,
  contactIds: ['contact-1'],
  recipients: [{ id: 'contact-1', name: 'Maria', phone: '+5511999998888' }],
  body: 'Olá!',
  status: 'scheduled',
  scheduledAt,
  sentAt: null,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
})

const newSentMessage = (tenantId: string, connectionId: string) => ({
  ...newScheduledMessage(tenantId, connectionId),
  status: 'sent',
  scheduledAt: null,
  sentAt: serverTimestamp(),
})

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-sendflow-rules',
    firestore: { rules: readFileSync(new URL('../../firestore.rules', import.meta.url), 'utf8') },
  })
})

afterAll(() => env.cleanup())

beforeEach(async () => {
  await env.clearFirestore()
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore() as unknown as Firestore
    const seed = (path: string, data: object) => setDoc(doc(db, path), data)
    const now = Timestamp.now()
    for (const tenantId of [ALICE, BOB]) {
      const base = { tenantId, createdAt: now, updatedAt: now }
      await seed(`connections/${tenantId}-conn`, { ...base, name: 'Conexão' })
      await seed(`contacts/${tenantId}-contact`, {
        ...base,
        connectionId: `${tenantId}-conn`,
        name: 'Contato',
        phone: SEEDED_PHONE,
      })
      await seed(lockPath(`${tenantId}-conn`, SEEDED_PHONE), { tenantId, contactId: `${tenantId}-contact` })
      await seed(`messages/${tenantId}-scheduled`, {
        ...base,
        connectionId: `${tenantId}-conn`,
        contactIds: [`${tenantId}-contact`],
        recipients: [{ id: `${tenantId}-contact`, name: 'Contato', phone: '+5511999998888' }],
        body: 'Agendada',
        status: 'scheduled',
        scheduledAt: inOneHour(),
        sentAt: null,
      })
      await seed(`messages/${tenantId}-sent`, {
        ...base,
        connectionId: `${tenantId}-conn`,
        contactIds: [`${tenantId}-contact`],
        recipients: [{ id: `${tenantId}-contact`, name: 'Contato', phone: '+5511999998888' }],
        body: 'Enviada',
        status: 'sent',
        scheduledAt: null,
        sentAt: now,
      })
    }
  })
})

describe('isolamento entre tenants', () => {
  it('nega qualquer acesso sem autenticação', async () => {
    await assertFails(getDoc(doc(dbFor(null), 'connections/alice-conn')))
    await assertFails(addDoc(collection(dbFor(null), 'connections'), newConnection(ALICE)))
  })

  it.each(['connections/bob-conn', 'contacts/bob-contact', 'messages/bob-sent'])(
    'alice não lê %s',
    async (path) => {
      await assertFails(getDoc(doc(dbFor(ALICE), path)))
    },
  )

  it('alice lista apenas filtrando pelo próprio tenant', async () => {
    const db = dbFor(ALICE)
    await assertSucceeds(getDocs(query(collection(db, 'connections'), where('tenantId', '==', ALICE))))
    await assertFails(getDocs(collection(db, 'connections')))
    await assertFails(getDocs(query(collection(db, 'messages'), where('tenantId', '==', BOB))))
  })

  it('alice não cria documentos em nome de outro tenant', async () => {
    const db = dbFor(ALICE)
    await assertFails(addDoc(collection(db, 'connections'), newConnection(BOB)))
    await assertFails(createContact(db, newContact(BOB, 'bob-conn')))
  })

  it('alice não pendura contatos/mensagens na conexão do bob', async () => {
    const db = dbFor(ALICE)
    await assertFails(createContact(db, newContact(ALICE, 'bob-conn')))
    await assertFails(addDoc(collection(db, 'messages'), newScheduledMessage(ALICE, 'bob-conn')))
  })

  it('alice não edita nem exclui dados do bob', async () => {
    const db = dbFor(ALICE)
    await assertFails(updateDoc(doc(db, 'connections/bob-conn'), { name: 'x', updatedAt: serverTimestamp() }))
    await assertFails(deleteDoc(doc(db, 'connections/bob-conn')))
    await assertFails(deleteDoc(doc(db, 'contacts/bob-contact')))
    await assertFails(deleteDoc(doc(db, 'messages/bob-scheduled')))
  })

  it('o tenantId e o connectionId são imutáveis', async () => {
    const db = dbFor(ALICE)
    await assertFails(updateDoc(doc(db, 'connections/alice-conn'), { tenantId: BOB }))
    await assertFails(
      updateDoc(doc(db, 'contacts/alice-contact'), { connectionId: 'bob-conn', updatedAt: serverTimestamp() }),
    )
  })
})

describe('CRUD do próprio tenant', () => {
  it('alice gerencia suas conexões e contatos', async () => {
    const db = dbFor(ALICE)
    await assertSucceeds(addDoc(collection(db, 'connections'), newConnection(ALICE)))
    await assertSucceeds(
      updateDoc(doc(db, 'connections/alice-conn'), { name: 'Nova', updatedAt: serverTimestamp() }),
    )
    await assertSucceeds(createContact(db, newContact(ALICE, 'alice-conn')))
    await assertSucceeds(deleteDoc(doc(db, 'contacts/alice-contact')))
    await assertSucceeds(deleteDoc(doc(db, 'connections/alice-conn')))
  })

  it('valida o schema (campos extras, telefone e nome inválidos)', async () => {
    const db = dbFor(ALICE)
    await assertFails(addDoc(collection(db, 'connections'), { ...newConnection(ALICE), extra: true }))
    await assertFails(addDoc(collection(db, 'connections'), { ...newConnection(ALICE), name: '   ' }))
    await assertFails(
      createContact(db, { ...newContact(ALICE, 'alice-conn'), phone: '11999998888' }),
    )
  })
})

describe('telefone único por conexão', () => {
  it('contato sem a trava do telefone é negado', async () => {
    await assertFails(addDoc(collection(dbFor(ALICE), 'contacts'), newContact(ALICE, 'alice-conn')))
  })

  it('não cadastra um telefone que já existe na conexão', async () => {
    await assertFails(createContact(dbFor(ALICE), newContact(ALICE, 'alice-conn', SEEDED_PHONE)))
  })

  it('o mesmo telefone pode existir em outra conexão', async () => {
    const db = dbFor(ALICE)
    const other = await addDoc(collection(db, 'connections'), newConnection(ALICE))
    await assertSucceeds(createContact(db, newContact(ALICE, other.id, SEEDED_PHONE)))
  })

  it('a trava precisa corresponder ao telefone e ao próprio contato', async () => {
    const db = dbFor(ALICE)
    const contact = newContact(ALICE, 'alice-conn')
    await assertFails(createContact(db, contact, { path: lockPath('alice-conn', '+5531977776666') }))
    await assertFails(createContact(db, contact, { contactId: 'alice-contact' }))
  })

  it('trocar o telefone move a trava e libera o número antigo', async () => {
    const db = dbFor(ALICE)
    const newPhone = '+5531977776666'
    const batch = writeBatch(db)
    batch.update(doc(db, 'contacts/alice-contact'), { phone: newPhone, updatedAt: serverTimestamp() })
    batch.delete(doc(db, lockPath('alice-conn', SEEDED_PHONE)))
    batch.set(doc(db, lockPath('alice-conn', newPhone)), { tenantId: ALICE, contactId: 'alice-contact' })
    await assertSucceeds(batch.commit())

    await assertSucceeds(createContact(db, newContact(ALICE, 'alice-conn', SEEDED_PHONE)))
  })

  it('não troca para um telefone já usado nem sem reservar o novo', async () => {
    const db = dbFor(ALICE)
    await assertSucceeds(createContact(db, newContact(ALICE, 'alice-conn')))
    await assertFails(
      updateDoc(doc(db, 'contacts/alice-contact'), { phone: '+5521988887777', updatedAt: serverTimestamp() }),
    )
  })

  it('excluir o contato libera o telefone; a trava de um contato ativo não pode ser apagada', async () => {
    const db = dbFor(ALICE)
    await assertFails(deleteDoc(doc(db, lockPath('alice-conn', SEEDED_PHONE))))

    const batch = writeBatch(db)
    batch.delete(doc(db, 'contacts/alice-contact'))
    batch.delete(doc(db, lockPath('alice-conn', SEEDED_PHONE)))
    await assertSucceeds(batch.commit())

    await assertSucceeds(createContact(db, newContact(ALICE, 'alice-conn', SEEDED_PHONE)))
  })

  it('bob não mexe nas travas da alice', async () => {
    const db = dbFor(BOB)
    await assertFails(deleteDoc(doc(db, lockPath('alice-conn', SEEDED_PHONE))))
    await assertFails(
      setDoc(doc(db, lockPath('alice-conn', '+5531977776666')), { tenantId: BOB, contactId: 'alice-contact' }),
    )
  })
})

describe('mensagens', () => {
  it('cria mensagem enviada imediatamente ou agendada para o futuro', async () => {
    const db = dbFor(ALICE)
    await assertSucceeds(addDoc(collection(db, 'messages'), newSentMessage(ALICE, 'alice-conn')))
    await assertSucceeds(addDoc(collection(db, 'messages'), newScheduledMessage(ALICE, 'alice-conn')))
  })

  it('não agenda no passado nem cria sem destinatários', async () => {
    const db = dbFor(ALICE)
    await assertFails(addDoc(collection(db, 'messages'), newScheduledMessage(ALICE, 'alice-conn', oneHourAgo())))
    await assertFails(
      addDoc(collection(db, 'messages'), { ...newScheduledMessage(ALICE, 'alice-conn'), contactIds: [] }),
    )
  })

  it('exige o retrato dos destinatários, um por contactId', async () => {
    const db = dbFor(ALICE)
    const { recipients, ...withoutRecipients } = newScheduledMessage(ALICE, 'alice-conn')
    await assertFails(addDoc(collection(db, 'messages'), withoutRecipients))
    await assertFails(
      addDoc(collection(db, 'messages'), { ...withoutRecipients, recipients: [...recipients, ...recipients] }),
    )
    await assertFails(
      addDoc(collection(db, 'messages'), {
        ...withoutRecipients,
        recipients: [{ ...recipients[0], extra: true }],
      }),
    )
  })

  it('edita apenas mensagens agendadas', async () => {
    const db = dbFor(ALICE)
    const edit = { body: 'Editada', scheduledAt: inOneHour(), updatedAt: serverTimestamp() }
    await assertSucceeds(updateDoc(doc(db, 'messages/alice-scheduled'), edit))
    await assertFails(updateDoc(doc(db, 'messages/alice-sent'), edit))
  })

  it('o cliente não consegue forçar scheduled -> sent', async () => {
    await assertFails(
      updateDoc(doc(dbFor(ALICE), 'messages/alice-scheduled'), {
        status: 'sent',
        sentAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    )
  })

  it('exclui mensagens enviadas e agendadas', async () => {
    const db = dbFor(ALICE)
    await assertSucceeds(deleteDoc(doc(db, 'messages/alice-sent')))
    await assertSucceeds(deleteDoc(doc(db, 'messages/alice-scheduled')))
  })

  it('pagina e conta as próprias mensagens, mas não conta sem filtrar por tenant', async () => {
    const messages = collection(dbFor(ALICE), 'messages')
    const own = [where('tenantId', '==', ALICE), where('connectionId', '==', 'alice-conn')] as const

    const page = await assertSucceeds(
      getDocs(query(messages, ...own, where('status', '==', 'sent'), orderBy('createdAt', 'desc'), limit(11))),
    )
    expect(page.docs.map((snapshot) => snapshot.id)).toEqual(['alice-sent'])

    const count = await assertSucceeds(getCountFromServer(query(messages, ...own)))
    expect(count.data().count).toBe(2)

    await assertFails(getCountFromServer(query(messages, where('connectionId', '==', 'bob-conn'))))
  })
})
