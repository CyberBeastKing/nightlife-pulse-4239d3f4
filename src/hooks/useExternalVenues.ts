import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Venue } from '@/types/venue';

interface ExternalVenueResponse {
  venues: Venue[];
}

export function useExternalVenues() {
  return useQuery({
    queryKey: ['external-venues'],
    queryFn: async (): Promise<Venue[]> => {
      const { data, error } = await supabase.functions.invoke<ExternalVenueResponse>(
        'fetch-external-venues'
      );

      if (error) {
        console.error('Error fetching external venues:', error);
        throw error;
      }

      return data?.venues ?? [];
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 2,
  });
}
