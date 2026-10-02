import { createContext, useContext } from 'react'
import type { AlertColor } from '@mui/material/Alert'

export type Notify = (message: string, severity?: AlertColor) => void

export const NotifierContext = createContext<Notify>(() => undefined)

export const useNotify = () => useContext(NotifierContext)
