"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Character, LockState } from "./types";

const STORAGE_KEY = "mc-npcgen-character";
const LOCK_KEY = "mc-npcgen-locks";
const CHANNEL_NAME = "mc-npcgen";
const ARCHIVE_KEY = "mc-npcgen-archive";
const KEEP_LIVE_KEY = "mc-npcgen-keep-live";

export const defaultLocks: LockState = {
  name: false,
  race: false,
  nationality: false,
  className: false,
  flawName: false,
  quest: false,
};

function getChannel(): BroadcastChannel | null {
  if (typeof window === "undefined" || !("BroadcastChannel" in window)) {
    return null;
  }
  return new BroadcastChannel(CHANNEL_NAME);
}

function loadLiveCharacter(): Character | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Character;
  } catch {
    return null;
  }
}

function saveLiveCharacter(character: Character) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(character));
  const channel = getChannel();
  channel?.postMessage({ type: "character", character });
  channel?.close();
}

/**
 * Publishes a character as the live/on-air character, syncing the control panel + overlay.
 * Marks it to survive the control panel's next mount (e.g. after navigating there from the
 * archive), since the control panel otherwise always starts fresh on load.
 */
export function publishCharacter(character: Character) {
  saveLiveCharacter(character);
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(KEEP_LIVE_KEY, "1");
  }
}

function generateId(): string {
  if (typeof window !== "undefined" && "crypto" in window && "randomUUID" in window.crypto) {
    return window.crypto.randomUUID();
  }
  return `npc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadArchive(): Character[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(ARCHIVE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Character[];
  } catch {
    return [];
  }
}

function persistArchive(characters: Character[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ARCHIVE_KEY, JSON.stringify(characters));
}

/** All saved NPCs, most recently updated first. */
export function getCharacters(): Character[] {
  return loadArchive().sort((a, b) =>
    (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "")
  );
}

/** A single saved NPC by id. */
export function loadCharacter(id: string): Character | null {
  return loadArchive().find((c) => c.id === id) ?? null;
}

/** Saves a new NPC to the archive, assigning an id and timestamps. */
export function saveCharacter(character: Character): Character {
  const now = new Date().toISOString();
  const saved: Character = {
    ...character,
    id: character.id ?? generateId(),
    createdAt: character.createdAt ?? now,
    updatedAt: now,
  };
  const archive = loadArchive().filter((c) => c.id !== saved.id);
  persistArchive([...archive, saved]);
  return saved;
}

/** Updates an existing saved NPC by id. Returns null if it doesn't exist. */
export function updateCharacter(
  id: string,
  updates: Partial<Character>
): Character | null {
  const archive = loadArchive();
  const existing = archive.find((c) => c.id === id);
  if (!existing) return null;
  const updated: Character = {
    ...existing,
    ...updates,
    id,
    updatedAt: new Date().toISOString(),
  };
  persistArchive(archive.map((c) => (c.id === id ? updated : c)));
  return updated;
}

/** Removes a saved NPC from the archive. */
export function deleteCharacter(id: string) {
  persistArchive(loadArchive().filter((c) => c.id !== id));
}

export function loadLocks(): LockState {
  if (typeof window === "undefined") return defaultLocks;
  const raw = window.localStorage.getItem(LOCK_KEY);
  if (!raw) return defaultLocks;
  try {
    return { ...defaultLocks, ...(JSON.parse(raw) as LockState) };
  } catch {
    return defaultLocks;
  }
}

export function saveLocks(locks: LockState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCK_KEY, JSON.stringify(locks));
}

/**
 * For the control panel: local character state that persists + broadcasts on every change.
 * Starts as `null` so the server-rendered markup and the first client render match exactly
 * (localStorage/randomness are only read after mount, avoiding a hydration mismatch).
 * Resets to `createInitial()` on mount — the control panel starts fresh on every page load —
 * unless a character was just published via `publishCharacter` (e.g. "Load" from the archive),
 * in which case that one is kept for this mount only.
 */
export function usePublishedCharacter(createInitial: () => Character) {
  const [character, setCharacterState] = useState<Character | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    // Guard against React StrictMode's dev-only double-invocation of this effect:
    // without this, the second invocation would consume/clear KEEP_LIVE_KEY having
    // already been cleared by the first, and re-generate a blank character.
    if (initialized.current) return;
    initialized.current = true;

    const shouldKeep =
      typeof window !== "undefined" &&
      window.sessionStorage.getItem(KEEP_LIVE_KEY) === "1";
    if (shouldKeep) {
      window.sessionStorage.removeItem(KEEP_LIVE_KEY);
      const stored = loadLiveCharacter();
      if (stored) {
        setCharacterState(stored);
        return;
      }
    }
    const generated = createInitial();
    setCharacterState(generated);
    saveLiveCharacter(generated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setCharacter = useCallback((next: Character) => {
    setCharacterState(next);
    saveLiveCharacter(next);
  }, []);

  return [character, setCharacter] as const;
}

/** For the overlay: read-only character state kept in sync via BroadcastChannel + storage events. */
export function useSyncedCharacter(): Character | null {
  const [character, setCharacter] = useState<Character | null>(null);

  useEffect(() => {
    setCharacter(loadLiveCharacter());
    const channel = getChannel();
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === "character") {
        setCharacter(event.data.character as Character);
      }
    };
    channel?.addEventListener("message", onMessage);

    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        try {
          setCharacter(JSON.parse(event.newValue) as Character);
        } catch {
          // ignore malformed payloads
        }
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      channel?.removeEventListener("message", onMessage);
      channel?.close();
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return character;
}
