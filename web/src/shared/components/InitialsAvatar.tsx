import { accentFor, initialsOf } from '../../lib/accent'

type InitialsAvatarProps = {
  id: string
  name: string
  size?: 'sm' | 'md' | 'lg'
  square?: boolean
}

const sizes = {
  sm: 'size-7 text-[11px]',
  md: 'size-9 text-sm',
  lg: 'size-12 text-lg',
}

export const InitialsAvatar = ({ id, name, size = 'md', square = false }: InitialsAvatarProps) => (
  <span
    aria-hidden
    className={`inline-flex shrink-0 items-center justify-center border-[1.5px] border-ink font-display font-semibold text-[#2d353b] ${sizes[size]} ${square ? 'rounded-xl' : 'rounded-full'}`}
    style={{ backgroundColor: accentFor(id) }}
  >
    {initialsOf(name)}
  </span>
)
