import { useCallback, useState, type ReactNode } from 'react'
import Alert, { type AlertColor } from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import { NotifierContext, type Notify } from './context'

type Notification = { key: number; message: string; severity: AlertColor }

export const NotifierProvider = ({ children }: { children: ReactNode }) => {
  const [notification, setNotification] = useState<Notification | null>(null)

  const notify = useCallback<Notify>(
    (message, severity = 'success') => setNotification({ key: Date.now(), message, severity }),
    [],
  )

  const close = () => setNotification(null)

  return (
    <NotifierContext.Provider value={notify}>
      {children}
      <Snackbar
        key={notification?.key}
        open={Boolean(notification)}
        autoHideDuration={4000}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={close} severity={notification?.severity} variant="filled" className="w-full">
          {notification?.message}
        </Alert>
      </Snackbar>
    </NotifierContext.Provider>
  )
}
