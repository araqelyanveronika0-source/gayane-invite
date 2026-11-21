import { createClient } from "@/lib/supabase/server";
import { FALLBACK, type InviteSettings } from "@/lib/invite";

// Միայն սերվերային կոդի համար (օգտագործվում է page.tsx-ներում)
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
    return slug === FALLBACK.slug ? FALLBACK : null;
  }
}
