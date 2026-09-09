import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/fields";
import { FormError } from "@/components/ui/primitives";
import { getApiError } from "@/lib/api-client";
import { toast } from "sonner";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullname: "", username: "", email: "", password: "" });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [k]: e.target.value });
    setFormError(null);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>A portrait (avatar) is required. Cover image is optional.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              setFormError(null);
              if (!avatar) {
                const msg = "Avatar portrait is required";
                setFormError(msg);
                toast.error(msg);
                return;
              }
              setBusy(true);
              const fd = new FormData();
              fd.append("fullname", form.fullname);
              fd.append("username", form.username.toLowerCase());
              fd.append("email", form.email);
              fd.append("password", form.password);
              fd.append("avatar", avatar);
              if (cover) fd.append("coverImage", cover);
              register(fd)
                .then(() => { toast.success("Account created — please sign in"); navigate("/login"); })
                .catch((err) => {
                  const { message, status } = getApiError(err);
                  const friendly = status === 409
                    ? "An account with that username or email already exists. Try signing in instead."
                    : message;
                  setFormError(friendly);
                  toast.error(friendly);
                })
                .finally(() => setBusy(false));
            }}
          >
            <div className="sm:col-span-2">
              <FormError message={formError} onDismiss={() => setFormError(null)} />
            </div>
            <Field label="Full name"><Input value={form.fullname} onChange={set("fullname")} required /></Field>
            <Field label="Username"><Input value={form.username} onChange={set("username")} required /></Field>
            <Field label="Email"><Input type="email" value={form.email} onChange={set("email")} required /></Field>
            <Field label="Password"><Input type="password" value={form.password} onChange={set("password")} required minLength={6} /></Field>
            <Field label="Portrait (avatar)"><Input type="file" accept="image/*" onChange={(e) => { setAvatar(e.target.files?.[0] ?? null); setFormError(null); }} required /></Field>
            <Field label="Cover (optional)"><Input type="file" accept="image/*" onChange={(e) => setCover(e.target.files?.[0] ?? null)} /></Field>
            <div className="sm:col-span-2 flex flex-col gap-2">
              <Button type="submit" disabled={busy}>{busy ? "Creating account…" : "Create account"}</Button>
              <p className="text-sm text-muted-foreground">Already have an account? <Link to="/login" className="underline">Sign in</Link></p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
