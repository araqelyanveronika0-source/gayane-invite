"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Loader2, X } from "lucide-react";
import { rsvpSchema, type RsvpInput } from "@/lib/schema";
import { Bloom } from "./Flowers";

type Props = { invitationId: string; defaultName?: string; onClose: () => void };

export default function RsvpForm({ invitationId, defaultName = "", onClose }: Props) {
  const [done, setDone] = useState<null | "yes" | "no">(null);
  const [serverError, setServerError] = useState("");
  const openedAt = useRef(Date.now());

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RsvpInput>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      invitationId,
      guestName: defaultName,
      guestCount: 1,
      companionName: "",
      message: "",
      website: "",
    },
  });

  const attendance = watch("attendance");
  const count = watch("guestCount");

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  async function onSubmit(values: RsvpInput) {
    setServerError("");
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, elapsed: Date.now() - openedAt.current }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setServerError(data.error ?? "Չհաջողվեց ուղարկել։ Փորձեք կրկին։");
        return;
      }
      navigator.vibrate?.([20, 40, 20]);
      setDone(values.attendance);
    } catch {
      setServerError("Կապի խնդիր։ Ստուգեք ինտերնետը և փորձեք կրկին։");
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-brown/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Մասնակցության հաստատում"
        className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-[2rem] bg-ivory p-6 shadow-soft sm:rounded-[2rem] sm:p-8"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 260 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Փակել"
          className="absolute right-4 top-4 rounded-full p-2 text-brown/60 transition hover:bg-champagne/50"
        >
          <X size={20} />
        </button>

        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-6 text-center"
            >
              <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", delay: 0.1 }}>
                <Bloom className="mx-auto h-28 w-28" />
              </motion.div>
              <h3 className="gold-text mt-4 font-serif text-3xl">Շնորհակալություն ❤️</h3>
              {done === "yes" ? (
                <>
                  <p className="mt-4 text-brown">Ձեր պատասխանը հաջողությամբ ստացվեց։</p>
                  <p className="mt-2 text-brown">Սպասում ենք Ձեզ՝ միասին տոնելու այս գեղեցիկ օրը։</p>
                </>
              ) : (
                <>
                  <p className="mt-4 text-brown">Շնորհակալ ենք, որ տեղեկացրիք։</p>
                  <p className="mt-2 text-brown">Ափսոս, որ չեք կարող լինել մեզ հետ, բայց Ձեր ջերմ մտքերն ու բարեմաղթանքները շատ թանկ են մեզ համար։ ❤️</p>
                </>
              )}
              <button type="button" onClick={onClose} className="btn-gold mt-8">
                Փակել
              </button>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="pr-8">
                <h3 className="gold-text font-serif text-2xl">Հաստատել մասնակցությունը</h3>
                <p className="mt-1 text-sm text-brown/70">Խնդրում ենք լրացնել մի քանի դաշտ</p>
              </div>

              <input type="hidden" {...register("invitationId")} />
              {/* Honeypot՝ մարդուն անտեսանելի */}
              <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                <label>
                  Website
                  <input type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
                </label>
              </div>

              <div>
                <label htmlFor="guestName" className="mb-1.5 block text-sm font-medium">
                  Անուն և ազգանուն
                </label>
                <input id="guestName" className="field" autoComplete="name" placeholder="Օր.՝ Անի Սարգսյան" {...register("guestName")} />
                {errors.guestName && <p className="mt-1 text-sm text-rose-700">{errors.guestName.message}</p>}
              </div>

              <fieldset>
                <legend className="mb-1.5 text-sm font-medium">Մասնակցություն</legend>
                <div className="grid gap-2.5">
                  {[
                    { v: "yes", t: "Այո, սիրով կմասնակցեմ ❤️" },
                    { v: "no", t: "Ցավոք, չեմ կարող մասնակցել" },
                  ].map((o) => (
                    <label
                      key={o.v}
                      className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3.5 transition ${
                        attendance === o.v ? "border-gold bg-champagne/50 shadow-soft" : "border-champagne bg-white/70"
                      }`}
                    >
                      <input type="radio" value={o.v} className="h-4 w-4 accent-[#B89456]" {...register("attendance")} />
                      <span>{o.t}</span>
                    </label>
                  ))}
                </div>
                {errors.attendance && <p className="mt-1 text-sm text-rose-700">{errors.attendance.message}</p>}
              </fieldset>

              <AnimatePresence>
                {attendance === "yes" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-5 overflow-hidden"
                  >
                    <div>
                      <label htmlFor="guestCount" className="mb-1.5 block text-sm font-medium">
                        Հյուրերի քանակ (Ձեզ հետ միասին)
                      </label>
                      <select id="guestCount" className="field" {...register("guestCount", { valueAsNumber: true })}>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                      {errors.guestCount && <p className="mt-1 text-sm text-rose-700">{errors.guestCount.message}</p>}
                    </div>

                    {Number(count) > 1 && (
                      <div>
                        <label htmlFor="companionName" className="mb-1.5 block text-sm font-medium">
                          Ուղեկցող անձի անուն <span className="text-brown/50">(ըստ ցանկության)</span>
                        </label>
                        <input id="companionName" className="field" {...register("companionName")} />
                        {errors.companionName && <p className="mt-1 text-sm text-rose-700">{errors.companionName.message}</p>}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label htmlFor="message" className="mb-1.5 block text-sm font-medium">
                  Հատուկ հաղորդագրություն Գայանեի համար <span className="text-brown/50">(ըստ ցանկության)</span>
                </label>
                <textarea id="message" rows={3} className="field resize-none" placeholder="Ձեր բարեմաղթանքը…" {...register("message")} />
                {errors.message && <p className="mt-1 text-sm text-rose-700">{errors.message.message}</p>}
              </div>

              {serverError && (
                <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">
                  {serverError}
                </p>
              )}

              <button type="submit" disabled={isSubmitting} className="btn-gold w-full disabled:opacity-60">
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Heart size={18} />}
                Ուղարկել պատասխանը
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
