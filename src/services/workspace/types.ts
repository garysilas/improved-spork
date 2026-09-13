/** Stable identities and UTC times. Runtime validation checks their representations. */
export type Id = string
export type Time = string
export type RunState =
  'queued' | 'running' | 'waiting' | 'completed' | 'failed' | 'stopped'
export type TaskStatus = RunState | 'draft' | 'interrupted'
export type Format = 'text' | 'markdown'
export interface Failure {
  readonly code: string
  readonly message: string
}
export type ErrorCode =
  | 'invalid_input'
  | 'invalid_data'
  | 'unavailable'
  | 'not_found'
  | 'active_run'
  | 'context_unavailable'
  | 'archived'
  | 'invalid_state'
  | 'wrong_owner'
  | 'source_removed'
  | 'stale_request'
  | 'not_archived'
  | 'conflict'
export type Result<T> =
  | { readonly ok: true; readonly value: T }
  | {
      readonly ok: false
      readonly error: { readonly code: ErrorCode; readonly message: string }
    }
export interface Project {
  readonly id: Id
  readonly name: string
  readonly description: string | undefined
  readonly folderPath: string | undefined
  readonly createdAt: Time
  readonly updatedAt: Time
  readonly archivedAt: Time | undefined
}
export interface Task {
  readonly id: Id
  readonly projectId: Id
  readonly title: string
  readonly createdAt: Time
  readonly updatedAt: Time
  readonly archivedAt: Time | undefined
}
export interface Message {
  readonly id: Id
  readonly taskId: Id
  readonly runId: Id | undefined
  readonly author: 'user' | 'assistant'
  readonly text: string
  readonly sequence: number
  readonly createdAt: Time
}
export interface Run {
  readonly id: Id
  readonly taskId: Id
  readonly initiatingMessageId: Id
  readonly sequence: number
  readonly state: RunState
  readonly retryOfRunId: Id | undefined
  readonly createdAt: Time
  readonly startedAt: Time | undefined
  readonly endedAt: Time | undefined
  readonly failure: Failure | undefined
}
export interface ContextSource {
  readonly id: Id
  readonly projectId: Id
  readonly label: string
  readonly kind: 'file' | 'folder'
  readonly path: string
  readonly createdAt: Time
  readonly removedAt: Time | undefined
}
export interface TaskContextSelection {
  readonly id: Id
  readonly taskId: Id
  readonly sourceId: Id
}
export interface CapturedFile {
  readonly path: string
  readonly format: Format
  readonly content: string
}
export interface RunContextSnapshot {
  readonly id: Id
  readonly runId: Id
  readonly sourceId: Id
  readonly sourcePath: string
  readonly capturedAt: Time
  readonly files: readonly CapturedFile[]
}
export interface ActivityEvent {
  readonly id: Id
  readonly runId: Id
  readonly sequence: number
  readonly kind: 'progress' | 'state_change' | 'context' | 'artifact' | 'error'
  readonly summary: string
  readonly createdAt: Time
}
export interface ProposedChange {
  readonly path: string
  readonly before: string | undefined
  readonly after: string | undefined
}
export type Resolution =
  | {
      readonly kind: 'answer'
      readonly messageId: Id
      readonly resolvedAt: Time
    }
  | {
      readonly kind: 'approval'
      readonly decision: 'approved' | 'declined'
      readonly resolvedAt: Time
    }
  | { readonly kind: 'cancelled'; readonly resolvedAt: Time }
interface WaitingBase {
  readonly id: Id
  readonly runId: Id
  readonly prompt: string
  readonly createdAt: Time
  readonly resolution: Resolution | undefined
}
export type WaitingRequest = WaitingBase &
  (
    | { readonly kind: 'question' }
    | {
        readonly kind: 'approval'
        readonly proposal: {
          readonly id: Id
          readonly changes: readonly ProposedChange[]
        }
      }
  )
export interface Artifact {
  readonly id: Id
  readonly taskId: Id
  readonly title: string
  readonly createdAt: Time
}
export interface ArtifactVersion {
  readonly id: Id
  readonly artifactId: Id
  readonly producingRunId: Id
  readonly version: number
  readonly format: Format
  readonly content: string
  readonly createdAt: Time
}
export interface WorkspaceData {
  readonly schemaVersion: 1
  readonly mode: 'sample'
  readonly projects: readonly Project[]
  readonly tasks: readonly Task[]
  readonly messages: readonly Message[]
  readonly runs: readonly Run[]
  readonly contextSources: readonly ContextSource[]
  readonly selections: readonly TaskContextSelection[]
  readonly snapshots: readonly RunContextSnapshot[]
  readonly activity: readonly ActivityEvent[]
  readonly waitingRequests: readonly WaitingRequest[]
  readonly artifacts: readonly Artifact[]
  readonly artifactVersions: readonly ArtifactVersion[]
}
export type TaskSummary = Task & { readonly status: TaskStatus }
export type RunDetail = Run & {
  readonly snapshots: readonly RunContextSnapshot[]
  readonly waitingRequests: readonly WaitingRequest[]
}
