import type { RunState, Task, WorkspaceData } from '../services/workspace/types'

export const sampleProjectId = 'project-sample'
const time = '2026-09-13T12:00:00.000Z'
const later = '2026-09-13T13:00:00.000Z'
/** A new envelope on each call, with no shared mutable collections. All content is fabricated. */
export function emptyWorkspace(): WorkspaceData {
  return {
    schemaVersion: 1,
    mode: 'sample',
    projects: [],
    tasks: [],
    messages: [],
    runs: [],
    contextSources: [],
    selections: [],
    snapshots: [],
    activity: [],
    waitingRequests: [],
    artifacts: [],
    artifactVersions: [],
  }
}
const project = (
  id: string,
  name: string,
  archivedAt: string | undefined = undefined,
) => ({
  id,
  name,
  description: 'Fabricated sample content',
  folderPath: undefined,
  createdAt: time,
  updatedAt: later,
  archivedAt,
})
const task = (
  id: string,
  title: string,
  projectId = sampleProjectId,
  archivedAt: string | undefined = undefined,
): Task => ({
  id,
  projectId,
  title,
  createdAt: time,
  updatedAt: later,
  archivedAt,
})

export function sampleWorkspace(): WorkspaceData {
  const states: readonly {
    readonly id: string
    readonly state: RunState
    readonly failureCode?: string
  }[] = [
    { id: 'queued', state: 'queued' },
    { id: 'running', state: 'running' },
    { id: 'question', state: 'waiting' },
    { id: 'approval', state: 'waiting' },
    { id: 'completed', state: 'completed' },
    { id: 'failed', state: 'failed', failureCode: 'execution_failed' },
    { id: 'stopped', state: 'stopped' },
    { id: 'interrupted', state: 'failed', failureCode: 'interrupted' },
    { id: 'declined', state: 'running' },
    { id: 'answered', state: 'running' },
    { id: 'archived', state: 'completed' },
  ]
  const tasks = states.map((s) =>
    task(
      `task-${s.id}`,
      s.id === 'archived' ? 'Archived sample' : 'Sample task',
      s.id === 'archived' ? 'project-archived' : sampleProjectId,
    ),
  )
  const messages = states.map((s) => ({
    id: `message-${s.id}`,
    taskId: `task-${s.id}`,
    runId: `run-${s.id}`,
    author: 'user' as const,
    text: 'Draft a plan from the supplied sample notes.',
    sequence: 1,
    createdAt: time,
  }))
  const runs = states.map((s) => ({
    id: `run-${s.id}`,
    taskId: `task-${s.id}`,
    initiatingMessageId: `message-${s.id}`,
    sequence: 1,
    state: s.state,
    retryOfRunId: undefined,
    createdAt: time,
    startedAt: s.state === 'queued' ? undefined : time,
    endedAt: ['completed', 'failed', 'stopped'].includes(s.state)
      ? later
      : undefined,
    failure: s.failureCode
      ? {
          code: s.failureCode,
          message: 'Sample execution ended. No real agent was involved.',
        }
      : undefined,
  }))
  return {
    ...emptyWorkspace(),
    projects: [
      project(sampleProjectId, 'Sample project'),
      project('project-empty', 'Empty project'),
      project('project-archived', 'Archived project', later),
    ],
    tasks: [
      ...tasks,
      task('task-draft', 'Draft task'),
      task('task-own-archive', 'Archived task', sampleProjectId, later),
      ...Array.from({ length: 26 }, (_, index) =>
        task(`task-extra-${String(index + 1).padStart(2, '0')}`, 'Sample task'),
      ),
    ],
    messages: [
      ...messages,
      {
        id: 'message-followup',
        taskId: 'task-completed',
        runId: 'run-followup',
        author: 'user',
        text: 'Revise the plan using the new sample notes.',
        sequence: 2,
        createdAt: later,
      },
      {
        id: 'message-result',
        taskId: 'task-completed',
        runId: 'run-followup',
        author: 'assistant',
        text: 'The revised sample plan is ready.',
        sequence: 3,
        createdAt: later,
      },
      {
        id: 'message-answer',
        taskId: 'task-answered',
        runId: 'run-answered',
        author: 'user',
        text: 'Use the shorter outline.',
        sequence: 2,
        createdAt: later,
      },
      {
        id: 'message-retry',
        taskId: 'task-failed',
        runId: 'run-retry',
        author: 'user',
        text: messages[0].text,
        sequence: 2,
        createdAt: later,
      },
    ],
    runs: [
      ...runs,
      {
        ...runs[4],
        id: 'run-followup',
        initiatingMessageId: 'message-followup',
        sequence: 2,
        createdAt: later,
        startedAt: later,
        endedAt: later,
      },
      {
        ...runs[5],
        id: 'run-retry',
        initiatingMessageId: 'message-retry',
        sequence: 2,
        retryOfRunId: 'run-failed',
        createdAt: later,
        startedAt: later,
        endedAt: later,
      },
    ],
    contextSources: [
      {
        id: 'source-old',
        projectId: sampleProjectId,
        label: 'Old sample notes',
        kind: 'file',
        path: '/sample/old-notes.md',
        createdAt: time,
        removedAt: later,
      },
      {
        id: 'source-current',
        projectId: sampleProjectId,
        label: 'Current sample notes',
        kind: 'file',
        path: '/sample/notes.md',
        createdAt: time,
        removedAt: undefined,
      },
      {
        id: 'source-folder',
        projectId: sampleProjectId,
        label: 'Empty sample folder',
        kind: 'folder',
        path: '/sample/empty',
        createdAt: time,
        removedAt: undefined,
      },
    ],
    selections: [
      {
        id: 'selection-current',
        taskId: 'task-completed',
        sourceId: 'source-current',
      },
      {
        id: 'selection-folder',
        taskId: 'task-completed',
        sourceId: 'source-folder',
      },
    ],
    snapshots: [
      {
        id: 'snapshot-old',
        runId: 'run-completed',
        sourceId: 'source-old',
        sourcePath: '/sample/old-notes.md',
        capturedAt: time,
        files: [
          {
            path: '/sample/old-notes.md',
            format: 'markdown',
            content: '# Sample notes\nStart with an outline.',
          },
        ],
      },
      {
        id: 'snapshot-current',
        runId: 'run-followup',
        sourceId: 'source-current',
        sourcePath: '/sample/notes.md',
        capturedAt: later,
        files: [
          {
            path: '/sample/notes.md',
            format: 'markdown',
            content: '# Sample notes\nKeep the outline short.',
          },
        ],
      },
      {
        id: 'snapshot-folder',
        runId: 'run-followup',
        sourceId: 'source-folder',
        sourcePath: '/sample/empty',
        capturedAt: later,
        files: [],
      },
    ],
    activity: runs.map((r) => ({
      id: `activity-${r.id}`,
      runId: r.id,
      sequence: 1,
      kind: 'state_change',
      summary: `Sample state: ${r.state}`,
      createdAt: time,
    })),
    waitingRequests: [
      {
        id: 'waiting-question',
        runId: 'run-question',
        kind: 'question',
        prompt: 'Which sample outline should I use?',
        createdAt: time,
        resolution: undefined,
      },
      {
        id: 'waiting-approval',
        runId: 'run-approval',
        kind: 'approval',
        prompt: 'Review this fabricated change.',
        createdAt: time,
        resolution: undefined,
        proposal: {
          id: 'proposal-pending',
          changes: [
            {
              path: '/sample/plan.md',
              before: undefined,
              after: '# Sample plan',
            },
          ],
        },
      },
      {
        id: 'waiting-declined',
        runId: 'run-declined',
        kind: 'approval',
        prompt: 'Review this fabricated change.',
        createdAt: time,
        resolution: {
          kind: 'approval',
          decision: 'declined',
          resolvedAt: later,
        },
        proposal: {
          id: 'proposal-declined',
          changes: [
            {
              path: '/sample/plan.md',
              before: 'Old sample',
              after: 'New sample',
            },
          ],
        },
      },
      {
        id: 'waiting-answered',
        runId: 'run-answered',
        kind: 'question',
        prompt: 'Which outline?',
        createdAt: time,
        resolution: {
          kind: 'answer',
          messageId: 'message-answer',
          resolvedAt: later,
        },
      },
      {
        id: 'waiting-cancelled',
        runId: 'run-stopped',
        kind: 'question',
        prompt: 'Continue the sample?',
        createdAt: time,
        resolution: { kind: 'cancelled', resolvedAt: later },
      },
    ],
    artifacts: [
      {
        id: 'artifact-plan',
        taskId: 'task-completed',
        title: 'Sample plan',
        createdAt: time,
      },
      {
        id: 'artifact-retained',
        taskId: 'task-stopped',
        title: 'Published before stop',
        createdAt: time,
      },
    ],
    artifactVersions: [
      {
        id: 'version-one',
        artifactId: 'artifact-plan',
        producingRunId: 'run-completed',
        version: 1,
        format: 'markdown',
        content: '# Sample plan\nCreate an outline, then review it.',
        createdAt: time,
      },
      {
        id: 'version-two',
        artifactId: 'artifact-plan',
        producingRunId: 'run-followup',
        version: 2,
        format: 'markdown',
        content: '# Sample plan\nReview a short outline.',
        createdAt: later,
      },
      {
        id: 'version-retained',
        artifactId: 'artifact-retained',
        producingRunId: 'run-stopped',
        version: 1,
        format: 'text',
        content: '',
        createdAt: time,
      },
    ],
  }
}

