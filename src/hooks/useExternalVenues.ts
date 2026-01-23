import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Venue } from '@/types/venue';

export interface CategoryData {
  id: string;
  label: string;
  icon: string;
  color: string;
}

interface ExternalVenuesResponse {
  venues: Venue[];
  categories: CategoryData[];
}

export function useExternalVenues() {
  return useQuery({
    queryKey: ['external-venues'],
    queryFn: async (): Promise<ExternalVenuesResponse> => {
      const { data, error } = await supabase.functions.invoke<ExternalVenuesResponse>(
        'fetch-external-venues'
      );

      if (error) {
        console.error('Error fetching external venues:', error);
        throw error;
      }

      console.log('External venues fetched:', data?.venues?.length || 0, 'records');
      console.log('Categories fetched:', data?.categories?.length || 0, 'categories');
      return {
        venues: data?.venues ?? [],
        categories: data?.categories ?? [],
      };
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 2,
    refetchOnMount: true,
  });
}
