import type { TokenMap } from './defaults'
import { isThemeToken, tokenNames, validateToken } from './tokens'

export type ImportedTheme = {
  id: string
  name: string
  light: TokenMap
  dark: TokenMap
  source: 'tweakcn-css'
}

export class ThemeInputError extends Error {
  field: 'name' | 'css'
  constructor(message: string, field: 'name' | 'css' = 'css') {
    super(message)
    this.field = field
  }
}

// Tokenize balanced CSS before interpreting declarations. Quoted separators and
// comments are handled without ever creating a stylesheet or DOM style element.
function scan(source: string): string[] {
  const pieces: string[] = []
  let part = '',
    quote = '',
    depth = 0
  for (let i = 0; i < source.length; i++) {
    const char = source[i]
    if (quote) {
      part += char
      if (char === '\\') {
        if (++i >= source.length)
          throw new ThemeInputError('Finish the quoted CSS value.')
        part += source[i]
      } else if (char === quote) quote = ''
      else if (char === '\n' || char === '\r')
        throw new ThemeInputError(
          'A quoted CSS value contains an unfinished line.',
        )
      continue
    }
    if (char === '/' && source[i + 1] === '*') {
      const end = source.indexOf('*/', i + 2)
      if (end < 0) throw new ThemeInputError('Close the CSS comment with */.')
      i = end + 1
      part += ' '
      continue
    }
    if (char === '"' || char === "'") {
      quote = char
      part += char
      continue
    }
    if (char === '(') depth++
    if (char === ')' && --depth < 0)
      throw new ThemeInputError('The CSS has an unmatched parenthesis.')
    if ('{};'.includes(char) && depth === 0) {
      if (part.trim()) pieces.push(part.trim())
      pieces.push(char)
      part = ''
    } else part += char
  }
  if (quote || depth)
    throw new ThemeInputError('Close all quotes and parentheses in the CSS.')
  if (part.trim()) pieces.push(part.trim())
  return pieces
}

type Rule = { header: string; declarations: string[]; children: Rule[] }
function parseRules(parts: string[]): Rule[] {
  let index = 0
  function block(nested: boolean, level: number): Rule[] {
    if (level > 24) throw new ThemeInputError('The CSS is nested too deeply.')
    const rules: Rule[] = []
    while (index < parts.length) {
      if (parts[index] === '}') {
        if (!nested)
          throw new ThemeInputError('The CSS has an extra closing brace.')
        index++
        return rules
      }
      const header = parts[index++]
      if ('{;'.includes(header))
        throw new ThemeInputError(
          'The CSS has a missing selector or declaration.',
        )
      const next = parts[index]
      if (next === '{') {
        index++
        const children = block(true, level + 1)
        rules.push({ header, declarations: [], children })
      } else if (
        next === ';' ||
        (nested && (next === '}' || next === undefined))
      ) {
        if (next === ';') index++
        if (
          !header.startsWith('@') &&
          !/^[-\w]+\s*:\s*\S[\s\S]*$/.test(header)
        ) {
          throw new ThemeInputError(
            `Malformed CSS near “${header.slice(0, 50)}”.`,
          )
        }
        if (!nested && !header.startsWith('@'))
          throw new ThemeInputError('Place declarations inside a CSS block.')
        rules.push({ header, declarations: [header], children: [] })
      } else
        throw new ThemeInputError(
          `Malformed CSS near “${header.slice(0, 50)}”.`,
        )
    }
    if (nested) throw new ThemeInputError('The CSS has an unclosed block.')
    return rules
  }
  return block(false, 0)
}

export function parseThemeCss(css: string): {
  light: TokenMap
  dark: TokenMap
  notes: string[]
} {
  if (!css.trim())
    throw new ThemeInputError('Paste a Tailwind 4 CSS export from tweakcn.')
  if (new TextEncoder().encode(css).length > 100 * 1024)
    throw new ThemeInputError('The CSS export must be no larger than 100 KiB.')
  const rules = parseRules(scan(css))
  const result: { light: TokenMap; dark: TokenMap; notes: string[] } = {
    light: {},
    dark: {},
    notes: [],
  }
  const found = new Set<string>(),
    ignored = new Set<string>()
  let structural = false
  for (const rule of rules) {
    const mode =
      rule.header === ':root'
        ? 'light'
        : rule.header === '.dark'
          ? 'dark'
          : null
    if (!mode) {
      structural = true
      continue
    }
    if (rule.declarations.length)
      throw new ThemeInputError('Expected a CSS block after the selector.')
    found.add(mode)
    for (const entry of rule.children) {
      if (entry.children.length || entry.declarations.length !== 1)
        throw new ThemeInputError(
          'Keep theme declarations directly inside :root and .dark.',
        )
      const colon = entry.header.indexOf(':')
      const name = entry.header.slice(0, colon).trim()
      const value = entry.header.slice(colon + 1).trim()
      if (!name.startsWith('--')) {
        structural = true
        continue
      }
      if (!isThemeToken(name)) {
        ignored.add(name)
        continue
      }
      if (!validateToken(name, value))
        throw new ThemeInputError(
          `Unsupported value for ${name}. Use a valid literal CSS value without resource URLs or variable references.`,
        )
      result[mode][name] = value
    }
  }
  if (!found.has('light') || !found.has('dark'))
    throw new ThemeInputError(
      'Include both a top level :root block and a .dark block.',
    )
  for (const mode of ['light', 'dark'] as const) {
    const missing = tokenNames.filter(
      (name) => !Object.hasOwn(result[mode], name),
    )
    if (missing.length)
      result.notes.push(
        `${mode === 'light' ? 'Light' : 'Dark'} uses Default for: ${missing.join(', ')}.`,
      )
  }
  if (ignored.size)
    result.notes.push(
      `Ignored unsupported properties: ${[...ignored].join(', ')}.`,
    )
  if (structural)
    result.notes.push(
      'Export mappings, imports, and global style rules were ignored. Fonts use locally available families with system fallbacks.',
    )
  return result
}

export function importTheme(
  nameInput: string,
  css: string,
  themes: ImportedTheme[],
) {
  const name = nameInput.trim()
  if (!name || name.length > 60)
    throw new ThemeInputError(
      'Use a theme name from 1 to 60 characters.',
      'name',
    )
  if (
    ['Default', ...themes.map((theme) => theme.name)].some(
      (existing) => existing.toLowerCase() === name.toLowerCase(),
    )
  ) {
    throw new ThemeInputError(
      'That theme name is already saved. Choose a different name.',
      'name',
    )
  }
  const { light, dark, notes } = parseThemeCss(css)
  const theme: ImportedTheme = {
    id: crypto.randomUUID(),
    name,
    light,
    dark,
    source: 'tweakcn-css',
  }
  return { theme, notes }
}
