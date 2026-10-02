import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Autocomplete from '@mui/material/Autocomplete'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import ScheduleIcon from '@mui/icons-material/Schedule'
import SendIcon from '@mui/icons-material/Send'
import type { Contact } from '../../shared/types'
import { fromE164 } from '../contacts/phone'
import type { MessageInput } from './api'
import { toRecipient } from './recipients'
import {
  emptyMessageForm,
  MAX_BODY_LENGTH,
  messageFormSchema,
  type MessageFormValues,
} from './messageFormSchema'

type MessageFormProps = {
  contacts: Contact[]
  defaultValues?: MessageFormValues
  allowSendNow?: boolean
  onSubmit: (input: MessageInput) => Promise<boolean>
  onCancel?: () => void
}

export const MessageForm = ({
  contacts,
  defaultValues = emptyMessageForm,
  allowSendNow = true,
  onSubmit,
  onCancel,
}: MessageFormProps) => {
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MessageFormValues>({ resolver: zodResolver(messageFormSchema), defaultValues })

  const [mode, body, contactIds] = useWatch({ control, name: ['mode', 'body', 'contactIds'] })
  const allSelected = contacts.length > 0 && contactIds.length === contacts.length

  const submit = async (values: MessageFormValues) => {
    const succeeded = await onSubmit({
      recipients: contacts.filter((contact) => values.contactIds.includes(contact.id)).map(toRecipient),
      body: values.body,
      scheduledAt: values.mode === 'schedule' && values.scheduledAt ? values.scheduledAt.toDate() : null,
    })
    if (succeeded && allowSendNow) reset(emptyMessageForm)
  }

  const toggleAll = () =>
    setValue('contactIds', allSelected ? [] : contacts.map((contact) => contact.id), {
      shouldValidate: true,
    })

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
      <Controller
        name="contactIds"
        control={control}
        render={({ field }) => (
          <Autocomplete
            multiple
            disableCloseOnSelect
            limitTags={3}
            options={contacts}
            value={contacts.filter((contact) => field.value.includes(contact.id))}
            onChange={(_, selected) => field.onChange(selected.map((contact) => contact.id))}
            getOptionLabel={(contact) => contact.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            noOptionsText="Nenhum contato encontrado"
            renderOption={({ key, ...props }, contact, { selected }) => (
              <li key={key} {...props}>
                <Checkbox size="small" checked={selected} className="mr-1" />
                <div>
                  <div>{contact.name}</div>
                  <div className="font-mono text-xs text-muted">{fromE164(contact.phone)}</div>
                </div>
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Destinatários"
                placeholder={field.value.length ? '' : 'Selecione os contatos'}
                error={Boolean(errors.contactIds)}
                helperText={errors.contactIds?.message ?? `${field.value.length} de ${contacts.length} selecionados`}
              />
            )}
          />
        )}
      />
      <div className="-mt-2 flex justify-end">
        <Button size="small" onClick={toggleAll} disabled={contacts.length === 0}>
          {allSelected ? 'Limpar seleção' : 'Selecionar todos'}
        </Button>
      </div>

      <TextField
        label="Mensagem"
        multiline
        minRows={4}
        maxRows={12}
        {...register('body')}
        error={Boolean(errors.body)}
        helperText={errors.body?.message ?? `${body.length}/${MAX_BODY_LENGTH}`}
        slotProps={{ htmlInput: { maxLength: MAX_BODY_LENGTH } }}
      />

      {allowSendNow && (
        <Controller
          name="mode"
          control={control}
          render={({ field }) => (
            <ToggleButtonGroup
              exclusive
              fullWidth
              size="small"
              color="primary"
              value={field.value}
              onChange={(_, value) => value && field.onChange(value)}
            >
              <ToggleButton value="now">
                <SendIcon fontSize="small" className="mr-2" /> Enviar agora
              </ToggleButton>
              <ToggleButton value="schedule">
                <ScheduleIcon fontSize="small" className="mr-2" /> Agendar
              </ToggleButton>
            </ToggleButtonGroup>
          )}
        />
      )}

      {mode === 'schedule' && (
        <Controller
          name="scheduledAt"
          control={control}
          render={({ field }) => (
            <DateTimePicker
              label="Data e horário do envio"
              value={field.value}
              onChange={field.onChange}
              disablePast
              ampm={false}
              slotProps={{
                textField: {
                  error: Boolean(errors.scheduledAt),
                  helperText: errors.scheduledAt?.message,
                },
              }}
            />
          )}
        />
      )}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          variant="contained"
          loading={isSubmitting}
          startIcon={mode === 'schedule' ? <ScheduleIcon /> : <SendIcon />}
        >
          {!allowSendNow ? 'Salvar' : mode === 'schedule' ? 'Agendar mensagem' : 'Enviar mensagem'}
        </Button>
      </div>
    </form>
  )
}
