import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, normalize } from "@/lib/api-client";
import type { CommentItem, Playlist, Tweet } from "@/lib/types";

// Comments
export function useComments(videoId?: string) {
  return useQuery({
    queryKey: ["comments", videoId],
    enabled: !!videoId,
    queryFn: async (): Promise<CommentItem[]> => {
      const { data } = await api.get(`/comments/${videoId}`);
      const payload = normalize<unknown>(data);
      if (Array.isArray(payload)) return payload as CommentItem[];
      if (payload && typeof payload === "object" && Array.isArray((payload as { docs?: unknown }).docs)) {
        return (payload as { docs: CommentItem[] }).docs;
      }
      return [];
    },
  });
}

export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { videoId: string; comment: string }) => {
      const { data } = await api.post(`/comments/${input.videoId}`, { comment: input.comment });
      return normalize<CommentItem>(data);
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ["comments", v.videoId] }),
  });
}

export function useUpdateComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; comment: string }) => {
      const { data } = await api.patch(`/comments/c/${input.id}`, { comment: input.comment });
      return normalize(data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comments"] }),
  });
}

export function useDeleteComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/comments/c/${id}`);
      return normalize(data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comments"] }),
  });
}

// Tweets
export function useUserTweets(userId?: string) {
  return useQuery({
    queryKey: ["tweets", userId],
    enabled: !!userId,
    queryFn: async (): Promise<Tweet[]> => {
      const { data } = await api.get(`/tweets/user/${userId}`);
      const payload = normalize<unknown>(data);
      return Array.isArray(payload) ? (payload as Tweet[]) : [];
    },
  });
}

export function useCreateTweet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      const { data } = await api.post("/tweets", { content });
      return normalize<Tweet>(data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tweets"] }),
  });
}

export function useDeleteTweet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/tweets/${id}`);
      return normalize(data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tweets"] }),
  });
}

// Playlists
export function useUserPlaylists(userId?: string) {
  return useQuery({
    queryKey: ["playlists", userId],
    enabled: !!userId,
    queryFn: async (): Promise<Playlist[]> => {
      const { data } = await api.get(`/playlist/user/${userId}`);
      const payload = normalize<unknown>(data);
      return Array.isArray(payload) ? (payload as Playlist[]) : [];
    },
  });
}

export function usePlaylist(id?: string) {
  return useQuery({
    queryKey: ["playlist", id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await api.get(`/playlist/${id}`);
      return normalize<Playlist>(data);
    },
  });
}

export function useCreatePlaylist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; description: string }) => {
      const { data } = await api.post("/playlist", input);
      return normalize<Playlist>(data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["playlists"] }),
  });
}

export function usePlaylistMutation() {
  const qc = useQueryClient();
  return {
    add: useMutation({
      mutationFn: async (input: { videoId: string; playlistId: string }) => {
        const { data } = await api.patch(`/playlist/add/${input.videoId}/${input.playlistId}`);
        return normalize(data);
      },
      onSuccess: () => qc.invalidateQueries({ queryKey: ["playlists"] }),
    }),
    remove: useMutation({
      mutationFn: async (input: { videoId: string; playlistId: string }) => {
        const { data } = await api.patch(`/playlist/remove/${input.videoId}/${input.playlistId}`);
        return normalize(data);
      },
      onSuccess: () => qc.invalidateQueries({ queryKey: ["playlists"] }),
    }),
  };
}
