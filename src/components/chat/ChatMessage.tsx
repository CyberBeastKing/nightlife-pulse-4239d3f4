import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Flag } from 'lucide-react';
import { ReportModal } from './ReportModal';
import type { ChatMessage as ChatMessageType, SenderLabel, ReportReason } from './types';

interface ChatMessageProps {
  message: ChatMessageType;
  onVote?: (messageId: string, type: 'up' | 'down') => void;
  onReport?: (messageId: string, reason: ReportReason, details?: string) => Promise<boolean>;
}

const senderLabels: Record<SenderLabel, string> = {
  someone_nearby: 'Someone nearby',
  just_arrived: 'Just arrived',
  leaving_soon: 'Leaving soon',
  regular: 'Here often',
};

export function ChatMessage({ message, onVote, onReport }: ChatMessageProps) {
  const [showReportModal, setShowReportModal] = useState(false);
  const timeAgo = getTimeAgo(message.timestamp);

  const handleUpvote = () => {
    onVote?.(message.id, 'up');
  };

  const handleDownvote = () => {
    onVote?.(message.id, 'down');
  };

  const handleReport = async (reason: ReportReason, details?: string): Promise<boolean> => {
    if (!onReport) return false;
    return onReport(message.id, reason, details);
  };

  return (
    <div className="group">
      {/* Sender label */}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs text-muted-foreground">
          {senderLabels[message.senderLabel]}
        </span>
        <span className="text-xs text-muted-foreground/50">•</span>
        <span className="text-xs text-muted-foreground/50">{timeAgo}</span>
      </div>

      {/* Message bubble */}
      <div className="flex items-end gap-2">
        <div className="glass rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%]">
          <p className="text-sm text-foreground leading-relaxed">{message.content}</p>
        </div>

        {/* Action buttons - show on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={handleUpvote}
            className="p-1.5 rounded-full hover:bg-secondary/50 text-muted-foreground hover:text-primary transition-colors"
            title="Helpful"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={handleDownvote}
            className="p-1.5 rounded-full hover:bg-secondary/50 text-muted-foreground hover:text-destructive transition-colors"
            title="Not helpful"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
          </button>
          {onReport && (
            <button 
              onClick={() => setShowReportModal(true)}
              className="p-1.5 rounded-full hover:bg-secondary/50 text-muted-foreground hover:text-destructive transition-colors"
              title="Report message"
            >
              <Flag className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Vote count if significant */}
      {message.upvotes > 2 && (
        <div className="mt-1 ml-1">
          <span className="text-xs text-primary/70">
            {message.upvotes} found this helpful
          </span>
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleReport}
        messagePreview={message.content}
      />
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  return 'earlier';
}
