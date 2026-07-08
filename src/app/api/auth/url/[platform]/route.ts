import { NextRequest, NextResponse } from 'next/server';
import { getAuthUrl, hasAuthConfig } from '@/lib/auth';
import { Platform } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;
  const normalizedPlatform = platform as Platform;

  try {
    const authUrl = getAuthUrl(normalizedPlatform, {});
    return NextResponse.json({ authUrl });
  } catch (error) {
    return NextResponse.json({ error: 'Platform is not configured for OAuth.' }, { status: 400 });
  }
}
