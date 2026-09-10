import { useState } from "react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/stores/auth-store";
import { Avatar, FormError } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/fields";
import { getApiError, normalize } from "@/lib/api-client";
import { toast } from "sonner";

export default function Settings() {
  const { user, fetchMe } = useAuth();
  const [fullname, setFullname] = useState(user?.fullname ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  if (!user) return null;

  const fail = (err: unknown, set: (m: string | null) => void) => {
    const { message } = getApiError(err);
    set(message);
    toast.error(message);
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Membership</p><h1 className="font-display text-3xl">Settings</h1></div>
      <Card>
        <CardHeader><CardTitle>Portrait of the member</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar src={user.avatar} name={user.fullname} className="size-16" />
            <div>
              <p className="font-display text-xl">{user.fullname}</p>
              <p className="text-sm text-muted-foreground">@{user.username} · {user.email}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <label className="text-sm">New portrait <Input type="file" accept="image/*" id="avatar-file" onChange={async (e) => {
              const f = e.target.files?.[0]; if (!f) return;
              const fd = new FormData(); fd.append("avatar", f);
              try { await api.patch("/users/avatar", fd, { headers: { "Content-Type": "multipart/form-data" } }); await fetchMe(); toast.success("Portrait updated"); }
              catch (err) { fail(err, setDetailsError); }
            }} /></label>
            <label className="text-sm">New cover <Input type="file" accept="image/*" onChange={async (e) => {
              const f = e.target.files?.[0]; if (!f) return;
              const fd = new FormData(); fd.append("coverImage", f);
              try { await api.patch("/users/cover-image", fd, { headers: { "Content-Type": "multipart/form-data" } }); await fetchMe(); toast.success("Cover updated"); }
              catch (err) { fail(err, setDetailsError); }
            }} /></label>
          </div>
          <div className="mt-4"><FormError message={detailsError} onDismiss={() => setDetailsError(null)} /></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Details</CardTitle></CardHeader>
        <CardContent>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={async (e) => {
            e.preventDefault();
            setDetailsError(null);
            try {
              const { data } = await api.patch("/users/update-user", { fullname, email });
              const payload = normalize<{ user: typeof user }>(data);
              if (payload?.user) useAuth.getState().setUser(payload.user); else await fetchMe();
              toast.success("Details updated");
            } catch (err) { fail(err, setDetailsError); }
          }}>
            <div className="sm:col-span-2"><FormError message={detailsError} onDismiss={() => setDetailsError(null)} /></div>
            <Field label="Full name"><Input value={fullname} onChange={(e) => setFullname(e.target.value)} /></Field>
            <Field label="Email"><Input value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
            <div className="sm:col-span-2"><Button size="sm">Save details</Button></div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Change password</CardTitle></CardHeader>
        <CardContent>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={async (e) => {
            e.preventDefault();
            setPasswordError(null);
            try { await api.post("/users/change-password", { oldPassword: oldPass, newPassword: newPass }); setOldPass(""); setNewPass(""); toast.success("Password updated"); }
            catch (err) { fail(err, setPasswordError); }
          }}>
            <div className="sm:col-span-2"><FormError message={passwordError} onDismiss={() => setPasswordError(null)} /></div>
            <Field label="Current password"><Input type="password" value={oldPass} onChange={(e) => setOldPass(e.target.value)} /></Field>
            <Field label="New password"><Input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} /></Field>
            <div className="sm:col-span-2"><Button size="sm" variant="secondary">Update password</Button></div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
