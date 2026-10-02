import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { useColorScheme } from '@mui/material/styles'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'

export const ThemeToggle = () => {
  const { mode, systemMode, setMode } = useColorScheme()
  const resolved = mode === 'system' ? systemMode : mode
  if (!resolved) return null

  const isDark = resolved === 'dark'
  const label = isDark ? 'Usar tema claro' : 'Usar tema escuro'

  return (
    <Tooltip title={label}>
      <IconButton aria-label={label} onClick={() => setMode(isDark ? 'light' : 'dark')}>
        {isDark ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
      </IconButton>
    </Tooltip>
  )
}
