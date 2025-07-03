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
    const { action, query, accessToken } = await req.json();
    
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'Spotify access token not provided. Please authenticate first.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    

    let endpoint = '';
    let method = 'PUT';
    let body = null;

    switch (action) {
      case 'play':
        endpoint = 'https://api.spotify.com/v1/me/player/play';
        if (query) {
          // Search for track first
          const searchResponse = await fetch(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`,
            {
              headers: { 'Authorization': `Bearer ${accessToken}` }
            }
          );
          const searchData = await searchResponse.json();
          
          if (searchData.tracks?.items?.length > 0) {
            body = JSON.stringify({
              uris: [searchData.tracks.items[0].uri]
            });
          }
        }
        break;
        
      case 'pause':
        endpoint = 'https://api.spotify.com/v1/me/player/pause';
        break;
        
      case 'next':
        endpoint = 'https://api.spotify.com/v1/me/player/next';
        method = 'POST';
        break;
        
      case 'previous':
        endpoint = 'https://api.spotify.com/v1/me/player/previous';
        method = 'POST';
        break;
        
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    const response = await fetch(endpoint, {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body,
    });

    if (response.status === 204 || response.status === 200) {
      return new Response(
        JSON.stringify({ success: true, message: `Successfully executed ${action}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      const errorData = await response.json().catch(() => ({}));
      return new Response(
        JSON.stringify({ error: errorData.error?.message || 'Spotify API error' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in spotify-control function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});