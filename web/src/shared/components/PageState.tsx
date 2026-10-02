import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'

export const LoadingState = () => (
  <div className="flex flex-col items-center gap-3 py-20 text-muted">
    <CircularProgress size={28} thickness={5} />
    <span className="font-mono text-xs tracking-widest uppercase">carregando…</span>
  </div>
)

export const ErrorState = ({ message = 'Não foi possível carregar os dados.' }: { message?: string }) => (
  <Alert severity="error" variant="outlined">
    {message}
  </Alert>
)
