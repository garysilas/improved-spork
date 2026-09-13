import { failure, isArchived, success, taskStatus } from '../workspace/derive'
import { validateWorkspace } from '../workspace/validate'
import type {
  ArchiveFilter,
  ArchivePageInput,
  Page,
  PageInput,
  SourcePageInput,
  WorkspaceReader,
} from '../workspace/reader'
import type { Result, WorkspaceData } from '../workspace/types'

export interface MockWorkspaceOptions {
  readonly unavailable?: boolean | (() => boolean) | undefined
  readonly delayMs?: number | undefined
}
type Key = readonly (string | number)[]
const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
const compare = (a: string | number, b: string | number): number =>
  a < b ? -1 : a > b ? 1 : 0
const createdKey = (item: {
  readonly createdAt: string
  readonly id: string
}): Key => [Date.parse(item.createdAt), item.id]
const updatedKey = (item: {
  readonly updatedAt: string
  readonly id: string
}): Key => [-Date.parse(item.updatedAt), item.id]
const sequenceKey = (item: { readonly sequence: number }): Key => [
  item.sequence,
]
const versionKey = (item: { readonly version: number }): Key => [item.version]
const matchesArchive = (archived: boolean, filter: ArchiveFilter): boolean =>
  filter === 'all' || archived === (filter === 'archived')
const archiveFilter = (input: ArchivePageInput): ArchiveFilter =>
  input.archive ?? 'active'
const validArchive = (input: unknown): boolean =>
  record(input) &&
  (input.archive === undefined ||
    (typeof input.archive === 'string' &&
      ['active', 'archived', 'all'].includes(input.archive)))
const missing = () =>
  failure('not_found', 'The requested sample record was not found.')

function page<T>(
  items: readonly T[],
  input: PageInput,
  query: string,
  key: (item: T) => Key,
): Result<Page<T>> {
  if (!record(input)) return failure('invalid_input', 'Use valid page options.')
  const limit = input.limit === undefined ? 25 : input.limit
  if (
    !Number.isInteger(limit) ||
    typeof limit !== 'number' ||
    limit < 1 ||
    limit > 100 ||
    (input.cursor !== undefined && typeof input.cursor !== 'string')
  )
    return failure(
      'invalid_input',
      'Use a page limit from 1 to 100 and a valid cursor.',
    )
  const sorted = items.toSorted((a, b) => {
    const left = key(a)
    const right = key(b)
    for (let i = 0; i < left.length; i++) {
      const order = compare(left[i], right[i])
      if (order) return order
    }
    return 0
  })
  let start = 0
  if (input.cursor !== undefined) {
    let cursor: unknown
    try {
      cursor = JSON.parse(decodeURIComponent(input.cursor))
    } catch {
      return failure('invalid_input', 'The page cursor is malformed.')
    }
    if (!record(cursor) || cursor.query !== query || !Array.isArray(cursor.key))
      return failure(
        'invalid_input',
        'The page cursor does not match this query.',
      )
    const lastKey = JSON.stringify(cursor.key)
    const index = sorted.findIndex(
      (item) => JSON.stringify(key(item)) === lastKey,
    )
    if (index < 0)
      return failure('invalid_input', 'The page cursor is no longer available.')
    start = index + 1
  }
  const batch = sorted.slice(start, start + limit)
  const nextCursor =
    start + batch.length < sorted.length
      ? encodeURIComponent(
          JSON.stringify({ query, key: key(batch[batch.length - 1]) }),
        )
      : undefined
  return success({ items: batch, nextCursor })
}

