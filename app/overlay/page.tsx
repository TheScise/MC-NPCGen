"use client";

import { AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { CharacterSheet } from "@/components/CharacterSheet";
import { useSyncedCharacter } from "@/lib/storage";

export default function OverlayPage() {
  const character = useSyncedCharacter();

  useEffect(() => {
    document.documentElement.classList.add("overlay-transparent");
    document.body.classList.add("overlay-transparent");
    return () => {
      document.documentElement.classList.remove("overlay-transparent");
      document.body.classList.remove("overlay-transparent");
    };
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-transparent p-8">
      <AnimatePresence mode="wait">
        {character && character.name && <CharacterSheet character={character} />}
      </AnimatePresence>
    </main>
  );
}
