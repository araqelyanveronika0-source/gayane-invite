"use client";

import { useEffect, useState } from "react";

export default function Countdown({ date, time }: { date: string; time: string }) {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    // Երևանի ժամանակով (UTC+4)
    const target = new Date(`${date}T${time}:00+04:00`).getTime();
    const tick = () => setLeft(target - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [date, time]);

  if (left === null) return <div className="h-24" />;
  if (left <= 0) {
    return <p className="text-center font-serif text-xl gold-text">Տոնը սկսվել է ❤️</p>;
  }

  const s = Math.floor(left / 1000);
  const items = [
    { v: Math.floor(s / 86400), l: "օր" },
    { v: Math.floor((s % 86400) / 3600), l: "ժամ" },
    { v: Math.floor((s % 3600) / 60), l: "րոպե" },
    { v: s % 60, l: "վրկ" },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3" role="timer" aria-label="Հետհաշվարկ մինչև միջոցառումը">
      {items.map((i) => (
        <div key={i.l} className="glass rounded-2xl py-3 text-center shadow-soft">
          <div className="font-serif text-2xl tabular-nums text-brown sm:text-3xl">{String(i.v).padStart(2, "0")}</div>
          <div className="mt-0.5 text-xs text-gold">{i.l}</div>
        </div>
      ))}
    </div>
  );
}
