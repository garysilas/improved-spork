import type {
  CapturedFile,
  ErrorCode,
  Project,
  Resolution,
  Result,
  Run,
  RunContextSnapshot,
  RunState,
  Task,
  TaskStatus,
  WaitingRequest,
  WorkspaceData,
} from './types'

export const success = <T>(value: T): Result<T> => ({ ok: true, value })
export const failure = (code: ErrorCode, message: string): Result<never> => ({
  ok: false,
  error: { code, message },
})
export const isActive = (run: Run): boolean =>
  ['queued', 'running', 'waiting'].includes(run.state)
export function latestRun(
  taskId: string,
  runs: readonly Run[],
): Run | undefined {
  return runs
    .filter((run) => run.taskId === taskId)
    .toSorted((a, b) => b.sequence - a.sequence)[0]
}
export function taskStatus(taskId: string, runs: readonly Run[]): TaskStatus {
  const run = latestRun(taskId, runs)
  return !run
    ? 'draft'
    : run.state === 'failed' && run.failure?.code === 'interrupted'
      ? 'interrupted'
      : run.state
}
export const isArchived = (task: Task, project: Project): boolean =>
  Boolean(task.archivedAt || project.archivedAt)
const transitions: Readonly<Record<RunState, readonly RunState[]>> = {
  queued: ['running', 'failed', 'stopped'],
  running: ['waiting', 'completed', 'failed', 'stopped'],
  waiting: ['running', 'failed', 'stopped'],
  completed: [],
  failed: [],
  stopped: [],
}
/** Checks a future worker transition without changing history. */
export const canTransition = (from: RunState, to: RunState): boolean =>
  transitions[from].includes(to)
export const canRetry = (run: Run): boolean =>
  run.state === 'failed' || run.state === 'stopped'
/** Input normalization for future forms, without accepting a message or run. */
export function normalizeTitle(value: string): Result<string> {
  const title = value.trim()
  return title && [...title].length <= 120
    ? success(title)
    : failure('invalid_input', 'Use a title of 1 to 120 characters.')
}
export const normalizeDescription = (
  value: string | undefined,
): string | undefined => value?.trim() || undefined
export function requestTitle(text: string): Result<string> {
  const line = text.split(/\r?\n/).find((part) => part.trim())
  return line
    ? normalizeTitle([...line.trim()].slice(0, 120).join(''))
    : failure('invalid_input', 'Enter a request.')
}
/** Archive and deletion eligibility only. No records or disk files are changed. */
export function retentionEligibility(
  data: WorkspaceData,
  kind: 'project' | 'task',
  id: string,
  action: 'archive' | 'delete',
): Result<string> {
  const record =
    kind === 'project'
      ? data.projects.find((p) => p.id === id)
      : data.tasks.find((t) => t.id === id)
  if (!record) return failure('not_found', 'Work was not found.')
  const tasks = data.tasks.filter((t) =>
    kind === 'project' ? t.projectId === id : t.id === id,
  )
  if (
    data.runs.some((r) => tasks.some((t) => t.id === r.taskId) && isActive(r))
  )
    return failure('active_run', 'Stop active work first.')
  const parent =
    kind === 'task'
      ? data.projects.find((p) => p.id === tasks[0]?.projectId)
      : undefined
  if (action === 'delete' && !record.archivedAt && !parent?.archivedAt)
    return failure('not_archived', 'Archive this work before deleting it.')
  return success(id)
}

export function submissionEligibility(
  data: WorkspaceData,
  taskId: string,
  unavailableSourceIds: readonly string[] = [],
): Result<string> {
  const task = data.tasks.find((t) => t.id === taskId)
  const project = data.projects.find((p) => p.id === task?.projectId)
  if (!task || !project) return failure('not_found', 'Work was not found.')
  if (isArchived(task, project))
    return failure('archived', 'Restore this work before continuing.')
  if (data.runs.some((r) => r.taskId === taskId && isActive(r)))
    return failure('active_run', 'Wait for the current run or stop it first.')
  const sources = data.selections
    .filter((s) => s.taskId === taskId)
    .map((s) => data.contextSources.find((source) => source.id === s.sourceId))
  if (
    sources.some(
      (s) =>
        !s ||
        s.removedAt ||
        s.projectId !== task.projectId ||
        unavailableSourceIds.includes(s.id),
    )
  )
    return failure(
      'context_unavailable',
      'Restore or remove unavailable context before submitting.',
    )
  return success(taskId)
}

export function suppliedContext(
  snapshots: readonly RunContextSnapshot[],
): Result<readonly CapturedFile[]> {
  const files = new Map<string, CapturedFile>()
  for (const snapshot of snapshots) {
    for (const file of snapshot.files) {
      const existing = files.get(file.path)
      if (
        existing &&
        (existing.content !== file.content || existing.format !== file.format)
      )
        return failure('invalid_data', 'Overlapping sample context conflicts.')
      files.set(file.path, file)
    }
  }
  return success(structuredClone([...files.values()]))
}

export function resolutionEligibility(
  run: Run,
  request: WaitingRequest,
  resolution: Resolution,
): Result<'resume' | 'cancel' | 'unchanged'> {
  if (request.runId !== run.id || run.state === 'stopped')
    return failure('stale_request', 'This request is no longer waiting.')
  if (request.resolution) {
    const prior = request.resolution
    const same =
      prior.kind === resolution.kind &&
      (prior.kind === 'cancelled' ||
        (prior.kind === 'answer' &&
          resolution.kind === 'answer' &&
          prior.messageId === resolution.messageId) ||
        (prior.kind === 'approval' &&
          resolution.kind === 'approval' &&
          prior.decision === resolution.decision))
    return same
      ? success('unchanged')
      : failure(
          'stale_request',
          'This request already has a different resolution.',
        )
  }
  if (run.state !== 'waiting')
    return failure('stale_request', 'This request is no longer waiting.')
  if (resolution.kind === 'cancelled') return success('cancel')
  if (resolution.kind !== (request.kind === 'question' ? 'answer' : 'approval'))
    return failure('invalid_input', 'The response does not match this request.')
  return success('resume')
}
