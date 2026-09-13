import { defaults } from './defaults'
import { tokenNames, appliedValue, runtimeToken } from './tokens'
import type { AppearanceRecord } from './storage'

export function applyAppearance(record: AppearanceRecord) {
  const mode =
    record.mode === 'system'
      ? matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : record.mode
  const theme = record.themes.find((item) => item.id === record.selectedThemeId)
  const tokens = { ...defaults[mode], ...theme?.[mode] }
  const root = document.documentElement
  for (const token of tokenNames)
    root.style.setProperty(
      runtimeToken(token),
      appliedValue(token, tokens[token] ?? defaults[mode][token]),
    )
  root.classList.toggle('dark', mode === 'dark')
  root.style.colorScheme = mode
  return mode
}
