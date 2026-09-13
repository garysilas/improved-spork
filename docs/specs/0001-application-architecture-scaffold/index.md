# 0001. Application architecture and scaffold

**Date**: 2026-09-13
**Status**: Accepted

## Summary

Build a private browser workspace on Gary's Mac with React, TypeScript, and Vite. Start with a small shell using shadcn components and sample content, plus Settings and Appearance for importing tweakcn themes. Keep sample data behind a replaceable interface so later features can connect local storage, files, and agent execution. This decision establishes the foundation for the Facade approach, which makes the interface usable before connecting real work.

## Decision

**Chosen option**: A single browser application with a replaceable sample data adapter. Use React with Vite, TypeScript, React Router, and shadcn components built on Radix. Run with the installed Node 22 and npm. (basis: Gary's architecture interview, the scope's Facade approach, and the official Vite and shadcn documentation.)

**Implementation skills**: `shadcn` from `shadcn-ui/ui`, installed at [project skill](../../../.agents/skills/shadcn/SKILL.md). Its component composition, semantic color, and registry rules govern UI implementation.

**Available MCP tools**: shadcn.io for registry discovery and component retrieval, Context7 for targeted implementation documentation, and existing browser control for inspection. No additional MCP setup was selected.

**Workflow**: Prototype. This spec belongs to scope feature 1. Confirmation ratifies its content; status stays `Proposed` until implementation starts. This architecture decision contains the target structure, not a separate sequence of scaffold tasks.

**Content confirmed**: Gary accepted the original foundation on September 13, 2026. He then requested Settings and Appearance with tweakcn themes, choosing import by pasting exported Tailwind 4 CSS. Gary also accepted the Appearance amendment on September 13, 2026. The scaffold has not been built.

## Proposed stack

| Layer | Choice | Reason |
|---|---|---|
| Application | One browser application, one npm package at the project root | Fits one person and keeps the code easy to navigate. |
| Language | TypeScript with strict checking | Checks component inputs and service contracts during development. |
| UI framework | React | Matches the requested shadcn.io React components. |
| Build tool | Vite with its React TypeScript template | Provides local development and static production output. |
| Routing | React Router in declarative mode with `BrowserRouter` | Gives browser navigation without introducing server routing. |
| Styling | Tailwind CSS 4 and shadcn semantic theme tokens | Matches the documented Vite integration and selected component source. |
| Components | shadcn/ui with Radix primitives, extended from shadcn.io | Keeps component APIs consistent while allowing workspace composition. |
| Initial visual defaults | Neutral shadcn tokens, system sans serif font, Lucide icons | Gives the temporary shell a coherent foundation without a separate asset pipeline. |
| Appearance | Settings page, imported tweakcn themes, and System, Light, or Dark mode | Lets Gary create themes externally and use them without changing application code. |
| Appearance storage | Versioned localStorage record, separate from sample data | Remembers imported themes and the selected appearance between visits. |
| State | React local state and a small shared provider only where needed | Sufficient for the shell; a separate state library has no present requirement. |
| Sample data | A typed asynchronous adapter backed by bundled fixtures | Allows later data access changes without putting transport logic in components. |
| Runtime | Installed Node 22.22.3, recorded as the initial supported runtime | Meets the verified Vite requirement without an upgrade. |
| Package manager | Installed npm 10.9.8 with `package-lock.json` | Uses the tools already on this Mac and makes dependency resolution repeatable. |
| Serving | Vite development and preview servers bound to loopback | Supports private use on this Mac. |
| Diagnostics | Development console errors and visible application error states | Supports debugging without an external reporting service. |
| Version control | Initialize local Git during scaffold setup, no remote | Gives reviewable history while leaving publishing separate. |

Exact compatible application dependency versions belong in the manifest and lockfile produced by the scaffold. Use stable releases that support the selected Node runtime. If a required release no longer supports Node 22, return that conflict as a decision instead of silently changing the runtime.

### Application structure

