import { RuleItem } from "./types";

export type ListCategory = "names" | "races" | "nationalities" | "quests";
export type RuleCategory = "classes" | "flaws";
export type Category = ListCategory | RuleCategory;

const CUSTOM_PREFIX = "mc-npcgen-custom-";
const REMOVED_PREFIX = "mc-npcgen-removed-";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

/** User-added options for a category, stored separately from the shipped defaults. */
export function getCustomItems<T>(category: Category): T[] {
  return readJson<T[]>(`${CUSTOM_PREFIX}${category}`, []);
}

function setCustomItems<T>(category: Category, items: T[]) {
  writeJson(`${CUSTOM_PREFIX}${category}`, items);
}

/** Default option names/values the user has chosen to hide for a category. */
export function getRemovedDefaults(category: Category): string[] {
  return readJson<string[]>(`${REMOVED_PREFIX}${category}`, []);
}

function setRemovedDefaults(category: Category, names: string[]) {
  writeJson(`${REMOVED_PREFIX}${category}`, names);
}

export function addCustomListItem(category: ListCategory, value: string) {
  const trimmed = value.trim();
  if (!trimmed) return;
  const items = getCustomItems<string>(category);
  if (items.includes(trimmed)) return;
  setCustomItems(category, [...items, trimmed]);
}

/** Removes an option: hides it if it's a default, deletes it if it's a custom addition. */
export function removeListItem(
  category: ListCategory,
  defaults: string[],
  value: string
) {
  if (defaults.includes(value)) {
    const removed = getRemovedDefaults(category);
    if (!removed.includes(value)) setRemovedDefaults(category, [...removed, value]);
  } else {
    setCustomItems(
      category,
      getCustomItems<string>(category).filter((v) => v !== value)
    );
  }
}

export function resolveList(category: ListCategory, defaults: string[]): string[] {
  const removed = new Set(getRemovedDefaults(category));
  const custom = getCustomItems<string>(category);
  return [...defaults.filter((v) => !removed.has(v)), ...custom];
}

export function addCustomRuleItem(category: RuleCategory, item: RuleItem) {
  const name = item.name.trim();
  if (!name) return;
  const items = getCustomItems<RuleItem>(category);
  if (items.some((i) => i.name === name)) return;
  setCustomItems(category, [
    ...items,
    { name, rules: item.rules.map((r) => r.trim()).filter(Boolean) },
  ]);
}

export function removeRuleItem(
  category: RuleCategory,
  defaults: RuleItem[],
  name: string
) {
  if (defaults.some((d) => d.name === name)) {
    const removed = getRemovedDefaults(category);
    if (!removed.includes(name)) setRemovedDefaults(category, [...removed, name]);
  } else {
    setCustomItems(
      category,
      getCustomItems<RuleItem>(category).filter((i) => i.name !== name)
    );
  }
}

export function resolveRules(category: RuleCategory, defaults: RuleItem[]): RuleItem[] {
  const removed = new Set(getRemovedDefaults(category));
  const custom = getCustomItems<RuleItem>(category);
  return [...defaults.filter((d) => !removed.has(d.name)), ...custom];
}
