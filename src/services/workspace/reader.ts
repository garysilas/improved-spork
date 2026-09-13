import type {
  ActivityEvent,
  Artifact,
  ArtifactVersion,
  ContextSource,
  Id,
  Message,
  Project,
  Result,
  Run,
  RunDetail,
  TaskContextSelection,
  TaskSummary,
} from './types'

export type ArchiveFilter = 'active' | 'archived' | 'all'
export interface PageInput {
  readonly cursor?: string | undefined
  readonly limit?: number | undefined
}
export interface Page<T> {
  readonly items: readonly T[]
  readonly nextCursor: string | undefined
}
export interface ArchivePageInput extends PageInput {
  readonly archive?: ArchiveFilter | undefined
}
export interface SourcePageInput extends PageInput {
  readonly includeRemoved?: boolean | undefined
}
export interface WorkspaceReader {
  listProjects(input?: ArchivePageInput): Promise<Result<Page<Project>>>
  getProject(projectId: Id): Promise<Result<Project>>
  listTasks(
    projectId: Id,
    input?: ArchivePageInput,
  ): Promise<Result<Page<TaskSummary>>>
  getTask(taskId: Id): Promise<Result<TaskSummary>>
  listMessages(taskId: Id, input?: PageInput): Promise<Result<Page<Message>>>
  listRuns(taskId: Id, input?: PageInput): Promise<Result<Page<Run>>>
  getRun(runId: Id): Promise<Result<RunDetail>>
  listActivity(
    runId: Id,
    input?: PageInput,
  ): Promise<Result<Page<ActivityEvent>>>
  listContextSources(
    projectId: Id,
    input?: SourcePageInput,
  ): Promise<Result<Page<ContextSource>>>
  getTaskContext(taskId: Id): Promise<Result<readonly TaskContextSelection[]>>
  listArtifacts(taskId: Id, input?: PageInput): Promise<Result<Page<Artifact>>>
  listArtifactVersions(
    artifactId: Id,
    input?: PageInput,
  ): Promise<Result<Page<ArtifactVersion>>>
  getArtifactVersion(
    artifactId: Id,
    version?: number,
  ): Promise<Result<ArtifactVersion>>
}
