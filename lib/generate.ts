import namesData from "@/data/names.json";
import racesData from "@/data/races.json";
import nationalitiesData from "@/data/nationalities.json";
import classesData from "@/data/classes.json";
import flawsData from "@/data/flaws.json";
import questsData from "@/data/quests.json";
import { Character, FieldKey, RuleItem } from "./types";

export const names: string[] = namesData;
export const races: string[] = racesData;
export const nationalities: string[] = nationalitiesData;
export const classes: RuleItem[] = classesData;
export const flaws: RuleItem[] = flawsData;
export const quests: string[] = questsData;

export const fieldOptions: Record<FieldKey, string[]> = {
  name: names,
  race: races,
  nationality: nationalities,
  className: classes.map((c) => c.name),
  flawName: flaws.map((f) => f.name),
  quest: quests,
};

export function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function rollField(field: FieldKey): string {
  return randomItem(fieldOptions[field]);
}

export function rulesFor(className: string, flawName: string): string[] {
  const classRules = classes.find((c) => c.name === className)?.rules ?? [];
  const flawRules = flaws.find((f) => f.name === flawName)?.rules ?? [];
  return [...classRules, ...flawRules];
}

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
