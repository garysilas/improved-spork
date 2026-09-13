import { shellFixture } from '@/fixtures/shell'
import type { ShellService } from '../shell-service'

export const mockShellService: ShellService = {
  async loadShell() {
    return { ...shellFixture }
  },
}
