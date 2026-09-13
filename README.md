# Agent Operating Environment

A private browser workspace for personal projects, tasks, and results. The scaffold contains sample content and local Appearance settings. It does not connect to an agent or read project files.

## Run locally

Use Node 22.22.3 and npm. The supported Node version is recorded in `.nvmrc` and `package.json`.

```sh
npm ci
npm run dev
```

Open [the workspace](http://127.0.0.1:5173/workspace). The development server binds to `127.0.0.1:5173`. Keep the terminal process running while using the app. Stop it with Ctrl+C.

```sh
npm run typecheck
npm run build
npm run preview
npm run lint
npm run format:check
```

`typecheck` checks TypeScript. `build` checks TypeScript and produces `dist/`. `preview` serves that production output at [the preview address](http://127.0.0.1:4173/workspace). Both servers use strict ports and fail if their port is occupied. `lint` retains the Vite template's Oxlint checks. No environment variables or credentials are required.

## Routes and sample data

`/` redirects to `/workspace`. `/workspace/task-preview` changes the task region inside the same shell. `/settings` redirects to `/settings/appearance`. Unknown routes provide a link back to the workspace. Both local servers support direct entry and refresh.

The data boundary is `ShellService.loadShell(): Promise<ShellSnapshot>` in `src/services/shell-service.ts`. Adapter selection lives in `src/services/index.ts`. The mock adapter reads `src/fixtures/shell.ts` asynchronously without network access. The workspace owns loading, error, and Retry states and ignores results after disposal. Future data integration can replace the adapter. Sample content is not persisted.

## Appearance

In Settings, import a named Tailwind 4 CSS export from tweakcn. The app reads declarations from top level `:root` and `.dark` blocks. Supported tokens cover semantic colors, sidebar and chart colors, radius, font families, generated shadows, spacing, and normal tracking. The shared map in `src/themes/tokens.ts` controls validation and application. Every theme starts with the complete neutral values in `src/themes/defaults.ts`.

Structural CSS, imports, global rules, and unknown tokens are ignored and reported. Raw shadow generator parameters are ignored because exported shadow values already contain their result. Pasted CSS is never installed as a stylesheet. Resource URLs, unresolved variable references, and invalid token values are rejected. Font families use available local fonts with system fallbacks. Numeric family names in tweakcn presets are quoted for native CSS compatibility.

Preferences use `aoe.appearance.v1` in localStorage. Theme and mode are independent. System mode follows the Mac's appearance. Reset appearance selects Default and System while retaining imported themes. Removing an active imported theme selects Default and preserves the mode. Writes happen before active state changes, so a failed save leaves the prior appearance intact. Invalid stored data uses Default and System and offers an explicit reset in Settings.

Storage belongs to each browser and origin. Development and preview ports have separate settings. Clearing browser storage removes imported themes.

A representative import fixture is in `src/fixtures/tweakcn-modern-minimal.css`, with its upstream source recorded in the file.

## Code map

| Directory                | Purpose                                                  |
| ------------------------ | -------------------------------------------------------- |
| `src/app`                | Application layout, routes, and render error boundary    |
| `src/features/workspace` | Sample project, task, and artifact regions               |
| `src/features/settings`  | Appearance controls and theme import dialog              |
| `src/themes`             | Token defaults, parser, validation, runtime, and storage |
| `src/components/ui`      | Installed shadcn Radix component source                  |
| `src/services`           | Data contract and selected adapter                       |
| `src/fixtures`           | Sample labels and representative theme CSS               |

The app uses the Vite React TypeScript initializer and shadcn Radix Nova primitives. It uses the system font rather than the initializer's optional font package. Local Git is initialized with no remote. Dependency output, environment files, and temporary browser artifacts are ignored. Existing specs and the project skill are preserved.

## Build inspection

Checked on September 13, 2026 with Node 22.22.3. TypeScript and the production build pass. Oxlint completes with five warnings in installed shadcn code, covering component exports and the mobile detection hook.

Chrome checks covered navigation and history, both local servers, direct routes and reload, theme import and persistence, duplicate names, malformed CSS and resource rejection, missing token defaults, unknown token notes, storage write failure, corrupt record recovery, System mode changes, active theme removal, reset, dialog keyboard focus, and layouts at desktop and 375 CSS pixels. Controlled adapter rejection and render failure both recovered through their visible actions.

Safari inspection covered workspace and Settings rendering, direct production entry, Back and Forward navigation, imported appearance, light and dark mode, and reload persistence. Occupied port checks confirmed that both local servers fail visibly instead of selecting a new port. Browser inspection is not a separate automated test suite.

Real workspace entities, persistence, file access, and agent execution belong to later scoped features. The historical Figma sequence in the wider scope still needs reconciliation with spec 0001.

## Formatting and code checks

Run `npm run format` to format application source, root configuration, and this README. Run `npm run format:check` to check formatting without writing. Prettier is pinned in the manifest and lockfile. `.prettierrc.json` selects single quotes and no semicolons, with the remaining Prettier defaults. `.prettierignore` excludes generated output, local configuration, installed skills, and curated instructions and specs so formatting does not rewrite that material.

Oxlint remains the code checker. TypeScript strict checking covers both application code and the Vite configuration. Before completing a change, run `npm run format:check`, `npm run typecheck`, `npm run lint`, and `npm run build`. Inspect relevant UI changes in Safari and Chrome. There are no commit hooks, CI, or automated test runner configured for this Prototype.

The tooling checks passed on September 13, 2026 with Node 22.22.3 and npm 10.9.8. Formatting left the generated JavaScript and CSS identical to the build before formatting. The five existing Oxlint warnings described above remain visible.

## Selected sidebar block

The application shell uses the actual shadcn.io Developer Tools Sidebar block, installed through its registry and adapted in `src/components/blocks/sidebar/sidebar-developer-tools.tsx`. Demo content became Workspace and Settings routes. Its SidebarProvider, icon collapse, collapsible groups, rail, tooltips, breadcrumb, and header toggle remain in place. The fixed demo frame was expanded to the application viewport. The mobile drawer closes after choosing a route. Sidebar state stays in memory.

Gary's UI direction is to start with his selected blocks, inspect them through MCP and their previews, and modify their content. Ask before creating a replacement from scratch. Do not replace a selected block with individually composed primitives.
