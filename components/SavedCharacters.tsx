"use client";

import { Character } from "@/lib/types";

interface SavedCharactersProps {
  characters: Character[];
  onLoad: (character: Character) => void;
  onDelete: (id: string) => void;
}

export function SavedCharacters({
  characters,
  onLoad,
  onDelete,
}: SavedCharactersProps) {
  if (characters.length === 0) return null;

  return (
    <div className="rounded-2xl border-2 border-neutral-700 bg-neutral-900/80 p-5">
      <span className="mb-3 block text-xs font-bold uppercase tracking-widest text-neutral-400">
        Saved Characters
      </span>
      <ul className="space-y-2">
        {characters.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between rounded-xl border-2 border-neutral-800 bg-neutral-950/60 px-4 py-2"
          >
            <div>
              <p className="font-display font-bold uppercase tracking-wide text-parchment">
                {c.name || "Unnamed"}
              </p>
              <p className="text-xs text-neutral-500">
                {c.race} · {c.className}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onLoad(c)}
                className="rounded-lg border-2 border-neutral-700 px-3 py-1 text-xs font-bold uppercase tracking-wide text-parchment transition hover:border-ember hover:text-ember"
              >
                Load
              </button>
              <button
                type="button"
                onClick={() => c.id && onDelete(c.id)}
                className="rounded-lg border-2 border-neutral-700 px-3 py-1 text-xs font-bold uppercase tracking-wide text-parchment transition hover:border-red-400 hover:text-red-400"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
