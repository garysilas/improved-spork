# Workspace design

Source: architecture spec 0001. This scaffold uses neutral shadcn Radix components, semantic colors, Lucide icons, and the system sans serif font.

## Review status and next step

The sections below describe the current scaffold and its existing reuse rules, not an accepted design for the full workspace. The September 13 Figma exploration is paused and was not approved. Its Geist font, panel dimensions, and composed screens must not silently replace the current application defaults.

Gary selected the actual shadcn.io Chat With Tools block after reviewing its live preview and accepted the running app review route. The first completed sample is now implemented at `/workspace/task-preview`. Preserve its header, plain message rows, expandable tool cards, result action, and composer. Spec 0003 records the bounded first review. Visual acceptance is pending. Do not restart the design questionnaire or expand Figma.

Interview choices, Figma links, unfinished work, and the proposed next step are recorded under feature 4 and the handoff in [scope](docs/scope/scope.md). Those choices are useful inputs, not approval of the first visual pass. The existing Developer Tools Sidebar and Appearance behavior remain the implementation baseline.

## Character and composition

A quiet workspace with clear regions. A compact navigation rail anchors the application title and Settings link. The workspace contains project navigation, a main task area, and an artifact panel. Sample labels stay visible. Appearance uses a page heading and grouped cards for theme selection, mode, and local preferences, with a dialog for importing CSS.

## Build mandate

Keep the scaffold small and complete within the accepted spec. Use clear headings, meaningful empty states, and readable loading and failure states. Keep working controls distinct from sample content.

## Components and tokens

Use the installed shadcn components and their variants. Default token values live in src/themes/defaults.ts. Tailwind mappings and shared styles live in src/index.css. Imported themes replace supported values through the shared token map. Fonts use local system fallbacks.

## Responsive and accessibility behavior

The overview retains its scaffold layout. The sample task uses one conversation surface, the existing navigation sheet on narrow windows, and a full width Markdown detail sheet with a return action. Settings cards flow in one column. Keep navigation, controls, and sample content reachable at 375 CSS pixels. Use labelled fields, visible keyboard focus, semantic regions, and Radix dialog focus management.

## Block selection and reuse

Gary selected the shadcn.io Developer Tools Sidebar block as the application shell. Start with the actual selected block source and adapt its content. Preserve its cohesive layout, collapsible groups, icon collapse, tooltips, rail, and header toggle. The implementation lives in src/components/blocks/sidebar/sidebar-developer-tools.tsx.

Use blocks Gary supplies as the starting point for future interface work. Inspect them through shadcn.io MCP and the live preview before modifying them. Ask Gary before designing a replacement from scratch. Do not substitute a collection of separate primitives when a selected block already provides the composed interface.
