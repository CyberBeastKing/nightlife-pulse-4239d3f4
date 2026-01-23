import { useState } from 'react';
import { Flag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ReportReason } from './types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: ReportReason, details?: string) => Promise<boolean>;
  messagePreview: string;
}

const REPORT_REASONS: { value: ReportReason; label: string; description: string }[] = [
  { value: 'harassment', label: 'Harassment', description: 'Bullying or targeting someone' },
  { value: 'spam', label: 'Spam', description: 'Repetitive or promotional content' },
  { value: 'inappropriate_content', label: 'Inappropriate', description: 'Explicit or offensive content' },
  { value: 'threats', label: 'Threats', description: 'Violence or threatening behavior' },
  { value: 'personal_info', label: 'Personal Info', description: 'Sharing private information' },
  { value: 'other', label: 'Other', description: 'Something else' },
];

export function ReportModal({ isOpen, onClose, onSubmit, messagePreview }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) return;
    
    setIsSubmitting(true);
    const success = await onSubmit(selectedReason, details);
    setIsSubmitting(false);
    
    if (success) {
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setSelectedReason(null);
        setDetails('');
      }, 1500);
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedReason(null);
    setDetails('');
    setSubmitted(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-destructive" />
            Report Message
          </DialogTitle>
          <DialogDescription>
            Help keep Hawkly safe. Reports are anonymous and reviewed by our team.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center">
            <div className="text-4xl mb-3">✓</div>
            <p className="text-foreground font-medium">Report submitted</p>
            <p className="text-muted-foreground text-sm">Thank you for helping keep Hawkly safe.</p>
          </div>
        ) : (
          <>
            {/* Message preview */}
            <div className="bg-secondary/50 rounded-lg p-3 text-sm text-muted-foreground">
              "{messagePreview.length > 100 ? messagePreview.slice(0, 100) + '...' : messagePreview}"
            </div>

            {/* Reason selection */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Why are you reporting this?</p>
              <div className="grid grid-cols-2 gap-2">
                {REPORT_REASONS.map((reason) => (
                  <button
                    key={reason.value}
                    onClick={() => setSelectedReason(reason.value)}
                    className={`p-3 rounded-lg text-left transition-all border ${
                      selectedReason === reason.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-secondary/30 hover:bg-secondary/50'
                    }`}
                  >
                    <p className="text-sm font-medium text-foreground">{reason.label}</p>
                    <p className="text-xs text-muted-foreground">{reason.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional details */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Additional details (optional)</p>
              <Textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Provide any additional context..."
                className="resize-none"
                rows={2}
                maxLength={500}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!selectedReason || isSubmitting}
                variant="destructive"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
