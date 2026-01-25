import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Venue } from '@/types/venue';
import { useVenueCorrections, CorrectionType } from '@/hooks/useVenueCorrections';
import { MapPin, Edit3, Home, Tag, Phone, Globe, XCircle, Loader2, Users, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportIssueSheetProps {
  venue: Venue;
  isOpen: boolean;
  onClose: () => void;
}

const issueTypes: { type: CorrectionType; icon: React.ReactNode; label: string; description: string }[] = [
  { type: 'name', icon: <Edit3 className="w-4 h-4" />, label: 'Wrong name', description: 'Name is misspelled or incorrect' },
  { type: 'location', icon: <MapPin className="w-4 h-4" />, label: 'Wrong location', description: 'Pin is in the wrong spot' },
  { type: 'address', icon: <Home className="w-4 h-4" />, label: 'Wrong address', description: 'Street address is incorrect' },
  { type: 'category', icon: <Tag className="w-4 h-4" />, label: 'Wrong category', description: 'Not a bar/restaurant/etc.' },
  { type: 'phone', icon: <Phone className="w-4 h-4" />, label: 'Wrong phone', description: 'Phone number is incorrect' },
  { type: 'website', icon: <Globe className="w-4 h-4" />, label: 'Wrong website', description: 'Website URL is incorrect' },
  { type: 'closed', icon: <XCircle className="w-4 h-4" />, label: 'Place is closed', description: 'This venue no longer exists' },
];

const categoryOptions = [
  { value: 'bar', label: 'Bar' },
  { value: 'nightclub', label: 'Nightclub' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'brewery', label: 'Brewery' },
  { value: 'lounge', label: 'Lounge' },
  { value: 'sports_bar', label: 'Sports Bar' },
  { value: 'live_music', label: 'Live Music Venue' },
  { value: 'coffee', label: 'Coffee Shop' },
];

export function ReportIssueSheet({ venue, isOpen, onClose }: ReportIssueSheetProps) {
  const [step, setStep] = useState<'select' | 'details'>('select');
  const [selectedType, setSelectedType] = useState<CorrectionType | null>(null);
  const [newValue, setNewValue] = useState('');
  const [notes, setNotes] = useState('');
  
  const { 
    submitCorrection, 
    fetchExistingCorrections, 
    existingCorrections, 
    isSubmitting,
    isLoadingCorrections 
  } = useVenueCorrections();

  // Reset state when sheet opens
  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setSelectedType(null);
      setNewValue('');
      setNotes('');
      fetchExistingCorrections(venue.id);
    }
  }, [isOpen, venue.id]);

  // Get current value based on correction type
  const getCurrentValue = (type: CorrectionType): string => {
    switch (type) {
      case 'name': return venue.name;
      case 'address': return venue.address || '';
      case 'category': return venue.category;
      case 'phone': return ''; // Not available in Venue type
      case 'website': return ''; // Not available in Venue type
      default: return '';
    }
  };

  // Find matching existing corrections for selected type
  const matchingCorrections = existingCorrections.filter(
    c => c.correction_type === selectedType && c.status === 'pending'
  );

  const handleTypeSelect = (type: CorrectionType) => {
    setSelectedType(type);
    setNewValue('');
    setStep('details');
  };

  const handleSubmit = async () => {
    if (!selectedType) return;

    const success = await submitCorrection({
      venueId: venue.id,
      correctionType: selectedType,
      oldValue: getCurrentValue(selectedType),
      newValue: selectedType === 'closed' ? 'CLOSED' : newValue,
      notes
    });

    if (success) {
      onClose();
    }
  };

  const handleBack = () => {
    setStep('select');
    setSelectedType(null);
    setNewValue('');
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="bottom"
        className={cn(
          // Render as a centered modal overlay above the VenuePopup context.
          "left-1/2 right-auto top-1/2 bottom-auto -translate-x-1/2 -translate-y-1/2",
          "w-[min(520px,calc(100vw-1.5rem))] h-[80vh] max-h-[85vh]",
          "rounded-3xl border border-border",
          "flex flex-col overflow-hidden",
        )}
      >
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-3">
            {step === 'details' && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleBack}
                className="h-8 w-8"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <SheetTitle className="text-lg">
              {step === 'select' ? 'Report an Issue' : `Fix ${issueTypes.find(t => t.type === selectedType)?.label}`}
            </SheetTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            {step === 'select' 
              ? `Help improve data for ${venue.name}`
              : 'Your correction will be reviewed by the community'
            }
          </p>
        </SheetHeader>

        {step === 'select' && (
          <div className="space-y-2 overflow-y-auto flex-1">
            {isLoadingCorrections && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            )}
            
            {issueTypes.map((issue) => {
              const existingForType = existingCorrections.filter(
                c => c.correction_type === issue.type
              );
              const hasExisting = existingForType.length > 0;
              const topVotes = hasExisting 
                ? Math.max(...existingForType.map(c => c.vote_count))
                : 0;
              
              return (
                <button
                  key={issue.type}
                  onClick={() => handleTypeSelect(issue.type)}
                  className={cn(
                    "w-full flex items-center gap-3 p-4 rounded-xl text-left transition-colors",
                    "bg-secondary/50 hover:bg-secondary"
                  )}
                >
                  <div className="p-2 rounded-full bg-background">
                    {issue.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{issue.label}</p>
                    <p className="text-xs text-muted-foreground">{issue.description}</p>
                  </div>
                  {hasExisting && (
                    <div className="flex items-center gap-1 text-xs text-primary">
                      <Users className="w-3 h-3" />
                      <span>{topVotes}/10</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {step === 'details' && selectedType && (
          <div className="space-y-4 overflow-y-auto flex-1">
            {/* Show existing corrections for this type */}
            {matchingCorrections.length > 0 && (
              <div className="space-y-2">
                <Label className="text-muted-foreground">Others have reported:</Label>
                {matchingCorrections.map((correction) => (
                  <button
                    key={correction.id}
                    onClick={() => setNewValue(correction.new_value || '')}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors",
                      newValue === correction.new_value 
                        ? "bg-primary/20 border border-primary" 
                        : "bg-secondary/50 hover:bg-secondary"
                    )}
                  >
                    <span className="font-medium truncate">
                      {correction.new_value || 'Location fix'}
                    </span>
                    <div className="flex items-center gap-1 text-xs">
                      <Users className="w-3 h-3" />
                      <span>{correction.vote_count}/10 votes</span>
                    </div>
                  </button>
                ))}
                <p className="text-xs text-muted-foreground">
                  Tap to vote on an existing report, or submit a new one below
                </p>
              </div>
            )}

            {/* Input for new correction */}
            {selectedType !== 'closed' && selectedType !== 'location' && (
              <div className="space-y-2">
                <Label>
                  Current: <span className="text-muted-foreground">{getCurrentValue(selectedType) || 'Not set'}</span>
                </Label>
                
                {selectedType === 'category' ? (
                  <RadioGroup value={newValue} onValueChange={setNewValue}>
                    <div className="grid grid-cols-2 gap-2">
                      {categoryOptions.map((cat) => (
                        <div key={cat.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={cat.value} id={cat.value} />
                          <Label htmlFor={cat.value} className="text-sm cursor-pointer">
                            {cat.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                ) : (
                  <Input
                    placeholder={`What should the ${selectedType} be?`}
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                  />
                )}
              </div>
            )}

            {selectedType === 'location' && (
              <div className="p-4 bg-secondary/50 rounded-lg text-center">
                <MapPin className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Location correction coming soon! For now, please describe the correct location in the notes below.
                </p>
              </div>
            )}

            {selectedType === 'closed' && (
              <div className="p-4 bg-destructive/10 rounded-lg">
                <XCircle className="w-8 h-8 mx-auto mb-2 text-destructive" />
                <p className="text-sm text-center text-muted-foreground">
                  Confirming this venue is permanently closed. Once 10 people confirm, it will be removed from Hawkly.
                </p>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional context..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || (selectedType !== 'closed' && selectedType !== 'location' && !newValue)}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Correction'
              )}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
