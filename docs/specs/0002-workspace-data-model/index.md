# 0002. Workspace data model

**Date**: 2026-09-13
**Status**: Accepted

## Summary

Projects organize tasks, and each task keeps a conversation across successive runs. Runs record the context they used and the artifact versions they produced. Build typed contracts and realistic sample records now, then implement persistence and real execution in their later features.

## Requirements

Gary needs to recognize ongoing work, inspect its history, and continue it without losing the relationship between requests, context, and results.

* **AC-1**: Typed records represent projects, tasks, messages, runs, context sources and selections, run context snapshots, activity, waiting requests, artifacts, and artifact versions. IDs and relationships survive renaming; every task has exactly one fixed project.
* **AC-2**: Task status is draft without runs and otherwise follows its latest run. One task has at most one active run, including waiting. A follow up creates a new run in the same task; a waiting answer resumes the existing run. Separate tasks may be active together.
* **AC-3**: Project sources are selected per task. Each run retains the exact supplied context independently of later selection edits or source removal. Missing selected context blocks submission.
* **AC-4**: Text and Markdown artifacts retain immutable versions. Every version names its producing run in the same task and can be traced to that run's context.
* **AC-5**: Fixtures cover an empty workspace, an empty project, a draft task, queued and running work, waiting for input and approval, completion, failure, stop, interruption, archival, and multiple artifact versions. Samples never imply real file access or execution.
* **AC-6**: An asynchronous sample reader returns validated records and typed failures, with deterministic pagination and no shared mutable fixture state. Shell loading and error recovery remain usable.
* **AC-7**: Contracts specify archive, restore, permanent deletion, retry, stop, and declined approval behavior. Active work cannot be archived or deleted. Historical context remains until its owning task is permanently deleted.
* **AC-8**: Sample workspace records do not persist. Appearance storage stays separate. Real persistence, file capture, approval enforcement, and execution remain outside this implementation.

## Decision

Use explicit related TypeScript records and pure derivation helpers behind the existing service boundary. Implement the read surface and fixtures in this feature. Declare the later mutation surface, but do not ship a pretend successful mutation adapter. Features 5 through 8 implement interactive simulations against these contracts. Features 9 through 12 implement durable and privileged behavior.

**Workflow**: Prototype, linked to scope feature 3. Content confirmation does not advance this spec beyond `Proposed`. No new dependency, database, transport, credentials, or environment variables are required.

**Content confirmed**: Gary accepted this spec on September 13, 2026, after confirming the model and choosing to skip an additional critique. Implementation is pending.

**Build approach**: Facade. Keep the existing shell first, supply coherent samples behind it, then let the later screen features consume richer data. No database migration occurs here.

## Feature design

### Record conventions

Use readonly records and arrays. `Id` is a nonempty string, with distinct entity ID types where useful. `Time` is an ISO 8601 UTC string. Sequence and version numbers are positive integers. All listed fields are required unless marked optional, represented as `T | undefined`, not `null`. Each entity has `id: Id`. There is one implicit local owner, Gary; do not add account or tenant records.

Fixture IDs and times are fixed literals. Later creation uses an injected ID generator and UTC clock, with `crypto.randomUUID()` and the system clock as defaults. Sequence establishes order even when times match. IDs are unique within each entity collection. No name or title uniqueness constraint applies.

