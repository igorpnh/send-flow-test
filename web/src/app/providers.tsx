import type { ReactNode } from 'react'
import GlobalStyles from '@mui/material/GlobalStyles'
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import 'dayjs/locale/pt-br'
import { AuthProvider } from '../features/auth/AuthProvider'
import { NotifierProvider } from '../shared/notifier/NotifierProvider'
import { theme } from './theme'

export const Providers = ({ children }: { children: ReactNode }) => (
  <StyledEngineProvider enableCssLayer>
    <GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
    <ThemeProvider theme={theme} disableTransitionOnChange>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
        <NotifierProvider>
          <AuthProvider>{children}</AuthProvider>
        </NotifierProvider>
      </LocalizationProvider>
    </ThemeProvider>
  </StyledEngineProvider>
)
