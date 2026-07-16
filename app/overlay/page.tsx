"use client";

import { useEffect } from "react";
import { CharacterSheet } from "@/components/CharacterSheet";
import { emptyCharacter } from "@/lib/generate";
import { useSyncedCharacter } from "@/lib/storage";

export default function OverlayPage() {
  const character = useSyncedCharacter() ?? emptyCharacter;

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
      <CharacterSheet character={character} />
    </main>
  );
}
