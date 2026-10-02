import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { setGlobalOptions } from 'firebase-functions/v2'

export const REGION = 'southamerica-east1'

setGlobalOptions({ region: REGION, maxInstances: 10 })

initializeApp()

export const db = getFirestore()
