import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSpotify = () => {
  const [isLoading, setIsLoading] = useState(false);

  const authenticateSpotify = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('spotify-auth');
      
      if (error) throw error;
      
      if (data.auth_url) {
        window.open(data.auth_url, '_blank');
        return { success: true, message: 'Please complete authentication in the new window' };
      }
      
      return { success: false, message: 'Failed to get authentication URL' };
    } catch (error) {
      console.error('Spotify auth error:', error);
      return { success: false, message: 'Authentication failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const controlSpotify = async (action: string, query?: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('spotify-control', {
        body: { action, query }
      });
      
      if (error) throw error;
      
      return { success: true, data };
    } catch (error) {
      console.error('Spotify control error:', error);
      return { success: false, message: 'Failed to control Spotify' };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    authenticateSpotify,
    controlSpotify,
    isLoading
  };
};