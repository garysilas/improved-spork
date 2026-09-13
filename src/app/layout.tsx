import { Outlet } from 'react-router'
import SidebarDeveloperTools from '@/components/blocks/sidebar/sidebar-developer-tools'

export function AppLayout() {
  return (
    <SidebarDeveloperTools>
      <Outlet />
    </SidebarDeveloperTools>
  )
}
