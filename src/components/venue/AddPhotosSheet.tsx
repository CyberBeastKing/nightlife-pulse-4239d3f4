import { useState, useRef } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Venue } from '@/types/venue';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Camera, X, Loader2, Upload, ImagePlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddPhotosSheetProps {
  venue: Venue;
  isOpen: boolean;
  onClose: () => void;
}

interface PhotoPreview {
  file: File;
  preview: string;
}

const MAX_PHOTOS = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function AddPhotosSheet({ venue, isOpen, onClose }: AddPhotosSheetProps) {
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file count
    if (photos.length + files.length > MAX_PHOTOS) {
      toast({
        title: "Too many photos",
        description: `Maximum ${MAX_PHOTOS} photos allowed`,
        variant: "destructive"
      });
      return;
    }

    // Validate and create previews
    const validFiles: PhotoPreview[] = [];
    
    for (const file of files) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image`,
          variant: "destructive"
        });
        continue;
      }
      
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 5MB limit`,
          variant: "destructive"
        });
        continue;
      }

      validFiles.push({
        file,
        preview: URL.createObjectURL(file)
      });
    }

    setPhotos(prev => [...prev, ...validFiles]);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to upload photos",
        variant: "destructive"
      });
      return;
    }

    if (photos.length === 0) {
      toast({
        title: "No photos selected",
        description: "Please select at least one photo",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // For now, just create the submission records without actual file upload
      // (Storage bucket needs to be created first)
      for (const photo of photos) {
        // Generate a placeholder URL until storage is set up
        const placeholderUrl = `pending-upload-${Date.now()}-${photo.file.name}`;
        
        const { error } = await supabase
          .from('venue_photo_submissions')
          .insert({
            venue_id: venue.id,
            user_id: user.id,
            photo_url: placeholderUrl,
            caption: caption || null
          });

        if (error) throw error;
      }

      toast({
        title: "Photos submitted! 📸",
        description: "Your photos are pending review. We'll notify you when approved!"
      });

      // Cleanup
      photos.forEach(p => URL.revokeObjectURL(p.preview));
      setPhotos([]);
      setCaption('');
      onClose();
      
    } catch (error: any) {
      console.error('Error submitting photos:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    // Cleanup previews
    photos.forEach(p => URL.revokeObjectURL(p.preview));
    setPhotos([]);
    setCaption('');
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent
        side="bottom"
        className={cn(
          // Render as a centered modal overlay above the VenuePopup context.
          "left-1/2 right-auto top-1/2 bottom-auto -translate-x-1/2 -translate-y-1/2",
          "w-[min(520px,calc(100vw-1.5rem))] h-[75vh] max-h-[85vh]",
          "rounded-3xl border border-border",
          "flex flex-col overflow-hidden",
        )}
      >
        <SheetHeader className="pb-4">
          <SheetTitle className="text-lg">Add Photos</SheetTitle>
          <p className="text-sm text-muted-foreground">
            Share photos of {venue.name}
          </p>
        </SheetHeader>

        <div className="space-y-4 overflow-y-auto flex-1">
          {/* Photo Grid */}
          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                <img
                  src={photo.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            
            {photos.length < MAX_PHOTOS && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30",
                  "flex flex-col items-center justify-center gap-1",
                  "hover:border-primary hover:bg-primary/5 transition-colors"
                )}
              >
                <ImagePlus className="w-6 h-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Add</span>
              </button>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Instructions when empty */}
          {photos.length === 0 && (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-muted-foreground/30 rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <Camera className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="font-medium">Tap to add photos</p>
              <p className="text-sm text-muted-foreground">Up to {MAX_PHOTOS} photos, max 5MB each</p>
            </div>
          )}

          {/* Caption */}
          {photos.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="caption">Caption (optional)</Label>
              <Input
                id="caption"
                placeholder="Add a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground text-right">
                {caption.length}/200
              </p>
            </div>
          )}

          {/* Info */}
          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              📋 <strong>Moderation:</strong> Photos are reviewed before appearing publicly. 
              Appropriate venue photos only—no selfies or inappropriate content.
            </p>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4">
          <Button
            onClick={handleSubmit}
            disabled={isUploading || photos.length === 0}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Submit {photos.length} Photo{photos.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
