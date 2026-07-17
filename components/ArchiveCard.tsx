"use client";

import { Character } from "@/lib/types";

interface ArchiveCardProps {
  character: Character;
  onLoad: () => void;
  onDelete: () => void;
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ArchiveCard({ character, onLoad, onDelete }: ArchiveCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border-2 border-ember/60 bg-neutral-950/80 p-5 shadow-lg">
      <div>
        <h2 className="font-display text-xl font-extrabold uppercase tracking-wide text-parchment">
          {character.name || "Unnamed"}
        </h2>
        <p className="mt-1 text-sm text-ember">
          {character.race || "—"} {character.className || "—"}
        </p>
        <div className="mt-3">
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
            Flaw
          </span>
          <p className="text-sm text-parchment">{character.flawName || "—"}</p>
        </div>
        <p className="mt-3 text-xs text-neutral-500">
          Created {formatDate(character.createdAt)}
        </p>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onLoad}
          className="flex-1 rounded-lg border-2 border-neutral-700 px-3 py-2 text-xs font-bold uppercase tracking-wide text-parchment transition hover:border-ember hover:text-ember"
        >
          Load
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="flex-1 rounded-lg border-2 border-neutral-700 px-3 py-2 text-xs font-bold uppercase tracking-wide text-parchment transition hover:border-red-400 hover:text-red-400"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