Keep `package.json`, Vite configuration, `components.json`, and TypeScript configuration at the project root. Preserve the existing `docs/` and installed `.agents/skills/` directories when scaffolding into this nonempty folder. Add application files without replacing existing project material.

| Area | Responsibility |
|---|---|
| `src/app/` | Application entry composition, routes, shared providers, and render error boundary. |
| `src/features/workspace/` | Workspace shell and its project navigation, task, and artifact regions. |
| `src/features/settings/` | Settings navigation and the Appearance page. |
| `src/themes/` | Default tokens, theme import validation, appearance provider, and local preference storage. |
| `src/components/ui/` | Installed shadcn component source. |
| `src/services/` | The UI facing data contract and adapter selection. |
| `src/services/mock/` | Sample adapter implementation. |
| `src/fixtures/` | Bundled sample labels and placeholder content. |
| `src/lib/` | Small shared utilities required by installed components. |
| `src/index.css` | Tailwind imports and shared theme variables. |

Use `@/` for `src/` consistently in TypeScript, Vite, and shadcn configuration. The app is rendered in the browser, with no React Server Components. Components receive data and callbacks from the workspace layer. Only the service adapter knows how to load sample content. Do not create empty packages or services for future capabilities.

### Scaffold boundary

The scaffold opens a minimal workspace shell. It shows project navigation, a task region, and an artifact region with clearly marked sample placeholders. It does not implement the full project, conversation, context, or artifact prototypes, which remain features 5 through 8.

Use `/workspace` for the shell and redirect `/` there. Include `/workspace/task-preview` as a static sample destination that changes the task region, providing a small route for proving navigation. Its fixed slug is a demonstration route, not a project or task identity scheme. Both routes retain the same shell. Unknown paths show an application page with a link back to `/workspace`.

Navigation between these routes supports Back, Forward, direct entry, and refresh on both local servers. The URL selects the view. Sample interactions live in memory and reset on reload. No database, cookies, or user account is needed. Appearance preferences and imported themes are the sole browser storage exception; workspace sample data still resets. Full entity fields, identities, relationships, and lifecycle states belong to feature 3.

### Data boundary and value sources

The initial service contract is `loadShell(): Promise<ShellSnapshot>`. `ShellSnapshot` contains `projectLabel`, `taskPlaceholder`, and `artifactPlaceholder`, each a required string. These are presentation fixtures only. It does not expose a filesystem path, task execution method, or persisted record. The mock implementation returns bundled values asynchronously without making a network request.

The workspace owns the request state: loading before the promise settles, ready with the returned snapshot, or failed with a readable message and Retry action. Retry calls `loadShell` again. Ignore results after the requesting view is disposed. Keep the underlying error available to development diagnostics. A rejected adapter call must be inspectable during the build check without adding debugging controls to the Appearance page.

| Displayed value or action | Source |
|---|---|
| Application title | Static label `Agent Operating Environment`. |
| Project label | Fixture value `Sample project`, returned by `loadShell`. |
| Task placeholder | Fixture value `Choose a task to begin`, returned by `loadShell`. |
| Artifact placeholder | Fixture value `Results will appear here`, returned by `loadShell`. |
| Sample destination task text | Static route content `Sample task preview`, with a visible sample label. |
| Active navigation state | Current React Router location. |
| Theme tokens | Built in default or a validated imported theme stored in the appearance record. |
| Light or dark appearance | Saved mode; `system` resolves through `prefers-color-scheme`. |
| Loading or error state | Pending or rejected `loadShell` promise. |
| Retry | Another call to the same selected adapter. |

When a future backend is introduced, an adapter may use local HTTP or another approved transport. That transport, its endpoints, identity model, and response validation are future decisions. The existing contract is intentionally small and may grow with the relevant feature spec.

### Settings and Appearance

Add a Settings link to the application navigation. `/settings` redirects to `/settings/appearance`. The Appearance page shares the application theme and offers a theme picker, System, Light, and Dark mode, theme import, removal of an imported theme, and Reset appearance. Return navigation leads back to `/workspace`. These routes work with direct entry, refresh, and browser history.

