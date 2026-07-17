# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Minecraft NPC Character Generator

## Project Purpose

This project is a lightweight livestream tool for creating Minecraft NPC characters.

The streamer uses it during live broadcasts to generate characters with chat participation.

The finished character is displayed through an OBS Browser Source overlay.

The goal is entertainment and speed, not complexity.

---

# Commands

- `npm run dev` — start the dev server (Next.js App Router, hot reload)
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — ESLint (`eslint-config-next`)
- `npx tsc --noEmit` — type-check only (no dedicated test runner or test suite exists in this repo)

There is no test suite. Verify changes by running `npm run dev` and exercising the `/` control panel and `/overlay` page in a browser (or two tabs, to check sync).

---

# Development Principles

## Keep It Simple

Avoid unnecessary infrastructure.

Do not add:

- Databases
- Authentication
- APIs
- Backend services
- External dependencies without reason

Prefer:

- Local state
- JSON data
- Simple React components
- Client-side functionality

---

# Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- Vercel deployment

---

# Architecture

## Routes (`/app`)

- `/` (`app/page.tsx`) — the control panel. Owns the live character via `usePublishedCharacter`, toggles between "roll" mode (RollCard grid + RulesPanel) and "edit" mode (`CharacterEditor`), and writes every change straight through to localStorage/BroadcastChannel so `/overlay` stays in sync in real time.
- `/overlay` (`app/overlay/page.tsx`) — read-only OBS Browser Source view. Subscribes via `useSyncedCharacter` (BroadcastChannel + storage events) and renders `CharacterSheet`. Must stay clean/controls-free; toggles a `overlay-transparent` class for a transparent background.
- `/archive` (`app/archive/page.tsx`) — lists saved NPCs (`ArchiveCard`), can load one back onto the live control panel (`publishCharacter`, which also flags `sessionStorage` so the control panel keeps it across the navigation instead of generating a fresh character) or import/export via JSON (`lib/summary.ts`).
- `/settings` (`app/settings/page.tsx`) — "NPC Libraries" editor for the option pools (names, races, nationalities, quests, classes, flaws). Custom additions and hidden defaults are stored in localStorage via `lib/customOptions.ts`; nothing here mutates the shipped `/data/*.json`.

## Character generation & options (`lib/generate.ts`)

- Field option pools are the shipped `/data/*.json` defaults merged with user customizations from `lib/customOptions.ts` (`resolveList`/`resolveRules` layer custom additions on top of defaults minus any hidden/removed defaults).
- `getFieldOptions()` is the single source of truth for what each `FieldKey` (`name`, `race`, `nationality`, `className`, `flawName`, `quest`) can roll to; `rollField`/`generateCharacter` build on it.
- A character's `rules` are always derived, never hand-set directly: `rulesFor(className, flawName)` concatenates the matching class's rules with the matching flaw's rules. Any code path that changes `className` or `flawName` must recompute `rules`.

## State & sync (`lib/storage.ts`)

There is no backend. The control panel and overlay are two separate tabs/windows kept in sync purely client-side:

- **Live character**: written to `localStorage` and broadcast over a `BroadcastChannel` on every change (`usePublishedCharacter` on the control panel side, `useSyncedCharacter` on the overlay side, which also falls back to the `storage` event for cross-tab updates BroadcastChannel might miss).
- **Archive**: a separate localStorage-backed list of saved `Character` records with id/createdAt/updatedAt, independent of the live character.
- **Custom options**: yet another localStorage namespace (`lib/customOptions.ts`), keyed per category, storing only the diff (added items, removed default names) against the shipped JSON.
- All of this is intentionally client-only — do not introduce a server-side store for any of it.
- `usePublishedCharacter` starts as `null` (not the generated default) so SSR and first client render match; the real value is only set after mount, once localStorage/randomness are available. Any new stateful hook here should follow the same null-until-mount pattern to avoid hydration mismatches.

## Character model (`lib/types.ts`)

A `Character` has required roll fields (`name`, `race`, `nationality`, `className`, `flawName`, `quest`, `rules`) plus optional sheet-editor fields (`gender`, `location`, `lore`, `notes`, `currentGoal`) and archive metadata (`id`, `createdAt`, `updatedAt`). `FieldKey`/`LockState` cover only the six rollable fields — the optional fields are edited directly in `CharacterEditor`, not rolled.

## Components (`/components`)

- `RollCard` / `SpinField` — the per-field slot-machine roll UI and animation (lock toggle, roll button, spin animation keyed by a per-field `spinToken` counter to retrigger Framer Motion on repeat rolls of the same value).
- `RulesPanel` — renders the combined class+flaw rules list.
- `CharacterEditor` — free-form sheet editor; fields backed by an option pool (race, nationality, class, flaw, quest) render as `<select>` dropdowns sourced from `lib/customOptions.ts`, with a per-field pencil toggle to drop into free text when needed.
- `CharacterSheet` — read-only presentational render used by the overlay.
- `ArchiveCard` — archive list item (load/delete).

---

# Important Routes

## /

Control panel.

Used by streamer.

Contains:

- Character generation
- Slot machine rolls
- Lock controls
- Character editing
- Copy summary

---

## /overlay

OBS Browser Source page.

Must remain:

- Clean
- Readable
- No controls
- Stream friendly

---

# Character Model

A character contains:

- Name
- Race
- Nationality
- Class
- Flaw
- Quest
- Generated rules

Rules come from:

Class rules + Flaw rules

---

# UX Rules

The primary experience is random generation.

Do not turn the UI into a normal form.

The user should feel like they are rolling an RPG character.

Important interactions:

- Large cards
- Roll buttons
- Lock buttons
- Animated reveals

---

# Data Rules

All character options live in:

/data

Do not hardcode character lists inside components.

New classes and flaws should be addable by editing JSON.

---

# State Rules

There is no backend.

Synchronisation between:

/

and:

/overlay

uses:

- localStorage
- BroadcastChannel

---

# Code Style

Prefer:

- Small components
- Clear naming
- Simple logic

Avoid:

- Over-abstraction
- Generic frameworks
- Premature optimisation

---

# Future Ideas

Possible future features:

- Persistent NPC archive
- Episode history
- Minecraft integration
- Public world wiki

Do not implement these unless explicitly requested.

The current goal is a polished character roller for streaming.
