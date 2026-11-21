"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Սխալ email կամ գաղտնաբառ");
      setLoading(false);
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <form onSubmit={submit} className="glass w-full max-w-sm space-y-4 rounded-3xl p-7 shadow-soft">
        <div className="text-center">
          <Lock className="mx-auto text-gold" />
          <h1 className="gold-text mt-2 font-serif text-2xl">Ադմինի մուտք</h1>
        </div>
        <input type="email" required autoComplete="username" placeholder="Email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" required autoComplete="current-password" placeholder="Գաղտնաբառ" className="field" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
        <button className="btn-gold w-full" disabled={loading}>
          {loading && <Loader2 className="animate-spin" size={18} />} Մուտք գործել
        </button>
      </form>
    </main>
  );
}
