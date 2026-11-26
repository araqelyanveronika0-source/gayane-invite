"use client";

import { useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

/**
 * Երաժշտությունը երբեք ավտոմատ չի միանում։
 * Տեղադրեք Ձեր instrumental ֆայլը՝ public/music/invitation.mp3
 */
export default function MusicToggle() {
  const ref = useRef<HTMLAudioElement>(null);
  const [on, setOn] = useState(false);
  const [missing, setMissing] = useState(false);

  async function toggle() {
    const a = ref.current;
    if (!a) return;
    if (typeof navigator !== "undefined") navigator.vibrate?.(15);
    if (on) {
      a.pause();
      setOn(false);
      return;
    }
    try {
      await a.play();
      setOn(true);
    } catch {
      setMissing(true);
    }
  }

  return (
    <>
      <audio ref={ref} src=/invitation.mp3" loop preload="none" onError={() => setMissing(true)} />
      <button
        type="button"
        onClick={toggle}
        aria-pressed={on}
        aria-label={on ? "Անջատել երաժշտությունը" : "Միացնել երաժշտությունը"}
        className="glass fixed right-4 top-4 z-40 flex items-center gap-2 rounded-full px-4 py-2.5 text-sm text-brown shadow-soft transition active:scale-95"
      >
        {on ? <Volume2 size={18} className="text-gold" /> : <VolumeX size={18} className="text-gold" />}
        <span>{missing ? "Երաժշտություն չկա" : on ? "Sound On" : "Sound Off"}</span>
      </button>
    </>
  );
}