| Entity | Fields beyond ID | Relationships and constraints |
|---|---|---|
| Project | `name: string`, `description: string` optional, `folderPath: string` optional, `createdAt: Time`, `updatedAt: Time`, `archivedAt: Time` optional | One project contains many tasks and sources. Folder is descriptive, optional, and grants no access. |
| Task | `projectId: Id`, `title: string`, `createdAt: Time`, `updatedAt: Time`, `archivedAt: Time` optional | Project cannot change. No separate stored task status or description. |
| Message | `taskId: Id`, `runId: Id` optional, `author: 'user' \| 'assistant'`, `text: string`, `sequence: number`, `createdAt: Time` | Unique `(taskId, sequence)`. A run reference must belong to this task. Assistant messages require a run. |
| Run | `taskId: Id`, `initiatingMessageId: Id`, `sequence: number`, `state: RunState`, `retryOfRunId: Id` optional, `createdAt: Time`, `startedAt: Time` optional, `endedAt: Time` optional, `failure: Failure` optional | Unique `(taskId, sequence)`. Initiating message is a user message in this task. Retry origin, if present, is an earlier terminal run in this task. |
| ContextSource | `projectId: Id`, `label: string`, `kind: 'file' \| 'folder'`, `path: string`, `createdAt: Time`, `removedAt: Time` optional | Fixed identity and path. Replacing a path creates a new source. Removal keeps the source record for historical references. |
| TaskContextSelection | `taskId: Id`, `sourceId: Id` | Unique `(taskId, sourceId)`; source belongs to task's project and is not removed. |
| RunContextSnapshot | `runId: Id`, `sourceId: Id`, `sourcePath: string`, `capturedAt: Time`, `files: readonly CapturedFile[]` | Unique `(runId, sourceId)`. Immutable; one snapshot for every selected source, including an empty folder. |
| ActivityEvent | `runId: Id`, `sequence: number`, `kind: 'progress' \| 'state_change' \| 'context' \| 'artifact' \| 'error'`, `summary: string`, `createdAt: Time` | Unique `(runId, sequence)`. Describes observable progress, not hidden model reasoning. |
| WaitingRequest | `runId: Id`, `prompt: string`, `createdAt: Time`, `resolution: Resolution` optional, and the variant below | At most one unresolved request per run; present exactly when the run is waiting. |
| Artifact | `taskId: Id`, `title: string`, `createdAt: Time` | Has at least one version. Cannot move to another task or be deleted separately in this version. |
| ArtifactVersion | `artifactId: Id`, `producingRunId: Id`, `version: number`, `format: 'text' \| 'markdown'`, `content: string`, `createdAt: Time` | Unique `(artifactId, version)` with consecutive numbers from 1. Producing run belongs to artifact's task. Content is immutable. |

`CapturedFile` contains `path: string`, `format: 'text' | 'markdown'`, and `content: string`. Content is the exact text supplied to the run, including empty text where the file is empty. This is not a promise to capture original bytes, binary files, or unsupplied files in a folder. Each snapshot has unique captured paths. Overlapping sources may repeat a captured file across snapshots; the supplied run context deduplicates by exact captured path, requiring identical content for repeated paths.

`Failure` contains `code: string` and `message: string`. Run failure codes initially include `execution_failed` and `interrupted`. Technical causes remain available separately to development diagnostics, not serialized into user messages.

A question waiting request has `kind: 'question'`. An approval request has `kind: 'approval'` and `proposal: { id: Id, changes: readonly ProposedChange[] }`. A proposed change has `path: string`, `before: string | undefined`, and `after: string | undefined`. Before absent means creation, after absent means deletion, and both absent is invalid. A proposal has at least one change, unique paths, and immutable contents. This models a reviewable text change in fixtures. It does not authorize a real write.

`Resolution` is a union: `{ kind: 'answer', messageId: Id, resolvedAt: Time }`, `{ kind: 'approval', decision: 'approved' | 'declined', resolvedAt: Time }`, or `{ kind: 'cancelled', resolvedAt: Time }`. Answers reference a user message in the same task and run. Resolution kind must match request kind, except cancellation, which applies to either.

Trim names and titles and require 1 to 120 Unicode code points. Descriptions are optional, with blank input becoming absent. User requests and question answers must contain nonwhitespace text. Preserve their original text. Task title fallback is the first nonblank request line, trimmed and truncated to 120 code points. Creating a draft without a request requires a title. Artifact content may be empty. Paths and source labels must be nonempty. Real path canonicalization and supported file size limits belong to feature 10; sample paths are inert strings.

### State transitions

`RunState` is `queued | running | waiting | completed | failed | stopped`.

| Current state | Allowed next states | Trigger |
|---|---|---|
| queued | running, failed, stopped | Worker starts, admission fails after acceptance, or stop is acknowledged |
| running | waiting, completed, failed, stopped | A request needs Gary, work finishes, execution fails, or stop is acknowledged |
| waiting | running, failed, stopped | Answer or approval decision arrives, execution fails, or stop is acknowledged |
| completed, failed, stopped | None | Follow up or retry creates another run |

