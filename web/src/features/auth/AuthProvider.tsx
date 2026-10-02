import { useEffect, useState, type ReactNode } from 'react'
import { onIdTokenChanged } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import { AuthContext, type AuthState } from './authContext'

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({ user: null, loading: true })

  useEffect(() => onIdTokenChanged(auth, (user) => setState({ user, loading: false })), [])

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}
