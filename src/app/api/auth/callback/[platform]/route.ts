import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken } from '@/lib/auth';
import { Platform } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;
  const normalizedPlatform = platform as Platform;
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    // Extract user credentials from state (base64 encoded JSON)
    let userCredentials: Record<string, string> = {};
    if (state) {
      try {
        userCredentials = JSON.parse(Buffer.from(state, 'base64').toString());
      } catch (e) {
        console.error('Failed to parse state:', e);
      }
    }

    const tokenData = await exchangeCodeForToken(normalizedPlatform, code, userCredentials);
    
    // Return the token data to the client via a simple HTML page that posts to the opener
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Successful</title>
        </head>
        <body>
          <script>
            window.opener.postMessage({
              type: 'AUTH_SUCCESS',
              accessToken: '${tokenData.access_token}',
              refreshToken: '${tokenData.refresh_token || ''}',
              expiresIn: ${tokenData.expires_in || 3600}
            }, '*');
            window.close();
          </script>
          <p>Authentication successful! You can close this window.</p>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
