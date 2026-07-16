"use client";

import { motion } from "framer-motion";

interface RulesPanelProps {
  rules: string[];
}

export function RulesPanel({ rules }: RulesPanelProps) {
  if (rules.length === 0) return null;

  return (
    <div className="rounded-2xl border-2 border-neutral-700 bg-neutral-900/80 p-5">
      <span className="mb-3 block text-xs font-bold uppercase tracking-widest text-neutral-400">
        Gameplay Rules
      </span>
      <ul className="space-y-2">
        {rules.map((rule, index) => (
          <motion.li
            key={`${rule}-${index}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="text-lg text-parchment"
          >
            • {rule}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
