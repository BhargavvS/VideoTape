import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, normalize, toFormData } from "@/lib/api-client";
import type { ChannelDetails, User, Video } from "@/lib/types";

// ---------- Videos ----------
export interface VideoQuery {
  page?: number;
  limit?: number;
  query?: string;
  sortBy?: string;
  sortType?: "asc" | "desc";
  userId?: string;
}

export function useVideos(params: VideoQuery = {}) {
  return useQuery({
    queryKey: ["videos", params],
    queryFn: async (): Promise<Video[]> => {
      const { data } = await api.get("/videos", { params });
      const payload = normalize<unknown>(data);
      if (Array.isArray(payload)) return payload as Video[];
      if (payload && typeof payload === "object") {
        const p = payload as Record<string, unknown>;
        if (Array.isArray(p.docs)) return p.docs as Video[];
        if (Array.isArray(p.videos)) return p.videos as Video[];
      }
      return [];
    },
  });
}

export function useVideo(id?: string) {
  return useQuery({
    queryKey: ["video", id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await api.get(`/videos/${id}`);
      return normalize<Video>(data);
    },
  });
}

export function usePublishVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { title: string; description: string; videoFile: File; thumbnail: File }) => {
      const { data } = await api.post(
        "/videos",
        toFormData({ title: input.title, description: input.description, videoFile: input.videoFile, thumbnail: input.thumbnail }),
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return normalize<Video>(data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["videos"] }),
  });
}

export function useUpdateVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; title: string; description: string; thumbnail?: string }) => {
      const { data } = await api.patch(`/videos/${input.id}`, {
        title: input.title,
        description: input.description,
        thumbnail: input.thumbnail,
      });
      return normalize<Video>(data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["videos"] }),
  });
}

export function useTogglePublish() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/videos/toggle/publish/${id}`);
      return normalize<Video>(data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["videos"] }),
  });
}

// ---------- Likes ----------
export function useToggleLike(kind: "v" | "c" | "t") {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/likes/toggle/${kind}/${id}`);
      return normalize(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["video"] });
      qc.invalidateQueries({ queryKey: ["liked"] });
    },
  });
}

export function useLikedVideos() {
  return useQuery({
    queryKey: ["liked"],
    queryFn: async (): Promise<Video[]> => {
      const { data } = await api.get("/likes/videos");
      const payload = normalize<unknown>(data);
      return Array.isArray(payload) ? (payload as Video[]) : [];
    },
  });
}

// ---------- Channel / subscriptions ----------
export function useChannel(username?: string) {
  return useQuery({
    queryKey: ["channel", username],
    enabled: !!username,
    queryFn: async () => {
      const { data } = await api.get(`/users/c/${username}`);
      return normalize<ChannelDetails>(data);
    },
  });
}

export function useToggleSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (channelId: string) => {
      const { data } = await api.post(`/subscriptions/c/${channelId}`);
      return normalize(data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["channel"] }),
  });
}

// ---------- Dashboard ----------
export function useChannelStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const { data } = await api.get("/dashboard/stats");
      return normalize<Record<string, unknown>>(data);
    },
  });
}

export function useChannelVideos() {
  return useQuery({
    queryKey: ["studio-videos"],
    queryFn: async (): Promise<Video[]> => {
      const { data } = await api.get("/dashboard/videos");
      const payload = normalize<unknown>(data);
      return Array.isArray(payload) ? (payload as Video[]) : [];
    },
  });
}

// ---------- Me ----------
export function useWatchHistory() {
  return useQuery({
    queryKey: ["history"],
    queryFn: async (): Promise<Video[]> => {
      const { data } = await api.get("/users/history");
      const payload = normalize<unknown>(data);
      if (Array.isArray(payload)) {
        const first = payload[0];
        if (Array.isArray(first)) return first as Video[];
        return payload as Video[];
      }
      return [];
    },
  });
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: async (input: { fullname: string; email: string }) => {
      const { data } = await api.patch("/users/update-user", input);
      return normalize<{ user: User }>(data);
    },
  });
}
