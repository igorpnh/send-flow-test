import { createTheme } from '@mui/material/styles'
import { ptBR } from '@mui/material/locale'
import { ptBR as datePickersPtBR } from '@mui/x-date-pickers/locales'

const everforest = {
  light: {
    bg: '#f4f0d9',
    surface: '#fdf6e3',
    fg: '#3a4549',
    muted: '#63736c',
    border: '#d8d3ba',
    green: '#4f7a28',
    aqua: '#2f7d63',
    yellow: '#8a6500',
    red: '#c4372f',
    blue: '#2f6f94',
    onColor: '#fdf6e3',
  },
  dark: {
    bg: '#2d353b',
    surface: '#343f44',
    fg: '#d3c6aa',
    muted: '#9da9a0',
    border: '#4f585e',
    green: '#a7c080',
    aqua: '#83c092',
    yellow: '#dbbc7f',
    red: '#e67e80',
    blue: '#7fbbb3',
    onColor: '#2d353b',
  },
}

type Scheme = (typeof everforest)['light']

const buildPalette = (scheme: Scheme) => ({
  primary: { main: scheme.green, contrastText: scheme.onColor },
  secondary: { main: scheme.aqua, contrastText: scheme.onColor },
  success: { main: scheme.green, contrastText: scheme.onColor },
  warning: { main: scheme.yellow, contrastText: scheme.onColor },
  error: { main: scheme.red, contrastText: scheme.onColor },
  info: { main: scheme.blue, contrastText: scheme.onColor },
  background: { default: scheme.bg, paper: scheme.surface },
  text: { primary: scheme.fg, secondary: scheme.muted },
  divider: scheme.border,
})

const hardShadow = (size: number) => `${size}px ${size}px 0 var(--ef-ink)`

export const theme = createTheme(
  {
    cssVariables: { colorSchemeSelector: 'class' },
    colorSchemes: {
      light: { palette: buildPalette(everforest.light) },
      dark: { palette: buildPalette(everforest.dark) },
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: 'var(--font-sans)',
      h1: { fontFamily: 'var(--font-display)', fontWeight: 600 },
      h2: { fontFamily: 'var(--font-display)', fontWeight: 600 },
      h3: { fontFamily: 'var(--font-display)', fontWeight: 600 },
      h4: { fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '-0.02em' },
      h5: { fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '-0.01em' },
      h6: { fontFamily: 'var(--font-display)', fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 10,
            transition: 'transform 120ms ease, box-shadow 120ms ease, background-color 120ms',
            variants: [
              {
                props: { variant: 'contained', color: 'primary' },
                style: {
                  backgroundColor: 'var(--ef-accent)',
                  color: 'var(--ef-on-accent)',
                  '&:hover': { backgroundColor: 'var(--ef-accent-hover)' },
                },
              },
            ],
          },
          contained: {
            border: '1.5px solid var(--ef-ink)',
            boxShadow: hardShadow(3),
            '&:hover': { boxShadow: hardShadow(4), transform: 'translate(-1px, -1px)' },
            '&:active': { boxShadow: hardShadow(1), transform: 'translate(2px, 2px)' },
            '&.Mui-disabled': { borderColor: 'var(--ef-border)', boxShadow: 'none' },
          },
          outlined: { borderWidth: 1.5, '&:hover': { borderWidth: 1.5 } },
        },
      },
      MuiIconButton: {
        styleOverrides: { root: { borderRadius: 10 } },
      },
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: 'none' } },
      },
      MuiCard: {
        defaultProps: { variant: 'outlined' },
        styleOverrides: {
          root: {
            borderRadius: 14,
            border: '1.5px solid var(--ef-ink)',
            boxShadow: hardShadow(4),
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
            border: '1.5px solid var(--ef-ink)',
            boxShadow: hardShadow(6),
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: { root: { fontSize: '1.35rem', paddingTop: 20 } },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            backgroundColor: 'var(--ef-surface)',
            '&:hover:not(.Mui-focused):not(.Mui-error):not(.Mui-disabled) .MuiOutlinedInput-notchedOutline': {
              borderColor: 'var(--ef-ink)',
            },
          },
          notchedOutline: { borderWidth: 1.5, borderColor: 'var(--ef-border)' },
        },
      },
      MuiChip: {
        styleOverrides: { root: { borderRadius: 8, fontWeight: 600 } },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: 'var(--ef-ink)',
            color: '#fdf6e3',
            fontSize: 12,
            borderRadius: 8,
          },
        },
      },
      MuiToggleButtonGroup: {
        styleOverrides: {
          root: {
            gap: 4,
            padding: 3,
            borderRadius: 12,
            border: '1.5px solid var(--ef-ink)',
            backgroundColor: 'var(--ef-surface)',
          },
          grouped: { border: 0, borderRadius: '9px !important', margin: 0 },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            color: 'var(--ef-muted)',
            '&.Mui-selected, &.Mui-selected:hover': {
              backgroundColor: 'var(--ef-accent)',
              color: 'var(--ef-on-accent)',
            },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: { minHeight: 0 },
          indicator: { display: 'none' },
          scroller: { padding: '2px 4px 4px 2px' },
          list: { gap: 6 },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            minHeight: 0,
            padding: '8px 16px',
            borderRadius: 999,
            border: '1.5px solid transparent',
            textTransform: 'none',
            fontWeight: 600,
            '&.Mui-selected': {
              color: 'var(--ef-on-accent)',
              backgroundColor: 'var(--ef-accent)',
              borderColor: 'var(--ef-ink)',
              boxShadow: hardShadow(2),
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderColor: 'var(--ef-border)' },
          head: {
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--ef-muted)',
            backgroundColor: 'var(--ef-surface-2)',
          },
        },
      },
      MuiAlert: {
        styleOverrides: { root: { borderRadius: 10 } },
      },
      MuiSnackbarContent: {
        styleOverrides: { root: { borderRadius: 10 } },
      },
    },
  },
  ptBR,
  datePickersPtBR,
)
