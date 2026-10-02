import { useContext } from 'react'
import { AuthContext } from './authContext'

export const useAuth = () => useContext(AuthContext)

export const useCurrentUser = () => {
  const { user } = useAuth()
  if (!user) throw new Error('useCurrentUser deve ser usado dentro de uma rota autenticada')
  return user
}
