// Adapted from shadcn.io sidebar-developer-tools, selected by Gary.
// https://www.shadcn.io/blocks/sidebar-developer-tools
import { type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'

import {
  ChevronRightIcon,
  ContainerIcon,
  LayoutGridIcon,
  MessageSquareIcon,
  PaletteIcon,
} from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'

function SidebarLink({
  to,
  children,
  ...props
}: React.ComponentProps<typeof NavLink>) {
  const { isMobile, setOpenMobile } = useSidebar()
  return (
    <NavLink
      to={to}
      onClick={() => {
        if (isMobile) setOpenMobile(false)
      }}
      {...props}
    >
      {children}
    </NavLink>
  )
}

const data = {
  groups: [
    {
      title: 'Workspace',
      defaultOpen: true,
      items: [
        { title: 'Overview', url: '/workspace', icon: LayoutGridIcon },
        {
          title: 'Sample task',
          url: '/workspace/task-preview',
          icon: MessageSquareIcon,
        },
      ],
    },
    {
      title: 'Settings',
      defaultOpen: true,
      items: [
        { title: 'Appearance', url: '/settings/appearance', icon: PaletteIcon },
      ],
    },
  ],
}

export default function SidebarDeveloperTools({
  children,
}: {
  children: ReactNode
}) {
  const { pathname } = useLocation()
  const group = data.groups.find((group) =>
    group.items.some((item) => item.url === pathname),
  )
  const current = group?.items.find((item) => item.url === pathname)
  return (
    <TooltipProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-background focus:p-3"
      >
        Skip to content
      </a>
      <div className="min-h-svh bg-card">
        <SidebarProvider className="min-h-svh">
          <Sidebar collapsible="icon" className="border-r">
            <SidebarHeader>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton size="lg" asChild>
                    <SidebarLink
                      to="/workspace"
                      aria-label="Agent Operating Environment"
                    >
                      <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                        <ContainerIcon className="size-4" />
                      </div>
                      <div className="flex flex-col gap-0.5 leading-none">
                        <span className="font-medium">Agent Operating</span>
                        <span className="text-xs">Environment</span>
                      </div>
                    </SidebarLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
              <nav aria-label="Application">
                {data.groups.map((group) => (
                  <Collapsible
                    key={group.title}
                    defaultOpen={group.defaultOpen}
                    className="group/collapsible"
                  >
                    <SidebarGroup>
                      <SidebarGroupLabel asChild>
                        <CollapsibleTrigger className="flex w-full items-center">
                          {group.title}
                          <ChevronRightIcon className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </CollapsibleTrigger>
                      </SidebarGroupLabel>
                      <CollapsibleContent>
                        <SidebarGroupContent>
                          <SidebarMenu>
                            {group.items.map((item) => (
                              <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                  asChild
                                  isActive={pathname === item.url}
                                  tooltip={item.title}
                                >
                                  <SidebarLink to={item.url} end>
                                    <item.icon aria-hidden="true" />
                                    <span>{item.title}</span>
                                  </SidebarLink>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            ))}
                          </SidebarMenu>
                        </SidebarGroupContent>
                      </CollapsibleContent>
                    </SidebarGroup>
                  </Collapsible>
                ))}
              </nav>
            </SidebarContent>
            <SidebarRail />
          </Sidebar>

          <SidebarInset id="main-content" className="min-w-0 flex-1">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink asChild>
                      <NavLink to={group?.items[0].url ?? '/workspace'}>
                        {group?.title ?? 'Workspace'}
                      </NavLink>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      {current?.title ?? 'Page not found'}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              {group?.title === 'Workspace' && (
                <Badge variant="secondary" className="ml-auto shrink-0">
                  Sample workspace
                </Badge>
              )}
            </header>
            {children}
          </SidebarInset>
        </SidebarProvider>
      </div>
    </TooltipProvider>
  )
}
