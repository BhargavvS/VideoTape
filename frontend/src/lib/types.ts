export interface User {
  _id: string;
  username: string;
  email: string;
  fullname: string;
  avatar: string;
  coverImage?: string;
  createdAt?: string;
}

export interface VideoOwner extends Pick<User, "_id" | "username" | "fullname" | "avatar"> {}

export interface Video {
  _id: string;
  videoFile: string;
  thumbnail: string;
  owner: VideoOwner | string;
  title: string;
  description: string;
  duration: number;
  views: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommentItem {
  _id: string;
  comment: string;
  video: string;
  owner: VideoOwner | string;
  createdAt: string;
}

export interface Tweet {
  _id: string;
  content: string;
  owner: VideoOwner | string;
  createdAt: string;
}

export interface Playlist {
  _id: string;
  name: string;
  description: string;
  video?: string | Video;
  videos?: Video[];
  owner: VideoOwner | string;
  createdAt: string;
}

export interface ChannelDetails extends User {
  subscriberCount: number;
  subscribedToCount: number;
  isSubscribed: boolean;
}

export interface DashboardStats {
  totalViews?: number;
  totalSubscribers?: number;
  totalVideos?: number;
  totalLikes?: number;
  [key: string]: unknown;
}

export interface Paginated<T> {
  docs: T[];
  totalDocs: number;
  page: number;
  limit: number;
}