export function createMockWorkspaceReader(
  input: unknown,
  options: MockWorkspaceOptions = {},
): WorkspaceReader {
  const unavailable = options.unavailable
  const delayMs = options.delayMs ?? 0
  const unexpected = (): Result<never> => {
    if (import.meta.env.DEV)
      console.error(
        'Unexpected sample reader failure. No workspace contents were logged.',
      )
    return failure(
      'unavailable',
      'Sample content is temporarily unavailable. Try again.',
    )
  }
  const validated = (() => {
    try {
      return validateWorkspace(input)
    } catch {
      return unexpected()
    }
  })()
  async function read<T>(
    operation: (data: WorkspaceData) => Result<T>,
  ): Promise<Result<T>> {
    try {
      if (delayMs > 0)
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      if (!validated.ok) return structuredClone(validated)
      if (typeof unavailable === 'function' ? unavailable() : unavailable)
        return failure(
          'unavailable',
          'Sample content is temporarily unavailable. Try again.',
        )
      return structuredClone(operation(validated.value))
    } catch {
      return unexpected()
    }
  }
  return {
    listProjects: (input = {}) =>
      read((data) =>
        validArchive(input)
          ? page(
              data.projects.filter((p) =>
                matchesArchive(Boolean(p.archivedAt), archiveFilter(input)),
              ),
              input,
              JSON.stringify(['projects', archiveFilter(input)]),
              updatedKey,
            )
          : failure('invalid_input', 'Use a valid archive filter.'),
      ),
    getProject: (projectId) =>
      read((data) => {
        const project = data.projects.find((p) => p.id === projectId)
        return project ? success(project) : missing()
      }),
    listTasks: (projectId, input = {}) =>
      read((data) => {
        if (!validArchive(input))
          return failure('invalid_input', 'Use a valid archive filter.')
        const project = data.projects.find((p) => p.id === projectId)
        if (!project) return missing()
        const tasks = data.tasks
          .filter(
            (t) =>
              t.projectId === projectId &&
              matchesArchive(isArchived(t, project), archiveFilter(input)),
          )
          .map((t) => ({ ...t, status: taskStatus(t.id, data.runs) }))
        return page(
          tasks,
          input,
          JSON.stringify(['tasks', projectId, archiveFilter(input)]),
          updatedKey,
        )
      }),
    getTask: (taskId) =>
      read((data) => {
        const task = data.tasks.find((t) => t.id === taskId)
        return task
          ? success({ ...task, status: taskStatus(taskId, data.runs) })
          : missing()
      }),
    listMessages: (taskId, input = {}) =>
      read((data) =>
        data.tasks.some((t) => t.id === taskId)
          ? page(
              data.messages.filter((m) => m.taskId === taskId),
              input,
              JSON.stringify(['messages', taskId]),
              sequenceKey,
            )
          : missing(),
      ),
    listRuns: (taskId, input = {}) =>
      read((data) =>
        data.tasks.some((t) => t.id === taskId)
          ? page(
              data.runs.filter((r) => r.taskId === taskId),
              input,
              JSON.stringify(['runs', taskId]),
              sequenceKey,
            )
          : missing(),
      ),
    getRun: (runId) =>
      read((data) => {
        const run = data.runs.find((r) => r.id === runId)
        return run
          ? success({
              ...run,
              snapshots: data.snapshots.filter((s) => s.runId === runId),
              waitingRequests: data.waitingRequests.filter(
                (w) => w.runId === runId,
              ),
            })
          : missing()
      }),
    listActivity: (runId, input = {}) =>
      read((data) =>
        data.runs.some((r) => r.id === runId)
          ? page(
              data.activity.filter((a) => a.runId === runId),
              input,
              JSON.stringify(['activity', runId]),
              sequenceKey,
            )
          : missing(),
      ),
    listContextSources: (projectId, input: SourcePageInput = {}) =>
      read((data) => {
        if (
          !record(input) ||
          (input.includeRemoved !== undefined &&
            typeof input.includeRemoved !== 'boolean')
        )
          return failure('invalid_input', 'Use a valid removed source filter.')
        if (!data.projects.some((p) => p.id === projectId)) return missing()
        const includeRemoved = input.includeRemoved ?? false
        return page(
          data.contextSources.filter(
            (s) =>
              s.projectId === projectId && (includeRemoved || !s.removedAt),
          ),
          input,
          JSON.stringify(['sources', projectId, includeRemoved]),
          createdKey,
        )
      }),
    getTaskContext: (taskId) =>
      read((data) =>
        data.tasks.some((t) => t.id === taskId)
          ? success(data.selections.filter((s) => s.taskId === taskId))
          : missing(),
      ),
    listArtifacts: (taskId, input = {}) =>
      read((data) =>
        data.tasks.some((t) => t.id === taskId)
          ? page(
              data.artifacts.filter((a) => a.taskId === taskId),
              input,
              JSON.stringify(['artifacts', taskId]),
              createdKey,
            )
          : missing(),
      ),
    listArtifactVersions: (artifactId, input = {}) =>
      read((data) =>
        data.artifacts.some((a) => a.id === artifactId)
          ? page(
              data.artifactVersions.filter((v) => v.artifactId === artifactId),
              input,
              JSON.stringify(['versions', artifactId]),
              versionKey,
            )
          : missing(),
      ),
    getArtifactVersion: (artifactId, version) =>
      read((data) => {
        if (
          version !== undefined &&
          (!Number.isSafeInteger(version) || version < 1)
        )
          return failure('invalid_input', 'Use a positive version number.')
        const found = data.artifactVersions
          .filter(
            (v) =>
              v.artifactId === artifactId &&
              (version === undefined || v.version === version),
          )
          .toSorted((a, b) => b.version - a.version)[0]
        return found ? success(found) : missing()
      }),
  }
}