Queued, running, and waiting are active. A waiting run retains the active slot. Reject another submission with `active_run`; the UI keeps the new request as an unsent local draft and does not enqueue it. A declined approval resolves the request and resumes the run without granting the proposed write. Stop cancels any unresolved waiting request. A repeated identical resolution is harmless; a different resolution or response after stop is `stale_request`.

`startedAt` is set on first entry to running and retained thereafter. Terminal states require `endedAt`; nonterminal states omit it. Failed requires failure details, all other states omit them. Interrupted work is `failed` with code `interrupted`, displayed as Interrupted, rather than adding a separate state. Later persistence recovery must determine that a worker truly ended before applying this rule; a disconnected browser alone does not prove interruption.

Task status is `draft` without runs, otherwise the highest run sequence's state and failure display. Completion does not prohibit a follow up. Retrying failed or stopped work preserves history and creates a new run using the original initiating request text and the task's current context selection. A retry does not silently reuse old access or approval. Successful runs are continued through a normal follow up.

Completed artifact versions remain readable even if their run subsequently fails or stops. Partial output stays in messages or activity until explicitly published as a complete artifact version. An artifact's latest version is its highest version number, not a mutable pointer.

### Ownership, retention, and consistency

Every reference must resolve within the same project and task where applicable. No cross project task selections, cross task versions, or cross task retry references are valid. Runtime fixture validation enforces these rules as well as TypeScript shape checks. Reject an invalid dataset as a whole, rather than displaying broken partial relationships.

Changing a task selection affects the next run. Run snapshots never change. Removing a source removes its current task selections within that project and sets its removal time, while preserving prior snapshots. Required missing or unreadable context causes submission to fail before a message or run is accepted. No partial context submission occurs. No sources selected is valid.

Archive hides a project or task from normal lists. Project archival makes descendants effectively archived without overwriting their individual archive times. Restoring a project does not restore tasks archived separately. Archived work remains readable. Creating work or changing context requires both task and project to be restored. Archive and delete reject any active descendant run. Restoration is permitted; repeated archive or restore is harmless.

Permanent deletion is explicit, confirmed separately in the eventual UI, and allowed only for already archived work. Task deletion removes its messages, runs, snapshots, activity, waiting requests, selections, artifacts, and versions atomically. Project deletion removes its whole contained graph, including sources. Deleting a task leaves project sources and sibling tasks intact. Originals on disk are never deleted through workspace deletion. No automatic history expiry or selective snapshot purge is introduced.

The later persistent adapter must commit each action atomically, including message plus run plus snapshots, artifact plus first version, and cascading deletion. Failed saves leave prior state intact. Logical lookup keys are project ID for tasks and sources, task ID plus sequence for runs and messages, run ID plus sequence for activity, and artifact ID plus version for results. Physical indexes and migrations wait for the persistence choice.

### Service surface

All functions return `Promise<Result<T>>`, with `{ ok: true, value: T }` or `{ ok: false, error: { code, message } }`. Expected errors are typed. Unexpected exceptions are caught at the adapter boundary, logged without captured contents in development, and returned as `unavailable`. There are no HTTP routes or status codes in this slice. All calls operate within Gary's local sample workspace.

`Page<T>` contains `items: readonly T[]` and optional `nextCursor: string`. List inputs take optional cursor and limit (default 25, integer 1 to 100). Cursors identify the last sort key and the query filters; mismatched or malformed cursors return `invalid_input`. Project and task lists sort by updated time descending, then ID ascending. History lists sort by sequence ascending; artifact versions sort by version ascending. Sources and artifacts sort by creation time then ID ascending. No offset or total count is promised.

**Implement now, read interface**:

| Function | Inputs | Output | Key errors |
|---|---|---|---|
| listProjects | archive filter `active | archived | all` (default active), page | Page of Project | invalid_input, unavailable |
| getProject | projectId | Project | not_found, unavailable |
| listTasks | projectId, archive filter, page | Page of TaskSummary (Task and derived status) | not_found, invalid_input |
| getTask | taskId | TaskSummary | not_found, unavailable |
| listMessages | taskId, page | Page of Message | not_found, invalid_input |
| listRuns | taskId, page | Page of Run | not_found, invalid_input |
| getRun | runId | Run with its snapshots and waiting requests | not_found, unavailable |
| listActivity | runId, page | Page of ActivityEvent | not_found, invalid_input |
| listContextSources | projectId, includeRemoved (default false), page | Page of ContextSource | not_found, invalid_input |
| getTaskContext | taskId | readonly selections | not_found, unavailable |
| listArtifacts | taskId, page | Page of Artifact | not_found, invalid_input |
| listArtifactVersions | artifactId, page | Page of ArtifactVersion | not_found, invalid_input |
| getArtifactVersion | artifactId, optional version (latest if absent) | ArtifactVersion | not_found, unavailable |

**Declare now, implement in later features**:

| Function | Inputs beyond operationId | Output | Key errors |
|---|---|---|---|
| createProject | name, optional description and folderPath | Project | invalid_input, unavailable |
| updateProject | projectId, name, description and folderPath (each optional value explicit) | Project | not_found, archived, invalid_input |
| createTask | projectId, title | Task | not_found, archived, invalid_input |
| renameTask | taskId, title | Task | not_found, archived, invalid_input |
| submitRequest | projectId, optional taskId and title, text | accepted Message and queued Run, Task | active_run, context_unavailable, archived |
| retryRun | runId | new queued Run | active_run, invalid_state, context_unavailable |
| addContextSource | projectId, label, kind, path | ContextSource | not_found, archived, invalid_input |
| removeContextSource | sourceId | removed ContextSource | not_found, archived |
| setTaskContext | taskId, sourceIds | readonly selections | wrong_owner, source_removed, archived |
| answerQuestion | requestId, text | resolved WaitingRequest and user Message | stale_request, invalid_input |
| resolveApproval | requestId, proposalId, decision | resolved WaitingRequest | stale_request, invalid_input |
| stopRun | runId | acknowledged terminal Run | not_found, unavailable |
| archiveProject, archiveTask | corresponding ID | updated record | active_run, not_found |
| restoreProject, restoreTask | corresponding ID | updated record | not_found, archived (parent still archived) |
| deleteProject, deleteTask | corresponding ID | deleted ID | active_run, not_archived |

`submitRequest` without taskId creates the task and first message together, using the title fallback. With taskId it validates project ownership and appends a follow up. A supplied title only applies to a newly created task. Archive filters on task lists use effective archive state, including the parent. Direct reads permit archived records. Stop returns the existing terminal record if work already ended, without changing a completed run to stopped.

Every future mutation accepts a caller generated `operationId: Id`; a repeated key with the same input returns its prior result, and a reused key with different input returns `conflict`. Real durable retry storage and retention belong to feature 9. No client method may directly set a run state, inject a captured file, or publish an artifact version. Those outputs come from a trusted execution adapter in later work, or fixed fixtures now.

### Value sourcing

| Produced or displayed value | Source |
|---|---|
| Project name, description, folder | Form inputs or fixed fixture literals |
| Task title | Explicit input, or the defined first request line fallback |
| IDs, creation and lifecycle times | Fixed fixture literals now; injected ID generator and clock in later adapters |
| Task status, most recent run | Highest run sequence for that task, with failure code controlling Interrupted display |
| Run sequence, message and activity order | Next sequence within the relevant owner; fixture sequences are explicit |
| Initiating request on retry | Origin run's initiating message; current selections supply the retry context |
| Active slot and archive eligibility | Current run states across the relevant task or project |
| Effective archive state | Task's own archive time or its parent project's archive time |
| Context label and selected sources | Project source records joined through task selections |
| Historical supplied content | Immutable run snapshots, supplied by fixtures now and the trusted capture adapter later |
| Waiting prompt, proposal, progress, failure, assistant text | Fixture records now; trusted execution adapter outputs later |
| Question response or approval decision | Gary's response input, bound to the waiting request and proposal ID |
| Artifact text, format, title, producing run | Fixture literals now; trusted execution output later; revisions specify the existing artifact ID |
| Artifact version number | Next number within artifact, assigned atomically by the service |
| Loading, missing, or unavailable display | Pending read, typed not_found, or typed unavailable result |
| Pagination cursor | Last item's stable sort keys and the applied query filters |