Gary designs themes at tweakcn.com. The first import method is a name plus pasted Tailwind 4 CSS export. Import does not run a CLI command, replace application files, or fetch a theme URL. The app stores a local theme and applies it immediately after a successful import. URL import and an embedded theme editor are outside this amendment. (basis: Gary's follow up and tweakcn's CSS theme exports.)

Theme and mode are independent. A theme carries light and dark token sets; mode selects the light set, the dark set, or follows the system. Default values are the built in neutral theme and `system`. The theme picker shows names and small color samples. Mark the active theme visibly. Changing theme or mode applies throughout the application, including menus and overlays. Reset appearance selects Default and System while retaining imported themes. The built in Default theme cannot be removed. Removing the active imported theme selects Default and preserves the chosen mode.

**Import boundary**: Parse CSS declarations rather than injecting the pasted stylesheet. Read supported shadcn and tweakcn custom properties from top level `:root` and `.dark` blocks. Support colors, sidebar and chart colors, radii, shadow values, font family tokens, spacing, and tracking where mapped by the application. Keep the Tailwind token mappings in the application; exported `@theme` mappings and global style rules are not installed. Ignore those structural rules with a short import note. Reject missing light or dark blocks, malformed CSS, unsupported token values, and external resource references such as `url()` in imported values. Never execute script or install `@import` or `@font-face` rules. A font family token uses an available local font with a system fallback; font downloads are a separate future capability.

Use the built in light and dark token sets as the complete baseline for every theme. Missing supported tokens inherit from the corresponding baseline, with an import note naming them. Switching themes restores this complete baseline before applying the selected overrides, so values from the previous theme cannot leak. The importer and runtime share one supported token map; each accepted token must have a defined consumer or mapping. Unrecognized custom properties are ignored and reported. Inspect a real tweakcn Tailwind 4 export during implementation to confirm this mapping and keep a representative fixture for the import checks.

Require a trimmed theme name of 1 to 60 characters and a nonempty export no larger than 100 KiB in UTF 8. Import validates first, then creates a new theme with a browser generated UUID. A name already present, compared without letter case, produces an inline error asking for a different name. Imports never silently replace an existing theme. Invalid input leaves the active appearance and stored collection unchanged, keeps the pasted input available, and explains what to correct.

**Appearance record**: Use localStorage key `aoe.appearance.v1`, with `version: 1`, `selectedThemeId`, `mode` (`system`, `light`, or `dark`), and an array of imported themes. Each theme has a generated `id`, user supplied `name`, `light` and `dark` maps of validated token strings, and `source: tweakcn-css`. The built in theme has stable ID `default` and is not copied into storage. Revalidate stored records on load. If storage is missing, malformed, or has an unsupported version, use Default and System. If the selected ID is missing, use Default. Explain unreadable saved appearance on the Settings page and offer an explicit reset of the invalid record.

Preference writes occur before reporting success or committing the new active state. If browser storage is unavailable or full, keep the prior appearance and collection and show a save error. Appearance data is separate from the sample adapter and requires no backend. It is local to the browser and origin: development and preview ports, Safari, and Chrome have independent settings. Apply the saved valid appearance before the first application paint to avoid a visible default theme flash. Listen for system changes only when mode is System. No theme sync across browsers or devices is promised.

**Additional value sources**: theme names come from the import form; theme IDs come from `crypto.randomUUID()`; color samples come from the selected theme's resolved background, primary, and accent tokens; current mode and selected ID come from the validated appearance record. Effective mode comes from the saved explicit mode or the system media query. Import notes and validation errors come from the parser and token map, while save errors come from the storage operation.

Inspect import, switching, mode changes, reload, active theme removal, Reset appearance, invalid CSS, duplicate names, missing tokens, and storage failure. Confirm both light and dark themes cover the workspace, Settings, and overlays in Safari and Chrome. A successful theme import does not change sample workspace state.

### UI and accessibility

