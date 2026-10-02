const accents = ['#a7c080', '#83c092', '#7fbbb3', '#d699b6', '#e69875', '#dbbc7f'] as const

export const accentFor = (id: string) => {
  const hash = [...id].reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 7)
  return accents[hash % accents.length]
}

export const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || '?'
