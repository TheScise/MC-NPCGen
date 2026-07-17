"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { getFieldOptions } from "@/lib/generate";
import { Character } from "@/lib/types";
import { SpinField, SPIN_DURATION_MS } from "./SpinField";

const RULES_REVEAL_DELAY_MS = SPIN_DURATION_MS + 300;

interface CharacterSheetProps {
  character: Character;
}

export function CharacterSheet({ character }: CharacterSheetProps) {
  const fieldOptions = getFieldOptions();
  const [displayRules, setDisplayRules] = useState(character.rules);
  const rulesKey = JSON.stringify(character.rules);
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    setDisplayRules([]);
    const timeout = setTimeout(() => {
      setDisplayRules(character.rules);
    }, RULES_REVEAL_DELAY_MS);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rulesKey]);

  return (
    <motion.div
      layout
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
        <SpinField value={character.name} options={fieldOptions.name} />
      </h1>

      <div className="mt-2 flex flex-wrap gap-x-4 text-lg text-ember">
        <SpinField value={character.race} options={fieldOptions.race} />
        <span className="text-neutral-500">•</span>
        <SpinField
          value={character.nationality}
          options={fieldOptions.nationality}
        />
      </div>

      <div className="mt-4 text-xl font-bold uppercase tracking-wide text-parchment">
        <SpinField
          value={character.className}
          options={fieldOptions.className}
        />
      </div>

      <div className="mt-4">
        <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
          Flaw
        </span>
        <p className="text-lg text-parchment">
          <SpinField
            value={character.flawName}
            options={fieldOptions.flawName}
          />
        </p>
      </div>

      <div className="mt-4">
        <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
          Quest
        </span>
        <p className="text-lg text-parchment">
          <SpinField value={character.quest} options={fieldOptions.quest} />
        </p>
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
        <ul className="relative mt-1 min-h-[8rem] space-y-1">
          <AnimatePresence mode="popLayout">
            {displayRules.length > 0 ? (
              displayRules.map((rule, index) => (
                <motion.li
                  key={`${rule}-${index}`}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.08 }}
                  className="text-base text-parchment"
                >
                  • {rule}
                </motion.li>
              ))
            ) : (
              <motion.li
                key="no-rules"
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-base text-neutral-600"
              >
                —
              </motion.li>
            )}
          </AnimatePresence>
        </ul>
      </div>
    </motion.div>
  );
}
