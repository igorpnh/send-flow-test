import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import type { ContactInput } from './api'
import { formatPhone, isValidPhone, onlyDigits } from './phone'

type ContactFormDialogProps = {
  open: boolean
  initialValues?: ContactInput
  takenPhones: string[]
  onSubmit: (values: ContactInput) => Promise<void>
  onClose: () => void
}

const emptyContact: ContactInput = { name: '', phone: '' }

const buildContactSchema = (takenPhones: string[]) =>
  z.object({
    name: z.string().trim().min(1, 'Informe o nome do contato.').max(80, 'Máximo de 80 caracteres.'),
    phone: z
      .string()
      .refine(isValidPhone, 'Informe DDD + número, ex.: (11) 99999-8888.')
      .refine((phone) => !takenPhones.includes(onlyDigits(phone)), 'Já existe um contato com este telefone.'),
  })

export const ContactFormDialog = ({
  open,
  initialValues,
  takenPhones,
  onSubmit,
  onClose,
}: ContactFormDialogProps) => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(buildContactSchema(takenPhones)),
    values: initialValues ?? emptyContact,
  })

  const isEditing = Boolean(initialValues)

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ transition: { onExited: () => reset(emptyContact) } }}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogTitle>{isEditing ? 'Editar contato' : 'Novo contato'}</DialogTitle>
        <DialogContent className="flex flex-col gap-2">
          <TextField
            label="Nome"
            fullWidth
            autoFocus
            margin="dense"
            {...register('name')}
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
          />
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                onChange={(event) => field.onChange(formatPhone(event.target.value))}
                label="Telefone"
                placeholder="(11) 99999-8888"
                fullWidth
                margin="dense"
                slotProps={{ htmlInput: { inputMode: 'tel' } }}
                error={Boolean(errors.phone)}
                helperText={errors.phone?.message}
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" loading={isSubmitting}>
            {isEditing ? 'Salvar' : 'Adicionar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
