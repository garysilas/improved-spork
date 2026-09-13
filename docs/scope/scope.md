# Scope: Personal Agent Operating Environment

A private workspace on Gary's Mac for moving personal projects forward with agents. It is also a place to learn frontend design and build an interface that is enjoyable to use.

**Build approach:** Facade (make the core screens convincing and clickable with sample content, then connect real work behind them).
**Workflow:** Prototype (build checks and visual inspection, with no separate verification stage by default). Features tagged Beta add `/check verify` and `/test` because they control real file access or agent actions.

The first deliverable is an editable Figma design, including a design system, representative workspace screens, and key interaction states. Gary reviews the design before application tools are chosen or code is written. Next, implement the accepted design as a clickable prototype with sample content. Finally, connect a real task using selected project context and save a useful artifact that can be reopened later.

**Chosen design foundation:** [Agent Operating Env](https://www.figma.com/design/FiMb2uZ5I6KnqLRf760bz6), selected by Gary on September 12, 2026. Build from this template's existing design system and extend it with components and elements needed for the agent workspace. The file contains `🎨Design System` (page `868:14739`) and `💠 5. App - CMS` (page `1325:18457`). Reuse and adapt its typography, colors, controls, and relevant project, task, chat, and file components; develop agent activity, context selection, approvals, and artifact inspection within that visual language. Template selection establishes the foundation; workspace screens and interaction states still need design and review.

**Earlier design file:** [Personal Agent Environment · Workspace Design](https://www.figma.com/design/66Btk7T6YgF8TXhAlJAjRb) was created with four pages before the template was selected. The template above now governs the design direction.

**First workspace design:** [01 · Workspace — Result ready](https://www.figma.com/design/FiMb2uZ5I6KnqLRf760bz6/Agent-Operating-Env?node-id=8758-2331), on `Agent Workspace · First pass`. Created September 12, 2026: editable 1440 × 960 layout with template navigation and action instances, Poppins text styles, template paint styles, task conversation, context summary, follow-up composer, and artifact preview. Screenshot and layout checks passed (Poppins throughout; no detected overflow). This is a static first pass with sample content awaiting Gary's review; additional interaction states and custom reusable components remain to be designed.

Success means Gary wants to open the workspace, can understand what an agent is doing, and can return to useful work without rebuilding its context. No firm deadline or spending limit has been specified. Running costs and limits must be decided before real execution is connected.

The workflow suggests a path, and Gary can override its depth. Record load bearing decisions in specs. Keep a feature built on an assumed decision in progress until that decision is ratified.

## At a glance

| # | Feature | Phase | Status |
|---|---|---|---|
| 4 | Visual language and UI foundation | Figma design | in-progress |
| 1 | Application architecture and scaffold | Foundation | done |
| 2 | Coding standards and tooling | Foundation | done |
| 3 | Workspace data model | Foundation | planned |
| 5 | Project navigation prototype | Clickable workspace | planned |
| 6 | Task conversation and activity prototype | Clickable workspace | planned |
| 7 | Context selection prototype | Clickable workspace | planned |
| 8 | Artifact inspection prototype | Clickable workspace | planned |
| 9 | Persistent projects and tasks | Real workspace | planned |
| 10 | Selected project context | Real workspace | planned |
| 11 | Agent task execution and action control | Real workspace | planned |
| 12 | Saved artifacts and task continuity | Real workspace | planned |

## Figma design first

### 4. Visual language and UI foundation · in-progress · needs a decision

Use Gary's selected Figma template as the visual and component foundation, extending its design system where the agent workspace needs additional elements. Design representative screens for project navigation, tasks and activity, selected context, and artifacts. Explore and review the experience before implementation. Feature numbers remain stable; section order records the revised sequence.

**Done when:** Gary accepts the visual direction, reusable Figma components, typography, color, spacing, representative workspace screens, and key states; keyboard focus and readable layouts are specified; design decisions are captured for implementation. Then features 1 through 3 establish the technical foundations, and features 5 through 8 implement the accepted screens.

- [ ] Design it (spec): `/architect visual language and UI foundation`

## Foundations

### 1. Application architecture and scaffold · done

Create the smallest runnable browser shell needed for a private workspace on this Mac. Gary accepted the architecture on September 13, 2026: React, Vite, TypeScript, and shadcn components with Radix, using Node 22 and npm. This feature now starts first and uses shadcn.io as its UI source, replacing its earlier Figma acceptance prerequisite. The broader Figma sequence above records the earlier plan and needs scope reconciliation.

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

### 3. Workspace data model · planned · needs a decision

Define projects, tasks, runs, context selections, and artifacts, including how they relate. Use that model for realistic sample content before installing persistence.

**Done when:** a spec defines identity, ownership, task and run states, and artifact relationships; sample data covers empty, active, waiting, failed, and completed work; persistence and deletion rules are recorded for the later real workspace.

- [ ] Design it (spec): `/architect workspace data model`

## Clickable workspace

Implement the accepted Figma screens with clearly identified sample content. Compare each implementation to the design as it is built. Navigation and interactions work, but agent execution and saved user data are simulated. Finish and inspect this whole experience before connecting real services.

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
