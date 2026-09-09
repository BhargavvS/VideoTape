import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/fields";
import { FormError } from "@/components/ui/primitives";
import { Clapperboard, ListVideo, SquarePlay, Users } from "lucide-react";
import { getApiError } from "@/lib/api-client";
import { toast } from "sonner";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  return (
    <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden rounded-lg border border-border bg-card p-8 md:flex">
        <div className="bg-grid bg-grid-fade pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-md bg-white text-black">
            <SquarePlay className="size-4" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">streamhouse</span>
          <span className="ml-auto flex items-center gap-1.5 font-mono text-[11px] text-[#737373]">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
            </span>
            OPERATIONAL
          </span>
        </div>
        <div className="relative">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Sign in to continue</p>
          <p className="mt-2 text-4xl font-semibold leading-[1.05] tracking-[-0.03em]">Welcome back.</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Pick up where you left off — your films, channels, and playlists are waiting.
          </p>
          <div className="mt-6 flex flex-col gap-4">
            {[
              { icon: Clapperboard, title: "Ship films in 4K", hint: "Direct uploads with instant playback." },
              { icon: Users, title: "Follow sharp channels", hint: "New drops surface on your Home." },
              { icon: ListVideo, title: "Keep playlists", hint: "Shelve what you love, revisit anytime." },
            ].map(({ icon: Icon, title, hint }) => (
              <div key={title} className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04]">
                  <Icon className="size-4 text-white" />
                </span>
                <span>
                  <span className="block text-[13.5px] font-medium tracking-tight">{title}</span>
                  <span className="block text-xs text-muted-foreground">{hint}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative flex items-center gap-5 border-t border-white/[0.08] pt-4 font-mono text-[11px] uppercase tracking-[0.12em] text-[#525252]">
          <span><span className="text-white">99.99%</span> uptime</span>
          <span><span className="text-white">4K</span> max</span>
          <span><span className="text-white">&lt;50ms</span> edge</span>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle>Sign in</CardTitle><CardDescription>Use your username or email.</CardDescription></CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              setFormError(null);
              setBusy(true);
              const payload = id.includes("@") ? { email: id, password } : { username: id.toLowerCase(), password };
              login(payload)
                .then(() => { toast.success("Welcome back"); navigate("/"); })
                .catch((err) => {
                  const { message } = getApiError(err);
                  setFormError(message);
                  toast.error(message);
                })
                .finally(() => setBusy(false));
            }}
          >
            <FormError message={formError} onDismiss={() => setFormError(null)} />
            <Field label="Username or email"><Input value={id} onChange={(e) => { setId(e.target.value); setFormError(null); }} required autoComplete="username" /></Field>
            <Field label="Password"><Input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setFormError(null); }} required autoComplete="current-password" /></Field>
            <Button type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Button>
            <p className="text-sm text-muted-foreground">New here? <Link to="/register" className="underline">Create an account</Link></p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
