import { Link } from "react-router-dom";
import { useLikedVideos, useVideos, useWatchHistory } from "@/api/use-catalog";
import { useAuth } from "@/stores/auth-store";
import { useCreateTweet, useDeleteTweet, useUserTweets } from "@/api/use-social";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/fields";
import { Empty } from "@/components/ui/primitives";
import { VideoCard } from "@/components/video/VideoCard";
import { apiErrorMessage } from "@/lib/api-client";
import { toast } from "sonner";

export function Tweets() {
  const { user } = useAuth();
  const { data } = useUserTweets(user?._id);
  const create = useCreateTweet();
  const del = useDeleteTweet();
  const [draft, setDraft] = useState("");
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <h1 className="font-display text-3xl">The Salon</h1>
      <p className="text-sm text-muted-foreground">Short notes from members of the house.</p>
      <form
        className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.trim()) return;
          create.mutateAsync(draft.trim()).then(() => setDraft("")).catch((err) => toast.error(apiErrorMessage(err)));
        }}
      >
        <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Share a quiet thought…" aria-label="New note" />
        <Button size="sm" className="self-end">Pin note</Button>
      </form>
      {(data ?? []).map((t) => (
        <Card key={t._id}>
          <CardHeader><CardTitle className="text-base">{typeof t.owner === "object" ? t.owner.fullname : "Member"}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm">{t.content}</p>
            <Button size="sm" variant="ghost" className="mt-2 h-7 px-2 text-xs" onClick={() => del.mutateAsync(t._id).catch((e) => toast.error(apiErrorMessage(e)))}>Remove</Button>
          </CardContent>
        </Card>
      ))}
      {(data ?? []).length === 0 ? <Empty title="Silence in the salon" hint="Pin the first note above." /> : null}
    </div>
  );
}

export function Liked() {
  const { data } = useLikedVideos();
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-3xl">Admired</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(data ?? []).map((v) => <VideoCard key={v._id} video={v} />)}
      </div>
      {(data ?? []).length === 0 ? <Empty title="Nothing admired yet" hint="Tap Admire on any film to keep it here." /> : null}
    </div>
  );
}

export function History() {
  const { data } = useWatchHistory();
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-3xl">Reading history</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(data ?? []).map((v) => <VideoCard key={v._id} video={v} />)}
      </div>
      {(data ?? []).length === 0 ? <Empty title="No history" hint="Films you watch will be recorded here." /> : null}
    </div>
  );
}

export function Subscriptions() {
  const { data } = useVideos({ limit: 12 });
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-3xl">Circles</h1>
      <p className="text-sm text-muted-foreground">Latest from channels in your circle. Open a channel to subscribe.</p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(data ?? []).map((v) => <VideoCard key={v._id} video={v} />)}
      </div>
    </div>
  );
}

export function Library() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-3xl">Library</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          ["/liked", "Admired", "Films marked with admiration"],
          ["/playlists", "Collections", "Your curated shelves"],
          ["/history", "History", "Everything you have seen"],
        ].map(([to, title, hint]) => (
          <Link key={to} to={to} className="rounded-2xl border border-border bg-card p-6 hover:bg-muted">
            <p className="font-display text-xl">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
