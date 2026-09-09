import { Link } from "react-router-dom";
import { Avatar, Skeleton } from "@/components/ui/primitives";
import { Badge } from "@/components/ui/primitives";
import type { Video } from "@/lib/types";

function ownerName(v: Video): string {
  return typeof v.owner === "object" ? v.owner.fullname || v.owner.username : "Channel";
}
function ownerAvatar(v: Video): string | undefined {
  return typeof v.owner === "object" ? v.owner.avatar : undefined;
}
function ownerId(v: Video): string {
  return typeof v.owner === "object" ? v.owner._id : String(v.owner);
}

export function VideoCard({ video }: { video: Video }) {
  return (
    <Link to={`/watch/${video._id}`} className="group flex flex-col gap-3 outline-none">
      <span className="relative block overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.03] transition-all duration-200 group-hover:border-white/20 group-hover:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_32px_rgba(0,0,0,0.6)] group-focus-visible:ring-2 group-focus-visible:ring-white/30">
        <span className="block aspect-video w-full">
          {video.thumbnail ? (
            <img src={video.thumbnail} alt={video.title} className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" loading="lazy" />
          ) : null}
        </span>
        <span className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" aria-hidden />
        {video.duration ? (
          <Badge className="absolute bottom-2 right-2 border-transparent bg-black/85 font-mono text-white">{formatDuration(video.duration)}</Badge>
        ) : null}
      </span>
      <span className="flex gap-2.5">
        <Avatar src={ownerAvatar(video)} name={ownerName(video)} className="size-8" />
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-[13.5px] font-medium leading-snug tracking-tight group-hover:text-white">{video.title}</span>
          <span className="truncate text-xs text-[#737373]">
            {ownerName(video)} · {video.views ?? 0} views
          </span>
          <span className="hidden text-xs text-muted-foreground">Owner: {ownerId(video)}</span>
        </span>
      </span>
    </Link>
  );
}

export function VideoGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <Skeleton className="aspect-video w-full rounded-lg" />
          <div className="flex gap-2.5">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function formatDuration(sec: number): string {
  if (!sec || Number.isNaN(sec)) return "";
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
