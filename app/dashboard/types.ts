export type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';

export const REACTION_EMOJIS: Record<ReactionType, { emoji: string; label: string; color: string }> = {
  like: { emoji: '👍', label: 'Like', color: 'text-blue-600' },
  love: { emoji: '❤️', label: 'Love', color: 'text-red-500' },
  haha: { emoji: '😂', label: 'Haha', color: 'text-yellow-500' },
  wow: { emoji: '😮', label: 'Wow', color: 'text-yellow-500' },
  sad: { emoji: '😢', label: 'Sad', color: 'text-yellow-500' },
  angry: { emoji: '😡', label: 'Angry', color: 'text-orange-600' },
};

export interface User {
  id: number;
  name: string;
  username: string;
  bio?: string;
  avatar_url?: string;
  created_at?: string;
}

export interface ProfileData {
  user: User;
  post_count: number;
  friend_count: number;
  is_self: boolean;
  friendship_status: FriendshipStatus;
  friendship_id?: number;
}

export interface ReactionUser extends User {
  reaction_type: ReactionType;
}

export type FriendshipStatus = 'none' | 'pending_sent' | 'pending_received' | 'accepted';

export interface UserWithFriendStatus {
  id: number;
  name: string;
  username: string;
  friendshipId?: number;
  status: FriendshipStatus;
}

export type PostVisibility = 'everyone' | 'friends' | 'no_one';

export interface Post {
  id: number;
  user_id: number;
  title: string;
  content: string;
  author_name?: string;
  visibility?: PostVisibility;
  like_count: number;
  user_reaction?: ReactionType | null;
  is_bookmarked?: boolean;      // <-- Add this
  media_url?: string;           // <-- Add this
  media_type?: 'image' | 'video'; // <-- Add this
}

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  author_name: string;
  created_at: string;
}
