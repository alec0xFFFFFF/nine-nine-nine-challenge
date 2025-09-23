import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth-v2';
import { generateUploadUrl } from '@/lib/r2';
import { saveMediaUpload, getEventByCode } from '@/lib/db-v2';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventCode: string }> }
) {
  const { eventCode } = await params;
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const event = await getEventByCode(eventCode);
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    const { fileType, mediaType, caption, holeNumber } = await request.json();
    
    if (!fileType || !mediaType) {
      return NextResponse.json(
        { error: 'File type and media type are required' },
        { status: 400 }
      );
    }
    
    // Generate presigned URL for upload
    const { uploadUrl, key, publicUrl } = await generateUploadUrl(
      event.id,
      fileType,
      mediaType
    );
    
    // Save media record (will be completed after actual upload)
    await saveMediaUpload(
      event.id,
      user.userId,
      null, // Will be set if user is participant
      mediaType,
      key,
      publicUrl,
      undefined,
      caption,
      holeNumber
    );
    
    return NextResponse.json({ 
      uploadUrl,
      publicUrl,
      key
    });
  } catch (error: any) {
    console.error('Upload URL generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}