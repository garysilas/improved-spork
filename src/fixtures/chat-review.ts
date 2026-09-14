import { workspaceScenarios } from './workspace'
import type { WorkspaceData } from '@/services/workspace/types'

/** One fabricated completed run, isolated from the lifecycle demonstration fixtures. */
export function chatReviewFixture(): WorkspaceData {
  const data = workspaceScenarios.completed()
  const runId = 'run-completed'
  const createdAt = '2026-09-13T12:00:00.000Z'
  const endedAt = '2026-09-13T13:00:00.000Z'
  return {
    ...data,
    tasks: data.tasks.map((task) => ({
      ...task,
      title: 'Create a project plan',
    })),
    runs: data.runs.filter((run) => run.id === runId),
    messages: [
      {
        id: 'message-completed',
        taskId: 'task-completed',
        runId,
        author: 'user',
        sequence: 1,
        createdAt,
        text: 'Turn the supplied project notes into a short Markdown plan. Group the work into clear phases and finish with a review checklist.',
      },
      {
        id: 'message-review-result',
        taskId: 'task-completed',
        runId,
        author: 'assistant',
        sequence: 2,
        createdAt: endedAt,
        text: 'The plan is ready. I organized the sample notes into three phases: define the first slice, build a clickable sample, and review it.\n\nEach phase has a concrete outcome, followed by a short checklist to guide the review. You can inspect the Markdown below.',
      },
    ],
    snapshots: data.snapshots
      .filter((snapshot) => snapshot.runId === runId)
      .map((snapshot) => ({
        ...snapshot,
        files: snapshot.files.map((file) => ({
          ...file,
          content:
            '# Project notes\n\nStart with a clear outline. Build one clickable sample using fabricated content. Review the result at desktop and narrow widths. Keep the first version small.',
        })),
      })),
    activity: [
      {
        id: 'review-read',
        runId,
        sequence: 1,
        kind: 'context',
        summary: 'Read project notes',
        createdAt,
      },
      {
        id: 'review-organize',
        runId,
        sequence: 2,
        kind: 'progress',
        summary: 'Organize the plan',
        createdAt,
      },
      {
        id: 'review-artifact',
        runId,
        sequence: 3,
        kind: 'artifact',
        summary: 'Create Markdown plan',
        createdAt: endedAt,
      },
    ],
    waitingRequests: [],
    artifactVersions: data.artifactVersions
      .filter((version) => version.producingRunId === runId)
      .map((version) => ({
        ...version,
        content:
          '# Project plan\n\n## 1. Define the first slice\n\nChoose one task to demonstrate. Write down its input, expected result, and what a successful review should show.\n\nOutcome: a short, agreed outline.\n\n## 2. Build a clickable sample\n\nUse fabricated project notes. Show the request, completed activity, and generated plan in the workspace. Keep the sample clearly labelled.\n\nOutcome: one complete example that can be explored.\n\n## 3. Review and refine\n\nRead the conversation and inspect the plan. Check the layout at desktop and narrow widths. Make the next change from specific feedback.\n\nOutcome: a clear decision about what to improve next.\n\n## Review checklist\n\n- [ ] The request and result are easy to follow.\n- [ ] Activity details are available when needed.\n- [ ] The plan opens and returns to the conversation.\n- [ ] Keyboard focus is visible.\n- [ ] Sample content is unmistakable.\n',
      })),
  }
}
