import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Clapperboard,
  History,
  House,
  Library,
  ListVideo,
  LogOut,
  MessageSquareText,
  Play,
  Plus,
  Search,
  Settings,
  ThumbsUp,
  Users,
} from "lucide-react";
import { useAuth } from "@/stores/auth-store";
import { Avatar, Separator } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* Classic, instantly-recognizable names — no metaphors. */
const GROUPS: {
  label: string;
  items: { to: string; label: string; icon: typeof House; hint?: string }[];
}[] = [
  {
    label: "Browse",
    items: [
      { to: "/", label: "Home", icon: House },
      { to: "/subscriptions", label: "Subscriptions", icon: Users },
      { to: "/history", label: "History", icon: History },
    ],
  },
  {
    label: "Library",
    items: [
      { to: "/playlists", label: "Playlists", icon: ListVideo },
      { to: "/liked", label: "Liked videos", icon: ThumbsUp },
      { to: "/library", label: "My library", icon: Library },
      { to: "/tweets", label: "Posts", icon: MessageSquareText },
    ],
  },
  {
    label: "Create",
    items: [
      { to: "/studio", label: "Studio", icon: Clapperboard, hint: "Upload" },
      { to: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

const MOBILE_NAV = [
  { to: "/", label: "Home", icon: House },
  { to: "/subscriptions", label: "Subs", icon: Users },
  { to: "/studio", label: "Create", icon: Plus },
  { to: "/library", label: "Library", icon: Library },
  { to: "/settings", label: "You", icon: Settings },
];

function SideLink({ to, label, icon: Icon, hint, end }: { to: string; label: string; icon: typeof House; hint?: string; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "group relative flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] transition-all duration-150",
          isActive
            ? "bg-white/[0.08] font-medium text-white"
            : "text-[#a1a1a1] hover:bg-white/[0.04] hover:text-white active:scale-[0.99]"
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              "absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-white transition-all duration-200",
              isActive ? "opacity-100" : "opacity-0 group-hover:opacity-30"
            )}
            aria-hidden
          />
          <Icon
            className={cn(
              "size-4 shrink-0 transition-colors",
              isActive ? "text-white" : "text-[#737373] group-hover:text-white"
            )}
          />
          <span className="truncate">{label}</span>
          {hint ? (
            <span className="ml-auto hidden font-mono text-[10px] uppercase tracking-wider text-[#525252] group-hover:text-[#737373] xl:block">
              {hint}
            </span>
          ) : isActive ? (
            <span className="ml-auto size-1 rounded-full bg-white" aria-hidden />
          ) : null}
        </>
      )}
    </NavLink>
  );
}

