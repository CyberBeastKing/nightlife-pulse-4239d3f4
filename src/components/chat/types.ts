export type CrowdStatus = 'quiet' | 'active' | 'busy';
export type ActivityTrend = 'rising' | 'steady' | 'falling';
export type SenderLabel = 'someone_nearby' | 'just_arrived' | 'leaving_soon' | 'regular';
export type ReportReason = 'harassment' | 'spam' | 'inappropriate_content' | 'threats' | 'personal_info' | 'other';

export interface PlaceChat {
  id: string;
  placeName: string;
  category: string;
  categoryEmoji: string;
  categoryColor: string;
  crowdStatus: CrowdStatus;
  distance: number;
  recentMessageCount: number;
  lastActivity: Date;
}

export interface ChatMessage {
  id: string;
  content: string;
  senderLabel: SenderLabel;
  timestamp: Date;
  upvotes: number;
  downvotes: number;
}

export interface PlaceChatDetails extends PlaceChat {
  messages: ChatMessage[];
  activityTrend: ActivityTrend;
  crowdCount: string; // Fuzzy like "8-12 people"
}

export interface UserStrike {
  id: string;
  reason: ReportReason;
  status: 'warning' | 'strike' | 'ban';
  strikeNumber: number;
  createdAt: Date;
}
