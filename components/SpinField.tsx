"use client";

import { useEffect, useRef, useState } from "react";

export const SPIN_DURATION_MS = 1000;
const SPIN_INTERVAL_MS = 70;

interface SpinFieldProps {
  value: string;
  options: string[];
  className?: string;
}

/** Cycles through random options before settling on the real value whenever it changes. */
export function SpinField({ value, options, className }: SpinFieldProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);

  useEffect(() => {
    if (value === previousValue.current) return;
    previousValue.current = value;

    if (!value) {
      setDisplayValue(value);
      return;
    }

    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      if (elapsed >= SPIN_DURATION_MS) {
        clearInterval(interval);
        setDisplayValue(value);
        return;
      }
      const pool = options.length > 0 ? options : [value];
      setDisplayValue(pool[Math.floor(Math.random() * pool.length)]);
    }, SPIN_INTERVAL_MS);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <span className={className}>{displayValue || "—"}</span>;
}
