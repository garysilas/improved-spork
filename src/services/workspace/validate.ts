import {
  failure,
  isActive,
  isArchived,
  success,
  suppliedContext,
} from './derive'
import type { Result, WorkspaceData } from './types'

type Check = (value: unknown) => boolean
const string: Check = (v) => typeof v === 'string'
const text: Check = (v) => typeof v === 'string' && v.trim().length > 0
const title: Check = (v) =>
  typeof v === 'string' &&
  v === v.trim() &&
  [...v].length > 0 &&
  [...v].length <= 120
const time: Check = (v) =>
  typeof v === 'string' &&
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(v) &&
  Number.isFinite(Date.parse(v)) &&
  new Date(v).toISOString().slice(0, 19) === v.slice(0, 19)
const integer: Check = (v) => Number.isSafeInteger(v) && Number(v) > 0
const optional =
  (check: Check): Check =>
  (v) =>
    v === undefined || check(v)
const oneOf =
  (...values: readonly unknown[]): Check =>
  (v) =>
    values.includes(v)
const array =
  (check: Check): Check =>
  (v) =>
    Array.isArray(v) && Array.from(v).every(check)
const object =
  (fields: Readonly<Record<string, Check>>): Check =>
  (v) =>
    typeof v === 'object' &&
    v !== null &&
    !Array.isArray(v) &&
    Object.entries(fields).every(([key, check]) =>
      check((v as Record<string, unknown>)[key]),
    )
const entity = (fields: Readonly<Record<string, Check>>): Check =>
  object({ id: text, ...fields })
const format = oneOf('text', 'markdown')
const resolution: Check = (v) =>
  object({ kind: oneOf('answer'), messageId: text, resolvedAt: time })(v) ||
  object({
    kind: oneOf('approval'),
    decision: oneOf('approved', 'declined'),
    resolvedAt: time,
  })(v) ||
  object({ kind: oneOf('cancelled'), resolvedAt: time })(v)
const waitingBase = {
  runId: text,
  prompt: text,
  createdAt: time,
  resolution: optional(resolution),
}
const waiting: Check = (v) =>
  entity({ ...waitingBase, kind: oneOf('question') })(v) ||
  entity({
    ...waitingBase,
    kind: oneOf('approval'),
    proposal: entity({
      changes: array(
        object({
          path: text,
          before: optional(string),
          after: optional(string),
        }),
      ),
    }),
  })(v)
const shape = object({
  schemaVersion: oneOf(1),
  mode: oneOf('sample'),
  projects: array(
    entity({
      name: title,
      description: optional(text),
      folderPath: optional(text),
      createdAt: time,
      updatedAt: time,
      archivedAt: optional(time),
    }),
  ),
  tasks: array(
    entity({
      projectId: text,
      title,
      createdAt: time,
      updatedAt: time,
      archivedAt: optional(time),
    }),
  ),
  messages: array(
    entity({
      taskId: text,
      runId: optional(text),
      author: oneOf('user', 'assistant'),
      text: string,
      sequence: integer,
      createdAt: time,
    }),
  ),
  runs: array(
    entity({
      taskId: text,
      initiatingMessageId: text,
      sequence: integer,
      state: oneOf(
        'queued',
        'running',
        'waiting',
        'completed',
        'failed',
        'stopped',
      ),
      retryOfRunId: optional(text),
      createdAt: time,
      startedAt: optional(time),
      endedAt: optional(time),
      failure: optional(object({ code: text, message: text })),
    }),
  ),
  contextSources: array(
    entity({
      projectId: text,
      label: text,
      kind: oneOf('file', 'folder'),
      path: text,
      createdAt: time,
      removedAt: optional(time),
    }),
  ),
  selections: array(entity({ taskId: text, sourceId: text })),
  snapshots: array(
    entity({
      runId: text,
      sourceId: text,
      sourcePath: text,
      capturedAt: time,
      files: array(object({ path: text, format, content: string })),
    }),
  ),
  activity: array(
    entity({
      runId: text,
      sequence: integer,
      kind: oneOf('progress', 'state_change', 'context', 'artifact', 'error'),
      summary: text,
      createdAt: time,
    }),
  ),
  waitingRequests: array(waiting),
  artifacts: array(entity({ taskId: text, title, createdAt: time })),
  artifactVersions: array(
    entity({
      artifactId: text,
      producingRunId: text,
      version: integer,
      format,
      content: string,
      createdAt: time,
    }),
  ),
})
const unique = <T>(items: readonly T[], key: (item: T) => unknown): boolean =>
  new Set(items.map(key)).size === items.length
