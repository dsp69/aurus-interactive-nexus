import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSpotify = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // Load stored token
    const storedToken = localStorage.getItem('spotify_access_token');
    const tokenExpiry = localStorage.getItem('spotify_token_expiry');
    
    if (storedToken && tokenExpiry) {
      const now = Date.now();
      if (now < parseInt(tokenExpiry)) {
        setAccessToken(storedToken);
      } else {
        // Token expired, clear it
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_token_expiry');
      }
    }
  }, []);

  useEffect(() => {
    // Listen for auth success from popup
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'SPOTIFY_AUTH_SUCCESS') {
        const { accessToken, expiresIn } = event.data;
        const expiryTime = Date.now() + (expiresIn * 1000);
        
        localStorage.setItem('spotify_access_token', accessToken);
        localStorage.setItem('spotify_token_expiry', expiryTime.toString());
        setAccessToken(accessToken);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const authenticateSpotify = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('spotify-auth');
      
      if (error) throw error;
      
      if (data.auth_url) {
        const popup = window.open(data.auth_url, 'spotify-auth', 'width=400,height=600');
        
        // Check if popup was closed manually
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            setIsLoading(false);
          }
        }, 1000);

        return { success: true, message: 'Please complete authentication in the popup window' };
      }
      
      return { success: false, message: 'Failed to get authentication URL' };
    } catch (error) {
      console.error('Spotify auth error:', error);
      return { success: false, message: 'Authentication failed' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const controlSpotify = useCallback(async (action: string, query?: string) => {
    try {
      setIsLoading(true);
      
      if (!accessToken) {
        return { success: false, message: 'Please authenticate with Spotify first' };
      }

      const { data, error } = await supabase.functions.invoke('spotify-control', {
        body: { action, query, accessToken }
      });
      
      if (error) throw error;
      
      return { success: true, data };
    } catch (error) {
      console.error('Spotify control error:', error);
      return { success: false, message: 'Failed to control Spotify' };
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  return {
    authenticateSpotify,
    controlSpotify,
    isLoading,
    isAuthenticated: !!accessToken
  };
};