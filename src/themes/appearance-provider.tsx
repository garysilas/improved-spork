import { useLayoutEffect, useState, type ReactNode } from 'react'
import { AppearanceContext } from './appearance-context'
import { applyAppearance } from './runtime'
import { saveAppearance, type AppearanceRecord } from './storage'

export function AppearanceProvider({
  initial,
  children,
}: {
  initial: { record: AppearanceRecord; issue: string | null }
  children: ReactNode
}) {
  const [record, setRecord] = useState(initial.record)
  const [issue, setIssue] = useState(initial.issue)
  const [saveError, setSaveError] = useState<string | null>(null)
  useLayoutEffect(() => {
    applyAppearance(record)
    if (record.mode !== 'system') return
    const media = matchMedia('(prefers-color-scheme: dark)')
    const update = () => {
      applyAppearance(record)
    }
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [record])
  function commit(next: AppearanceRecord, resetInvalid = false): boolean {
    if (issue && !resetInvalid) {
      setSaveError('Reset the unreadable record before saving new preferences.')
      return false
    }
    try {
      saveAppearance(next)
      applyAppearance(next)
      setRecord(next)
      setIssue(null)
      setSaveError(null)
      return true
    } catch (error) {
      if (import.meta.env.DEV)
        console.error('Appearance could not be saved', error)
      setSaveError(
        'Appearance could not be saved. Browser storage may be unavailable or full. Your previous appearance is unchanged.',
      )
      return false
    }
  }
  return (
    <AppearanceContext value={{ record, issue, saveError, commit }}>
      {children}
    </AppearanceContext>
  )
}