const pair = (...parts: readonly unknown[]): string => JSON.stringify(parts)
const before = (left: string, right: string): boolean =>
  Date.parse(left) < Date.parse(right)

/** Validate the entire fixture graph. Failure never exposes a partial dataset or captured content. */
export function validateWorkspace(input: unknown): Result<WorkspaceData> {
  if (!shape(input))
    return failure(
      'invalid_data',
      'The sample record shape or schema version is invalid.',
    )
  // Every nested record has passed its runtime shape check before this boundary cast.
  const data = input as WorkspaceData
  const bad = () =>
    failure(
      'invalid_data',
      'The sample workspace has inconsistent relationships or lifecycle records.',
    )
  const {
    projects,
    tasks,
    messages,
    runs,
    contextSources,
    selections,
    snapshots,
    activity,
    waitingRequests,
    artifacts,
    artifactVersions,
  } = data
  for (const collection of [
    projects,
    tasks,
    messages,
    runs,
    contextSources,
    selections,
    snapshots,
    activity,
    waitingRequests,
    artifacts,
    artifactVersions,
  ]) {
    if (!unique(collection as readonly { readonly id: string }[], (r) => r.id))
      return bad()
  }
  const project = new Map(projects.map((p) => [p.id, p]))
  const task = new Map(tasks.map((t) => [t.id, t]))
  const run = new Map(runs.map((r) => [r.id, r]))
  const message = new Map(messages.map((m) => [m.id, m]))
  const source = new Map(contextSources.map((s) => [s.id, s]))
  const artifact = new Map(artifacts.map((a) => [a.id, a]))
  if (
    !unique(messages, (m) => pair(m.taskId, m.sequence)) ||
    !unique(runs, (r) => pair(r.taskId, r.sequence)) ||
    !unique(selections, (s) => pair(s.taskId, s.sourceId)) ||
    !unique(snapshots, (s) => pair(s.runId, s.sourceId)) ||
    !unique(activity, (a) => pair(a.runId, a.sequence)) ||
    !unique(artifactVersions, (v) => pair(v.artifactId, v.version))
  )
    return bad()
  for (const p of projects) {
    if (
      before(p.updatedAt, p.createdAt) ||
      (p.archivedAt && before(p.archivedAt, p.createdAt))
    )
      return bad()
  }
  for (const t of tasks) {
    const owner = project.get(t.projectId)
    if (
      !owner ||
      before(t.updatedAt, t.createdAt) ||
      (t.archivedAt && before(t.archivedAt, t.createdAt))
    )
      return bad()
    const active = runs.filter((r) => r.taskId === t.id && isActive(r))
    if (active.length > 1 || (active.length && isArchived(t, owner)))
      return bad()
    if (
      active.some((r) =>
        runs.some(
          (later) => later.taskId === t.id && later.sequence > r.sequence,
        ),
      )
    )
      return bad()
  }
  for (const m of messages) {
    if (
      !task.has(m.taskId) ||
      (m.author === 'user' && !text(m.text)) ||
      (m.author === 'assistant' && !m.runId) ||
      (m.runId !== undefined && run.get(m.runId)?.taskId !== m.taskId)
    )
      return bad()
  }
  for (const r of runs) {
    const initiating = message.get(r.initiatingMessageId)
    if (
      !task.has(r.taskId) ||
      !initiating ||
      initiating.taskId !== r.taskId ||
      initiating.author !== 'user'
    )
      return bad()
    if (
      (isActive(r) && r.endedAt !== undefined) ||
      (!isActive(r) && !r.endedAt) ||
      (r.state === 'failed' ? !r.failure : r.failure !== undefined)
    )
      return bad()
    if (
      (['running', 'waiting', 'completed'].includes(r.state) && !r.startedAt) ||
      (r.state === 'queued' && r.startedAt !== undefined)
    )
      return bad()
    if (
      (r.startedAt && before(r.startedAt, r.createdAt)) ||
      (r.endedAt && before(r.endedAt, r.startedAt ?? r.createdAt))
    )
      return bad()
    if (r.retryOfRunId !== undefined) {
      const origin = run.get(r.retryOfRunId)
      if (
        !origin ||
        origin.taskId !== r.taskId ||
        origin.sequence >= r.sequence ||
        !['failed', 'stopped'].includes(origin.state) ||
        message.get(origin.initiatingMessageId)?.text !== initiating.text
      )
        return bad()
    }
    const unresolved = waitingRequests.filter(
      (w) => w.runId === r.id && !w.resolution,
    )
    if (unresolved.length !== (r.state === 'waiting' ? 1 : 0)) return bad()
  }
  for (const s of contextSources)
    if (
      !project.has(s.projectId) ||
      (s.removedAt && before(s.removedAt, s.createdAt))
    )
      return bad()
  for (const s of selections) {
    const selected = source.get(s.sourceId)
    if (
      !task.has(s.taskId) ||
      !selected ||
      selected.removedAt ||
      selected.projectId !== task.get(s.taskId)?.projectId
    )
      return bad()
  }
  for (const s of snapshots) {
    const supplied = source.get(s.sourceId)
    const owner = run.get(s.runId)
    if (
      !supplied ||
      !owner ||
      supplied.projectId !== task.get(owner.taskId)?.projectId ||
      supplied.path !== s.sourcePath ||
      !unique(s.files, (f) => f.path)
    )
      return bad()
    if (
      supplied.kind === 'file' &&
      (s.files.length !== 1 || s.files[0].path !== supplied.path)
    )
      return bad()
    if (
      !suppliedContext(snapshots.filter((other) => other.runId === s.runId)).ok
    )
      return bad()
  }
  for (const a of activity) if (!run.has(a.runId)) return bad()
  for (const w of waitingRequests) {
    const owner = run.get(w.runId)
    if (!owner) return bad()
    if (
      w.kind === 'approval' &&
      (!w.proposal.changes.length ||
        !unique(w.proposal.changes, (c) => c.path) ||
        w.proposal.changes.some(
          (c) => c.before === undefined && c.after === undefined,
        ))
    )
      return bad()
    const resolution = w.resolution
    if (resolution) {
      if (
        before(resolution.resolvedAt, w.createdAt) ||
        (resolution.kind !== 'cancelled' &&
          resolution.kind !== (w.kind === 'question' ? 'answer' : 'approval'))
      )
        return bad()
      if (resolution.kind === 'answer') {
        const answer = message.get(resolution.messageId)
        if (
          !answer ||
          answer.author !== 'user' ||
          answer.taskId !== owner.taskId ||
          answer.runId !== owner.id
        )
          return bad()
      }
    }
  }
  for (const a of artifacts) {
    const versions = artifactVersions
      .filter((v) => v.artifactId === a.id)
      .toSorted((a, b) => a.version - b.version)
    if (
      !task.has(a.taskId) ||
      !versions.length ||
      versions.some((v, index) => v.version !== index + 1)
    )
      return bad()
  }
  for (const v of artifactVersions) {
    const owner = artifact.get(v.artifactId)
    if (!owner || run.get(v.producingRunId)?.taskId !== owner.taskId)
      return bad()
  }
  return success(structuredClone(data))
}