function taskScenario(taskId: string): WorkspaceData {
  const data = sampleWorkspace()
  const tasks = data.tasks.filter((t) => t.id === taskId)
  const runs = data.runs.filter((r) => r.taskId === taskId)
  const artifacts = data.artifacts.filter((a) => a.taskId === taskId)
  return {
    ...data,
    projects: data.projects.filter((p) =>
      tasks.some((t) => t.projectId === p.id),
    ),
    tasks,
    runs,
    messages: data.messages.filter((m) => m.taskId === taskId),
    contextSources: data.contextSources.filter((s) =>
      tasks.some((t) => t.projectId === s.projectId),
    ),
    selections: data.selections.filter((s) => s.taskId === taskId),
    snapshots: data.snapshots.filter((s) => runs.some((r) => r.id === s.runId)),
    activity: data.activity.filter((a) => runs.some((r) => r.id === a.runId)),
    waitingRequests: data.waitingRequests.filter((w) =>
      runs.some((r) => r.id === w.runId),
    ),
    artifacts,
    artifactVersions: data.artifactVersions.filter((v) =>
      artifacts.some((a) => a.id === v.artifactId),
    ),
  }
}

/** Each named scenario is an independent coherent graph. Reader failures are constructor options. */
export const workspaceScenarios = {
  emptyWorkspace,
  emptyProject: (): WorkspaceData => ({
    ...emptyWorkspace(),
    projects: [project(sampleProjectId, 'Empty project')],
  }),
  lifecycle: sampleWorkspace,
  draft: (): WorkspaceData => taskScenario('task-draft'),
  queued: (): WorkspaceData => taskScenario('task-queued'),
  running: (): WorkspaceData => taskScenario('task-running'),
  waitingForInput: (): WorkspaceData => taskScenario('task-question'),
  waitingForApproval: (): WorkspaceData => taskScenario('task-approval'),
  completed: (): WorkspaceData => taskScenario('task-completed'),
  failed: (): WorkspaceData => taskScenario('task-failed'),
  stopped: (): WorkspaceData => taskScenario('task-stopped'),
  interrupted: (): WorkspaceData => taskScenario('task-interrupted'),
  archivedProject: (): WorkspaceData => taskScenario('task-archived'),
  archivedTask: (): WorkspaceData => taskScenario('task-own-archive'),
  declinedApproval: (): WorkspaceData => taskScenario('task-declined'),
  answeredQuestion: (): WorkspaceData => taskScenario('task-answered'),
  artifactHistory: (): WorkspaceData => taskScenario('task-completed'),
  removedSourceHistory: sampleWorkspace,
  paginationAndRepeatedTitles: sampleWorkspace,
  unavailableRead: { unavailable: true },
  missingArtifactVersion: { artifactId: 'artifact-plan', version: 99 },
} as const
