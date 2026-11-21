import { NextResponse } from "next/server";
import { rsvpSchema } from "@/lib/schema";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

// Պարզ in-memory rate limit (յուրաքանչյուր instance-ի համար).
// Արտադրության համար լրացուցիչ կարող եք միացնել Vercel Firewall / Upstash.
const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;

function limited(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
  }
  return list.length > MAX_HITS;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limited(ip)) {
    return NextResponse.json({ error: "Չափազանց շատ փորձեր։ Խնդրում ենք փորձել մի փոքր ուշ։" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Սխալ հարցում" }, { status: 400 });
  }

  const parsed = rsvpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Սխալ տվյալներ" },
      { status: 400 }
    );
  }
  const d = parsed.data;

  // Honeypot կամ չափազանց արագ ուղարկում → կեղծ «հաջողություն», որ բոտը չհասկանա
  if ((d.website && d.website.length > 0) || (typeof d.elapsed === "number" && d.elapsed < 1500)) {
    return NextResponse.json({ ok: true });
  }

  const attending = d.attendance === "yes";
  const supabase = createServiceClient();

  const { error } = await supabase.from("guest_responses").insert({
    invitation_id: d.invitationId,
    guest_name: d.guestName,
    attendance_status: d.attendance,
    guest_count: attending ? d.guestCount : 0,
    companion_name: attending && d.companionName ? d.companionName : null,
    message: d.message ? d.message : null,
  });

  if (error) {
    console.error("RSVP insert error:", error.message);
    return NextResponse.json({ error: "Չհաջողվեց պահպանել պատասխանը։ Փորձեք կրկին։" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
