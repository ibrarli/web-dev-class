'use client';

import { useState, useRef, useEffect } from 'react';
import { Comment, ReactionType } from '../types';

interface Props {
  comment: Comment & {
    user_reaction?: ReactionType;
    reaction_count?: number;
  };
  currentUserId: number;
  isPostOwner: boolean;
  onUpdate: (commentId: number, content: string) => void;
  onDelete: (commentId: number) => void;
  onRefreshComments?: () => void;
}

const REACTION_CONFIG: Record<ReactionType, { label: string; icon: string; color: string }> = {
  like: { label: 'Like', icon: '👍', color: 'text-blue-600' },
  love: { label: 'Love', icon: '❤️', color: 'text-red-500' },
  haha: { label: 'Haha', icon: '😂', color: 'text-yellow-500' },
  wow: { label: 'Wow', icon: '😮', color: 'text-yellow-500' },
  sad: { label: 'Sad', icon: '😢', color: 'text-yellow-600' },
  angry: { label: 'Angry', icon: '😡', color: 'text-orange-600' },
};

export default function CommentItem({
  comment,
  currentUserId,
  isPostOwner,
  onUpdate,
  onDelete,
  onRefreshComments,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [showReactions, setShowReactions] = useState(false);

  // Local optimistic state for reaction
  const [localReaction, setLocalReaction] = useState<ReactionType | null | undefined>(
    comment.user_reaction
  );

  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync local reaction when parent props change
  useEffect(() => {
    setLocalReaction(comment.user_reaction);
  }, [comment.user_reaction]);

  const isCommentOwner = comment.user_id === currentUserId;
  const canDelete = isCommentOwner || isPostOwner;

  // Resolve current active reaction configuration safely
  const currentReactionType = localReaction ?? comment.user_reaction;
  const activeReaction = currentReactionType && REACTION_CONFIG[currentReactionType]
    ? REACTION_CONFIG[currentReactionType]
    : null;

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => setShowReactions(true), 200);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => setShowReactions(false), 300);
  };

  const handlePopoverMouseEnter = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
  };

  const handleSave = () => {
    if (!editText.trim()) return;
    onUpdate(comment.id, editText);
    setIsEditing(false);
  };

  const handleToggleReaction = async (selectedType: ReactionType) => {
    setShowReactions(false);

    // Optimistic UI update
    const updatedReaction = localReaction === selectedType ? null : selectedType;
    setLocalReaction(updatedReaction);

    try {
      const res = await fetch('/api/comment-reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          commentId: comment.id, 
          reactionType: selectedType 
        }),
      });

      if (res.ok && onRefreshComments) {
        onRefreshComments();
      }
    } catch (err) {
      // Revert state if request failed
      setLocalReaction(comment.user_reaction);
      console.error('Failed to save reaction', err);
    }
  };

  return (
    <div className="p-2 border rounded text-sm relative bg-black/5">
      <div className="flex justify-between items-center mb-1">
        <span className="font-semibold text-xs">{comment.author_name}</span>
        <div className="flex gap-2 text-xs">
          {isCommentOwner && !isEditing && (
            <button onClick={() => setIsEditing(true)} className="text-blue-600 hover:underline">
              Edit
            </button>
          )}
          {canDelete && (
            <button onClick={() => onDelete(comment.id)} className="text-red-600 hover:underline">
              Delete
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="flex gap-2 mt-1">
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="border p-1 rounded text-xs flex-1"
          />
          <button onClick={handleSave} className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs">
            Save
          </button>
          <button onClick={() => setIsEditing(false)} className="bg-gray-300 px-2 py-0.5 rounded text-xs">
            Cancel
          </button>
        </div>
      ) : (
        <p className="mb-2 text-grey-300">{comment.content}</p>
      )}

      {/* Comment Reaction Section */}
      <div className="relative inline-block mt-1">
        {showReactions && (
          <div
            onMouseEnter={handlePopoverMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="absolute -top-10 left-0 bg-white border border-gray-200 shadow-xl rounded-full px-2 py-1 flex gap-1.5 z-30"
          >
            {(Object.keys(REACTION_CONFIG) as ReactionType[]).map((type) => (
              <button
                key={type}
                onClick={() => handleToggleReaction(type)}
                className="text-lg transform hover:scale-125 transition-transform duration-100 ease-out"
                title={REACTION_CONFIG[type].label}
              >
                {REACTION_CONFIG[type].icon}
              </button>
            ))}
          </div>
        )}

        <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          <button
            onClick={() => handleToggleReaction(currentReactionType || 'like')}
            className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded hover:bg-gray-100 transition-colors ${
              activeReaction ? activeReaction.color : 'text-grey-300'
            }`}
          >
            <span>{activeReaction ? activeReaction.icon : '👍'}</span>
            <span>{activeReaction ? activeReaction.label : 'Like'}</span>
            {Boolean(comment.reaction_count) && (
              <span className="text-grey-300 text-[10px] ml-0.5">({comment.reaction_count})</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}