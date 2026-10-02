import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link as RouterLink } from 'react-router'
import { z } from 'zod'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import TextField from '@mui/material/TextField'
import { getAuthErrorMessage, signUp } from './api'
import { AuthLayout } from './AuthLayout'
import { passwordSchema } from './password'
import { PasswordChecklist } from './PasswordChecklist'

const signUpSchema = z
  .object({
    name: z.string().trim().min(2, 'Informe seu nome.').max(80, 'Máximo de 80 caracteres.'),
    email: z.email('Informe um e-mail válido.'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não coincidem.',
  })

type SignUpForm = z.infer<typeof signUpSchema>

export const SignUpPage = () => {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })
  const password = useWatch({ control, name: 'password' })

  const onSubmit = async ({ name, email, password }: SignUpForm) => {
    setSubmitError(null)
    try {
      await signUp({ name, email, password })
    } catch (error) {
      setSubmitError(getAuthErrorMessage(error))
    }
  }

  return (
    <AuthLayout
      title="Bora começar?"
      subtitle="Crie sua conta em menos de um minuto."
      footer={
        <>
          Já tem uma conta?{' '}
          <Link component={RouterLink} to="/login">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        {submitError && <Alert severity="error">{submitError}</Alert>}
        <TextField
          label="Nome"
          autoComplete="name"
          autoFocus
          {...register('name')}
          error={Boolean(errors.name)}
          helperText={errors.name?.message}
        />
        <TextField
          label="E-mail"
          type="email"
          autoComplete="email"
          {...register('email')}
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
        />
        <TextField
          label="Senha"
          type="password"
          autoComplete="new-password"
          {...register('password')}
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
        />
        <PasswordChecklist value={password} />
        <TextField
          label="Confirmar senha"
          type="password"
          autoComplete="new-password"
          {...register('confirmPassword')}
          error={Boolean(errors.confirmPassword)}
          helperText={errors.confirmPassword?.message}
        />
        <Button type="submit" variant="contained" size="large" loading={isSubmitting}>
          Criar conta
        </Button>
      </form>
    </AuthLayout>
  )
}
