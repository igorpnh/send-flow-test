import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import type { ConnectionInput } from './api'

const connectionSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome da conexão.').max(80, 'Máximo de 80 caracteres.'),
})

const emptyConnection: ConnectionInput = { name: '' }

type ConnectionFormDialogProps = {
  open: boolean
  initialValues?: ConnectionInput
  onSubmit: (values: ConnectionInput) => Promise<void>
  onClose: () => void
}

export const ConnectionFormDialog = ({ open, initialValues, onSubmit, onClose }: ConnectionFormDialogProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ConnectionInput>({
    resolver: zodResolver(connectionSchema),
    values: initialValues ?? emptyConnection,
  })

  const isEditing = Boolean(initialValues)

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ transition: { onExited: () => reset(emptyConnection) } }}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogTitle>{isEditing ? 'Editar conexão' : 'Nova conexão'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Nome"
            fullWidth
            autoFocus
            margin="dense"
            {...register('name')}
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" loading={isSubmitting}>
            {isEditing ? 'Salvar' : 'Criar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
