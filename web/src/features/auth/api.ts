import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth'
import { FirebaseError } from 'firebase/app'
import { auth } from '../../lib/firebase'

export const signUp = async ({ name, email, password }: { name: string; email: string; password: string }) => {
  const { user } = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(user, { displayName: name })
  await user.getIdToken(true)
  return user
}

export const signIn = ({ email, password }: { email: string; password: string }) =>
  signInWithEmailAndPassword(auth, email, password)

export const signOut = () => firebaseSignOut(auth)

const authErrorMessages: Record<string, string> = {
  'auth/email-already-in-use': 'Já existe uma conta com este e-mail.',
  'auth/invalid-email': 'E-mail inválido.',
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/wrong-password': 'E-mail ou senha incorretos.',
  'auth/user-not-found': 'E-mail ou senha incorretos.',
  'auth/weak-password': 'A senha não atende aos requisitos de segurança.',
  'auth/password-does-not-meet-requirements': 'A senha não atende aos requisitos de segurança.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
  'auth/network-request-failed': 'Falha de conexão. Verifique sua internet.',
}

export const getAuthErrorMessage = (error: unknown) =>
  (error instanceof FirebaseError && authErrorMessages[error.code]) ||
  'Não foi possível concluir a operação. Tente novamente.'
