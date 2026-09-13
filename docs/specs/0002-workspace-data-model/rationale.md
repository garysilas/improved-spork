# Workspace data model rationale

## Context

Gary's private workspace needs realistic projects, conversations, progress, selected context, and results before real persistence or agents are connected. Existing code has a shell service with three presentation labels and no domain records. The repository contains 40 TypeScript source files and uses a single React application. Preflight found a clean working tree and no commits behind origin/main.

This is scope feature 3, a new feature under the Facade approach and Prototype checks. Spec 0001 establishes the service boundary and explicitly leaves this model to feature 3. It remains in force. The current decision concerns data contracts and samples, not the independent implementation decisions for persistence and privileged execution.

## Options considered

| Option | Benefit | Cost |
|---|---|---|
| Screen specific nested fixtures | Few types and fast initial screen construction | Duplicates relationships and makes history inconsistent across screens |
| Explicit related records behind an asynchronous adapter | One coherent source for tasks, context, and versioned results | Requires graph validation and more fixture authoring |
| Database schema and persistence now | Immediately establishes durable constraints and queries | Advances the real workspace phase before the prototype is usable |

## Rationale

Choose explicit records because Gary wants conversations to continue across runs and each result to retain its original context. Nested display samples are the runner up for speed, but do not reliably express these shared relationships. A database is unnecessary for fixed samples and would force an independent storage decision early.

Gary confirmed project ownership for every task, optional project folders, one active run per task, separate messages and activity, reusable project sources selected per task, exact supplied context snapshots, and artifact versions. Task completion follows the latest run. Waiting answers resume that run. A retry or follow up creates a new run. These choices establish understandable history without an execution queue.

Gary chose archive before explicit permanent deletion, restoration before new work, no task movement, and text and Markdown artifacts. Removing a source preserves prior captured contents. Missing selected context blocks a run. Active descendants must stop before archive or deletion. Interrupted work requires explicit retry. Declining an approval resumes the run with the decline recorded.

Small implementation choices use stable IDs instead of names, UTC times plus local sequences instead of timestamp ordering alone, and derived task status instead of redundant state. Typed result values are preferred over expected thrown failures to fit project conventions. Paginated lists give later screens bounded reads; an unbounded array is simpler but would change the surface when history grows. No library is required for these contracts.

The model review was confirmed in the design conversation. Gary requested no References section. Content confirmation of the finished spec is recorded in its index after review.
