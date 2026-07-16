import { Character } from "./types";

export function characterSummary(character: Character): string {
  const lines = [
    character.name.toUpperCase(),
    "",
    "Race:",
    character.race,
    "",
    "Nationality:",
    character.nationality,
    "",
    "Class:",
    character.className,
    "",
    "Flaw:",
    character.flawName,
    "",
    "Quest:",
    character.quest,
    "",
    "Rules:",
    ...character.rules.map((rule) => `- ${rule}`),
  ];
  return lines.join("\n");
}
