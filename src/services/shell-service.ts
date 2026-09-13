export interface ShellSnapshot {
  projectLabel: string
  taskPlaceholder: string
  artifactPlaceholder: string
}
export interface ShellService {
  loadShell(): Promise<ShellSnapshot>
}
