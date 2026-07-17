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

export function characterSummaryMarkdown(character: Character): string {
  const lines = [
    `# ${character.name || "Unnamed"}`,
    "",
    `**Race:** ${character.race}`,
    "",
    `**Nationality:** ${character.nationality}`,
    "",
    `**Class:** ${character.className}`,
    "",
    `**Flaw:** ${character.flawName}`,
    "",
    `**Quest:** ${character.quest}`,
    "",
    "**Rules:**",
    ...character.rules.map((rule) => `- ${rule}`),
  ];
  return lines.join("\n");
}

export function characterSummaryJson(character: Character): string {
  const { name, race, nationality, className, flawName, quest, rules } =
    character;
  return JSON.stringify(
    { name, race, nationality, className, flawName, quest, rules },
    null,
    2
  );
}
