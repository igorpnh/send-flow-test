import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link as RouterLink } from 'react-router'
import { z } from 'zod'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import TextField from '@mui/material/TextField'
import { getAuthErrorMessage, signIn } from './api'
import { AuthLayout } from './AuthLayout'

const loginSchema = z.object({
  email: z.email('Informe um e-mail válido.'),
  password: z.string().min(1, 'Informe a senha.'),
})

type LoginForm = z.infer<typeof loginSchema>

export const LoginPage = () => {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } })

  const onSubmit = async (values: LoginForm) => {
    setSubmitError(null)
    try {
      await signIn(values)
    } catch (error) {
      setSubmitError(getAuthErrorMessage(error))
    }
  }

  return (
    <AuthLayout
      title="Que bom te ver de novo"
      subtitle="Entre para continuar seus disparos."
      footer={
        <>
          Ainda não tem conta?{' '}
          <Link component={RouterLink} to="/cadastro">
            Cadastre-se
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        {submitError && <Alert severity="error">{submitError}</Alert>}
        <TextField
          label="E-mail"
          type="email"
          autoComplete="email"
          autoFocus
          {...register('email')}
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
        />
        <TextField
          label="Senha"
          type="password"
          autoComplete="current-password"
          {...register('password')}
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
        />
        <Button type="submit" variant="contained" size="large" loading={isSubmitting}>
          Entrar
        </Button>
      </form>
    </AuthLayout>
  )
}
