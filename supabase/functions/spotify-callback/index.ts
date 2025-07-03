import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error) {
      return new Response(`
        <html>
          <body>
            <h1>Authentication Failed</h1>
            <p>Error: ${error}</p>
            <script>window.close();</script>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    if (!code) {
      return new Response(`
        <html>
          <body>
            <h1>Authentication Failed</h1>
            <p>No authorization code received</p>
            <script>window.close();</script>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    const clientId = Deno.env.get('SPOTIFY_CLIENT_ID');
    const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET');
    
    if (!clientId || !clientSecret) {
      return new Response(`
        <html>
          <body>
            <h1>Configuration Error</h1>
            <p>Spotify credentials not configured</p>
            <script>window.close();</script>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    const redirectUri = 'https://qhcbdzaammelnxcofazs.supabase.co/functions/v1/spotify-callback';
    
    // Exchange code for access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri
      })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      return new Response(`
        <html>
          <body>
            <h1>Token Exchange Failed</h1>
            <p>Error: ${tokenData.error_description || tokenData.error}</p>
            <script>window.close();</script>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // Store the token in localStorage via postMessage
    return new Response(`
      <html>
        <body>
          <h1>Authentication Successful!</h1>
          <p>You can now close this window and use Spotify controls.</p>
          <script>
            // Send token to parent window
            if (window.opener) {
              window.opener.postMessage({
                type: 'SPOTIFY_AUTH_SUCCESS',
                accessToken: '${tokenData.access_token}',
                refreshToken: '${tokenData.refresh_token}',
                expiresIn: ${tokenData.expires_in}
              }, '*');
            }
            setTimeout(() => window.close(), 2000);
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (error) {
    console.error('Error in spotify-callback function:', error);
    return new Response(`
      <html>
        <body>
          <h1>Authentication Error</h1>
          <p>An unexpected error occurred</p>
          <script>window.close();</script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
});