import { chatReviewFixture } from '@/fixtures/chat-review'
import { createMockWorkspaceReader } from './mock/workspace-service'
import type { WorkspaceReader } from './workspace/reader'
import type {
  Artifact,
  ArtifactVersion,
  Message,
  Result,
  TaskSummary,
} from './workspace/types'

export interface ReviewTool {
  readonly id: string
  readonly name: string
  readonly displayName: string
  readonly input: Readonly<Record<string, unknown>>
  readonly output: Readonly<Record<string, unknown>>
}
export interface ChatReview {
  readonly task: TaskSummary
  readonly messages: readonly Message[]
  readonly tools: readonly ReviewTool[]
  readonly artifact: Artifact
  readonly version: ArtifactVersion
}
const reviewReader = createMockWorkspaceReader(chatReviewFixture())
/** Loads the bounded, single run review. Expected reader failures return a typed result. */
export async function loadChatReview(
  reader: WorkspaceReader = reviewReader,
): Promise<Result<ChatReview | undefined>> {
  const [task, messages, run, activity, artifacts] = await Promise.all([
    reader.getTask('task-completed'),
    reader.listMessages('task-completed'),
    reader.getRun('run-completed'),
    reader.listActivity('run-completed'),
    reader.listArtifacts('task-completed'),
  ])
  if (!task.ok) return task
  if (!messages.ok) return messages
  if (!run.ok) return run
  if (!activity.ok) return activity
  if (!artifacts.ok) return artifacts
  const artifact = artifacts.value.items[0]
  if (!artifact || messages.value.items.length === 0)
    return { ok: true, value: undefined }
  const version = await reader.getArtifactVersion(artifact.id, 1)
  if (!version.ok) return version
  const files = run.value.snapshots.flatMap((snapshot) => snapshot.files)
  return {
    ok: true,
    value: {
      task: task.value,
      messages: messages.value.items,
      artifact,
      version: version.value,
      tools: activity.value.items.map((event) => ({
        id: event.id,
        name: event.kind,
        displayName: event.summary,
        input:
          event.kind === 'context'
            ? { files: files.map((file) => file.path) }
            : { task: task.value.title },
        output:
          event.kind === 'context'
            ? { capturedNotes: files.map((file) => file.content) }
            : event.kind === 'artifact'
              ? {
                  title: artifact.title,
                  format: version.value.format,
                  version: version.value.version,
                }
              : { summary: event.summary },
      })),
    },
  }
}
