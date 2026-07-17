"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import classesData from "@/data/classes.json";
import flawsData from "@/data/flaws.json";
import namesData from "@/data/names.json";
import nationalitiesData from "@/data/nationalities.json";
import questsData from "@/data/quests.json";
import racesData from "@/data/races.json";
import {
  addCustomListItem,
  addCustomRuleItem,
  getCustomItems,
  getRemovedDefaults,
  ListCategory,
  removeListItem,
  removeRuleItem,
  RuleCategory,
} from "@/lib/customOptions";
import { RuleItem } from "@/lib/types";

const LIST_CATEGORIES: { key: ListCategory; label: string; defaults: string[] }[] = [
  { key: "names", label: "Names", defaults: namesData },
  { key: "races", label: "Races", defaults: racesData },
  { key: "nationalities", label: "Nationalities", defaults: nationalitiesData },
  { key: "quests", label: "Quests", defaults: questsData },
];

const RULE_CATEGORIES: { key: RuleCategory; label: string; defaults: RuleItem[] }[] = [
  { key: "classes", label: "Classes", defaults: classesData },
  { key: "flaws", label: "Flaws", defaults: flawsData },
];

type TabKey = ListCategory | RuleCategory;

const TABS: { key: TabKey; label: string }[] = [
  { key: "classes", label: "Classes" },
  { key: "flaws", label: "Flaws" },
  { key: "races", label: "Races" },
  { key: "nationalities", label: "Nationalities" },
  { key: "names", label: "Names" },
  { key: "quests", label: "Quests" },
];

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("classes");
  const [refreshToken, setRefreshToken] = useState(0);
  const [newName, setNewName] = useState("");
  const [newRules, setNewRules] = useState("");

  const listCategory = LIST_CATEGORIES.find((c) => c.key === activeTab);
  const ruleCategory = RULE_CATEGORIES.find((c) => c.key === activeTab);

  function selectTab(key: TabKey) {
    setActiveTab(key);
    setNewName("");
    setNewRules("");
  }

  function refresh() {
    setRefreshToken((t) => t + 1);
    setNewName("");
    setNewRules("");
  }

  // Custom/removed options live in localStorage, which isn't available during server
  // rendering. Start empty (matching the server-rendered markup) and fill in via effect
  // after mount, so hydration never sees a client/server mismatch.
  const [listEntries, setListEntries] = useState<
    { name: string; isDefault: boolean }[]
  >([]);
  const [ruleEntries, setRuleEntries] = useState<(RuleItem & { isDefault: boolean })[]>(
    []
  );

  useEffect(() => {
    if (listCategory) {
      const removed = new Set(getRemovedDefaults(listCategory.key));
      const custom = getCustomItems<string>(listCategory.key);
      setListEntries([
        ...listCategory.defaults
          .filter((name) => !removed.has(name))
          .map((name) => ({ name, isDefault: true })),
        ...custom.map((name) => ({ name, isDefault: false })),
      ]);
      setRuleEntries([]);
      return;
    }
    if (ruleCategory) {
      const removed = new Set(getRemovedDefaults(ruleCategory.key));
      const custom = getCustomItems<RuleItem>(ruleCategory.key);
      setRuleEntries([
        ...ruleCategory.defaults
          .filter((item) => !removed.has(item.name))
          .map((item) => ({ ...item, isDefault: true })),
        ...custom.map((item) => ({ ...item, isDefault: false })),
      ]);
      setListEntries([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, refreshToken]);

  function handleAdd() {
    if (listCategory) {
      addCustomListItem(listCategory.key, newName);
      refresh();
      return;
    }
    if (ruleCategory) {
      const rules = newRules
        .split("\n")
        .map((r) => r.trim())
        .filter(Boolean);
      addCustomRuleItem(ruleCategory.key, { name: newName, rules });
      refresh();
    }
  }

  function handleDelete(name: string) {
    if (listCategory) {
      removeListItem(listCategory.key, listCategory.defaults, name);
      refresh();
      return;
    }
    if (ruleCategory) {
      removeRuleItem(ruleCategory.key, ruleCategory.defaults, name);
      refresh();
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 bg-neutral-950 px-6 py-10">
      <header className="flex flex-col items-center gap-2 text-center">
        <h1 className="font-display text-3xl font-extrabold uppercase tracking-wide text-parchment">
          NPC Libraries
        </h1>
        <p className="text-sm text-neutral-400">
          Expand the pool of races, classes, flaws, and more used by the roller.
        </p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mt-2 rounded-xl border-2 border-neutral-700 bg-neutral-900 px-6 py-3 text-sm font-bold uppercase tracking-wide text-parchment transition hover:border-ember hover:text-ember"
        >
          ← Back to Generator
        </button>
      </header>

      <div className="flex flex-wrap justify-center gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => selectTab(tab.key)}
            className={`rounded-lg border-2 px-4 py-2 text-xs font-bold uppercase tracking-wide transition ${
              activeTab === tab.key
                ? "border-ember text-ember"
                : "border-neutral-700 text-parchment hover:border-ember hover:text-ember"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <section className="rounded-2xl border-2 border-ember/60 bg-neutral-950/80 p-6 shadow-lg">
        <div className="flex flex-col gap-3 border-b border-neutral-800 pb-5">
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
            Add New
          </span>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={
              ruleCategory ? "e.g. Dragon Accountant" : "e.g. Clockwork Goblin"
            }
            className="w-full rounded-xl border-2 border-neutral-700 bg-neutral-900 px-3 py-2 text-parchment placeholder:text-neutral-600 focus:border-ember focus:outline-none"
          />
          {ruleCategory && (
            <textarea
              value={newRules}
              onChange={(e) => setNewRules(e.target.value)}
              rows={3}
              placeholder={
                "One rule per line, e.g.\nCannot resist cheese\nHide cheese in every chest you find"
              }
              className="w-full rounded-xl border-2 border-neutral-700 bg-neutral-900 px-3 py-2 text-parchment placeholder:text-neutral-600 focus:border-ember focus:outline-none"
            />
          )}
          <button
            type="button"
            onClick={handleAdd}
            disabled={!newName.trim()}
            className="self-start rounded-xl bg-ember/90 px-5 py-2 text-sm font-black uppercase tracking-wide text-white transition hover:bg-ember disabled:cursor-not-allowed disabled:opacity-50"
          >
            + Add
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {listCategory && listEntries.length === 0 && (
            <p className="text-center text-sm font-bold uppercase tracking-widest text-neutral-500">
              Nothing here yet.
            </p>
          )}

          {listCategory &&
            listEntries.map((entry) => (
              <div
                key={entry.name}
                className="flex items-center justify-between rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2"
              >
                <span className="text-parchment">{entry.name}</span>
                <div className="flex items-center gap-2">
                  {entry.isDefault && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                      Default
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(entry.name)}
                    className="rounded-md border border-neutral-700 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-parchment transition hover:border-red-400 hover:text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

          {ruleCategory && ruleEntries.length === 0 && (
            <p className="text-center text-sm font-bold uppercase tracking-widest text-neutral-500">
              Nothing here yet.
            </p>
          )}

          {ruleCategory &&
            ruleEntries.map((entry) => (
              <div
                key={entry.name}
                className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-parchment">
                    {entry.name}
                  </span>
                  <div className="flex items-center gap-2">
                    {entry.isDefault && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                        Default
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(entry.name)}
                      className="rounded-md border border-neutral-700 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-parchment transition hover:border-red-400 hover:text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {entry.rules.length > 0 && (
                  <ul className="mt-2 list-disc pl-5 text-sm text-neutral-400">
                    {entry.rules.map((rule, i) => (
                      <li key={i}>{rule}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
        </div>
      </section>
    </main>
  );
}
