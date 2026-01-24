-- Create location sharing relationships table
CREATE TABLE public.location_sharing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sharer_id UUID NOT NULL,
  recipient_id UUID,
  recipient_phone TEXT,
  invite_token UUID DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT unique_sharing_pair UNIQUE (sharer_id, recipient_id)
);

-- Enable RLS
ALTER TABLE public.location_sharing ENABLE ROW LEVEL SECURITY;

-- Users can see sharing relationships they're part of
CREATE POLICY "Users can view their sharing relationships"
ON public.location_sharing
FOR SELECT
USING (auth.uid() = sharer_id OR auth.uid() = recipient_id);

-- Users can create sharing invites
CREATE POLICY "Users can create sharing invites"
ON public.location_sharing
FOR INSERT
WITH CHECK (auth.uid() = sharer_id);

-- Users can update sharing relationships they're part of (accept/decline)
CREATE POLICY "Users can update their sharing relationships"
ON public.location_sharing
FOR UPDATE
USING (auth.uid() = sharer_id OR auth.uid() = recipient_id);

-- Users can delete sharing relationships they're part of
CREATE POLICY "Users can delete their sharing relationships"
ON public.location_sharing
FOR DELETE
USING (auth.uid() = sharer_id OR auth.uid() = recipient_id);