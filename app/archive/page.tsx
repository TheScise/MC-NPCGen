"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArchiveCard } from "@/components/ArchiveCard";
import {
  deleteCharacter,
  getCharacters,
  publishCharacter,
} from "@/lib/storage";
import { Character } from "@/lib/types";

export default function ArchivePage() {
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setCharacters(getCharacters());
  }, []);

  function loadCharacter(character: Character) {
    publishCharacter(character);
    router.push("/");
  }

  function confirmDelete(id: string) {
    deleteCharacter(id);
    setCharacters(getCharacters());
    setPendingDeleteId(null);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 bg-neutral-950 px-6 py-10">
      <header className="flex flex-col items-center gap-2 text-center">
        <h1 className="font-display text-3xl font-extrabold uppercase tracking-wide text-parchment">
          NPC Archive
        </h1>
        <p className="text-sm text-neutral-400">
          Browse, reload, or retire your previously created NPCs.
        </p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mt-2 rounded-xl border-2 border-neutral-700 bg-neutral-900 px-6 py-3 text-sm font-bold uppercase tracking-wide text-parchment transition hover:border-ember hover:text-ember"
        >
          ← Back to Generator
        </button>
      </header>

      {characters.length === 0 ? (
        <p className="text-center text-sm font-bold uppercase tracking-widest text-neutral-500">
          No NPCs saved yet.
        </p>
      ) : (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {characters.map((character) => (
            <ArchiveCard
              key={character.id}
              character={character}
              onLoad={() => loadCharacter(character)}
              onDelete={() => setPendingDeleteId(character.id ?? null)}
            />
          ))}
        </section>
      )}

      {pendingDeleteId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 px-6">
          <div className="w-full max-w-sm rounded-2xl border-2 border-red-400/60 bg-neutral-950 p-6 text-center shadow-2xl">
            <p className="font-display text-lg font-bold uppercase tracking-wide text-parchment">
              Delete this NPC?
            </p>
            <p className="mt-2 text-sm text-neutral-400">
              This cannot be undone.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setPendingDeleteId(null)}
                className="rounded-xl border-2 border-neutral-700 bg-neutral-900 px-5 py-2 text-sm font-bold uppercase tracking-wide text-parchment transition hover:border-ember hover:text-ember"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => confirmDelete(pendingDeleteId)}
                className="rounded-xl border-2 border-red-400 bg-red-500/20 px-5 py-2 text-sm font-bold uppercase tracking-wide text-red-300 transition hover:bg-red-500/30"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
