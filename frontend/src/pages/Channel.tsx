import { useState } from "react";
import { useParams } from "react-router-dom";
import { useChannel, useToggleSubscription, useVideos } from "@/api/use-catalog";
import { useCreateTweet, useUserTweets } from "@/api/use-social";
import { useUserPlaylists } from "@/api/use-social";
import { Avatar, Empty, Skeleton } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/fields";
import { VideoCard } from "@/components/video/VideoCard";
import { apiErrorMessage } from "@/lib/api-client";
import { useAuth } from "@/stores/auth-store";
import { toast } from "sonner";

const TABS = ["Films", "Salon", "Collections"] as const;

export default function Channel() {
  const { username } = useParams();
  const { data: channel, isLoading } = useChannel(username);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Films");
  const toggle = useToggleSubscription();
  const { user } = useAuth();
  const { data: films } = useVideos({ limit: 12 });

  if (isLoading) return <Skeleton className="h-64 w-full rounded-2xl" />;
  if (!channel) return <Empty title="Channel not found" />;

  const mine = user?._id === channel._id;

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {channel.coverImage ? <img src={channel.coverImage} alt="" className="h-40 w-full object-cover sm:h-56" /> : <div className="h-32 bg-secondary sm:h-44" />}
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          <Avatar src={channel.avatar} name={channel.fullname} className="size-20 border-2 border-background" />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl sm:text-3xl">{channel.fullname}</h1>
            <p className="text-sm text-muted-foreground">@{channel.username} · {channel.subscriberCount} patrons · {channel.subscribedToCount} circles</p>
          </div>
          {!mine ? (
            <Button
              disabled={toggle.isPending}
              onClick={() => toggle.mutateAsync(channel._id).then(() => toast.success(channel.isSubscribed ? "Unsubscribed" : "Subscribed")).catch((e) => toast.error(apiErrorMessage(e)))}
            >
              {channel.isSubscribed ? "Subscribed" : "Subscribe"}
            </Button>
          ) : (
            <Button variant="secondary" disabled>Your house</Button>
          )}
        </div>
      </div>

      <div className="flex gap-2" role="tablist" aria-label="Channel sections">
        {TABS.map((t) => (
          <Button key={t} size="sm" variant={tab === t ? "default" : "secondary"} onClick={() => setTab(t)} role="tab" aria-selected={tab === t}>{t}</Button>
        ))}
      </div>

      {tab === "Films" ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(films ?? []).map((v) => <VideoCard key={v._id} video={v} />)}
          {(films ?? []).length === 0 ? <Empty title="No films yet" /> : null}
        </div>
      ) : null}
      {tab === "Salon" ? <ChannelTweets channelId={channel._id} mine={mine} /> : null}
      {tab === "Collections" ? <ChannelPlaylists channelId={channel._id} /> : null}
    </div>
  );
}

function ChannelTweets({ channelId, mine }: { channelId: string; mine: boolean }) {
  const { data: tweets } = useUserTweets(channelId);
  const create = useCreateTweet();
  const [draft, setDraft] = useState("");
  return (
    <div className="flex flex-col gap-4">
      {mine ? (
        <form
          className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!draft.trim()) return;
            create.mutateAsync(draft.trim()).then(() => setDraft("")).catch((err) => toast.error(apiErrorMessage(err)));
          }}
        >
          <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Pin a note to the salon door…" aria-label="New tweet" />
          <Button size="sm" className="self-end" disabled={!draft.trim() || create.isPending}>Publish note</Button>
        </form>
      ) : null}
      {(tweets ?? []).map((t) => (
        <Card key={t._id}><CardHeader><CardTitle className="text-base">{typeof t.owner === "object" ? t.owner.fullname : "Note"}</CardTitle></CardHeader><CardContent><p className="text-sm">{t.content}</p></CardContent></Card>
      ))}
      {(tweets ?? []).length === 0 ? <Empty title="The salon is quiet" hint="No notes pinned yet." /> : null}
    </div>
  );
}

function ChannelPlaylists({ channelId }: { channelId: string }) {
  const { data } = useUserPlaylists(channelId);
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {(data ?? []).map((p) => (
        <Card key={p._id}><CardHeader><CardTitle>{p.name}</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">{p.description}</p></CardContent></Card>
      ))}
      {(data ?? []).length === 0 ? <Empty title="No collections" hint="Curated shelves will appear here." /> : null}
    </div>
  );
}
