"use client";

import { Character } from "@/lib/types";

interface CharacterEditorProps {
  character: Character;
  onChange: (character: Character) => void;
  onSave: () => void;
  onClose: () => void;
  justSaved?: boolean;
}

const CORE_FIELDS: { key: keyof Character; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "race", label: "Race" },
  { key: "nationality", label: "Nationality" },
  { key: "className", label: "Class" },
  { key: "flawName", label: "Flaw" },
  { key: "quest", label: "Quest" },
];

const OPTIONAL_FIELDS: { key: keyof Character; label: string }[] = [
  { key: "gender", label: "Gender" },
  { key: "location", label: "Location" },
];

function textValue(character: Character, key: keyof Character): string {
  const value = character[key];
  return typeof value === "string" ? value : "";
}

export function CharacterEditor({
  character,
  onChange,
  onSave,
  onClose,
  justSaved,
}: CharacterEditorProps) {
  function setField(key: keyof Character, value: string) {
    onChange({ ...character, [key]: value } as Character);
  }

  return (
    <div className="rounded-3xl border-2 border-ember/60 bg-neutral-950/80 p-6 shadow-2xl">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-2xl font-black uppercase tracking-widest text-ember">
          Character Sheet
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-sm font-bold uppercase tracking-wide text-neutral-400 transition hover:text-parchment"
        >
          Back to Rolling
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CORE_FIELDS.map((f) => (
          <label key={f.key} className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-neutral-400">
              {f.label}
            </span>
            <input
              type="text"
              value={textValue(character, f.key)}
              onChange={(e) => setField(f.key, e.target.value)}
              className="w-full rounded-xl border-2 border-neutral-700 bg-neutral-900 px-3 py-2 font-display font-bold text-parchment focus:border-ember focus:outline-none"
            />
          </label>
        ))}
        {OPTIONAL_FIELDS.map((f) => (
          <label key={f.key} className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-neutral-400">
              {f.label}
            </span>
            <input
              type="text"
              value={textValue(character, f.key)}
              onChange={(e) => setField(f.key, e.target.value)}
              placeholder="Optional"
              className="w-full rounded-xl border-2 border-neutral-700 bg-neutral-900 px-3 py-2 text-parchment placeholder:text-neutral-600 focus:border-ember focus:outline-none"
            />
          </label>
        ))}
      </div>

      <label className="mt-4 block">
        <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-neutral-400">
          Lore
        </span>
        <textarea
          value={textValue(character, "lore")}
          onChange={(e) => setField("lore", e.target.value)}
          rows={3}
          placeholder="Backstory, personality, secrets..."
          className="w-full rounded-xl border-2 border-neutral-700 bg-neutral-900 px-3 py-2 text-parchment placeholder:text-neutral-600 focus:border-ember focus:outline-none"
        />
      </label>

      <label className="mt-4 block">
        <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-neutral-400">
          Notes
        </span>
        <textarea
          value={textValue(character, "notes")}
          onChange={(e) => setField("notes", e.target.value)}
          rows={2}
          placeholder="Stream notes, reminders..."
          className="w-full rounded-xl border-2 border-neutral-700 bg-neutral-900 px-3 py-2 text-parchment placeholder:text-neutral-600 focus:border-ember focus:outline-none"
        />
      </label>

      <button
        type="button"
        onClick={onSave}
        className="mt-5 w-full rounded-xl bg-ember/90 px-4 py-3 text-sm font-black uppercase tracking-widest text-white transition hover:bg-ember"
      >
        {justSaved ? "✅ Saved!" : "💾 Save Character"}
      </button>
    </div>
  );
}
