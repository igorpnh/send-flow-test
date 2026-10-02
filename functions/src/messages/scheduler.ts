import { logger } from 'firebase-functions'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { db } from '../config.js'
import { dispatchDueMessages } from './dispatchDueMessages.js'

export const dispatchScheduledMessages = onSchedule(
  { schedule: 'every 1 minutes', timeZone: 'America/Sao_Paulo', retryCount: 0 },
  async () => {
    const dispatched = await dispatchDueMessages(db)
    if (dispatched > 0) logger.info(`Mensagens agendadas enviadas: ${dispatched}`)
  },
)
