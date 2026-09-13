# Workspace design

Source: architecture spec 0001. This scaffold uses neutral shadcn Radix components, semantic colors, Lucide icons, and the system sans serif font.

## Character and composition

A quiet workspace with clear regions. A compact navigation rail anchors the application title and Settings link. The workspace contains project navigation, a main task area, and an artifact panel. Sample labels stay visible. Appearance uses a page heading and grouped cards for theme selection, mode, and local preferences, with a dialog for importing CSS.

## Build mandate

Keep the scaffold small and complete within the accepted spec. Use clear headings, meaningful empty states, and readable loading and failure states. Keep working controls distinct from sample content.

## Components and tokens

Use the installed shadcn components and their variants. Default token values live in src/themes/defaults.ts. Tailwind mappings and shared styles live in src/index.css. Imported themes replace supported values through the shared token map. Fonts use local system fallbacks.

## Responsive and accessibility behavior

The three workspace regions sit together on a wide window and stack on narrow screens. Settings cards flow in one column. Keep navigation, controls, and sample content reachable at 375 CSS pixels. Use labelled fields, visible keyboard focus, semantic regions, and Radix dialog focus management.

## Block selection and reuse

Gary selected the shadcn.io Developer Tools Sidebar block as the application shell. Start with the actual selected block source and adapt its content. Preserve its cohesive layout, collapsible groups, icon collapse, tooltips, rail, and header toggle. The implementation lives in src/components/blocks/sidebar/sidebar-developer-tools.tsx.

Use blocks Gary supplies as the starting point for future interface work. Inspect them through shadcn.io MCP and the live preview before modifying them. Ask Gary before designing a replacement from scratch. Do not substitute a collection of separate primitives when a selected block already provides the composed interface.
