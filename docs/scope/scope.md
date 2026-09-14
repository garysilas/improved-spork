# Scope: Personal Agent Operating Environment

A private workspace on Gary's Mac for moving personal projects forward with agents. It is also a place to learn frontend design and build an interface that is enjoyable to use.

**Build approach:** Facade (make the core screens convincing and clickable with sample content, then connect real work behind them).
**Workflow:** Prototype (build checks and visual inspection, with no separate verification stage by default). Features tagged Beta add `/check verify` and `/test` because they control real file access or agent actions.

The application scaffold, tooling, and workspace data model are built. The next deliverable is a convincing clickable workspace with sample content, using actual reusable UI components. Real persistence, selected file access, and agent execution come later. The earlier plan requiring an accepted Figma design before choosing tools or writing any code no longer describes the project.

**Current review:** Gary selected the actual shadcn.io Chat With Tools block after viewing live previews and accepted the running app review route. The first completed sample is implemented at `/workspace/task-preview`, with expandable tool activity, a Markdown inspector, and a local draft composer. Review this result before extending feature 4. Spec [0003](../specs/0003-chat-with-tools-review.md) records this bounded choice. Visual acceptance is still pending.

**Handoff, September 13, 2026:** Figma work is paused. Gary wants useful shadcn.io components and blocks to be used directly, not recreated as similar looking arrangements in Figma or from separate primitives. He found the long design interview and Figma workflow unhelpful and asked how to communicate component choices. The agent recommended reviewing actual blocks and iterating in the running app. This recommendation has not yet been tried or expressly ratified as a permanent replacement for Figma. Do not expand Figma or assume its screens are accepted. Resume with a small visual shortlist of real shadcn.io options and confirm the review route before changing application code.

