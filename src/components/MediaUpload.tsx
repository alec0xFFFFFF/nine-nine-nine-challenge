'use client';

import { useState, useRef } from 'react';
import toast from 'react-hot-toast';

interface MediaUploadProps {
  eventCode: string;
  holeNumber?: number;
  onUploadComplete?: () => void;
}

export default function MediaUpload({ eventCode, holeNumber, onUploadComplete }: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File too large. Max size is 50MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      // Get presigned URL
      const mediaType = file.type.startsWith('video/') ? 'video' : 'photo';
      
      const res = await fetch(`/api/events/${eventCode}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileType: file.type,
          mediaType,
          caption,
          holeNumber
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      // Upload to R2 using presigned URL
      const uploadRes = await fetch(data.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      });

      if (!uploadRes.ok) {
        throw new Error('Upload failed');
      }

      toast.success(`${mediaType === 'video' ? 'Video' : 'Photo'} uploaded successfully!`);
      
      // Reset form
      setPreview(null);
      setCaption('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      onUploadComplete?.();
    } catch (error: any) {
      toast.error(error.message || 'Upload failed');
    }
    
    setUploading(false);
  };

  const handleCancel = () => {
    setPreview(null);
    setCaption('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {!preview ? (
        <div>
          <label className="block">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-blue-500 transition-colors">
              <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-gray-600 mb-1">📸 Upload Photo or Video</p>
              <p className="text-xs text-gray-500">Max 50MB</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            {preview.startsWith('data:video') ? (
              <video
                src={preview}
                controls
                className="w-full rounded-lg max-h-64 object-contain bg-black"
              />
            ) : (
              <img
                src={preview}
                alt="Preview"
                className="w-full rounded-lg max-h-64 object-contain"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Caption (Optional)</label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full p-2 border rounded-lg"
              placeholder={holeNumber ? `Hole ${holeNumber} action!` : "Living my best 9/9/9 life!"}
              disabled={uploading}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1 bg-blue-600 text-white p-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
            <button
              onClick={handleCancel}
              disabled={uploading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}