"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArchiveCard } from "@/components/ArchiveCard";
import { parseCharacterJson } from "@/lib/summary";
import {
  deleteCharacter,
  getCharacters,
  publishCharacter,
  saveCharacter as saveCharacterToArchive,
} from "@/lib/storage";
import { Character } from "@/lib/types";

export default function ArchivePage() {
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);

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

  function openImport() {
    setImportText("");
    setImportError(null);
    setImportOpen(true);
  }

  function importCharacter() {
    try {
      const parsed = parseCharacterJson(importText);
      saveCharacterToArchive(parsed);
      setCharacters(getCharacters());
      setImportOpen(false);
    } catch (error) {
      setImportError(
        error instanceof Error ? error.message : "Could not import that JSON."
      );
    }
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
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-xl border-2 border-neutral-700 bg-neutral-900 px-6 py-3 text-sm font-bold uppercase tracking-wide text-parchment transition hover:border-ember hover:text-ember"
          >
            ← Back to Generator
          </button>
          <button
            type="button"
            onClick={openImport}
            className="rounded-xl border-2 border-neutral-700 bg-neutral-900 px-6 py-3 text-sm font-bold uppercase tracking-wide text-parchment transition hover:border-ember hover:text-ember"
          >
            ⬆️ Import JSON
          </button>
        </div>
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

      {importOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 px-6">
          <div className="w-full max-w-lg rounded-2xl border-2 border-ember/60 bg-neutral-950 p-6 shadow-2xl">
            <p className="font-display text-lg font-bold uppercase tracking-wide text-parchment">
              Import NPC from JSON
            </p>
            <p className="mt-1 text-sm text-neutral-400">
              Paste JSON copied via the generator&apos;s Copy Character → JSON
              option.
            </p>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              rows={10}
              placeholder='{ "name": "...", "race": "...", ... }'
              className="mt-4 w-full rounded-xl border-2 border-neutral-700 bg-neutral-900 px-3 py-2 font-mono text-xs text-parchment placeholder:text-neutral-600 focus:border-ember focus:outline-none"
            />
            {importError && (
              <p className="mt-2 text-sm text-red-400">{importError}</p>
            )}
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setImportOpen(false)}
                className="rounded-xl border-2 border-neutral-700 bg-neutral-900 px-5 py-2 text-sm font-bold uppercase tracking-wide text-parchment transition hover:border-ember hover:text-ember"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={importCharacter}
                disabled={!importText.trim()}
                className="rounded-xl bg-ember/90 px-5 py-2 text-sm font-black uppercase tracking-wide text-white transition hover:bg-ember disabled:cursor-not-allowed disabled:opacity-50"
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