**Latest Figma exploration:** Gary supplied the [shadcn template](https://www.figma.com/design/eKRotihVQ9n9brVeiZadCZ/Agent-Enviroment) on September 13. Page `AOE Workspace` (`6007:2`) contains [completed task, light](https://www.figma.com/design/eKRotihVQ9n9brVeiZadCZ/Agent-Enviroment?node-id=6007-3) and [completed task, dark](https://www.figma.com/design/eKRotihVQ9n9brVeiZadCZ/Agent-Enviroment?node-id=6008-529). Both are editable 1440 × 960 static screens using Geist styles, template variables, and component instances. Screenshot inspection and visible layout bounds checks passed. These checks do not imply acceptance, keyboard verification, or a working prototype. Gary chose to refine the first screen rather than continue, then questioned the Figma workflow. No specific visual revisions were supplied. Original template pages were preserved.

**Historical Figma files:** The [earlier Poppins template](https://www.figma.com/design/FiMb2uZ5I6KnqLRf760bz6) and its [result ready exploration](https://www.figma.com/design/FiMb2uZ5I6KnqLRf760bz6/Agent-Operating-Env?node-id=8758-2331), plus the initial [Workspace Design file](https://www.figma.com/design/66Btk7T6YgF8TXhAlJAjRb), are retained as history, not current implementation instructions.

Success means Gary wants to open the workspace, can understand what an agent is doing, and can return to useful work without rebuilding its context. No firm deadline or spending limit has been specified. Running costs and limits must be decided before real execution is connected.

The workflow suggests a path, and Gary can override its depth. Record load bearing decisions in specs. Keep a feature built on an assumed decision in progress until that decision is ratified.

## At a glance

| # | Feature | Phase | Status |
|---|---|---|---|
| 4 | Visual language and UI foundation | Visual foundation | in-progress |
| 1 | Application architecture and scaffold | Foundation | done |
| 2 | Coding standards and tooling | Foundation | done |
| 3 | Workspace data model | Foundation | done |
| 5 | Project navigation prototype | Clickable workspace | planned |
| 6 | Task conversation and activity prototype | Clickable workspace | planned |
| 7 | Context selection prototype | Clickable workspace | planned |
| 8 | Artifact inspection prototype | Clickable workspace | planned |
| 9 | Persistent projects and tasks | Real workspace | planned |
| 10 | Selected project context | Real workspace | planned |
| 11 | Agent task execution and action control | Real workspace | planned |
| 12 | Saved artifacts and task continuity | Real workspace | planned |

## Visual foundation, current resume point

### 4. Visual language and UI foundation · in-progress · first screen review

Establish the visual language and reusable component choices for project navigation, conversation and activity, selected context, artifacts, and Appearance. Use real shadcn.io blocks as the basis for the next review. Confirm the review medium with Gary rather than treating Figma as a prerequisite or assuming it has been permanently abandoned.

**Done when:** Gary accepts the visual direction, reusable component choices, typography, color, spacing, representative workspace screens, and key states in the chosen review medium; keyboard focus and readable layouts are specified; design decisions are captured for implementation. Features 1 through 3 already provide the technical foundations. Features 5 through 8 remain the clickable workspace work.

* [ ] Design it (spec): `/architect visual language and UI foundation`

**Resume here:** Review the implemented Chat With Tools sample in the running app. Gary selected this block and approved this review route. Preserve the Developer Tools Sidebar and the selected conversation structure. Do not restart discovery, repeat the interview, or expand Figma.

**First review spec:** [0003. Chat With Tools visual review](../specs/0003-chat-with-tools-review.md).

* [x] Adapt the selected block and completed sample reader.
* [x] Connect the task route, Markdown inspector, local draft, and read states.
* [ ] Finish browser verification and obtain visual feedback. Safari and the in-app browser were inspected; Chrome automation timed out.

**Code:** `src/components/blocks/ai/ai-chat-with-tools.tsx`, `src/features/workspace/chat-review.tsx`, `src/services/chat-review.ts`, and `src/fixtures/chat-review.ts`.

**Interview choices to carry forward, not visual acceptance:**

* Design the intended workspace beyond the shell placeholders. Record the eventual decision in a new visual spec, retaining architecture spec 0001 and data model spec 0002. Spec 0003 now records the first Chat With Tools review, not the whole visual foundation.
* Resume recent work, with projects and their tasks in one grouped sidebar. Keep conversation central and use one optional inspector for context or artifacts. Actual resume across restarts belongs with later persistence, not sample storage.
* Use compact navigation and readable conversation spacing. Show a concise activity summary with expandable steps rather than all activity inline.
* Keep approval requests visible in the conversation, with an inspect action for affected files and the concrete proposed change. Distinguish next run context selections from immutable context used by earlier runs, following spec 0002.
* On narrow windows, show one surface at a time: conversation by default, navigation in a sheet, and context or artifacts in a full width detail view with a clear return action.
* Include Appearance without changing its theme import, save, reset, or mode behavior. Design for light and dark. The first review story is a completed task that creates a Markdown plan from fabricated project notes, visibly marked as sample content.
* Gary chose the shadcn Figma template styling, including Geist, during the Figma interview. This did not approve the resulting screen or change the app's fonts and tokens. He also chose linked key states rather than wiring every control, and no extra References section in the future spec. Revisit only choices affected by the selected real blocks or a change of review medium.

**Earlier Figma session, historical:** No new application UI, component installation, or visual spec resulted from that session. The current review above supersedes this as the resume point. The Figma page contains only the two static completed task screens linked above. Context selection, approvals, draft, working, waiting, failure, empty and loading states, narrow layouts, Appearance screens, custom reusable workspace components, and prototype links were not created. These needs remain; do not silently treat them as done or recreate them in Figma unless Gary resumes that route. First screen visual feedback is still unresolved.

**Earlier repository handoff (historical):** Before these documentation edits, the working tree was clean on `feat/workspace-data-model` at `9de79e5`, tracking `origin/feat/workspace-data-model`. A fresh fetch showed `origin/main` one merge commit ahead (`ba85a24`, PR #1), with identical file contents. Local `main` was still at `3df1a98`; do not start new work from that stale local branch. These handoff edits are local and uncommitted. Preserve them before switching branches, recheck Git status, then use the current merged base for the next feature branch. No code changed or build checks were rerun during the Figma exploration; existing verification evidence is in README.

**Known documentation debt:** Spec 0001 is marked Accepted but still contains historical claims that the scaffold is unbuilt and Git has no remote. Its current architecture and Appearance contracts remain valid. A later `/architect` cleanup should reconcile that historical wording without reopening the accepted stack or treating the unfinished visual work as shipped.

## Foundations

### 1. Application architecture and scaffold · done

Create the smallest runnable browser shell needed for a private workspace on this Mac. Gary accepted the architecture on September 13, 2026: React, Vite, TypeScript, and shadcn components with Radix, using Node 22 and npm. The scaffold was built from shadcn.io, replacing its earlier Figma acceptance prerequisite.

**Spec:** [0001. Application architecture and scaffold](../specs/0001-application-architecture-scaffold/index.md).

**Appearance amendment:** Settings includes an Appearance page. Gary can name and import themes by pasting tweakcn Tailwind 4 CSS, switch among saved themes, choose System, Light, or Dark mode, remove imported themes, and reset the appearance. Theme imports and preferences persist in browser storage, separately from sample workspace data. Accepted September 13, 2026.

**Done when:** a spec records the application boundaries and execution integration questions; the app opens locally and passes its build checks; the workspace shell supports the prototype without live agent services; Settings and Appearance imports valid tweakcn CSS and applies saved themes across the app; theme and mode selection survive reload; invalid imports and failed preference saves leave the prior appearance intact; the built in default remains available.

* [x] Decide the architecture (spec): `/architect application architecture and scaffold`
* [x] Scaffold from the decision: `/develop application architecture and scaffold`

**Code:** `src/app/`, `src/features/workspace/`, `src/features/settings/`, `src/themes/`, and `src/services/`. Run commands and build inspection are in `README.md`.

### 2. Coding standards and tooling · done

Capture conventions from the real scaffold, then establish consistent formatting and basic code checks. Keep the conventions understandable for learning frontend development.

**Done when:** project instructions describe the actual structure and development commands, and the chosen formatting and code checks run successfully.

- [x] Capture conventions and tooling choices: `/audit`

### 3. Workspace data model · done

Define projects, tasks, runs, context selections, and artifacts, including how they relate. Use that model for realistic sample content before installing persistence.

**Done when:** a spec defines identity, ownership, task and run states, and artifact relationships; sample data covers empty, active, waiting, failed, and completed work; persistence and deletion rules are recorded for the later real workspace.

**Spec:** [0002. Workspace data model](../specs/0002-workspace-data-model/index.md). Content accepted and implementation completed September 13, 2026.

* [x] Design it (spec): `/architect workspace data model`
* [x] Build it: `/develop workspace data model`
  * [x] Define typed records, relationships, and derived status with a small coherent sample (AC-1, AC-2, AC-4, AC-8).
  * [x] Add validated context, lifecycle, artifact history, and retention fixtures (AC-3, AC-5, AC-7).
  * [x] Connect the paginated sample reader, preserve the shell, and declare later action contracts (AC-1, AC-6, AC-7, AC-8).
  * [x] Complete Prototype build checks and Safari and Chrome inspection (AC-1 through AC-8).

**Code:** `src/services/workspace/`, `src/services/mock/`, `src/services/index.ts`, and `src/fixtures/workspace.ts`. Format checking, typecheck, lint, build, fixture assertions, and Chrome and Safari inspection passed. Results are recorded in `README.md`.

## Clickable workspace

Implement the component and interaction choices accepted through feature 4 with clearly identified sample content. Review actual blocks and the running result with Gary. Figma explorations are not automatically implementation references. Navigation and interactions work, but agent execution and saved user data are simulated. Finish and inspect this whole experience before connecting real services.

### 5. Project navigation prototype · planned · needs a decision

Open a project and move between its recent tasks without losing orientation.

**Done when:** sample projects and tasks are navigable; the active project and task are clear; creating a sample project and task is demonstrable; empty and long lists remain usable.

- [ ] Design it (spec): `/architect project navigation prototype`

### 6. Task conversation and activity prototype · planned · needs a decision

Make requesting work and understanding its progress the center of the workspace. Show the conversation and activity without overwhelming the screen.

**Done when:** a sample request moves through working, needs input, completed, failed, and stopped states; simulated progress, a response to a question, and a stop action are inspectable; loading and error states explain what can happen next.

- [ ] Design it (spec): `/architect task conversation and activity prototype`

### 7. Context selection prototype · planned · needs a decision

Show exactly which files and folders a task can use. Make approval for proposed changes understandable before real files are involved.

**Done when:** sample context can be selected, inspected, and removed; task scope is visible before submission; a simulated change shows the affected originals and lets Gary approve or decline it.

- [ ] Design it (spec): `/architect context selection prototype`

### 8. Artifact inspection prototype · planned · needs a decision

Inspect the useful result of a task alongside its conversation. Start with text and Markdown results that suit a project work companion.

**Done when:** sample artifacts open from their producing task, display readable content, and retain their task relationship; empty, unavailable, and unsupported preview states are clear.

- [ ] Design it (spec): `/architect artifact inspection prototype`

## Real workspace

This phase replaces sample behavior behind the accepted screens. Feature 9 is the explicit transition to persistent user data and proves one real write and read before context access or agent execution is introduced.

### 9. Persistent projects and tasks · planned · needs a decision

Create real projects and tasks and return to them after closing the app. Keep sample work distinguishable from real work.

**Done when:** creating a project and task persists through restart; navigation reads saved records; failed saves are visible; the app handles an empty store and follows the agreed deletion rules.

- [ ] Design it (spec): `/architect persistent projects and tasks`

### 10. Selected project context · planned · needs a decision · Beta

Connect explicitly selected files and folders to a project task. Let Gary inspect what is included and remove access.

**Done when:** only selected context is supplied to a run; file boundaries, missing files, changed content, and removed selections have defined behavior; the task records which context it used; reading context does not change originals.

- [ ] Design it (spec): `/architect selected project context`

### 11. Agent task execution and action control · planned · needs a decision · Beta

Run one project task using selected context, show its progress, and request input when needed. Keep the initial agent configuration outside the product UI.

**Done when:** a real request produces a result; activity and failures are visible; Gary can respond to a question and stop work; runtime and spending limits are defined; no original is changed without approval of the concrete proposed change, and declined or stale approvals cannot authorize it.

- [ ] Design it (spec): `/architect agent task execution and action control`

### 12. Saved artifacts and task continuity · planned · needs a decision

Save the result as a project artifact and make continuing a task useful after returning to the workspace.

**Done when:** a completed task saves a readable artifact linked to its run and context; restarting preserves conversations and results; a follow up uses the saved task history; interrupted runs show an honest recoverable state without silently repeating actions.

- [ ] Design it (spec): `/architect saved artifacts and task continuity`

## Deferred

These capabilities stay outside the first build pass. Revisit them after using the real project work companion.

* **Agent and skills editors:** configure reusable agent behavior through dedicated screens.
* **Broader connections and project knowledge search:** bring in more sources and search durable knowledge across tasks.
* **Dedicated run history and richer previews:** compare runs and inspect additional artifact formats beyond the initial task view.
* **Remote access and sharing:** use other devices, sign in, or share projects and results.
* **Commercial product features:** billing, teams, marketing pages, acquisition analytics, and public distribution.

## Legend

**Entry commands:** the first unticked box is the next step. A feature tagged `needs a decision` starts with `/architect`. Coding standards starts with `/audit` after a runnable scaffold exists.

**Scope depth:** this file records intent and observable completion criteria. Specs own design decisions and detailed build plans. After design, the scope gains a spec link, a build command with a few milestones, and the checks appropriate to its workflow tier.

**Statuses:** `planned` means not started, `in-progress` means partly designed or built, `done` means completed through the chosen workflow, `existing` means built before this workflow, and `dropped` preserves work removed from the plan. No code or specs existed when this scope was created.

**Workflow:** untagged features inherit Prototype. Beta features add real app verification and automated tests. File access boundaries and approval behavior warrant those extra checks even in a personal project.

**Quality baseline:** support keyboard navigation, visible focus, readable contrast, and clear empty, loading, and error states. Target one person, English, and typical Mac windows. Record technical errors usefully; broader analytics, public site requirements, and localization are deferred.
