import { useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import {
  ArrowLeftIcon,
  CheckIcon,
  MonitorIcon,
  MoonIcon,
  PlusIcon,
  SunIcon,
  RotateCcwIcon,
} from 'lucide-react'
import { useAppearance } from '@/themes/appearance-context'
import { defaults } from '@/themes/defaults'
import { defaultRecord, isMode } from '@/themes/storage'
import { importTheme, ThemeInputError } from '@/themes/import-theme'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function Appearance() {
  const { record, issue, saveError, commit } = useAppearance()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [css, setCss] = useState('')
  const [inputError, setInputError] = useState<ThemeInputError | null>(null)
  const [notes, setNotes] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const pickerRef = useRef<HTMLButtonElement>(null)
  const themes = [
    {
      id: 'default',
      name: 'Default',
      light: defaults.light,
      dark: defaults.dark,
    },
    ...record.themes,
  ]
  const selected =
    themes.find((theme) => theme.id === record.selectedThemeId) ?? themes[0]
  function submit(event: FormEvent) {
    event.preventDefault()
    setInputError(null)
    try {
      const imported = importTheme(name, css, record.themes)
      if (
        commit({
          ...record,
          selectedThemeId: imported.theme.id,
          themes: [...record.themes, imported.theme],
        })
      ) {
        setNotes(imported.notes)
        setMessage(`${imported.theme.name} imported and applied.`)
        setName('')
        setCss('')
        setOpen(false)
      }
    } catch (error) {
      setInputError(
        error instanceof ThemeInputError
          ? error
          : new ThemeInputError(
              'This theme could not be imported. Check the name and CSS.',
            ),
      )
    }
  }
  return (
    <section className="min-w-0 bg-muted/20 px-5 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <header className="flex flex-col gap-4">
          <Button asChild variant="ghost" className="w-fit">
            <Link to="/workspace">
              <ArrowLeftIcon data-icon="inline-start" aria-hidden="true" />
              Back to workspace
            </Link>
          </Button>
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Settings
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              Appearance
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Make this workspace feel like yours.
            </p>
          </div>
        </header>
        {issue && (
          <Alert>
            <AlertTitle>Saved appearance needs attention</AlertTitle>
            <AlertDescription>
              <p>{issue}</p>
              <Button
                variant="outline"
                onClick={() => {
                  if (commit(defaultRecord(), true))
                    setMessage('Unreadable appearance record reset.')
                }}
              >
                Reset unreadable record
              </Button>
            </AlertDescription>
          </Alert>
        )}
        {saveError && (
          <Alert variant="destructive">
            <AlertTitle>Unable to save</AlertTitle>
            <AlertDescription>{saveError}</AlertDescription>
          </Alert>
        )}
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Workspace theme</h2>
            </CardTitle>
            <CardDescription>
              Choose a saved theme or bring one in from tweakcn.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="theme-picker">Theme</FieldLabel>
                <Select
                  value={record.selectedThemeId}
                  onValueChange={(id) => {
                    if (commit({ ...record, selectedThemeId: id }))
                      setMessage('Theme applied.')
                  }}
                >
                  <SelectTrigger
                    id="theme-picker"
                    ref={pickerRef}
                    className="w-full"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectGroup>
                      {themes.map((theme) => (
                        <SelectItem value={theme.id} key={theme.id}>
                          <span className="flex items-center gap-2">
                            <span
                              aria-hidden="true"
                              className="flex shrink-0 gap-1"
                            >
                              {(
                                [
                                  '--background',
                                  '--primary',
                                  '--accent',
                                ] as const
                              ).map((token) => (
                                <span
                                  key={token}
                                  className="size-3 rounded-full border"
                                  style={{
                                    backgroundColor:
                                      theme.light[token] ??
                                      defaults.light[token],
                                  }}
                                />
                              ))}
                            </span>
                            <span className="max-w-48 truncate">
                              {theme.name}
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
            <div
              className="grid grid-cols-2 gap-3"
              aria-label="Selected theme preview"
            >
              {(['light', 'dark'] as const).map((mode) => {
                const tokens = { ...defaults[mode], ...selected[mode] }
                return (
                  <div
                    key={mode}
                    className="flex flex-col gap-3 rounded-lg border p-4"
                    style={{
                      backgroundColor: tokens['--background'],
                      color: tokens['--foreground'],
                      borderColor: tokens['--border'],
                    }}
                  >
                    <span className="text-xs font-medium capitalize">
                      {mode}
                    </span>
                    <div className="flex gap-2" aria-hidden="true">
                      {(['--background', '--primary', '--accent'] as const).map(
                        (token) => (
                          <span
                            key={token}
                            className="size-6 rounded-full border"
                            style={{
                              backgroundColor: tokens[token],
                              borderColor: tokens['--border'],
                            }}
                          />
                        ),
                      )}
                    </div>
                    <span className="text-xs">Your workspace, your style.</span>
                  </div>
                )
              })}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                <CheckIcon data-icon="inline-start" aria-hidden="true" />
                Active
              </Badge>
              <span className="break-all text-sm">{selected.name}</span>
            </div>
          </CardContent>
          <CardFooter className="flex-wrap justify-between gap-3">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <PlusIcon data-icon="inline-start" aria-hidden="true" />
                  Import theme
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle>Import a tweakcn theme</DialogTitle>
                  <DialogDescription>
                    Name your theme and paste its Tailwind 4 CSS export. It will
                    be saved in this browser.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="flex flex-col gap-5">
                  <FieldGroup>
                    <Field data-invalid={inputError?.field === 'name'}>
                      <FieldLabel htmlFor="theme-name">Theme name</FieldLabel>
                      <Input
                        id="theme-name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        aria-invalid={inputError?.field === 'name'}
                        aria-describedby={
                          inputError?.field === 'name'
                            ? 'import-error'
                            : undefined
                        }
                        placeholder="My workspace theme"
                      />
                    </Field>
                    <Field data-invalid={inputError?.field === 'css'}>
                      <FieldLabel htmlFor="theme-css">
                        Tailwind 4 CSS
                      </FieldLabel>
                      <Textarea
                        id="theme-css"
                        value={css}
                        onChange={(event) => setCss(event.target.value)}
                        className="min-h-48"
                        aria-invalid={inputError?.field === 'css'}
                        aria-describedby={
                          inputError?.field === 'css'
                            ? 'import-error'
                            : 'css-help'
                        }
                        placeholder=":root { ... } .dark { ... }"
                      />
                      <FieldDescription id="css-help">
                        Include both :root and .dark. Up to 100 KiB. Font
                        families use fonts available on this Mac.
                      </FieldDescription>
                    </Field>
                  </FieldGroup>
                  {inputError && (
                    <Alert variant="destructive" id="import-error">
                      <AlertDescription>{inputError.message}</AlertDescription>
                    </Alert>
                  )}
                  {saveError && (
                    <Alert variant="destructive">
                      <AlertDescription>{saveError}</AlertDescription>
                    </Alert>
                  )}
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Import and apply</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            {selected.id !== 'default' && (
              <Button
                variant="ghost"
                onClick={() => {
                  if (
                    commit({
                      ...record,
                      selectedThemeId: 'default',
                      themes: record.themes.filter(
                        (theme) => theme.id !== selected.id,
                      ),
                    })
                  ) {
                    setMessage(`${selected.name} removed. Default is active.`)
                    pickerRef.current?.focus()
                  }
                }}
              >
                Remove selected theme
              </Button>
            )}
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Color mode</h2>
            </CardTitle>
            <CardDescription>
              Follow your Mac or keep a light or dark workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ToggleGroup
              type="single"
              variant="outline"
              value={record.mode}
              aria-label="Color mode"
              onValueChange={(mode) => {
                if (isMode(mode) && commit({ ...record, mode }))
                  setMessage(
                    `${mode === 'system' ? 'System' : mode === 'light' ? 'Light' : 'Dark'} mode applied.`,
                  )
              }}
            >
              <ToggleGroupItem value="system">
                <MonitorIcon data-icon="inline-start" aria-hidden="true" />
                System
              </ToggleGroupItem>
              <ToggleGroupItem value="light">
                <SunIcon data-icon="inline-start" aria-hidden="true" />
                Light
              </ToggleGroupItem>
              <ToggleGroupItem value="dark">
                <MoonIcon data-icon="inline-start" aria-hidden="true" />
                Dark
              </ToggleGroupItem>
            </ToggleGroup>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Local preferences</h2>
            </CardTitle>
            <CardDescription>
              Themes stay in this browser at this address. Other browsers and
              the preview server have their own settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() => {
                if (
                  commit({
                    ...record,
                    selectedThemeId: 'default',
                    mode: 'system',
                  })
                )
                  setMessage(
                    'Default theme and System mode restored. Imported themes were kept.',
                  )
              }}
            >
              <RotateCcwIcon data-icon="inline-start" aria-hidden="true" />
              Reset appearance
            </Button>
          </CardContent>
        </Card>
        <div
          role="status"
          aria-live="polite"
          className="text-sm text-muted-foreground"
        >
          {message}
        </div>
        {notes.length > 0 && (
          <details className="rounded-lg border bg-card p-4 text-sm">
            <summary className="cursor-pointer font-medium">
              Import notes
            </summary>
            <ul className="mt-3 flex list-disc flex-col gap-3 ps-5 text-muted-foreground">
              {notes.map((note) => (
                <li key={note} className="break-words">
                  {note}
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </section>
  )
}
