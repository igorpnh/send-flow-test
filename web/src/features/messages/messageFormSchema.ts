import dayjs, { type Dayjs } from 'dayjs'
import { z } from 'zod'

export const MAX_BODY_LENGTH = 1000

export const messageFormSchema = z
  .object({
    contactIds: z.array(z.string()).min(1, 'Selecione pelo menos um contato.'),
    body: z
      .string()
      .trim()
      .min(1, 'Escreva a mensagem.')
      .max(MAX_BODY_LENGTH, `Máximo de ${MAX_BODY_LENGTH} caracteres.`),
    mode: z.enum(['now', 'schedule']),
    scheduledAt: z.custom<Dayjs>((value) => dayjs.isDayjs(value)).nullable(),
  })
  .refine((values) => values.mode === 'now' || values.scheduledAt?.isAfter(dayjs()), {
    path: ['scheduledAt'],
    message: 'Escolha uma data e horário futuros.',
  })

export type MessageFormValues = z.infer<typeof messageFormSchema>

export const emptyMessageForm: MessageFormValues = {
  contactIds: [],
  body: '',
  mode: 'now',
  scheduledAt: null,
}
