import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV)
      console.error('Application render failed', error, info)
  }
  render() {
    if (this.state.failed)
      return (
        <main className="mx-auto max-w-xl p-8">
          <h1 className="mb-5 text-xl font-semibold">
            Agent Operating Environment
          </h1>
          <Alert>
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>
              <p>Reload the workspace to try again.</p>
              <Button onClick={() => location.reload()}>
                Reload workspace
              </Button>
            </AlertDescription>
          </Alert>
        </main>
      )
    return this.props.children
  }
}
