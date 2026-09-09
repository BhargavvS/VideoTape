import { useState } from "react";
import { useChannelStats, useChannelVideos, usePublishVideo, useTogglePublish, useUpdateVideo } from "@/api/use-catalog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/fields";
import { Empty, FormError } from "@/components/ui/primitives";
import { getApiError } from "@/lib/api-client";
import { toast } from "sonner";

export default function Studio() {
  const { data: stats } = useChannelStats();
  const { data: videos, refetch } = useChannelVideos();
  const publish = usePublishVideo();
  const toggle = useTogglePublish();
  const update = useUpdateVideo();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [editing, setEditing] = useState<{ id: string; title: string; description: string } | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  const fail = (err: unknown) => {
    const { message } = getApiError(err);
    setPublishError(message);
    toast.error(message);
  };

  const statCards: Array<[string, string]> = [
    ["Total views", String((stats as Record<string, unknown> | undefined)?.totalViews ?? (stats as Record<string, unknown> | undefined)?.views ?? "—")],
    ["Patrons", String((stats as Record<string, unknown> | undefined)?.totalSubscribers ?? (stats as Record<string, unknown> | undefined)?.subscribers ?? "—")],
    ["Films", String((videos ?? []).length)],
    ["Admiration", String((stats as Record<string, unknown> | undefined)?.totalLikes ?? "—")],
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Studio · Private atelier</p>
        <h1 className="font-display text-3xl">Direct the house</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map(([k, v]) => (
          <Card key={k}><CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">{k}</CardTitle></CardHeader><CardContent><p className="font-display text-3xl">{v}</p></CardContent></Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Publish a new film</CardTitle>
          <CardDescription>Video file + thumbnail are uploaded to Cloudinary via your backend.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              setPublishError(null);
              if (!videoFile || !thumbnail) {
                const msg = "Video file and thumbnail are required";
                setPublishError(msg);
                toast.error(msg);
                return;
              }
              publish.mutateAsync({ title, description, videoFile, thumbnail })
                .then(() => { setTitle(""); setDescription(""); setVideoFile(null); setThumbnail(null); refetch(); toast.success("Film published"); })
                .catch(fail);
            }}
          >
            <div className="sm:col-span-2"><FormError message={publishError} onDismiss={() => setPublishError(null)} /></div>
            <Field label="Title"><Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Evening at the Gallery" /></Field>
            <Field label="Video file"><Input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)} required /></Field>
            <Field label="Programme notes"><Textarea value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="What should the audience know?" /></Field>
            <Field label="Thumbnail"><Input type="file" accept="image/*" onChange={(e) => setThumbnail(e.target.files?.[0] ?? null)} required /></Field>
            <div className="sm:col-span-2"><Button type="submit" disabled={publish.isPending}>{publish.isPending ? "Publishing…" : "Publish film"}</Button></div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Your repertoire</CardTitle><CardDescription>Rename, or withdraw a film from the public rooms.</CardDescription></CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {(videos ?? []).map((v) => (
              <div key={v._id} className="flex flex-col gap-2 rounded-xl border border-border p-3 sm:flex-row sm:items-center">
                <img src={v.thumbnail} alt="" className="h-16 w-28 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display">{v.title}</p>
                  <p className="text-xs text-muted-foreground">{v.views} views · {v.isPublished ? "Public" : "Private"}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setEditing({ id: v._id, title: v.title, description: v.description })}>Rename</Button>
                  <Button size="sm" variant="outline" disabled={toggle.isPending} onClick={() => toggle.mutateAsync(v._id).then(() => { refetch(); toast.success("Visibility changed"); }).catch((e) => toast.error(getApiError(e).message))}>{v.isPublished ? "Make private" : "Make public"}</Button>
                </div>
              </div>
            ))}
            {(videos ?? []).length === 0 ? <Empty title="No films yet" hint="Your published works will be listed here." /> : null}
          </div>
          {editing ? (
            <form
              className="mt-4 grid gap-3 rounded-xl bg-muted p-4 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                update.mutateAsync({ id: editing.id, title: editing.title, description: editing.description })
                  .then(() => { setEditing(null); refetch(); toast.success("Updated"); })
                  .catch((err) => toast.error(getApiError(err).message));
              }}
            >
              <Field label="Title"><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></Field>
              <Field label="Description"><Input value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></Field>
              <div className="flex gap-2 sm:col-span-2">
                <Button size="sm" type="submit" disabled={update.isPending}>Save</Button>
                <Button size="sm" variant="ghost" type="button" onClick={() => setEditing(null)}>Cancel</Button>
              </div>
            </form>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
