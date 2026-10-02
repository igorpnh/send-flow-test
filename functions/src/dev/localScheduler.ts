import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { dispatchDueMessages } from '../messages/dispatchDueMessages.js'

const INTERVAL_MS = 60_000

process.env.FIRESTORE_EMULATOR_HOST ??= '127.0.0.1:8085'

const db = getFirestore(initializeApp({ projectId: process.env.GCLOUD_PROJECT ?? 'demo-sendflow' }))

const tick = async (): Promise<void> => {
  const time = new Date().toLocaleTimeString('pt-BR')
  try {
    const dispatched = await dispatchDueMessages(db)
    if (dispatched > 0) console.log(`[${time}] scheduler local: ${dispatched} mensagem(ns) enviada(s)`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[${time}] scheduler local falhou:`, message)
  }
}

console.log(`Scheduler local ativo (Firestore em ${process.env.FIRESTORE_EMULATOR_HOST}), a cada ${INTERVAL_MS / 1000}s.`)
await tick()
setInterval(tick, INTERVAL_MS)
