import { createContext, useContext } from 'react'
import type { AppearanceRecord } from './storage'

export type AppearanceContextValue = {
  record: AppearanceRecord
  issue: string | null
  saveError: string | null
  commit: (record: AppearanceRecord, resetInvalid?: boolean) => boolean
}
export const AppearanceContext = createContext<AppearanceContextValue | null>(
  null,
)
export function useAppearance() {
  const context = useContext(AppearanceContext)
  if (!context) throw new Error('Appearance provider is missing')
  return context
}
