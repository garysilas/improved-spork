# Agent Operating Environment

## Stack

One private browser application and one npm package. Use strict TypeScript, React, Vite, React Router with `BrowserRouter`, Tailwind CSS 4, and shadcn/ui Radix components from shadcn.io. Use Node 22.22.3 and npm with `package-lock.json`. Start with neutral semantic tokens, system fonts, and Lucide icons. Use local React state and a small appearance provider. Sample data comes from a typed asynchronous fixture adapter. Appearance alone persists in versioned localStorage. Bind local servers to loopback. No backend or credentials are required.

## Build approach

Facade (make the core screens convincing and clickable with sample content, then connect real work behind them).

Workflow: Prototype. Use build checks and browser inspection. Features that control real file access or agent actions use the Beta checks defined in scope.

## Commands

```sh
npm ci
npm run dev
npm run typecheck
npm run lint
npm run format
npm run format:check
npm run build
npm run preview
```

Development uses `127.0.0.1:5173`; preview uses `127.0.0.1:4173`. Both fail if their port is occupied. See `README.md` for operation and recorded browser checks.

## Specs

Architecture: [spec 0001](docs/specs/0001-application-architecture-scaffold/index.md). Scope: [scope](docs/scope/scope.md). UI direction: [design](design.md). The accepted shadcn scaffold decision supersedes the earlier Figma prerequisite for this slice. Spec 0001 retains historical scaffold wording; the scope handoff identifies it separately from the current implementation.

Workspace data contracts and fixtures: [spec 0002](docs/specs/0002-workspace-data-model/index.md). For the current resume point, design review status, and unfinished work, read the September 13 handoff and feature 4 in [scope](docs/scope/scope.md). No visual foundation spec 0003 has been written. Figma exploration is paused and is not an accepted implementation reference.

## Working with Gary on UI

* Use actual shadcn.io components and composed blocks. The Figma kit is a separate library, not proof that a matching React block was selected or reused. Preserve the selected Developer Tools Sidebar unless Gary approves changing it.
* Gary can communicate a choice with a block URL, name, or screenshot and a short description of where to use it. The agent owns finding candidates, inspecting their source and live previews, explaining fit, and reusing the selected block. Bring a small visual shortlist when no block is selected; do not require Gary to know component APIs or repeat an extensive interview.
* Prefer a short review loop around a real block and a visible result. Confirm the next review medium before implementation. Do not resume Figma generation or treat its exploratory Geist styling as an approved change to the app's fonts and tokens.

## Rules

* Prefer small pure functions and React function components. Compose functions instead of adding inheritance. Keep side effects explicit at service, storage, and React boundaries.
* Treat data as immutable. Use `const` and `readonly` where useful, avoid shared mutable module state, and use array transformations when clearer than loops.
* Keep strict types. Avoid `any`; validate unknown input at boundaries. For new optional values prefer explicit `undefined` unions. Preserve existing contracts when editing established code.
* For new expected failures prefer typed result values. Handle existing thrown errors at boundaries with useful messages and recovery actions. Keep underlying errors available in development diagnostics.
* Keep feature code in `src/features/`, application composition in `src/app/`, theme logic in `src/themes/`, data contracts and adapters in `src/services/`, and sample content in `src/fixtures/`.
* Use consistent descriptive names. Document public contracts, especially inputs, outputs, and failure behavior. Prefer named exports, allowing framework requirements and existing registry component conventions.
* Start with Gary's selected shadcn blocks and adapt their content. Inspect the source and preview before modification. Ask before creating a replacement from scratch. Reuse semantic tokens, component variants, and Radix behavior.
* Preserve accessible names, semantic regions, visible focus, keyboard controls, and usable narrow layouts. Inspect relevant UI changes in Safari and Chrome.
* Keep sample workspace data separate from appearance storage. Validate imported theme declarations and saved records; never install pasted CSS as a stylesheet. Save preferences before committing active state so failed writes preserve the prior appearance.
* Keep provider keys, privileged file access, and real agent execution outside the browser bundle. Their service boundaries require future specs.

## Tooling

Oxlint checks code and Prettier formats it with single quotes and no semicolons. Run `npm run format` to apply formatting and `npm run format:check` to check without writing. `.prettierignore` excludes generated output, local configuration, installed skills, and curated project instructions and specs. Both TypeScript configurations use strict checking. No commit hooks or CI yet. Retain format checking, typecheck, lint, build, and relevant browser inspection as the prototype checks. There is no test runner or test script. Use `/test` and `/check verify` for the later Beta features specified in scope.

## Git

- integration: on
- branch prefix: feat/
- commit: per-milestone

Agents may manage local feature branches and milestone commits. Confirm pushes and PRs before performing them. Keep unrelated scaffold files out of tooling and documentation commits.

## Agent skills

* [shadcn](.agents/skills/shadcn/SKILL.md): `shadcn-ui/ui`, component composition, semantic colors, and registry conventions.

Declined: extra Tailwind skills and additional MCP setup, as recorded in spec 0001. That spec records shadcn.io, Context7, and browser inspection tools as available; check current tool availability when needed.

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
