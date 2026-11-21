"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Clock, MapPin } from "lucide-react";
import Envelope from "./Envelope";
import RsvpForm from "./RsvpForm";
import Countdown from "./Countdown";
import ShareButtons from "./ShareButtons";
import MusicToggle from "./MusicToggle";
import { Corner, Petals } from "./Flowers";
import { formatDateHy, mapLink, type InviteSettings } from "@/lib/invite";

type Props = { settings: InviteSettings; guestName: string; shareUrl: string };

const fade = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function Invitation({ settings, guestName, shareUrl }: Props) {
  const [opened, setOpened] = useState(false);
  const [rsvp, setRsvp] = useState(false);

  const dateText = formatDateHy(settings.event_date);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <MusicToggle />

      <AnimatePresence>{!opened && <Envelope key="env" guestName={guestName} onOpened={() => setOpened(true)} />}</AnimatePresence>

      {opened && (
        <>
          <Petals />
          <div
            className="pointer-events-none fixed inset-0 -z-0"
            style={{
              background:
                "radial-gradient(ellipse at 20% 0%, rgba(217,165,160,.25), transparent 55%), radial-gradient(ellipse at 90% 100%, rgba(232,213,181,.6), transparent 55%)",
            }}
          />

          <div className="relative z-20 mx-auto flex max-w-xl flex-col gap-14 px-5 pb-24 pt-20">
            {/* ===== Հրավիրատոմս ===== */}
            <motion.section variants={fade} initial="hidden" animate="show" className="gold-frame relative overflow-hidden rounded-[1.75rem] bg-ivory px-6 pb-12 pt-16 text-center shadow-soft">
              <Corner className="-left-3 -top-3" />
              <Corner className="-bottom-3 -right-3 rotate-180" />

              {guestName && <p className="mb-5 font-serif text-lg text-gold">Հարգելի՛ {guestName}</p>}

              <p className="font-serif text-xl leading-relaxed">Սիրով հրավիրում ենք Ձեզ</p>
              <p className="mt-1 font-serif text-lg leading-relaxed text-brown/80">Գայանեի անակնկալ ծննդյան տոնին</p>

              <h1 className="gold-text mt-8 font-serif text-6xl leading-tight sm:text-7xl">Գայանե</h1>

              <motion.div
                className="mx-auto mt-4 flex h-36 w-36 flex-col items-center justify-center rounded-full border border-gold/60"
                style={{ background: "radial-gradient(circle, #FFF9F2 55%, #F5E6D0)" }}
                animate={{ boxShadow: ["0 0 0 rgba(184,148,86,0)", "0 0 36px rgba(184,148,86,.45)", "0 0 0 rgba(184,148,86,0)"] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <span className="gold-text font-serif text-6xl leading-none">51</span>
                <span className="mt-1 text-sm tracking-widest text-brown">Տարեդարձ</span>
              </motion.div>

              <div className="mx-auto my-8 h-px w-24 bg-gold/60" />

              <p className="font-serif text-2xl">{dateText}</p>
              <p className="mt-2 text-lg">Ժամը՝ {settings.event_time}</p>
              <p className="mt-5 text-brown/80">Վայրը՝</p>
              <p className="font-serif text-2xl">{settings.venue_name}</p>

              <p className="mx-auto mt-8 max-w-xs rounded-2xl bg-champagne/40 px-4 py-3 font-serif leading-relaxed text-brown">
                🤫 Սա անակնկալ է. խնդրում ենք պահել գաղտնիք, Գայանեն չպետք է իմանա։
              </p>
              <p className="mx-auto mt-6 max-w-xs leading-relaxed text-brown/90">
                Սպասում ենք Ձեզ՝ միասին անցկացնելու գեղեցիկ, ջերմ և հիշարժան երեկո։
              </p>
              <p className="mt-6 font-serif text-xl text-gold">Սիրով՝ {settings.inviter_name} ❤️</p>
            </motion.section>

            {/* ===== Մանրամասներ ===== */}
            <motion.section variants={fade} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} className="space-y-4">
              <h2 className="gold-text text-center font-serif text-3xl">Միջոցառման մանրամասները</h2>
              <div className="glass space-y-1 rounded-3xl p-3 shadow-soft">
                <Detail icon={<Calendar size={22} />} label="Ամսաթիվ" value={dateText} />
                <Detail icon={<Clock size={22} />} label="Ժամ" value={settings.event_time} />
                <Detail
                  icon={<MapPin size={22} />}
                  label="Վայր"
                  value={settings.venue_name + (settings.address ? `, ${settings.address}` : "")}
                />
              </div>
              <div className="flex justify-center pt-2">
                <a href={mapLink(settings)} target="_blank" rel="noopener noreferrer" className="btn-outline">
                  <MapPin size={18} /> Տեսնել քարտեզը
                </a>
              </div>
            </motion.section>

            {/* ===== Countdown ===== */}
            <motion.section variants={fade} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} className="space-y-5">
              <h2 className="gold-text text-center font-serif text-3xl">Մինչև տոնը մնաց</h2>
              <Countdown date={settings.event_date} time={settings.event_time} />
            </motion.section>

            {/* ===== RSVP ===== */}
            <motion.section variants={fade} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} className="glass rounded-3xl px-6 py-10 text-center shadow-soft">
              <h2 className="gold-text font-serif text-3xl">Սպասում ենք Ձեզ</h2>
              <p className="mx-auto mt-3 max-w-xs text-brown/80">Խնդրում ենք հաստատել Ձեր մասնակցությունը։</p>
              <button
                type="button"
                className="btn-gold mt-7"
                onClick={() => {
                  navigator.vibrate?.(20);
                  setRsvp(true);
                }}
              >
                Հաստատել մասնակցությունը
              </button>
            </motion.section>

            {/* ===== Share + QR ===== */}
            <motion.section variants={fade} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} className="space-y-5">
              <h2 className="gold-text text-center font-serif text-2xl">Կիսվել հրավիրատոմսով</h2>
              <ShareButtons url={shareUrl} />
            </motion.section>
          </div>

          <AnimatePresence>
            {rsvp && <RsvpForm invitationId={settings.slug} defaultName={guestName} onClose={() => setRsvp(false)} />}
          </AnimatePresence>
        </>
      )}
    </main>
  );
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl px-4 py-3.5">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-champagne/60 text-gold">{icon}</span>
      <div className="text-left">
        <p className="text-sm text-gold">{label}</p>
        <p className="font-serif text-lg leading-snug">{value}</p>
      </div>
    </div>
  );
}
