import { sampleWorkspace } from '@/fixtures/workspace'
import { createMockShellService } from './mock/shell-service'
import { createMockWorkspaceReader } from './mock/workspace-service'
import type { ShellService } from './shell-service'
import type { WorkspaceReader } from './workspace/reader'

export const workspaceReader: WorkspaceReader =
  createMockWorkspaceReader(sampleWorkspace())
export const shellService: ShellService =
  createMockShellService(workspaceReader)

export { createMockShellService } from './mock/shell-service'
export { createMockWorkspaceReader } from './mock/workspace-service'
export type { MockWorkspaceOptions } from './mock/workspace-service'
export type * from './workspace/types'
export type * from './workspace/reader'
export type * from './workspace/actions'
export * from './workspace/derive'
export { validateWorkspace } from './workspace/validate'
