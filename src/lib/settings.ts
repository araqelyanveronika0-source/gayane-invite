import { createClient } from "@/lib/supabase/server";

export type InviteSettings = {
  slug: string;
  title: string;
  event_date: string; // YYYY-MM-DD
  event_time: string; // HH:MM
  venue_name: string;
  inviter_name: string;
  address: string;
  map_url: string;
};

export const FALLBACK: InviteSettings = {
  slug: "gayane-51",
  title: "Գայանեի 51-ամյակ",
  event_date: "2026-12-09",
  event_time: "17:00",
  venue_name: "«Ակունքի դրախտ»",
  inviter_name: "Գայանեի ընտանիքը",
  address: "",
  map_url: "",
};

export async function getSettings(slug: string): Promise<InviteSettings | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("invitation_settings")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return (data as InviteSettings) ?? null;
  } catch {
    // Եթե DB-ն դեռ կարգավորված չէ, ցույց ենք տալիս լռելյայն տվյալները միայն հիմնական slug-ի համար
    return slug === FALLBACK.slug ? FALLBACK : null;
  }
}

const MONTHS = [
  "Հունվարի", "Փետրվարի", "Մարտի", "Ապրիլի", "Մայիսի", "Հունիսի",
  "Հուլիսի", "Օգոստոսի", "Սեպտեմբերի", "Հոկտեմբերի", "Նոյեմբերի", "Դեկտեմբերի",
];

export function formatDateHy(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

export function mapLink(s: InviteSettings) {
  if (s.map_url) return s.map_url;
  const q = encodeURIComponent([s.venue_name.replace(/[«»]/g, ""), s.address].filter(Boolean).join(", "));
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}
