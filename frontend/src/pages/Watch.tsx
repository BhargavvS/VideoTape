import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAddComment, useDeleteComment } from "@/api/use-social";
import { useToggleLike, useVideo, useVideos } from "@/api/use-catalog";
import { Avatar, Empty, Separator, Skeleton } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/fields";
import { VideoCard } from "@/components/video/VideoCard";
import { apiErrorMessage } from "@/lib/api-client";
import { BookmarkPlus, Share2, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/stores/auth-store";

export default function Watch() {
  const { id } = useParams();
  const { data: video, isLoading } = useVideo(id);
  const { data: upNext } = useVideos({ limit: 8 });
  const { user } = useAuth();
  const likeVideo = useToggleLike("v");
  const { data: comments } = require_comments(id);
  const addComment = useAddComment();
  const delComment = useDeleteComment();
  const [draft, setDraft] = useState("");

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="aspect-video w-full rounded-2xl" />
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    );
  }
  if (!video) return <Empty title="Reel not found" hint="This film may be unpublished or removed." />;

  const owner = typeof video.owner === "object" ? video.owner : null;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex min-w-0 flex-col gap-5">
        <div className="overflow-hidden rounded-2xl border border-border bg-black">
          <video src={video.videoFile} poster={video.thumbnail} controls className="aspect-video w-full" />
        </div>
        <div>
          <h1 className="font-display text-2xl leading-tight sm:text-3xl">{video.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{video.views ?? 0} views · {video.createdAt ? new Date(video.createdAt).toLocaleDateString() : ""}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4">
          {owner ? (
            <Link to={`/c/${owner.username}`} className="flex items-center gap-3">
              <Avatar src={owner.avatar} name={owner.fullname} />
              <span>
                <span className="block font-display text-base">{owner.fullname}</span>
                <span className="block text-xs text-muted-foreground">@{owner.username}</span>
              </span>
            </Link>
          ) : null}
          <span className="ml-auto flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={likeVideo.isPending}
              onClick={() => likeVideo.mutateAsync(video._id).then(() => toast.success("Noted with admiration")).catch((e) => toast.error(apiErrorMessage(e)))}
            >
              <ThumbsUp data-icon="inline-start" /> Admire
            </Button>
            <Button size="sm" variant="outline" onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success("Link copied"); }}>
              <Share2 data-icon="inline-start" /> Share
            </Button>
            <Button size="sm" variant="outline" onClick={() => toast("Choose a collection under Collections → open it to shelve this film.")}>
              <BookmarkPlus data-icon="inline-start" /> Shelve
            </Button>
          </span>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="font-display text-lg">Programme notes</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{video.description}</p>
        </div>

        <section className="flex flex-col gap-4">
          <h2 className="font-display text-xl">Correspondence ({comments?.length ?? 0})</h2>
          {user ? (
            <form
              className="flex flex-col gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!draft.trim() || !id) return;
                addComment.mutateAsync({ videoId: id, comment: draft.trim() }).then(() => { setDraft(""); toast.success("Letter posted"); }).catch((err) => toast.error(apiErrorMessage(err)));
              }}
            >
              <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Write a thoughtful note…" aria-label="Add a comment" />
              <Button type="submit" size="sm" className="self-end" disabled={addComment.isPending || !draft.trim()}>Post note</Button>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground"><Link to="/login" className="underline">Sign in</Link> to join the correspondence.</p>
          )}
          <div className="flex flex-col gap-4">
            {(comments ?? []).map((c) => {
              const o = typeof c.owner === "object" ? c.owner : null;
              const mine = user && o && o._id === user._id;
              return (
                <div key={c._id} className="flex gap-3">
                  <Avatar src={o?.avatar} name={o?.fullname ?? "Reader"} className="size-8" />
                  <div className="flex-1 rounded-xl border border-border bg-card p-3">
                    <p className="text-xs text-muted-foreground">@{o?.username} · {new Date(c.createdAt).toLocaleDateString()}</p>
                    <p className="mt-1 text-sm">{c.comment}</p>
                    {mine ? (
                      <Button size="sm" variant="ghost" className="mt-1 h-7 px-2 text-xs" onClick={() => delComment.mutateAsync(c._id).catch((e) => toast.error(apiErrorMessage(e)))}>Remove</Button>
                    ) : null}
                  </div>
                </div>
              );
            })}
            {(comments ?? []).length === 0 ? <p className="text-sm text-muted-foreground">No letters yet. Begin the correspondence.</p> : null}
          </div>
        </section>
      </div>

      <aside className="flex flex-col gap-4">
        <p className="font-display text-lg">Up next</p>
        <Separator />
        {(upNext ?? []).filter((v) => v._id !== id).slice(0, 6).map((v) => (
          <VideoCard key={v._id} video={v} />
        ))}
      </aside>
    </div>
  );
}

// local hook alias to keep imports tidy
import { useComments } from "@/api/use-social";
function require_comments(id?: string) {
  return useComments(id);
}
