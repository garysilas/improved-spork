import { shellFixture } from '@/fixtures/shell'
import { sampleProjectId } from '@/fixtures/workspace'
import type { ShellService } from '../shell-service'
import type { WorkspaceReader } from '../workspace/reader'

export function createMockShellService(
  reader: WorkspaceReader,
  projectId = sampleProjectId,
): ShellService {
  return {
    async loadShell() {
      const result = await reader.getProject(projectId)
      if (!result.ok)
        throw new Error(result.error.message, { cause: result.error })
      return { ...shellFixture, projectLabel: result.value.name }
    },
  }
}
