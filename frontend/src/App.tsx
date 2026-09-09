import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AppShell, RequireAuth } from "@/components/layout/AppShell";
import { useAuth } from "@/stores/auth-store";
import Home from "@/pages/Home";
import Watch from "@/pages/Watch";
import Channel from "@/pages/Channel";
import Studio from "@/pages/Studio";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import { Playlists, PlaylistDetail } from "@/pages/Playlists";
import { History, Library, Liked, Subscriptions, Tweets } from "@/pages/Library";
import Settings from "@/pages/Settings";

const qc = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30_000 } },
});

function PlaylistDetailRoute() {
  const { id } = useParams();
  return <PlaylistDetail id={id ?? ""} />;
}

function Bootstrap({ children }: { children: React.ReactNode }) {
  const fetchMe = useAuth((s) => s.fetchMe);
  useEffect(() => {
    fetchMe();
  }, [fetchMe]);
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Bootstrap>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<Home />} />
              <Route path="watch/:id" element={<Watch />} />
              <Route path="c/:username" element={<Channel />} />
              <Route path="tweets" element={<Tweets />} />
              <Route path="playlists" element={<RequireAuth><Playlists /></RequireAuth>} />
              <Route path="playlists/:id" element={<RequireAuth><PlaylistDetailRoute /></RequireAuth>} />
              <Route path="liked" element={<RequireAuth><Liked /></RequireAuth>} />
              <Route path="history" element={<RequireAuth><History /></RequireAuth>} />
              <Route path="subscriptions" element={<RequireAuth><Subscriptions /></RequireAuth>} />
              <Route path="library" element={<Library />} />
              <Route path="studio" element={<RequireAuth><Studio /></RequireAuth>} />
              <Route path="settings" element={<RequireAuth><Settings /></RequireAuth>} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Bootstrap>
      </BrowserRouter>
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  );
}
