import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Invitation from "@/components/Invitation";
import { formatDateHy, getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ to?: string }>;
};

const site = () => (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = await getSettings(slug);
  if (!s) return {};
  const url = `${site()}/invite/${slug}`;
  const title = "Գայանեի անակնկալ 51-ամյակ — հրավիրատոմս 🌸";
  const description = `Սիրով հրավիրում ենք Ձեզ Գայանեի անակնկալ ծննդյան տոնին։ ${formatDateHy(s.event_date)}, ${s.venue_name}։`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      locale: "hy_AM",
      siteName: "Գայանե · 51",
      images: [{ url: `${site()}/og.jpg`, width: 1200, height: 630, alt: "Գայանեի անակնկալ 51-ամյակի հրավիրատոմս" }],
    },
    twitter: { card: "summary_large_image", title, description, images: [`${site()}/og.jpg`] },
  };
}

export default async function InvitePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { to } = await searchParams;
  const settings = await getSettings(slug);
  if (!settings) notFound();

  const guest = to ? to.replace(/[<>]/g, "").slice(0, 60).trim() : "";

  return <Invitation settings={settings} guestName={guest} shareUrl={`${site()}/invite/${slug}`} />;
}
