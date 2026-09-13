import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router'
import {
  ArrowRightIcon,
  FileTextIcon,
  FolderIcon,
  MessageSquareIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { shellService } from '@/services'
import type { ShellService, ShellSnapshot } from '@/services/shell-service'

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; data: ShellSnapshot }
  | { status: 'failed'; error: unknown }

export function Workspace({
  service = shellService,
}: {
  service?: ShellService
}) {
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const isPreview = useLocation().pathname === '/workspace/task-preview'
  useEffect(() => {
    let disposed = false
    Promise.resolve()
      .then(() => service.loadShell())
      .then((data) => {
        if (!disposed) setState({ status: 'ready', data })
      })
      .catch((error: unknown) => {
        if (!disposed) {
          if (import.meta.env.DEV)
            console.error('Sample workspace could not load', error)
          setState({ status: 'failed', error })
        }
      })
    return () => {
      disposed = true
    }
  }, [service, attempt])
  function retry() {
    setState({ status: 'loading' })
    setAttempt((value) => value + 1)
  }
  return (
    <section className="flex min-w-0 flex-1 flex-col">
      <h1 className="sr-only">Workspace</h1>
      {state.status === 'loading' && (
        <div role="status" className="flex flex-col gap-4 p-8">
          <span className="text-sm text-muted-foreground">
            Loading sample workspace…
          </span>
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}
      {state.status === 'failed' && (
        <div className="p-8">
          <Alert>
            <AlertTitle>Sample workspace could not load</AlertTitle>
            <AlertDescription>
              <p>Try loading the sample content again.</p>
              <Button onClick={retry} variant="outline">
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}
      {state.status === 'ready' && (
        <div className="grid min-w-0 flex-1 lg:grid-cols-[12rem_minmax(0,1fr)] xl:grid-cols-[12rem_minmax(0,1fr)_17rem]">
          <nav
            aria-label="Sample project"
            className="flex flex-col gap-5 border-b p-5 lg:border-e lg:border-b-0"
          >
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Projects
            </h2>
            <div className="flex items-center gap-2 text-sm font-medium">
              <FolderIcon className="size-4 shrink-0" aria-hidden="true" />
              {state.data.projectLabel}
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant={isPreview ? 'ghost' : 'secondary'}
                asChild
                className="justify-start"
              >
                <NavLink end to="/workspace">
                  Overview
                </NavLink>
              </Button>
              <Button
                variant={isPreview ? 'secondary' : 'ghost'}
                asChild
                className="justify-start"
              >
                <NavLink to="/workspace/task-preview">Sample task</NavLink>
              </Button>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Sample content for exploring the workspace.
            </p>
          </nav>
          <section
            aria-labelledby="task-heading"
            className="flex min-h-96 min-w-0 flex-col p-5 lg:p-8"
          >
            <h2 id="task-heading" className="text-sm font-medium">
              Task
            </h2>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <MessageSquareIcon aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>
                  <h3>
                    {isPreview
                      ? 'Sample task preview'
                      : state.data.taskPlaceholder}
                  </h3>
                </EmptyTitle>
                <EmptyDescription>
                  {isPreview
                    ? 'This is a sample destination. Your task conversation and activity will have a home here.'
                    : 'Open the sample task to explore how a project, a task, and its results fit together.'}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                {isPreview ? (
                  <Badge variant="outline">Sample only</Badge>
                ) : (
                  <Button asChild variant="outline">
                    <NavLink to="/workspace/task-preview">
                      Explore sample task
                      <ArrowRightIcon
                        data-icon="inline-end"
                        aria-hidden="true"
                      />
                    </NavLink>
                  </Button>
                )}
              </EmptyContent>
            </Empty>
            <p className="text-center text-xs text-muted-foreground">
              No agent is connected to this sample workspace.
            </p>
          </section>
          <aside
            aria-labelledby="artifacts-heading"
            className="flex min-w-0 flex-col gap-6 border-t bg-muted/20 p-5 lg:col-span-2 xl:col-span-1 xl:border-s xl:border-t-0"
          >
            <h2 id="artifacts-heading" className="text-sm font-medium">
              Artifacts
            </h2>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileTextIcon aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>{state.data.artifactPlaceholder}</EmptyTitle>
                <EmptyDescription>
                  Documents, code, and other useful outputs from a task.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Badge variant="outline">Sample placeholder</Badge>
              </EmptyContent>
            </Empty>
          </aside>
        </div>
      )}
    </section>
  )
}
