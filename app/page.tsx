"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CharacterEditor } from "@/components/CharacterEditor";
import { RollCard, SPIN_DURATION_MS } from "@/components/RollCard";
import { RulesPanel } from "@/components/RulesPanel";
import {
  emptyCharacter,
  getFieldOptions,
  rollField,
  rulesFor,
} from "@/lib/generate";
import {
  characterSummary,
  characterSummaryJson,
  characterSummaryMarkdown,
} from "@/lib/summary";
import {
  defaultLocks,
  loadLocks,
  saveCharacter as saveCharacterToArchive,
  saveLocks,
  updateCharacter,
  usePublishedCharacter,
} from "@/lib/storage";
import { Character, FieldKey, LockState } from "@/lib/types";

const FIELD_ORDER: { key: FieldKey; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "race", label: "Race" },
  { key: "nationality", label: "Nationality" },
  { key: "className", label: "Class" },
  { key: "flawName", label: "Flaw" },
  { key: "quest", label: "Quest" },
];

const STAGGER_MS = 350;

export default function ControlPanel() {
  const router = useRouter();
  const [character, setCharacter] = usePublishedCharacter(() => emptyCharacter);
  const [locks, setLocks] = useState<LockState>(defaultLocks);
  const [spinTokens, setSpinTokens] = useState<Record<FieldKey, number>>({
    name: 0,
    race: 0,
    nationality: 0,
    className: 0,
    flawName: 0,
    quest: 0,
  });
  const [revealStatus, setRevealStatus] = useState<string | null>(null);
  const [copyLabel, setCopyLabel] = useState("Copy Character");
  const [copyMenuOpen, setCopyMenuOpen] = useState(false);
  const [mode, setMode] = useState<"roll" | "edit">("roll");
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    setLocks(loadLocks());
  }, []);

  useEffect(() => {
    saveLocks(locks);
  }, [locks]);

  function toggleLock(field: FieldKey) {
    setLocks((prev) => ({ ...prev, [field]: !prev[field] }));
  }

  function rollSingleField(field: FieldKey) {
    if (!character) return;
    const newValue = rollField(field);
    const updated: Character = { ...character, [field]: newValue } as Character;
    if (field === "className" || field === "flawName") {
      updated.rules = rulesFor(updated.className, updated.flawName);
    }
    setCharacter(updated);
    setSpinTokens((prev) => ({ ...prev, [field]: prev[field] + 1 }));
  }

  function rollEntireCharacter() {
    if (!character || revealStatus) return;
    const unlockedFields = FIELD_ORDER.filter((f) => !locks[f.key]);
    if (unlockedFields.length === 0) return;

    setRevealStatus("Rolling Character...");

    const newValues: Partial<Character> = {};
    unlockedFields.forEach((f) => {
      (newValues as Record<string, string>)[f.key] = rollField(f.key);
    });
    const updated: Character = { ...character, ...newValues } as Character;
    updated.rules = rulesFor(updated.className, updated.flawName);

    const clearedValues: Partial<Character> = {};
    unlockedFields.forEach((f) => {
      (clearedValues as Record<string, string>)[f.key] = "";
    });
    const cleared: Character = { ...character, ...clearedValues } as Character;
    cleared.rules = rulesFor(cleared.className, cleared.flawName);
    setCharacter(cleared);

    let revealed: Character = cleared;
    unlockedFields.forEach((f, index) => {
      setTimeout(() => {
        revealed = { ...revealed, [f.key]: updated[f.key] } as Character;
        revealed.rules = rulesFor(revealed.className, revealed.flawName);
        setCharacter(revealed);
        setSpinTokens((prev) => ({ ...prev, [f.key]: prev[f.key] + 1 }));
        setRevealStatus(`${f.label}: ${updated[f.key]}`);
      }, index * STAGGER_MS);
    });

    const totalDelay = unlockedFields.length * STAGGER_MS + SPIN_DURATION_MS;
    setTimeout(() => setRevealStatus("Character Complete!"), totalDelay);
    setTimeout(() => setRevealStatus(null), totalDelay + 1600);
  }

  async function copySummary(format: "text" | "markdown" | "json") {
    if (!character) return;
    const content =
      format === "markdown"
        ? characterSummaryMarkdown(character)
        : format === "json"
        ? characterSummaryJson(character)
        : characterSummary(character);
    await navigator.clipboard.writeText(content);
    setCopyMenuOpen(false);
    setCopyLabel("Copied!");
    setTimeout(() => setCopyLabel("Copy Character"), 1500);
  }

  function clearCharacter() {
    setRevealStatus(null);
    setLocks(defaultLocks);
    setCharacter(emptyCharacter);
  }

  function saveCharacterToSheet() {
    if (!character) return;
    const saved = character.id
      ? updateCharacter(character.id, character) ??
        saveCharacterToArchive({ ...character, id: undefined })
      : saveCharacterToArchive({ ...character, id: undefined });
    setCharacter(saved);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1500);
  }

  if (!character) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950">
        <p className="font-display text-sm font-bold uppercase tracking-widest text-neutral-500">
          Loading...
        </p>
      </main>
    );
  }

  const isEmpty = character.name === "";
  const fieldOptions = getFieldOptions();

  return (
    <main className="relative mx-auto flex min-h-screen max-w-5xl flex-col gap-6 bg-neutral-950 px-6 py-10">
      <div className="absolute right-4 top-4 flex gap-2">
        <div
          className="relative"
          onMouseEnter={() => !isEmpty && setCopyMenuOpen(true)}
          onMouseLeave={() => setCopyMenuOpen(false)}
        >
          <button
            type="button"
            onClick={() => copySummary("text")}
            disabled={isEmpty}
            className="rounded-lg border-2 border-neutral-700 bg-neutral-900 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-parchment transition hover:border-ember hover:text-ember disabled:cursor-not-allowed disabled:opacity-50"
          >
            📋 {copyLabel}
          </button>
          <AnimatePresence>
            {copyMenuOpen && !isEmpty && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full z-10 mt-1 flex w-32 flex-col overflow-hidden rounded-lg border-2 border-neutral-700 bg-neutral-900 shadow-lg"
              >
                <button
                  type="button"
                  onClick={() => copySummary("text")}
                  className="px-3 py-1.5 text-left text-[11px] font-bold uppercase tracking-wide text-parchment transition hover:bg-neutral-800 hover:text-ember"
                >
                  Plain Text
                </button>
                <button
                  type="button"
                  onClick={() => copySummary("markdown")}
                  className="px-3 py-1.5 text-left text-[11px] font-bold uppercase tracking-wide text-parchment transition hover:bg-neutral-800 hover:text-ember"
                >
                  Markdown
                </button>
                <button
                  type="button"
                  onClick={() => copySummary("json")}
                  className="px-3 py-1.5 text-left text-[11px] font-bold uppercase tracking-wide text-parchment transition hover:bg-neutral-800 hover:text-ember"
                >
                  JSON
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          type="button"
          onClick={() => router.push("/archive")}
          className="rounded-lg border-2 border-neutral-700 bg-neutral-900 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-parchment transition hover:border-ember hover:text-ember"
        >
          📚 Archive
        </button>
        <button
          type="button"
          onClick={() => router.push("/settings")}
          className="rounded-lg border-2 border-neutral-700 bg-neutral-900 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-parchment transition hover:border-ember hover:text-ember"
        >
          ⚙️ Libraries
        </button>
      </div>

      <header className="flex flex-col items-center text-center">
        <img
          src="/npcmc_logo.png"
          alt="Minecraft NPC Generator"
          className="h-24 w-auto"
        />
        <p className="mt-1 text-sm text-neutral-400">
          Roll a character live, lock what chat loves, keep the rest random.
        </p>
      </header>

      {mode === "roll" ? (
        <>
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={rollEntireCharacter}
              disabled={!!revealStatus}
              className="rounded-2xl bg-ember px-8 py-4 text-lg font-black uppercase tracking-widest text-white shadow-lg transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              🎲 Roll Entire Character
            </button>

            <div className="h-6">
              <AnimatePresence mode="wait">
                {revealStatus && (
                  <motion.p
                    key={revealStatus}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="font-display text-sm font-bold uppercase tracking-widest text-parchment"
                  >
                    {revealStatus}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {FIELD_ORDER.map((f) => (
              <RollCard
                key={f.key}
                label={f.label}
                value={character[f.key]}
                options={fieldOptions[f.key]}
                locked={locks[f.key]}
                onToggleLock={() => toggleLock(f.key)}
                onRoll={() => rollSingleField(f.key)}
                spinToken={spinTokens[f.key]}
                disabled={!!revealStatus}
                compact={f.key === "flawName" || f.key === "quest"}
              />
            ))}
          </section>

          <RulesPanel rules={character.rules} />

          <div className="flex flex-wrap justify-center gap-3 pb-6">
            <button
              type="button"
              onClick={() => setMode("edit")}
              disabled={isEmpty}
              className="rounded-xl border-2 border-neutral-700 bg-neutral-900 px-6 py-3 text-sm font-bold uppercase tracking-wide text-parchment transition hover:border-ember hover:text-ember disabled:cursor-not-allowed disabled:opacity-50"
            >
              ✏️ Edit Character
            </button>
            <button
              type="button"
              onClick={saveCharacterToSheet}
              disabled={isEmpty}
              className="rounded-xl border-2 border-neutral-700 bg-neutral-900 px-6 py-3 text-sm font-bold uppercase tracking-wide text-parchment transition hover:border-ember hover:text-ember disabled:cursor-not-allowed disabled:opacity-50"
            >
              {justSaved ? "✅ Saved!" : "💾 Save Character"}
            </button>
            <button
              type="button"
              onClick={clearCharacter}
              disabled={isEmpty}
              className="rounded-xl border-2 border-neutral-700 bg-neutral-900 px-6 py-3 text-sm font-bold uppercase tracking-wide text-parchment transition hover:border-red-400 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              🗑️ Clear
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-6 pb-10">
          <CharacterEditor
            character={character}
            onChange={setCharacter}
            onSave={saveCharacterToSheet}
            onClose={() => setMode("roll")}
            justSaved={justSaved}
          />
        </div>
      )}

      <button
        type="button"
        onClick={() => window.open("/overlay", "_blank", "noopener,noreferrer")}
        className="fixed bottom-4 right-4 rounded-full border-2 border-neutral-700 bg-neutral-900 px-4 py-2 text-xs font-bold uppercase tracking-wide text-parchment shadow-lg transition hover:border-ember hover:text-ember"
      >
        🖥️ Open Overlay
      </button>
    </main>
  );
}
