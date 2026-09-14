import { useEffect, useState } from 'react'
import AiChatWithTools from '@/components/blocks/ai/ai-chat-with-tools'
import { loadChatReview, type ChatReview } from '@/services/chat-review'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'

type State =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly data: ChatReview | undefined }
  | { readonly status: 'failed'; readonly message: string }

/** The completed sample review. Inject a loader to exercise read failures and empty results. */
export function ChatReviewPage({
  load = loadChatReview,
}: {
  readonly load?: typeof loadChatReview
}) {
  const [state, setState] = useState<State>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let disposed = false
    void Promise.resolve()
      .then(() => load())
      .then((result) => {
        if (!disposed)
          setState(
            result.ok
              ? { status: 'ready', data: result.value }
              : { status: 'failed', message: result.error.message },
          )
      })
      .catch((error: unknown) => {
        if (import.meta.env.DEV)
          console.error('Sample conversation could not load', error)
        if (!disposed)
          setState({
            status: 'failed',
            message: 'The sample conversation could not load.',
          })
      })
    return () => {
      disposed = true
    }
  }, [load, attempt])
  function retry() {
    setState({ status: 'loading' })
    setAttempt((value) => value + 1)
  }
  if (state.status === 'loading')
    return (
      <section
        aria-label="Loading sample conversation"
        className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-6"
      >
        <p role="status">Loading sample conversation…</p>
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-72 w-full" />
      </section>
    )
  if (state.status === 'failed')
    return (
      <section className="p-6">
        <Alert>
          <AlertTitle>Sample conversation unavailable</AlertTitle>
          <AlertDescription>
            <p>{state.message}</p>
            <Button onClick={retry} variant="outline">
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      </section>
    )
  if (!state.data)
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No sample conversation</EmptyTitle>
          <EmptyDescription>
            The review sample has no conversation or plan to display.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" onClick={retry}>
            Reload sample
          </Button>
        </EmptyContent>
      </Empty>
    )
  return <AiChatWithTools data={state.data} />
}
