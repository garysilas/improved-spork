import { type ImportedTheme } from './import-theme'
import { isThemeToken, validateToken } from './tokens'

export const APPEARANCE_KEY = 'aoe.appearance.v1'
export type Mode = 'system' | 'light' | 'dark'
export type AppearanceRecord = {
  version: 1
  selectedThemeId: string
  mode: Mode
  themes: ImportedTheme[]
}
export const defaultRecord = (): AppearanceRecord => ({
  version: 1,
  selectedThemeId: 'default',
  mode: 'system',
  themes: [],
})
export const isMode = (value: unknown): value is Mode =>
  value === 'system' || value === 'light' || value === 'dark'
const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

function validMap(value: unknown): boolean {
  return (
    isObject(value) &&
    Object.entries(value).every(
      ([key, token]) => isThemeToken(key) && validateToken(key, token),
    )
  )
}

export function validateRecord(value: unknown): AppearanceRecord {
  if (
    !isObject(value) ||
    value.version !== 1 ||
    !isMode(value.mode) ||
    typeof value.selectedThemeId !== 'string' ||
    !Array.isArray(value.themes)
  )
    throw new Error('Invalid appearance record')
  const ids = new Set(['default']),
    names = new Set(['default'])
  for (const theme of value.themes) {
    if (
      !isObject(theme) ||
      typeof theme.id !== 'string' ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        theme.id,
      ) ||
      typeof theme.name !== 'string' ||
      !theme.name.trim() ||
      theme.name !== theme.name.trim() ||
      theme.name.length > 60 ||
      theme.source !== 'tweakcn-css' ||
      !validMap(theme.light) ||
      !validMap(theme.dark)
    )
      throw new Error('Invalid saved theme')
    if (ids.has(theme.id) || names.has(theme.name.toLowerCase()))
      throw new Error('Duplicate saved theme')
    ids.add(theme.id)
    names.add(theme.name.toLowerCase())
  }
  return {
    version: 1,
    mode: value.mode,
    selectedThemeId: ids.has(value.selectedThemeId)
      ? value.selectedThemeId
      : 'default',
    themes: value.themes as ImportedTheme[],
  }
}

export function readAppearance(): {
  record: AppearanceRecord
  issue: string | null
} {
  try {
    const raw = localStorage.getItem(APPEARANCE_KEY)
    return {
      record: raw === null ? defaultRecord() : validateRecord(JSON.parse(raw)),
      issue: null,
    }
  } catch (error) {
    if (import.meta.env.DEV)
      console.error('Appearance could not be read', error)
    return {
      record: defaultRecord(),
      issue:
        'Saved appearance could not be read. Default and System are active. Reset the unreadable record to save preferences again.',
    }
  }
}

export function saveAppearance(record: AppearanceRecord) {
  localStorage.setItem(APPEARANCE_KEY, JSON.stringify(validateRecord(record)))
}
