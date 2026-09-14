# 0003. Chat With Tools visual review

**Status**: In Progress
**Date**: 2026-09-13

## Summary

Use the actual shadcn.io Chat With Tools block for the first working review of feature 4. Gary selected this block after viewing its live preview and accepted reviewing it in the running app. This records that decision, not acceptance of the finished visual foundation.

## Context

The application has a selected Developer Tools Sidebar and sample data contracts from specs 0001 and 0002. The task area is still a placeholder. The September 13 handoff calls for one real block adapted to a completed task that creates a Markdown plan from fabricated notes.

## Requirements

1. **AC-1:** The sample task route shows the selected block's request, tool activity, assistant result, and composer structure inside the existing sidebar shell.
2. **AC-2:** Activity starts as one concise completed summary. It expands to tool cards, each with inspectable details. All displayed work is fabricated sample content.
3. **AC-3:** The result opens the generated Markdown plan in one optional inspector. Closing it returns focus to its trigger. Narrow windows use a full width detail surface with a clear return action.
4. **AC-4:** The composer accepts a local draft and clearly explains that no agent is connected. It does not simulate a successful submission or persist the draft.
5. **AC-5:** The screen has loading, retryable failure, and empty states. It retains the current Appearance behavior, system fonts, semantic tokens, keyboard focus, and usable narrow layouts. Inspect Chrome and Safari.

## Decision

Adapt `ai-chat-with-tools` from shadcn.io directly. Preserve its composed structure and expandable tool cards. Replace demo data with a typed asynchronous fixture adapter. Use the installed Radix Collapsible and Sheet for accessible disclosure and the optional inspector. Retain the block's plain message rows as selected by Gary, rather than substituting another chat composition.

**Implementation skills**: `shadcn` (`.agents/skills/shadcn/`).

## Feature design

The existing header and Developer Tools Sidebar remain. On the task route, replace the placeholder workspace columns with the conversation block. Its header names the task and shows Completed. The body contains the user request, collapsed activity summary, assistant answer, and a View plan action. A labelled composer sits below with a disabled send button and an explicit local draft explanation. The overview route and Appearance continue to work.

The inspector is a Radix Sheet containing a heading, Markdown source, and a return button. It is read only, labelled as sample content, and full width on narrow windows. Only one inspector exists. No rich text editor or real file access is introduced.

### Value sourcing

| Display or action | Source |
| --- | --- |
| Task name, user request, assistant result, run state | Isolated review fixture conforming to spec 0002, read through `createMockWorkspaceReader` |
| Activity summary and tool card titles | Review run ActivityEvent records, ordered by sequence |
| Expanded inputs and outputs | Captured sample note snapshot, activity summary, generated artifact metadata |
| Plan title and Markdown | Review Artifact and ArtifactVersion records |
| Counts | Number of loaded review activity records |
| Draft text | React state from textarea input, discarded on navigation or reload |
| Loading, error and retry | Asynchronous reader results and caught unexpected failures |
| Theme and typography | Existing appearance provider and theme tokens |

The fixture represents one completed run. It performs no network requests, real agent actions, or workspace writes. The view adapter returns typed results. Unexpected errors remain available in development diagnostics.

## Build plan

- [x] Adapt the registry block and supply a coherent completed sample through the existing reader boundary (AC-1, AC-2).
- [x] Integrate the task route, plan inspector, local draft, and read states (AC-3, AC-4, AC-5).
- [ ] Run format checking, typecheck, lint, build, and browser inspection (AC-1 through AC-5).

## Consequences

The next review shows the real chosen component in the application. Registry demo behavior needs adaptation, including accessible names, disclosure behavior, responsive sizing, and token colors. The block adds its existing Motion dependency. This is a bounded visual review; feature 4 remains in progress until Gary accepts the broader visual foundation and remaining states.

## Rationale

Gary selected this composed block after reviewing its preview. Keeping its structure makes the result comparable to that choice. The existing reader and domain contracts keep sample content independent of the UI and Appearance storage.

## Follow-up

Review this first working screen with Gary before extending the visual foundation.
