import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FALLBACK, type InviteSettings } from "@/lib/invite";
import AdminDashboard from "@/components/AdminDashboard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — Գայանե 51", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  // RLS-ը թույլ է տալիս տեսնել միայն սեփական տողը
  const { data: adminRow } = await supabase.from("admins").select("email").maybeSingle();
  if (!adminRow) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5 text-center">
        <div className="glass max-w-sm rounded-3xl p-8">
          <h1 className="font-serif text-xl">Մուտքը արգելված է</h1>
          <p className="mt-2 text-sm text-brown/70">{user.email} հասցեն ադմինների ցուցակում չէ։</p>
          <form action="/admin/signout" method="post" className="mt-5">
            <button className="btn-outline">Դուրս գալ</button>
          </form>
        </div>
      </main>
    );
  }

  const { data: settings } = await supabase.from("invitation_settings").select("*").eq("slug", FALLBACK.slug).maybeSingle();

  return <AdminDashboard slug={FALLBACK.slug} initialSettings={(settings as InviteSettings) ?? FALLBACK} email={user.email ?? ""} />;
}
