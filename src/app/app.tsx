import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router'
import { AppLayout } from './layout'
import { Workspace } from '@/features/workspace/workspace'
import { Appearance } from '@/features/settings/appearance'
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@/components/ui/empty'
import { Button } from '@/components/ui/button'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/workspace" replace />} />
          <Route path="workspace" element={<Workspace />}>
            <Route path="task-preview" element={null} />
          </Route>
          <Route
            path="settings"
            element={<Navigate to="/settings/appearance" replace />}
          />
          <Route path="settings/appearance" element={<Appearance />} />
          <Route
            path="*"
            element={
              <section className="flex min-h-96 p-8">
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>
                      <h1>Page not found</h1>
                    </EmptyTitle>
                    <EmptyDescription>
                      This address is not part of the workspace.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button asChild>
                      <Link to="/workspace">Return to workspace</Link>
                    </Button>
                  </EmptyContent>
                </Empty>
              </section>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
