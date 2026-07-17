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
  if (character.currentGoal) lines.push("", "Current Goal:", character.currentGoal);
  if (character.gender) lines.push("", "Gender:", character.gender);
  if (character.location) lines.push("", "Location:", character.location);
  if (character.lore) lines.push("", "Lore:", character.lore);
  if (character.notes) lines.push("", "Notes:", character.notes);
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
  if (character.currentGoal)
    lines.push("", `**Current Goal:** ${character.currentGoal}`);
  if (character.gender) lines.push("", `**Gender:** ${character.gender}`);
  if (character.location) lines.push("", `**Location:** ${character.location}`);
  if (character.lore) lines.push("", `**Lore:** ${character.lore}`);
  if (character.notes) lines.push("", `**Notes:** ${character.notes}`);
  return lines.join("\n");
}

export function characterSummaryJson(character: Character): string {
  const {
    name,
    race,
    nationality,
    className,
    flawName,
    quest,
    rules,
    gender,
    location,
    lore,
    notes,
    currentGoal,
  } = character;
  const data: Record<string, unknown> = {
    name,
    race,
    nationality,
    className,
    flawName,
    quest,
    rules,
  };
  if (gender) data.gender = gender;
  if (location) data.location = location;
  if (lore) data.lore = lore;
  if (notes) data.notes = notes;
  if (currentGoal) data.currentGoal = currentGoal;
  return JSON.stringify(data, null, 2);
}

/** Parses the JSON produced by `characterSummaryJson`. Throws if the shape doesn't match. */
export function parseCharacterJson(input: string): Character {
  let data: unknown;
  try {
    data = JSON.parse(input);
  } catch {
    throw new Error("That isn't valid JSON.");
  }

  if (typeof data !== "object" || data === null) {
    throw new Error("Character JSON must be an object.");
  }

  const {
    name,
    race,
    nationality,
    className,
    flawName,
    quest,
    rules,
    gender,
    location,
    lore,
    notes,
    currentGoal,
  } = data as Record<string, unknown>;

  const isStringField = (value: unknown): value is string =>
    typeof value === "string";
  const optionalString = (value: unknown): string | undefined =>
    isStringField(value) ? value : undefined;

  if (
    !isStringField(name) ||
    !isStringField(race) ||
    !isStringField(nationality) ||
    !isStringField(className) ||
    !isStringField(flawName) ||
    !isStringField(quest) ||
    !Array.isArray(rules) ||
    !rules.every(isStringField)
  ) {
    throw new Error(
      "Missing or invalid fields — expected name, race, nationality, className, flawName, quest, rules."
    );
  }

  return {
    name,
    race,
    nationality,
    className,
    flawName,
    quest,
    rules,
    gender: optionalString(gender),
    location: optionalString(location),
    lore: optionalString(lore),
    notes: optionalString(notes),
    currentGoal: optionalString(currentGoal),
  };
}