### Fixtures and boundaries

Place contracts, validation, and derivations under `src/services/workspace/`, the fixture reader under `src/services/mock/`, and sample records under `src/fixtures/`. Export through `src/services/index.ts`. Use a factory that accepts a validated dataset; each returned snapshot is isolated from consumer mutation. Keep the existing `ShellService` compatible, with its label derived from a designated sample project. Keep shell placeholder copy as presentation data rather than adding it to domain records.

Use a versioned fixture envelope `{ schemaVersion: 1, mode: 'sample', ...collections }`. An empty envelope has empty collections. Reject unknown versions. This version describes the sample contract and is not a commitment to a future storage format. Do not load sample records into localStorage or write a workspace importer.

Provide named fixture scenarios for all AC-5 states, plus unavailable reads, a missing artifact version, a removed source retained in history, repeated titles, and enough list entries to cross the default page boundary. Error injection is a constructor option for development inspection, not a production settings screen. Unsupported artifact formats are rejected by validation; a future richer preview may show a separate unsupported presentation fixture without expanding this model's format union.

The browser reads only fabricated context contents in this feature. No folder picker, OS reads, approval execution, provider key, telemetry, or public API is added. Private text and Markdown remain inert data; no HTML execution follows from this model. Rendering safety and accessible interaction details belong to the respective screen specs. No new layout is required here.

### Failure handling and inspection

The reader distinguishes empty success from loading and failure. Failed reads offer retry through existing shell behavior; they do not overwrite successful data with an empty dataset. Invalid references, unknown versions, illegal states, and conflicting snapshot contents return `invalid_data`. Callers never receive a partly valid graph.

Critical inspection scenarios are: follow a completed task to its two artifact versions and distinct run snapshots (AC-1 to AC-4); validate every named lifecycle fixture and multiple active tasks (AC-2, AC-5); page through a long list without duplication (AC-6); reject broken references and a second active run (AC-1, AC-2, AC-6); inspect archived and removed source history (AC-3, AC-7); load and retry a failing sample adapter without appearance writes (AC-6, AC-8). Transition and deletion contracts are validated through pure helpers and representative sample graphs, not claimed as functioning real services.

## Build plan

1. Keep the shell in place and define the record types, fixture envelope, status derivations, and validators. Author a small project, task, run, and artifact example against those types. Satisfies AC-1, AC-2, AC-4, AC-8.
2. Expand the fixtures to context snapshots, waiting requests, archival, and every named sample and failure state. Validate graph invariants and retention examples. Satisfies AC-3, AC-5, AC-7.
3. Implement the paginated sample read service and retain shell compatibility. Declare future mutation contracts with documented inputs and errors. Add no real mutation or persistence implementation. Satisfies AC-1, AC-6, AC-7, AC-8.
4. Run format checking, typecheck, lint, and build. Inspect shell loading, failure and retry in Safari and Chrome and inspect the fixture scenarios through the development adapter. Record results in README. No test runner is introduced for this Prototype slice. Satisfies AC-1 through AC-8.

## Consequences

History remains understandable when files change, tasks continue, or results are revised. The fixture model can serve multiple screens without duplicating their relationships.

Exact context copies and artifact versions increase eventual storage use and retain private contents until permanent deletion. A single active run prevents parallel requests inside one task. Fixed task ownership requires creating a new task to work in another project. Permanent deletion removes the history needed to explain earlier results.

## Follow-up

* Feature 9 chooses persistence, atomic writes, physical indexes, durable operation replay, migration, and deletion recovery. Enforce this spec's ownership and retention rules there.
* Feature 10 decides real path resolution, folder expansion, binary handling, capture limits, access grants, and content capture integrity. Source paths alone never grant access.
* Feature 11 defines trusted execution writes, concrete approval validation against current originals, cancellation acknowledgement, interrupted worker detection, and runtime and spending limits. These simulated approval records do not authorize execution.
* Feature 12 chooses durable content storage and artifact preview handling while retaining version and run relationships.
* Features 5 through 8 implement the user interactions against these contracts. Rich preview formats and task movement require later decisions.

## Rationale

Reasoning and alternatives are in [rationale.md](rationale.md).
