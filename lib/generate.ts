import namesData from "@/data/names.json";
import racesData from "@/data/races.json";
import nationalitiesData from "@/data/nationalities.json";
import classesData from "@/data/classes.json";
import flawsData from "@/data/flaws.json";
import questsData from "@/data/quests.json";
import { resolveList, resolveRules } from "./customOptions";
import { Character, FieldKey, RuleItem } from "./types";

const defaultNames: string[] = namesData;
const defaultRaces: string[] = racesData;
const defaultNationalities: string[] = nationalitiesData;
const defaultClasses: RuleItem[] = classesData;
const defaultFlaws: RuleItem[] = flawsData;
const defaultQuests: string[] = questsData;

export function getClasses(): RuleItem[] {
  return resolveRules("classes", defaultClasses);
}

export function getFlaws(): RuleItem[] {
  return resolveRules("flaws", defaultFlaws);
}

/** Current option pools per field, including any custom additions and minus any removed defaults. */
export function getFieldOptions(): Record<FieldKey, string[]> {
  const classes = getClasses();
  const flaws = getFlaws();
  return {
    name: resolveList("names", defaultNames),
    race: resolveList("races", defaultRaces),
    nationality: resolveList("nationalities", defaultNationalities),
    className: classes.map((c) => c.name),
    flawName: flaws.map((f) => f.name),
    quest: resolveList("quests", defaultQuests),
  };
}

export function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function rollField(field: FieldKey): string {
  return randomItem(getFieldOptions()[field]);
}

export function rulesFor(className: string, flawName: string): string[] {
  const classRules = getClasses().find((c) => c.name === className)?.rules ?? [];
  const flawRules = getFlaws().find((f) => f.name === flawName)?.rules ?? [];
  return [...classRules, ...flawRules];
}

export const emptyCharacter: Character = {
  name: "",
  race: "",
  nationality: "",
  className: "",
  flawName: "",
  quest: "",
  rules: [],
};

export function generateCharacter(): Character {
  const className = rollField("className");
  const flawName = rollField("flawName");
  return {
    name: rollField("name"),
    race: rollField("race"),
    nationality: rollField("nationality"),
    className,
    flawName,
    quest: rollField("quest"),
    rules: rulesFor(className, flawName),
  };
}
