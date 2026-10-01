'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Post, Comment, ReactionUser, PostVisibility, ReactionType, REACTION_EMOJIS } from '../types';
import CommentSection from './CommentSection';
import LikesModal from './LikesModal';

interface Props {
  post: Post;
  currentUserId: number;
  comments: Comment[];
  isBookmarked?: boolean;
  onStartEdit: (post: Post) => void;
  onDeletePost: (postId: number) => void;
  onToggleReaction: (postId: number, reactionType: ReactionType) => void;
  onToggleBookmark?: (postId: number) => void;
  onAddComment: (postId: number, content: string) => void;
  onUpdateComment: (commentId: number, content: string) => void;
  onDeleteComment: (commentId: number) => void;
}

const visibilityLabels: Record<PostVisibility, string> = {
  everyone: '🌐 Everyone',
  friends: '👥 Friends',
  no_one: '🔒 Only Me',
};

const reactionKeys: ReactionType[] = ['like', 'love', 'haha', 'wow', 'sad', 'angry'];

export default function PostItem({
  post,
  currentUserId,
  comments,
  isBookmarked = false,
  onStartEdit,
  onDeletePost,
  onToggleReaction,
  onToggleBookmark,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
}: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const [isLikesModalOpen, setIsLikesModalOpen] = useState(false);
  const [likers, setLikers] = useState<ReactionUser[]>([]);
  const [isLoadingLikers, setIsLoadingLikers] = useState(false);
  const [bookmarked, setBookmarked] = useState(isBookmarked);

  const isPostOwner = post.user_id === currentUserId;
  const currentReaction = post.user_reaction ? REACTION_EMOJIS[post.user_reaction] : null;

  const handleOpenLikesModal = async () => {
    if (post.like_count === 0) return;
    setIsLikesModalOpen(true);
    setIsLoadingLikers(true);

    try {
      const res = await fetch(`/api/likes?postId=${post.id}`);
      if (res.ok) {
        setLikers(await res.json());
      }
    } catch {
      console.error('Failed to fetch reactions list');
    } finally {
      setIsLoadingLikers(false);
    }
  };

  const handleBookmarkClick = () => {
    setBookmarked(!bookmarked);
    if (onToggleBookmark) {
      onToggleBookmark(post.id);
    }
  };

  return (
    <div className="p-4 border rounded-xl space-y-3">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg">{post.title}</h3>
          <div className="flex items-center gap-2 text-xs">
            <span>By {post.author_name}</span>
            <span>•</span>
            <span className="border px-1.5 py-0.5 rounded text-[11px]">
              {visibilityLabels[post.visibility || 'everyone']}
            </span>
          </div>
        </div>

        {isPostOwner && (
          <div className="flex gap-2">
            <button
              onClick={() => onStartEdit(post)}
              className="border px-2 py-0.5 rounded text-xs font-medium"
            >
              Edit
            </button>
            <button
              onClick={() => onDeletePost(post.id)}
              className="border px-2 py-0.5 rounded text-xs font-medium"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      {post.content && <p className="whitespace-pre-wrap text-sm">{post.content}</p>}

      {/* Cloudinary Media Container */}
      {post.media_url && (
        <div className="relative w-full rounded-lg overflow-hidden border my-2 bg-black/5">
          {post.media_type === 'video' ? (
            <video
              src={post.media_url}
              controls
              className="w-full max-h-[500px] object-contain rounded-lg"
            />
          ) : (
            <div className="relative w-full h-[350px] sm:h-[450px]">
              <Image
                src={post.media_url}
                alt={post.title || 'Post image'}
                fill
                className="object-cover rounded-lg"
                sizes="(max-width: 768px) 100vw, 700px"
              />
            </div>
          )}
        </div>
      )}

      {/* Reaction & Actions Bar */}
      <div className="flex items-center justify-between border-t border-b py-2 text-xs relative">
        <div className="flex items-center gap-3">
          <div
            className="relative"
            onMouseEnter={() => setShowPicker(true)}
            onMouseLeave={() => setShowPicker(false)}
          >
            {/* Reaction Picker Popover */}
            {showPicker && (
              <div className="absolute bottom-full left-0 flex items-center gap-1 border rounded-full bg-white px-2 py-1 z-20">
                {reactionKeys.map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      onToggleReaction(post.id, key);
                      setShowPicker(false);
                    }}
                    title={REACTION_EMOJIS[key].label}
                    className="text-xl hover:scale-125 transition-transform duration-100 p-1"
                  >
                    {REACTION_EMOJIS[key].emoji}
                  </button>
                ))}
              </div>
            )}

            {/* Main Reaction Button */}
            <button
              onClick={() => onToggleReaction(post.id, post.user_reaction || 'like')}
              className={`flex items-center gap-1.5 font-medium border px-2.5 py-1 rounded transition-colors ${
                currentReaction ? 'border-2' : ''
              }`}
            >
              <span className="text-base">{currentReaction ? currentReaction.emoji : '👍'}</span>
              <span>{currentReaction ? currentReaction.label : 'Like'}</span>
            </button>
          </div>

          {/* Reaction Count Trigger */}
          {post.like_count > 0 && (
            <button
              onClick={handleOpenLikesModal}
              className="font-medium hover:underline"
            >
              {post.like_count} {post.like_count === 1 ? 'reaction' : 'reactions'}
            </button>
          )}
        </div>

        {/* Bookmark Button */}
        {onToggleBookmark && (
          <button
            onClick={handleBookmarkClick}
            className={`border px-2.5 py-1 rounded flex items-center gap-1.5 font-medium transition ${
              bookmarked ? 'border-2' : ''
            }`}
          >
            <span>{bookmarked ? '🔖 Saved' : '🔖 Save'}</span>
          </button>
        )}
      </div>

      {/* Embedded Comments */}
      <CommentSection
        postId={post.id}
        postOwnerId={post.user_id}
        comments={comments}
        currentUserId={currentUserId}
        onAddComment={onAddComment}
        onUpdateComment={onUpdateComment}
        onDeleteComment={onDeleteComment}
      />

      {/* Likes Modal */}
      <LikesModal
        isOpen={isLikesModalOpen}
        onClose={() => setIsLikesModalOpen(false)}
        likers={likers}
        isLoading={isLoadingLikers}
      />
    </div>
  );
}