Use shadcn.io as the requested component source and shadcn/ui for its underlying primitives. The earlier Figma template and static workspace pass are historical context, not prerequisites or visual requirements for this shell. Use existing component variants and semantic colors before custom styles. Keep Radix APIs consistent when importing blocks. Inspect component dependencies and imports before adopting source.

No particular shadcn.io block has been selected. The discovered `ai-chat-with-sidebar` block is premium and contains controls outside the scaffold scope. Its discovery does not authorize a purchase or require importing the entire block. Compose the shell from accessible primitives and suitable available registry items; there are no real model controls or agent actions in this slice.

Support current installed Safari and Chrome on this Mac. Use semantic navigation and main regions, visible focus, accessible names, and keyboard access for every active control. Keep sample text readable in both appearances. At ordinary Mac window sizes the three regions remain understandable; at narrow widths they may stack or collapse, with all content still reachable and no page wide horizontal overflow. Pixel dimensions and detailed interaction design remain implementation work.

### Local operation and configuration

Define `npm run dev`, `npm run build`, `npm run preview`, and `npm run typecheck`. The build runs TypeScript checking and the Vite production build. Record the resolved commands in the scaffold README. Coding standards and additional formatting or lint policy remain feature 2; retain useful checks supplied by the chosen template.

Use `127.0.0.1:5173` for development and `127.0.0.1:4173` for preview, with strict port selection. If a port is occupied, fail with the visible terminal explanation rather than silently changing the address. These processes run while Gary is using the app. An automatic background launcher or hosted deployment is outside the scaffold.

No environment variables or credentials are required to run the sample app. Browser bundled configuration is public to the local browser and must never contain future provider keys or registry credentials. Do not retain token bearing registry install URLs in source, docs, or Git. Future file and agent services must remain outside the browser bundle.

Initialize Git locally during scaffold implementation. Ignore dependencies, production output, local environment files, and operating system debris. Keep source, specs, package manifests, lockfiles, and the selected project skill reviewable. Git setup does not create a remote or publish anything.

### Failure handling and checks

An unavailable local process is handled by starting the documented command. An occupied port is a terminal startup failure. The application handles unknown routes, a rejected sample load with Retry, and render failures with a clear reload action. Loading uses a suitable shadcn component. Sample states never imply that real work ran or was saved.

The Prototype baseline is a successful dependency install, TypeScript check, production build, and browser inspection. Inspect both Safari and Chrome for the shell, direct route loading, refresh, Back and Forward, keyboard focus, narrow windows, and system appearance changes. Exercise sample loading failure and recovery. These are implementation checks, not a claim that this unbuilt specification has passed them. No separate automated test suite is required for this reversible shell; later real file and agent features retain their Beta checks.

## Consequences

The first build has one package and no service credentials, migrations, or hosting requirement. Component and data boundaries give later work an obvious place to grow. Gary learns React and TypeScript in a small application.

The browser cannot become the privileged agent runtime. Real persistence, local file access, approval enforcement, and execution will add a local service and new contracts. Sample workspace state is intentionally lost on reload. Appearance data remains local to each browser and origin and is lost if that browser storage is cleared. Owned component source also means imported components need review and maintenance.

## Follow-up

* Feature 2 captures the real scaffold's conventions and tooling, including the installed shadcn skill and available MCP tools, in project instructions.
* Feature 3 defines the workspace data model before realistic prototype records are introduced.
* Reconcile the broader scope's earlier Figma first sequence and visual feature with Gary's architecture first and shadcn.io direction. This decision governs feature 1 immediately; the old Figma work remains historical.
* Feature 9 decides local persistence, backend structure, transport, migrations, and deletion behavior before real writes.
* Features 10 and 11 decide allowed file boundaries, local request authorization, agent provider and runtime, streaming, cancellation, recovery, concrete action approvals, and spending limits before execution is connected.
* Feature 12 decides artifact storage and continuity after restart.
* Record that extra Tailwind skills and additional MCP setup were declined for this stack. The official shadcn skill was selected and installed.

## Rationale

Reasoning, alternatives, and verified sources: [rationale.md](rationale.md).
