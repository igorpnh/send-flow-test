import SendRoundedIcon from '@mui/icons-material/SendRounded'

export const Logo = ({ size = 'md' }: { size?: 'md' | 'lg' }) => (
  <span className="inline-flex items-center gap-2.5">
    <span
      className={`inline-flex -rotate-6 items-center justify-center rounded-xl border-[1.5px] border-ink bg-accent text-on-accent shadow-hard-sm ${size === 'lg' ? 'size-11' : 'size-9'}`}
    >
      <SendRoundedIcon className="-rotate-12" fontSize={size === 'lg' ? 'medium' : 'small'} />
    </span>
    <span className={`font-display font-semibold tracking-tight text-fg ${size === 'lg' ? 'text-3xl' : 'text-xl'}`}>
      send<span className="italic text-ef-green">flow</span>
    </span>
  </span>
)
