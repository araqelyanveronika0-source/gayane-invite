"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bloom, Leaf } from "./Flowers";

export default function Envelope({ onOpened, guestName }: { onOpened: () => void; guestName?: string }) {
  const [open, setOpen] = useState(false);

  function handleOpen() {
    if (open) return;
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(25);
    setOpen(true);
    window.setTimeout(onOpened, 2300);
  }

  return (
    <motion.div
      className="fixed inset-0 z-30 flex flex-col items-center justify-center overflow-hidden px-6"
      style={{ background: "radial-gradient(ellipse at 50% 30%, #FFF9F2 0%, #F5E6D0 100%)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.8 }}
    >
      <Bloom className="absolute -left-10 -top-10 h-48 w-48 opacity-70" />
      <Bloom className="absolute -bottom-12 -right-10 h-56 w-56 opacity-70" tone="#E6BDB6" />
      <Leaf className="absolute left-24 top-6 h-24 w-12 rotate-12" />
      <Leaf className="absolute bottom-8 right-28 h-24 w-12 -rotate-[160deg]" />

      {guestName ? (
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6 text-center font-serif text-lg text-brown"
        >
          Հարգելի՛ {guestName}
        </motion.p>
      ) : null}

      <div className="relative w-[min(86vw,360px)]" style={{ perspective: 1000 }}>
        <div className="relative aspect-[4/3] w-full">
          {/* Ծրարի ետևի մաս */}
          <div className="absolute inset-0 rounded-md bg-[#E8D5B5] shadow-soft" />

          {/* Թուղթ (դուրս է գալիս) */}
          <motion.div
            className="gold-frame absolute left-[6%] right-[6%] top-[8%] flex h-[84%] items-center justify-center rounded-sm bg-ivory"
            animate={open ? { y: "-62%" } : { y: 0 }}
            transition={{ delay: 0.9, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="gold-text font-serif text-5xl">51</span>
          </motion.div>

          {/* Առջևի ծալքեր */}
          <div
            className="absolute inset-0 rounded-md"
            style={{
              background: "linear-gradient(135deg,#F2E3C8,#E8D5B5)",
              clipPath: "polygon(0 0, 50% 58%, 100% 0, 100% 100%, 0 100%)",
              boxShadow: "inset 0 0 0 1px rgba(184,148,86,.25)",
            }}
          />
          <div
            className="absolute inset-0 rounded-md"
            style={{
              background: "linear-gradient(200deg,#EBD9B8,#E0C9A2)",
              clipPath: "polygon(0 100%, 55% 52%, 100% 100%)",
            }}
          />

          {/* Կափարիչ */}
          <motion.div
            className="absolute inset-x-0 top-0 h-[58%] origin-top"
            style={{
              background: "linear-gradient(180deg,#F5E6D0,#E8D5B5)",
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              transformStyle: "preserve-3d",
              zIndex: open ? 0 : 5,
            }}
            animate={open ? { rotateX: 180 } : { rotateX: 0 }}
            transition={{ duration: 0.9, ease: "easeInOut" }}
          />

          {/* Ոսկե կնիք */}
          <motion.button
            type="button"
            onClick={handleOpen}
            aria-label="Բացեք Ձեր հրավերը"
            className="absolute left-1/2 top-[50%] z-10 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xl text-ivory shadow-glow"
            style={{ background: "radial-gradient(circle at 35% 30%, #E7CB92, #B89456 60%, #8F6F35)" }}
            animate={open ? { scale: 0, opacity: 0 } : { scale: [1, 1.08, 1] }}
            transition={open ? { duration: 0.4 } : { duration: 2.2, repeat: Infinity }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="font-serif">Գ</span>
          </motion.button>
        </div>
      </div>

      <motion.p
        className="mt-10 text-center font-serif text-xl text-brown"
        animate={open ? { opacity: 0 } : { opacity: [0.55, 1, 0.55] }}
        transition={{ duration: 2.6, repeat: open ? 0 : Infinity }}
      >
        Բացեք Ձեր հրավերը
      </motion.p>
    </motion.div>
  );
}
