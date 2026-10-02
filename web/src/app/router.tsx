import { createBrowserRouter, Navigate } from 'react-router'
import { LoginPage } from '../features/auth/LoginPage'
import { RequireAuth, RequireGuest } from '../features/auth/routes'
import { SignUpPage } from '../features/auth/SignUpPage'
import { ConnectionPage } from '../features/connections/ConnectionPage'
import { ConnectionsPage } from '../features/connections/ConnectionsPage'
import { ContactsPage } from '../features/contacts/ContactsPage'
import { BroadcastPage } from '../features/messages/BroadcastPage'
import { AppLayout, type RouteHandle } from '../shared/components/AppLayout'

export const router = createBrowserRouter([
  {
    element: <RequireGuest />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/cadastro', element: <SignUpPage /> },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <ConnectionsPage /> },
          {
            path: 'conexoes/:connectionId',
            element: <ConnectionPage />,
            children: [
              { index: true, element: <Navigate to="contatos" replace /> },
              { path: 'contatos', element: <ContactsPage /> },
              { path: 'broadcast', element: <BroadcastPage />, handle: { fullHeight: true } satisfies RouteHandle },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
