import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export type CorrectionType = 'name' | 'location' | 'address' | 'category' | 'phone' | 'website' | 'closed';

interface CorrectionData {
  venueId: string;
  correctionType: CorrectionType;
  oldValue?: string;
  newValue?: string;
  newLatitude?: number;
  newLongitude?: number;
  notes?: string;
}

interface ExistingCorrection {
  id: string;
  correction_type: string;
  new_value: string | null;
  new_latitude: number | null;
  new_longitude: number | null;
  matching_correction_hash: string;
  vote_count: number;
  status: string;
}

// Generate a hash for matching identical corrections
function generateCorrectionHash(data: CorrectionData): string {
  const parts = [data.venueId, data.correctionType];
  
  if (data.correctionType === 'location' && data.newLatitude && data.newLongitude) {
    // Round to 4 decimal places (~11m precision) for matching nearby corrections
    parts.push(data.newLatitude.toFixed(4), data.newLongitude.toFixed(4));
  } else if (data.newValue) {
    // Normalize text for matching
    parts.push(data.newValue.toLowerCase().trim());
  }
  
  return parts.join('|');
}

export function useVenueCorrections() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingCorrections, setExistingCorrections] = useState<ExistingCorrection[]>([]);
  const [isLoadingCorrections, setIsLoadingCorrections] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch existing corrections for a venue
  const fetchExistingCorrections = async (venueId: string) => {
    setIsLoadingCorrections(true);
    try {
      // First get corrections
      const { data: corrections, error } = await supabase
        .from('venue_corrections')
        .select('id, correction_type, new_value, new_latitude, new_longitude, matching_correction_hash, status')
        .eq('venue_id', venueId)
        .eq('status', 'pending');

      if (error) throw error;

      // For each correction, count the votes
      const correctionsWithVotes = await Promise.all(
        (corrections || []).map(async (correction) => {
          const { count } = await supabase
            .from('correction_votes')
            .select('*', { count: 'exact', head: true })
            .eq('correction_id', correction.id);

          return {
            ...correction,
            vote_count: count || 0
          };
        })
      );

      setExistingCorrections(correctionsWithVotes);
    } catch (error) {
      console.error('Error fetching corrections:', error);
    } finally {
      setIsLoadingCorrections(false);
    }
  };

  // Submit a new correction or vote on existing
  const submitCorrection = async (data: CorrectionData): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to submit corrections",
        variant: "destructive"
      });
      return false;
    }

    setIsSubmitting(true);
    try {
      const correctionHash = generateCorrectionHash(data);

      // Check if an identical correction already exists
      const { data: existing, error: fetchError } = await supabase
        .from('venue_corrections')
        .select('id, matching_correction_hash')
        .eq('matching_correction_hash', correctionHash)
        .eq('status', 'pending')
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existing) {
        // Vote on existing correction
        const { error: voteError } = await supabase
          .from('correction_votes')
          .insert({
            correction_id: existing.id,
            user_id: user.id
          });

        if (voteError) {
          if (voteError.code === '23505') { // Unique violation
            toast({
              title: "Already voted",
              description: "You've already voted on this correction",
              variant: "destructive"
            });
            return false;
          }
          throw voteError;
        }

        // Get updated vote count
        const { count } = await supabase
          .from('correction_votes')
          .select('*', { count: 'exact', head: true })
          .eq('correction_id', existing.id);

        const votesNeeded = Math.max(0, 10 - (count || 0));
        
        toast({
          title: "Vote recorded! 🗳️",
          description: votesNeeded > 0 
            ? `${votesNeeded} more vote${votesNeeded > 1 ? 's' : ''} needed to apply this fix`
            : "Threshold reached! Fix applied automatically ✅"
        });
      } else {
        // Create new correction
        const { data: newCorrection, error: insertError } = await supabase
          .from('venue_corrections')
          .insert({
            venue_id: data.venueId,
            user_id: user.id,
            correction_type: data.correctionType,
            old_value: data.oldValue,
            new_value: data.newValue,
            new_latitude: data.newLatitude,
            new_longitude: data.newLongitude,
            matching_correction_hash: correctionHash,
            notes: data.notes
          })
          .select('id')
          .single();

        if (insertError) throw insertError;

        // Add first vote from submitter
        await supabase
          .from('correction_votes')
          .insert({
            correction_id: newCorrection.id,
            user_id: user.id
          });

        toast({
          title: "Correction submitted! 📝",
          description: "9 more votes needed to auto-apply this fix. Thanks for helping!"
        });
      }

      return true;
    } catch (error: any) {
      console.error('Error submitting correction:', error);
      toast({
        title: "Submission failed",
        description: error.message || "Please try again later",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitCorrection,
    fetchExistingCorrections,
    existingCorrections,
    isSubmitting,
    isLoadingCorrections
  };
}
