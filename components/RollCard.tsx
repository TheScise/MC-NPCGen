"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface RollCardProps {
  label: string;
  value: string;
  options: string[];
  locked: boolean;
  onToggleLock: () => void;
  onRoll: () => void;
  spinToken: number;
  disabled?: boolean;
  compact?: boolean;
}

export const SPIN_DURATION_MS = 900;
const SPIN_INTERVAL_MS = 70;

export function RollCard({
  label,
  value,
  options,
  locked,
  onToggleLock,
  onRoll,
  spinToken,
  disabled,
  compact,
}: RollCardProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isSpinning, setIsSpinning] = useState(false);
  const previousToken = useRef(spinToken);

  useEffect(() => {
    if (spinToken === previousToken.current) return;
    previousToken.current = spinToken;

    setIsSpinning(true);
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      if (elapsed >= SPIN_DURATION_MS) {
        clearInterval(interval);
        setDisplayValue(value);
        setIsSpinning(false);
        return;
      }
      const pool = options.length > 0 ? options : [value];
      setDisplayValue(pool[Math.floor(Math.random() * pool.length)]);
    }, SPIN_INTERVAL_MS);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinToken]);

  useEffect(() => {
    if (!isSpinning) {
      setDisplayValue(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <motion.div
      layout
      className={`relative rounded-2xl border-2 p-5 shadow-lg transition-colors ${
        locked
          ? "border-ember bg-ember/10"
          : "border-neutral-700 bg-neutral-900/80"
      }`}
      animate={isSpinning ? { scale: [1, 1.02, 1] } : { scale: 1 }}
      transition={{ duration: 0.4, repeat: isSpinning ? Infinity : 0 }}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
          {label}
        </span>
        <button
          type="button"
          onClick={onToggleLock}
          aria-label={locked ? "Unlock field" : "Lock field"}
          className="text-xl leading-none transition-transform hover:scale-110"
        >
          {locked ? "🔒" : "🔓"}
        </button>
      </div>

      <div className="mb-4 flex min-h-[2.75rem] items-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={displayValue}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.15 }}
            className={`font-display font-extrabold uppercase leading-tight tracking-wide ${
              compact ? "text-lg" : "text-2xl"
            } ${displayValue ? "text-parchment" : "text-neutral-600"}`}
          >
            {displayValue || "—"}
          </motion.span>
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={onRoll}
        disabled={locked || disabled}
        className="w-full rounded-xl bg-ember/90 px-4 py-2 text-sm font-bold uppercase tracking-wide text-neutral-900 transition hover:bg-ember disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400"
      >
        🎲 Roll
      </button>
    </motion.div>
  );
}
