import { useState } from "react";
import { Link } from "react-router-dom";
import { useCreatePlaylist, usePlaylist, useUserPlaylists } from "@/api/use-social";
import { useAuth } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/fields";
import { Empty } from "@/components/ui/primitives";
import { apiErrorMessage } from "@/lib/api-client";
import { toast } from "sonner";

export function Playlists() {
  const { user } = useAuth();
  const { data } = useUserPlaylists(user?._id);
  const create = useCreatePlaylist();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="flex flex-col gap-6">
      <div><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Collections</p><h1 className="font-display text-3xl">Shelves & playlists</h1></div>
      <Card>
        <CardHeader><CardTitle>New shelf</CardTitle><CardDescription>Group films by mood, season, or study.</CardDescription></CardHeader>
        <CardContent>
          <form
            className="grid gap-3 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              create.mutateAsync({ name, description }).then(() => { setName(""); setDescription(""); toast.success("Shelf created"); }).catch((err) => toast.error(apiErrorMessage(err)));
            }}
          >
            <Field label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} required /></Field>
            <Field label="Description"><Input value={description} onChange={(e) => setDescription(e.target.value)} required /></Field>
            <div className="sm:col-span-2"><Button size="sm" disabled={create.isPending}>Create shelf</Button></div>
          </form>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {(data ?? []).map((p) => (
          <Link key={p._id} to={`/playlists/${p._id}`}>
            <Card><CardHeader><CardTitle>{p.name}</CardTitle><CardDescription>{p.description}</CardDescription></CardHeader></Card>
          </Link>
        ))}
      </div>
      {(data ?? []).length === 0 ? <Empty title="No shelves yet" hint="Create your first collection above." /> : null}
    </div>
  );
}

export function PlaylistDetail({ id }: { id: string }) {
  const { data } = usePlaylist(id);
  if (!data) return <Empty title="Shelf not found" />;
  const videos = data.videos ?? (data.video ? [data.video as never] : []);
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-3xl">{data.name}</h1>
      <p className="text-sm text-muted-foreground">{data.description}</p>
      {(videos as Array<{ _id: string; title: string; thumbnail?: string }>).map((v) => (
        <Link key={v._id} to={`/watch/${v._id}`} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
          {v.thumbnail ? <img src={v.thumbnail} alt="" className="h-14 w-24 rounded-lg object-cover" /> : null}
          <span className="font-display">{v.title}</span>
        </Link>
      ))}
      {videos.length === 0 ? <Empty title="Empty shelf" hint="Add films from any watch page via Shelve." /> : null}
    </div>
  );
}
