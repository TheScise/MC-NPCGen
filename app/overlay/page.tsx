"use client";

import { AnimatePresence } from "framer-motion";
import { CharacterSheet } from "@/components/CharacterSheet";
import { useSyncedCharacter } from "@/lib/storage";

export default function OverlayPage() {
  const character = useSyncedCharacter();

  return (
    <main className="flex min-h-screen items-center justify-center bg-transparent p-8">
      <AnimatePresence mode="wait">
        {character && <CharacterSheet character={character} />}
      </AnimatePresence>
    </main>
  );
}
