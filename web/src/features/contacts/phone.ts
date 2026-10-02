const BRAZIL_PREFIX = '+55'

export const onlyDigits = (value: string) => value.replace(/\D/g, '')

export const formatPhone = (value: string) => {
  const digits = onlyDigits(value).slice(0, 11)
  if (digits.length <= 2) return digits.length ? `(${digits}` : ''
  const ddd = digits.slice(0, 2)
  const rest = digits.slice(2)
  const splitAt = rest.length > 8 ? 5 : 4
  return rest.length > splitAt
    ? `(${ddd}) ${rest.slice(0, splitAt)}-${rest.slice(splitAt)}`
    : `(${ddd}) ${rest}`
}

export const isValidPhone = (value: string) => /^\d{10,11}$/.test(onlyDigits(value))

export const toE164 = (value: string) => `${BRAZIL_PREFIX}${onlyDigits(value)}`

export const fromE164 = (phone: string) => formatPhone(phone.replace(BRAZIL_PREFIX, ''))
