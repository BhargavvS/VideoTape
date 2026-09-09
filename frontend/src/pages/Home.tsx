import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
import { useVideos } from "@/api/use-catalog";
import { VideoCard, VideoGridSkeleton } from "@/components/video/VideoCard";
import { Empty } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FILTERS = ["All", "Music", "Gaming", "Live", "Podcasts", "Design"] as const;

export default function Home() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const q = params.get("q") ?? "";
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const { data: videos, isLoading, isError, refetch } = useVideos({ query: q || undefined, limit: 24 });

  const list = useMemo(() => videos ?? [], [videos]);

  return (
    <div className="flex flex-col gap-6">
      {/* Resend-style hero: mono eyebrow, tight mega-type, dual CTA */}
      {!q && (
        <section className="relative overflow-hidden rounded-lg border border-white/[0.08] bg-[#0a0a0a]">
          <div className="bg-grid bg-grid-fade pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative flex flex-col gap-4 p-6 sm:p-10">
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[#737373]">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
              </span>
              Video infrastructure for creators
            </p>
            <h1 className="text-balance max-w-2xl text-3xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-5xl">
              Upload once.
              <br />
              Stream everywhere.
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-[#a1a1a1] sm:text-[15px]">
              A sharp, black-and-white home for your films. Publish from the Studio, build
              playlists, and keep every view.
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Button onClick={() => navigate("/studio")}>
                Start uploading <ArrowRight data-icon="inline-end" />
              </Button>
              <Button variant="outline" onClick={() => navigate("/library")}>
                <Play data-icon="inline-start" /> Browse library
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap gap-6 border-t border-white/[0.08] pt-4">
              {[
                ["99.99%", "uptime"],
                ["4K", "max quality"],
                ["<50ms", "global edge"],
              ].map(([v, l]) => (
                <div key={l} className="flex flex-col gap-0.5">
                  <span className="text-lg font-semibold tracking-tight">{v}</span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#525252]">{l}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filters">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "h-8 rounded-lg border px-3 text-[13px] transition-all duration-150 active:scale-[0.97]",
              filter === f
                ? "border-transparent bg-white font-medium text-black"
                : "border-white/[0.08] bg-white/[0.04] text-[#a1a1a1] hover:border-white/20 hover:text-white"
            )}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto hidden font-mono text-[11px] uppercase tracking-[0.12em] text-[#525252] sm:block">
          {q ? `Results for "${q}"` : `${list.length} videos`}
        </span>
      </div>

      {isLoading ? (
        <VideoGridSkeleton />
      ) : isError ? (
        <Empty title="Stream interrupted" hint="Could not reach the backend. Check VITE_API_URL and try again." />
      ) : list.length === 0 ? (
        <Empty title={q ? "No results found" : "No videos yet"} hint={q ? "Try another title or channel." : "Publish the first video from the Studio."} />
      ) : (
        <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((v) => (
            <VideoCard key={v._id} video={v} />
          ))}
        </div>
      )}
      {isError ? <Button variant="outline" onClick={() => refetch()}>Retry</Button> : null}
    </div>
  );
}
