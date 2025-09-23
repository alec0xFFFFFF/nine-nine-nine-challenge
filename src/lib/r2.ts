import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { nanoid } from 'nanoid';

// Cloudflare R2 configuration
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || '';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || '';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '';
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'nine-nine-nine';
const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export async function generateUploadUrl(
  eventId: string,
  fileType: string,
  mediaType: 'photo' | 'video'
): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
  const extension = fileType.split('/')[1] || 'jpg';
  const key = `events/${eventId}/${mediaType}s/${nanoid()}.${extension}`;
  
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: fileType,
  });
  
  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
  const publicUrl = `${R2_PUBLIC_URL}/${key}`;
  
  return { uploadUrl, key, publicUrl };
}

export async function uploadToR2(
  file: File,
  eventId: string,
  mediaType: 'photo' | 'video'
): Promise<{ key: string; publicUrl: string }> {
  const extension = file.name.split('.').pop() || 'jpg';
  const key = `events/${eventId}/${mediaType}s/${nanoid()}.${extension}`;
  
  const buffer = await file.arrayBuffer();
  
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: new Uint8Array(buffer),
    ContentType: file.type,
  });
  
  await r2Client.send(command);
  
  const publicUrl = `${R2_PUBLIC_URL}/${key}`;
  
  return { key, publicUrl };
}

export function getPublicUrl(key: string): string {
  return `${R2_PUBLIC_URL}/${key}`;
}

// Generate thumbnail for videos
export async function generateVideoThumbnail(videoFile: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    video.addEventListener('loadeddata', () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      video.currentTime = 1; // Capture at 1 second
    });
    
    video.addEventListener('seeked', () => {
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to generate thumbnail'));
          }
        }, 'image/jpeg');
      }
    });
    
    video.addEventListener('error', reject);
    
    video.src = URL.createObjectURL(videoFile);
    video.load();
  });
}