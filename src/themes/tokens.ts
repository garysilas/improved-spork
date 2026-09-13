import { defaults, type ThemeToken } from './defaults'

// The importer and runtime use this same list. Every entry has a CSS consumer.
export const tokenNames = Object.keys(defaults.light) as ThemeToken[]
export const isThemeToken = (name: string): name is ThemeToken =>
  Object.hasOwn(defaults.light, name)

export function cssProperty(token: ThemeToken): string {
  if (token.startsWith('--font-')) return 'font-family'
  if (token.startsWith('--shadow')) return 'box-shadow'
  if (token === '--radius') return 'border-radius'
  if (token === '--spacing') return 'gap'
  if (token === '--tracking-normal') return 'letter-spacing'
  return 'color'
}

export function runtimeToken(token: ThemeToken): string {
  return /^(--font-|--shadow|--spacing|--tracking-normal)/.test(token)
    ? `--aoe${token.slice(1)}`
    : token
}

export function validateToken(
  token: ThemeToken,
  value: unknown,
): value is string {
  if (typeof value !== 'string' || !value.trim() || value.length > 2048)
    return false
  // No resource loads, escapes, unresolved references, or CSS wide reset values.
  if (
    /[\\;{}@!<>]|\/\*|(?:url|var|env|attr|expression)\s*\(|(?:https?:|data:)|\b(?:inherit|initial|unset|revert|revert-layer)\b/i.test(
      value,
    )
  )
    return false
  return CSS.supports(
    cssProperty(token),
    token.startsWith('--font-') ? fontStack(value) : value,
  )
}

function fontStack(value: string): string {
  // Some tweakcn presets export family names containing an unquoted number.
  // Quote those family names so native CSS accepts the intended local font.
  return value
    .split(',')
    .map((family) => {
      const name = family.trim()
      return /^[a-zA-Z][a-zA-Z0-9 _-]*$/.test(name) && /[0-9]/.test(name)
        ? `"${name}"`
        : name
    })
    .join(', ')
}

export function appliedValue(token: ThemeToken, value: string): string {
  if (token === '--font-sans')
    return `${fontStack(value)}, ui-sans-serif, system-ui, sans-serif`
  if (token === '--font-serif')
    return `${fontStack(value)}, ui-serif, Georgia, serif`
  if (token === '--font-mono')
    return `${fontStack(value)}, ui-monospace, monospace`
  return value
}
