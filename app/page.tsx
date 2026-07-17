"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { CharacterEditor } from "@/components/CharacterEditor";
import { RollCard, SPIN_DURATION_MS } from "@/components/RollCard";
import { RulesPanel } from "@/components/RulesPanel";
import { SavedCharacters } from "@/components/SavedCharacters";
import {
  emptyCharacter,
  fieldOptions,
  rollField,
  rulesFor,
} from "@/lib/generate";
import { characterSummary } from "@/lib/summary";
import {
  defaultLocks,
  deleteCharacter,
  getCharacters,
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
  const [copyLabel, setCopyLabel] = useState("Copy Character Summary");
  const [mode, setMode] = useState<"roll" | "edit">("roll");
  const [savedCharacters, setSavedCharacters] = useState<Character[]>([]);
  const [justSaved, setJustSaved] = useState(false);
  const [savedAsName, setSavedAsName] = useState<string | null>(null);

  useEffect(() => {
    setLocks(loadLocks());
    setSavedCharacters(getCharacters());
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
    setCharacter(updated);

    unlockedFields.forEach((f, index) => {
      setTimeout(() => {
        setSpinTokens((prev) => ({ ...prev, [f.key]: prev[f.key] + 1 }));
        setRevealStatus(`${f.label}: ${updated[f.key]}`);
      }, index * STAGGER_MS);
    });

    const totalDelay = unlockedFields.length * STAGGER_MS + SPIN_DURATION_MS;
    setTimeout(() => setRevealStatus("Character Complete!"), totalDelay);
    setTimeout(() => setRevealStatus(null), totalDelay + 1600);
  }

  async function copySummary() {
    if (!character) return;
    await navigator.clipboard.writeText(characterSummary(character));
    setCopyLabel("Copied!");
    setTimeout(() => setCopyLabel("Copy Character Summary"), 1500);
  }

  function clearCharacter() {
    setRevealStatus(null);
    setLocks(defaultLocks);
    setCharacter(emptyCharacter);
    setSavedAsName(null);
  }

  function saveCharacterToSheet() {
    if (!character) return;
    const isSameCharacter = !!character.id && character.name === savedAsName;
    const saved = isSameCharacter
      ? updateCharacter(character.id!, character) ?? saveCharacterToArchive({ ...character, id: undefined })
      : saveCharacterToArchive({ ...character, id: undefined });
    setCharacter(saved);
    setSavedAsName(saved.name);
    setSavedCharacters(getCharacters());
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1500);
  }

  function loadSavedCharacter(saved: Character) {
    setCharacter(saved);
    setSavedAsName(saved.name);
    setMode("edit");
  }

  function deleteSavedCharacter(id: string) {
    deleteCharacter(id);
    setSavedCharacters(getCharacters());
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

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 bg-neutral-950 px-6 py-10">
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
              className="rounded-2xl bg-ember px-8 py-4 text-lg font-black uppercase tracking-widest text-neutral-900 shadow-lg transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
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
              onClick={copySummary}
              disabled={isEmpty}
              className="rounded-xl border-2 border-neutral-700 bg-neutral-900 px-6 py-3 text-sm font-bold uppercase tracking-wide text-parchment transition hover:border-ember hover:text-ember disabled:cursor-not-allowed disabled:opacity-50"
            >
              📋 {copyLabel}
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
          <SavedCharacters
            characters={savedCharacters}
            onLoad={loadSavedCharacter}
            onDelete={deleteSavedCharacter}
          />
        </div>
      )}
    </main>
  );
}
