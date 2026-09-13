import type {
  ContextSource,
  Id,
  Message,
  Project,
  Result,
  Run,
  Task,
  TaskContextSelection,
  WaitingRequest,
} from './types'

export interface OperationInput {
  readonly operationId: Id
}
export interface ProjectInput extends OperationInput {
  readonly name: string
  readonly description: string | undefined
  readonly folderPath: string | undefined
}
export interface ProjectAction extends OperationInput {
  readonly projectId: Id
}
export interface TaskAction extends OperationInput {
  readonly taskId: Id
}
export interface RunAction extends OperationInput {
  readonly runId: Id
}
export interface SourceAction extends OperationInput {
  readonly sourceId: Id
}
export interface WaitingAction extends OperationInput {
  readonly requestId: Id
}
export interface SubmitRequestInput extends ProjectAction {
  readonly taskId: Id | undefined
  readonly title: string | undefined
  readonly text: string
}
export interface AcceptedRequest {
  readonly message: Message
  readonly run: Run
  readonly task: Task
}
export interface WorkspaceActions {
  createProject(input: ProjectInput): Promise<Result<Project>>
  updateProject(input: ProjectInput & ProjectAction): Promise<Result<Project>>
  createTask(
    input: ProjectAction & { readonly title: string },
  ): Promise<Result<Task>>
  renameTask(
    input: TaskAction & { readonly title: string },
  ): Promise<Result<Task>>
  submitRequest(input: SubmitRequestInput): Promise<Result<AcceptedRequest>>
  retryRun(input: RunAction): Promise<Result<Run>>
  addContextSource(
    input: ProjectAction & {
      readonly label: string
      readonly kind: 'file' | 'folder'
      readonly path: string
    },
  ): Promise<Result<ContextSource>>
  removeContextSource(input: SourceAction): Promise<Result<ContextSource>>
  setTaskContext(
    input: TaskAction & { readonly sourceIds: readonly Id[] },
  ): Promise<Result<readonly TaskContextSelection[]>>
  answerQuestion(
    input: WaitingAction & { readonly text: string },
  ): Promise<
    Result<{ readonly request: WaitingRequest; readonly message: Message }>
  >
  resolveApproval(
    input: WaitingAction & {
      readonly proposalId: Id
      readonly decision: 'approved' | 'declined'
    },
  ): Promise<Result<WaitingRequest>>
  stopRun(input: RunAction): Promise<Result<Run>>
  archiveProject(input: ProjectAction): Promise<Result<Project>>
  archiveTask(input: TaskAction): Promise<Result<Task>>
  restoreProject(input: ProjectAction): Promise<Result<Project>>
  restoreTask(input: TaskAction): Promise<Result<Task>>
  deleteProject(input: ProjectAction): Promise<Result<Id>>
  deleteTask(input: TaskAction): Promise<Result<Id>>
}
