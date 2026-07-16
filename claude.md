# Minecraft NPC Character Generator

## Project Purpose

This project is a lightweight livestream tool for creating Minecraft NPC characters.

The streamer uses it during live broadcasts to generate characters with chat participation.

The finished character is displayed through an OBS Browser Source overlay.

The goal is entertainment and speed, not complexity.

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