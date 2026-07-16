"use client";

import { motion } from "framer-motion";
import { Character } from "@/lib/types";

interface CharacterSheetProps {
  character: Character;
}

export function CharacterSheet({ character }: CharacterSheetProps) {
  return (
    <motion.div
      key={character.name + character.race + character.className}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-[420px] rounded-3xl border-2 border-ember/60 bg-neutral-950/80 p-6 shadow-2xl backdrop-blur-sm"
    >
      <h1 className="font-display text-4xl font-extrabold uppercase tracking-wide text-parchment">
        {character.name}
      </h1>

      <div className="mt-2 flex flex-wrap gap-x-4 text-lg text-ember">
        <span>{character.race}</span>
        <span className="text-neutral-500">•</span>
        <span>{character.nationality}</span>
      </div>

      <div className="mt-4 text-xl font-bold uppercase tracking-wide text-parchment">
        {character.className}
      </div>

      <div className="mt-4">
        <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
          Flaw
        </span>
        <p className="text-lg text-parchment">{character.flawName}</p>
      </div>

      <div className="mt-4">
        <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
          Quest
        </span>
        <p className="text-lg text-parchment">{character.quest}</p>
      </div>

      {character.rules.length > 0 && (
        <div className="mt-4">
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
            Rules
          </span>
          <ul className="mt-1 space-y-1">
            {character.rules.map((rule, index) => (
              <li key={`${rule}-${index}`} className="text-base text-parchment">
                • {rule}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}
