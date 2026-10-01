'use client';

import Image from 'next/image';
import { CldUploadWidget, CloudinaryUploadWidgetResults } from 'next-cloudinary';
import { PostVisibility } from '../types';

interface Props {
  title: string;
  content: string;
  visibility: PostVisibility;
  isEditing: boolean;
  mediaUrl?: string;                            // <-- Add this
  mediaType?: 'image' | 'video';                 // <-- Add this
  setTitle: (val: string) => void;
  setContent: (val: string) => void;
  setVisibility: (val: PostVisibility) => void;
  setMediaUrl: (val: string | undefined) => void;       // <-- Add this
  setMediaType: (val: 'image' | 'video' | undefined) => void; // <-- Add this
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}


export default function PostForm({
  title,
  content,
  visibility,
  isEditing,
  mediaUrl,
  mediaType,
  setTitle,
  setContent,
  setVisibility,
  setMediaUrl,
  setMediaType,
  onSubmit,
  onCancel,
}: Props) {
  const handleUploadSuccess = (result: CloudinaryUploadWidgetResults) => {
    if (typeof result.info === 'object' && result.info?.secure_url) {
      setMediaUrl(result.info.secure_url);
      setMediaType(result.info.resource_type === 'video' ? 'video' : 'image');
    }
  };

  return (
    <form onSubmit={onSubmit} className="p-4 rounded-lg border mb-8 flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold">{isEditing ? 'Edit Post' : 'Create a Post'}</h2>

        {/* Visibility Selector */}
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <label htmlFor="visibility-select" className="font-medium">
            Who can see this?
          </label>
          <select
            id="visibility-select"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as PostVisibility)}
            className="p-1 border rounded bg-white text-xs"
          >
            <option value="everyone">🌐 Everyone</option>
            <option value="friends">👥 Friends Only</option>
            <option value="no_one">🔒 Only Me</option>
          </select>
        </div>
      </div>

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="p-2 border rounded text-sm"
      />

      <textarea
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        rows={3}
        className="p-2 border rounded text-sm resize-none"
      />

      {/* Cloudinary Media Preview */}
      {mediaUrl && (
        <div className="relative border rounded-lg p-2 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            {mediaType === 'video' ? (
              <video src={mediaUrl} className="w-16 h-16 object-cover rounded bg-black" />
            ) : (
              <div className="relative w-16 h-16 flex-shrink-0">
                <Image src={mediaUrl} alt="Uploaded media" fill className="object-cover rounded" />
              </div>
            )}
            <div className="text-xs truncate">
              <p className="font-medium text-gray-700">
                {mediaType === 'video' ? '📹 Video Attached' : '🖼️ Image Attached'}
              </p>
              <p className="text-gray-400 truncate max-w-[200px]">{mediaUrl}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setMediaUrl(undefined);
              setMediaType(undefined);
            }}
            className="text-xs text-red-500 hover:text-red-700 border border-red-200 px-2 py-1 rounded bg-white hover:bg-red-50 transition"
          >
            Remove
          </button>
        </div>
      )}

      {/* Action Buttons & Upload Widget */}
      <div className="flex justify-between items-center pt-1">
        <CldUploadWidget
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
          onSuccess={handleUploadSuccess}
        >
          {({ open }) => (
            <button
              type="button"
              onClick={() => open()}
              className="border px-3 py-1.5 rounded text-xs font-medium hover:bg-gray-50 transition flex items-center gap-1.5"
            >
              📷 Add Photo/Video
            </button>
          )}
        </CldUploadWidget>

        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded text-xs font-medium"
          >
            {isEditing ? 'Update Post' : 'Publish Post'}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-300 hover:bg-gray-400 px-4 py-1.5 rounded text-xs font-medium"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </form>
  );
}