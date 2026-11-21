"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, Heart, LogOut, MessageSquareText, RefreshCw, Search, UserCheck, UserX, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { settingsSchema } from "@/lib/schema";
import type { InviteSettings } from "@/lib/invite";

type Row = {
  id: string;
  guest_name: string;
  attendance_status: "yes" | "no";
  guest_count: number;
  companion_name: string | null;
  message: string | null;
  submitted_at: string;
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("hy-AM", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Yerevan" });

export default function AdminDashboard({ slug, initialSettings, email }: { slug: string; initialSettings: InviteSettings; email: string }) {
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "yes" | "no">("all");
  const [sortDesc, setSortDesc] = useState(true);
  const [seenAt] = useState(() => Date.now());

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("guest_responses")
      .select("id,guest_name,attendance_status,guest_count,companion_name,message,submitted_at")
      .eq("invitation_id", slug)
      .order("submitted_at", { ascending: false });
    setRows((data as Row[]) ?? []);
    setLoading(false);
  }, [supabase, slug]);

  useEffect(() => {
    load();
    // Իրական ժամանակ
    const ch = supabase
      .channel("guest_responses_live")
      .on("postgres_changes", { event: "*", schema: "public", table: "guest_responses" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [supabase, load]);

  const stats = useMemo(() => {
    const yes = rows.filter((r) => r.attendance_status === "yes");
    return {
      total: rows.length,
      yes: yes.length,
      no: rows.length - yes.length,
      people: yes.reduce((s, r) => s + r.guest_count, 0),
      fresh: rows.filter((r) => seenAt - new Date(r.submitted_at).getTime() < 24 * 3600 * 1000).length,
    };
  }, [rows, seenAt]);

  const view = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows
      .filter((r) => (filter === "all" ? true : r.attendance_status === filter))
      .filter((r) => !term || r.guest_name.toLowerCase().includes(term))
      .sort((a, b) => (sortDesc ? 1 : -1) * (new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()));
  }, [rows, q, filter, sortDesc]);

  function exportCsv() {
    const esc = (v: string | number | null) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const head = ["Անուն", "Մասնակցություն", "Հյուրերի քանակ", "Ուղեկցող", "Հաղորդագրություն", "Ամսաթիվ"];
    const lines = view.map((r) =>
      [r.guest_name, r.attendance_status === "yes" ? "Այո" : "Ոչ", r.guest_count, r.companion_name, r.message, fmt(r.submitted_at)].map(esc).join(",")
    );
    // BOM՝ որ Excel-ը ճիշտ կարդա հայերենը
    const blob = new Blob(["﻿" + [head.map(esc).join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `gayane-51-rsvp-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="gold-text font-serif text-3xl">Գայանե · 51 — Ադմին</h1>
          <p className="text-sm text-brown/60">{email}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-outline !px-4 !py-2.5 text-sm" aria-label="Թարմացնել">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Թարմացնել
          </button>
          <form action="/admin/signout" method="post">
            <button className="btn-outline !px-4 !py-2.5 text-sm">
              <LogOut size={16} /> Դուրս գալ
            </button>
          </form>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Card icon={<Users />} label="Ընդհանուր պատասխաններ" value={stats.total} />
        <Card icon={<UserCheck />} label="Մասնակցում են" value={stats.yes} />
        <Card icon={<UserX />} label="Չեն մասնակցում" value={stats.no} />
        <Card icon={<Heart />} label="Ընդհանուր հյուրեր (ուղեկցողներով)" value={stats.people} accent />
        <Card icon={<MessageSquareText />} label="Նոր (24 ժամ)" value={stats.fresh} />
      </section>

      <section className="glass space-y-4 rounded-3xl p-4 shadow-soft sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold" />
            <input className="field !pl-10" placeholder="Որոնել ըստ անվան" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select className="field !w-auto" value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
            <option value="all">Բոլորը</option>
            <option value="yes">Մասնակցում են</option>
            <option value="no">Չեն մասնակցում</option>
          </select>
          <button className="btn-outline !py-3 text-sm" onClick={() => setSortDesc((s) => !s)}>
            Ամսաթիվ {sortDesc ? "↓" : "↑"}
          </button>
          <button className="btn-gold !py-3 text-sm" onClick={exportCsv} disabled={!view.length}>
            <Download size={16} /> CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-gold">
              <tr className="border-b border-champagne">
                <th className="py-2 pr-3">Անուն</th>
                <th className="pr-3">Կարգավիճակ</th>
                <th className="pr-3">Հյուրեր</th>
                <th className="pr-3">Ուղեկցող</th>
                <th className="pr-3">Հաղորդագրություն</th>
                <th>Ամսաթիվ</th>
              </tr>
            </thead>
            <tbody>
              {view.map((r) => (
                <tr key={r.id} className="border-b border-champagne/60 align-top">
                  <td className="py-3 pr-3 font-medium">{r.guest_name}</td>
                  <td className="pr-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs ${r.attendance_status === "yes" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                      {r.attendance_status === "yes" ? "Մասնակցում է" : "Չի մասնակցում"}
                    </span>
                  </td>
                  <td className="pr-3">{r.attendance_status === "yes" ? r.guest_count : "—"}</td>
                  <td className="pr-3">{r.companion_name || "—"}</td>
                  <td className="max-w-xs whitespace-pre-wrap break-words pr-3">{r.message || "—"}</td>
                  <td className="whitespace-nowrap text-brown/70">{fmt(r.submitted_at)}</td>
                </tr>
              ))}
              {!view.length && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-brown/60">
                    {loading ? "Բեռնվում է…" : "Պատասխաններ դեռ չկան"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <SettingsPanel slug={slug} initial={initialSettings} />
    </main>
  );
}

function Card({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number; accent?: boolean }) {
  return (
    <div className={`glass rounded-3xl p-4 shadow-soft ${accent ? "ring-1 ring-gold" : ""}`}>
      <div className="text-gold">{icon}</div>
      <div className="mt-2 font-serif text-3xl">{value}</div>
      <div className="text-xs text-brown/70">{label}</div>
    </div>
  );
}

function SettingsPanel({ slug, initial }: { slug: string; initial: InviteSettings }) {
  const supabase = useMemo(() => createClient(), []);
  const [f, setF] = useState({
    event_time: initial.event_time,
    venue_name: initial.venue_name,
    inviter_name: initial.inviter_name,
    address: initial.address,
    map_url: initial.map_url,
  });
  const [msg, setMsg] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const parsed = settingsSchema.safeParse(f);
    if (!parsed.success) {
      setMsg(parsed.error.issues[0].message);
      return;
    }
    const { error } = await supabase
      .from("invitation_settings")
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq("slug", slug);
    setMsg(error ? "Չհաջողվեց պահպանել" : "Պահպանվեց ✓");
  }

  return (
    <form onSubmit={save} className="glass space-y-4 rounded-3xl p-4 shadow-soft sm:p-6">
      <h2 className="font-serif text-xl">Հրավիրատոմսի կարգավորումներ</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          Ժամ (ԺԺ:ՐՐ)
          <input className="field mt-1" value={f.event_time} onChange={(e) => setF({ ...f, event_time: e.target.value })} placeholder="17:00" />
        </label>
        <label className="text-sm">
          Վայրի անվանում
          <input className="field mt-1" value={f.venue_name} onChange={(e) => setF({ ...f, venue_name: e.target.value })} />
        </label>
        <label className="text-sm sm:col-span-2">
          Հրավիրողի անուն (քարտի ստորագրությունը)
          <input className="field mt-1" value={f.inviter_name} onChange={(e) => setF({ ...f, inviter_name: e.target.value })} />
        </label>
        <label className="text-sm">
          Հասցե
          <input className="field mt-1" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} />
        </label>
        <label className="text-sm">
          Google Maps հղում
          <input className="field mt-1" value={f.map_url} onChange={(e) => setF({ ...f, map_url: e.target.value })} placeholder="https://maps.app.goo.gl/…" />
        </label>
      </div>
      <div className="flex items-center gap-3">
        <button className="btn-gold !py-3 text-sm">Պահպանել</button>
        {msg && <span className="text-sm text-brown/70">{msg}</span>}
      </div>
    </form>
  );
}
