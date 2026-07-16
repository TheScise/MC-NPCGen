"use client";

import { useCallback, useEffect, useState } from "react";
import { Character, LockState } from "./types";

const STORAGE_KEY = "mc-npcgen-character";
const LOCK_KEY = "mc-npcgen-locks";
const CHANNEL_NAME = "mc-npcgen";

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

export function loadCharacter(): Character | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Character;
  } catch {
    return null;
  }
}

export function saveCharacter(character: Character) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(character));
  const channel = getChannel();
  channel?.postMessage({ type: "character", character });
  channel?.close();
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
 */
export function usePublishedCharacter(createInitial: () => Character) {
  const [character, setCharacterState] = useState<Character | null>(null);

  useEffect(() => {
    const stored = loadCharacter();
    if (stored) {
      setCharacterState(stored);
    } else {
      const generated = createInitial();
      setCharacterState(generated);
      saveCharacter(generated);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setCharacter = useCallback((next: Character) => {
    setCharacterState(next);
    saveCharacter(next);
  }, []);

  return [character, setCharacter] as const;
}

/** For the overlay: read-only character state kept in sync via BroadcastChannel + storage events. */
export function useSyncedCharacter(): Character | null {
  const [character, setCharacter] = useState<Character | null>(null);

  useEffect(() => {
    setCharacter(loadCharacter());
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