export function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [q, setQ] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  // Auth pages get a clean, centered layout. The sidebar appears once signed in.
  const isAuthRoute = location.pathname === "/login" || location.pathname === "/register";
  const showSidebar = !!user && !isAuthRoute;

  // Resend-style command hint: "/" or Cmd+K focuses search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(q ? `/?q=${encodeURIComponent(q)}` : "/");
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-[#fafafa]">
      {/* faint grid wash, Resend-style */}
      <div className="bg-grid bg-grid-fade pointer-events-none absolute inset-x-0 top-0 h-[420px]" aria-hidden />

      <header className="sticky top-0 z-20 border-b border-white/[0.08] bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-3 px-4">
          <Link to="/" className="group flex shrink-0 items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-md bg-white text-black transition-transform duration-200 group-hover:scale-105">
              <Play className="size-3.5 fill-current" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight">streamhouse</span>
            <span className="rounded border border-white/10 bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-wider text-[#a1a1a1]">
              BETA
            </span>
          </Link>

          <form
            onSubmit={submitSearch}
            className="group mx-auto hidden w-full max-w-md items-center sm:flex"
            role="search"
          >
            <div className="flex h-8 w-full items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 transition-colors focus-within:border-white/25 focus-within:bg-white/[0.06] hover:border-white/[0.14]">
              <Search className="size-3.5 shrink-0 text-[#737373]" />
              <input
                ref={searchRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search videos, channels…"
                aria-label="Search videos"
                className="w-full bg-transparent text-[13px] outline-none placeholder:text-[#525252]"
              />
              <kbd className="kbd hidden shrink-0 lg:block">/</kbd>
            </div>
          </form>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <span className="mr-1 hidden items-center gap-1.5 font-mono text-[11px] text-[#737373] lg:flex">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
              </span>
              OPERATIONAL
            </span>
            {user ? (
              <>
                <Button size="sm" onClick={() => navigate("/studio")}>
                  <Plus data-icon="inline-start" /> Upload
                </Button>
                <Link
                  to="/settings"
                  aria-label="Settings"
                  className="rounded-full outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-white/30"
                >
                  <Avatar src={user.avatar} name={user.fullname || user.username} className="size-8" />
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Sign out"
                  onClick={() => logout().then(() => navigate("/login"))}
                >
                  <LogOut />
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                  Sign in
                </Button>
                <Button size="sm" onClick={() => navigate("/register")}>
                  Get started
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="px-4 pb-2.5 sm:hidden">
          <div className="flex h-9 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3">
            <Search className="size-3.5 shrink-0 text-[#737373]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  navigate(q ? `/?q=${encodeURIComponent(q)}` : "/");
                }
              }}
              placeholder="Search…"
              aria-label="Search"
              className="w-full bg-transparent text-[13px] outline-none placeholder:text-[#525252]"
            />
          </div>
        </div>
      </header>

      <div className="relative mx-auto flex max-w-[1440px] gap-0 px-0 sm:px-4">
        {/* Sidebar — only for signed-in users, hidden on auth pages */}
        {showSidebar ? (
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 overflow-y-auto border-r border-white/[0.08] py-5 pr-4 md:block">
          <nav className="flex flex-col gap-5" aria-label="Primary">
            {GROUPS.map((g) => (
              <div key={g.label} className="flex flex-col gap-0.5">
                <p className="px-2.5 pb-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-[#525252]">
                  {g.label}
                </p>
                {g.items.map((item) => (
                  <SideLink key={item.to + item.label} {...item} end={item.to === "/"} />
                ))}
              </div>
            ))}
          </nav>

          <Separator className="my-5" />

          <div className="rounded-lg border border-white/[0.08] bg-[#0a0a0a] p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#737373]">Creator</p>
            <p className="mt-1.5 text-[13px] font-medium tracking-tight">Ship your first video</p>
            <p className="mt-1 text-xs leading-relaxed text-[#a1a1a1]">
              Upload, publish, and track it from the Studio.
            </p>
            <Button size="sm" variant="outline" className="mt-3 w-full" onClick={() => navigate("/studio")}>
              <Clapperboard data-icon="inline-start" /> Open Studio
            </Button>
          </div>

          <p className="mt-5 px-2.5 font-mono text-[10px] leading-relaxed tracking-wider text-[#3f3f3f]">
            STREAMHOUSE © 2026
            <br />
            BUILT FOR CREATORS
          </p>
        </aside>
        ) : null}

        <main className="min-w-0 flex-1 px-4 py-6 pb-24 sm:px-6 md:pb-10">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav — only for signed-in users, hidden on auth pages */}
      {showSidebar ? (
      <nav
        className="fixed inset-x-0 bottom-0 z-20 border-t border-white/[0.08] bg-black/90 backdrop-blur-xl md:hidden"
        aria-label="Primary"
      >
        <div className="grid grid-cols-5">
          {MOBILE_NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={label}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] transition-colors",
                  isActive ? "text-white" : "text-[#737373]"
                )
              }
            >
              <Icon className="size-5" /> {label}
            </NavLink>
          ))}
        </div>
      </nav>
      ) : null}
    </div>
  );
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (ready && !user) navigate("/login", { replace: true });
  }, [ready, user, navigate]);
  if (!ready)
    return (
      <div className="flex items-center gap-3 p-8">
        <span className="size-3 animate-pulse rounded-full bg-white/40" />
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">Connecting…</p>
      </div>
    );
  if (!user) return null;
  return <>{children}</>;
}
