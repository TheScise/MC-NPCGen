"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Character } from "@/lib/types";

interface CharacterSheetProps {
  character: Character;
}

export function CharacterSheet({ character }: CharacterSheetProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative w-[420px] rounded-3xl border-2 border-ember/60 bg-neutral-950/80 p-6 shadow-2xl backdrop-blur-sm"
    >
      <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/4">
        <Image
          src="/npcmc_logo.png"
          alt="NPC MC logo"
          width={110}
          height={61}
          className="drop-shadow-lg"
          priority
        />
      </div>

      <h1 className="mt-10 font-display text-4xl font-extrabold uppercase tracking-wide text-parchment">
        {character.name || "—"}
      </h1>

      <div className="mt-2 flex flex-wrap gap-x-4 text-lg text-ember">
        <span>{character.race || "—"}</span>
        <span className="text-neutral-500">•</span>
        <span>{character.nationality || "—"}</span>
      </div>

      <div className="mt-4 text-xl font-bold uppercase tracking-wide text-parchment">
        {character.className || "—"}
      </div>

      <div className="mt-4">
        <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
          Flaw
        </span>
        <p className="text-lg text-parchment">{character.flawName || "—"}</p>
      </div>

      <div className="mt-4">
        <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
          Quest
        </span>
        <p className="text-lg text-parchment">{character.quest || "—"}</p>
      </div>

      <div className="mt-4">
        <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
          Current Goal
        </span>
        <p className="text-lg text-parchment">
          {character.currentGoal || "—"}
        </p>
      </div>

      <div className="mt-4">
        <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
          Rules
        </span>
        <ul className="mt-1 min-h-[1.5rem] space-y-1">
          {character.rules.length > 0 ? (
            character.rules.map((rule, index) => (
              <li key={`${rule}-${index}`} className="text-base text-parchment">
                • {rule}
              </li>
            ))
          ) : (
            <li className="text-base text-neutral-600">—</li>
          )}
        </ul>
      </div>
    </motion.div>
  );
}
