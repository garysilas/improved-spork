# Application architecture rationale

## Context

The project is a private agent workspace for Gary on one Mac. It is also a place to learn frontend development. The recorded delivery approach is Facade: establish a convincing interface with sample content, then connect real work. The scope reserves persistence, selected files, and controlled agent execution for later features, with stronger checks for real file access and actions.

On September 13, 2026, Gary moved application architecture and scaffold to the first step. During this interview he chose shadcn.io as the UI direction. This changes the earlier Figma first dependency recorded in the scope. The old design artifacts have not been reviewed or implemented as part of this decision.

Preflight found no application source, specs, root or nested project instruction files, package manifests, or Git repository. Only `docs/scope/scope.md` existed as project content. Git freshness checks could not apply. The installed runtime is Node 22.22.3, with npm 10.9.8 and pnpm 10.33.0 available. Gary chose Node 22 and npm. No deadline or spending cap was supplied; none is invented here.

## Options considered

| Option | Advantage | Cost | Outcome and basis |
|---|---|---|---|
| React, TypeScript, Vite, and a later local service | Small browser foundation, direct fit for requested React components | Backend and transport will need a later design | Selected. (basis: Gary's choices, Vite guide, React TypeScript guide, and Facade delivery.) |
| Next.js with React and integrated server features | Keeps UI and server capabilities in one framework | Adds server rendering and framework concepts before the sample prototype needs them | Runner up. (basis: official Next installation and Next 16 documentation.) |
| SvelteKit and a later local service | Integrated routing and rendering with a compact UI model | Does not directly reuse the requested React components | Considered during research, set aside after the shadcn.io choice. (basis: official SvelteKit introduction and component metadata.) |
| Desktop application with a native boundary | Dedicated launch experience and access to platform integration | More packaging and native integration work for the initial shell | Gary chose a local browser application. (basis: interview and separation of privileged operations.) |

## Rationale

The first goal is a comprehensible, editable interface. React and Vite fit the requested component source and require one development process. The local service is deferred because sample UI behavior does not need file access or agent execution. A small asynchronous adapter introduces the replacement point without inventing the final backend. (basis: scope Facade approach and separation of concerns.)

TypeScript gives useful checks at component and adapter boundaries. React Router's declarative mode supports browser history without adopting a server framework. Tailwind and shadcn semantic tokens match the documented Vite setup, while the installed skill gives concrete composition conventions. (basis: React TypeScript guide, React Router declarative installation, shadcn Vite guide, and the installed shadcn skill.)

Gary chose the installed Node 22 and npm over runtime changes or pnpm setup. The verified Vite guide accepts Node 22.12 or newer, so the installed runtime meets that requirement. Stable compatible dependency versions will be recorded by the build. (basis: local tool inventory, Vite guide, and interview.)

Use React state rather than an additional state package while the shell has only a few presentation states. Keep a single root package rather than a monorepo while only one application exists. Use neutral tokens, system fonts, and Lucide as temporary visual defaults rather than carrying forward an unaccepted Figma design. These are small implementation recommendations for the selected boundaries; a custom design system, shared state package, or workspace split can be reconsidered when an actual feature requires it. (basis: scope learning goal, installed shadcn skill, and minimal necessary structure.)

### Appearance amendment

Gary requested an Appearance page within Settings, using themes created at tweakcn.com. He selected import through the page and chose pasted Tailwind 4 CSS over a remote theme URL. A named local collection supports switching among his themes without changing application code. This extends the original system appearance default with a persistent theme and mode preference. (basis: Gary's follow up and tweakcn's official repository.)

Local browser storage is sufficient for these appearance preferences and does not introduce the real workspace database early. Parsing supported tokens rather than installing a complete stylesheet keeps theme changes within the application's existing component and Tailwind mappings. The tradeoff is that custom fonts need to be available locally, and arbitrary CSS rules are not imported. A developer installed theme collection remains simpler internally, but would not provide the in app import flow Gary selected.

## Tool discovery record

Gary approved current official sources and additional skill discovery. The architecture landscape check was bounded and used official documentation. CLI skill discovery stalled without results; web discovery confirmed the official shadcn skill and a community Tailwind skill. The React Router candidate came from an archived repository and was not offered as a verified installation. A broad React repository result did not establish a focused installable skill.

Gary selected only the official `shadcn` skill from `shadcn-ui/ui`, directory `skills/shadcn`. It was installed into this project's `.agents/skills/shadcn/`. The installer used its Git method after Python's certificate validation failed; certificate checks were not disabled. The skill was read and applied to this architecture.

Existing shadcn.io, Context7, and browser tools were sufficient. Gary declined additional MCP setup. No registry purchase or premium component installation was requested. The observed `ai-chat-with-sidebar` metadata identifies a premium React block using shadcn/ui and Tailwind, with Motion and Lucide dependencies; it was inspected for fit, not selected as the scaffold.

## References

**Project sources**

* [Scope](../../scope/scope.md), product intent, feature boundaries, Facade delivery, and Prototype checks.
* Gary's September 13 architecture interview, decisions captured in the accompanying spec.
* [Installed shadcn skill](../../../.agents/skills/shadcn/SKILL.md), component composition and semantic styling conventions.
* Local tool inventory and shadcn.io registry metadata observed during this session.

**Practices**

* Separation of concerns, UI components call an adapter while privileged work remains outside the browser.
* Minimal necessary structure, add service and state infrastructure when features need it.

**Verified links**

* [Vite guide](https://vite.dev/guide/), frontend build workflow and Node compatibility.
* [React TypeScript guide](https://react.dev/learn/typescript), typed components.
* [React Router declarative installation](https://reactrouter.com/start/declarative/installation), browser routing with Vite.
* [shadcn Vite installation](https://ui.shadcn.com/docs/installation/vite), Tailwind and component setup.
* [shadcn skills](https://ui.shadcn.com/docs/skills), official implementation skill.
* [Next installation](https://nextjs.org/docs/pages/getting-started/installation) and [Next 16 documentation](https://nextjs.org/docs/app/guides/upgrading/version-16), integrated framework alternative.
* [SvelteKit introduction](https://svelte.dev/docs/kit/introduction), alternate application framework.

* [tweakcn official repository](https://github.com/jnsahaj/tweakcn), the visual theme editor and export source selected for Appearance.

These links record the research used for this decision. Later spec review need not fetch them again.
