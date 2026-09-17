export type ItemCondition = 'New' | 'Like New' | 'Good' | 'Fair';

export interface Post {
  id: string;
  user_id?: string;
  owner: string;
  avatar: string;
  title: string;
  condition: ItemCondition;
  category: string;
  city: string;
  locality?: string;
  wanted: string;
  description: string;
  image: string;
  images?: string[];
  time: string;
  exchanges: number;
  rating: string;
  mine?: boolean;
  status?: 'active' | 'archived' | 'completed' | 'removed';
}

export interface UserProfile {
  id?: string;
  name: string;
  first: string;
  city: string;
  locality: string;
  avatar: string;
  joined: string;
  rating: string;
  exchanges: number;
  email?: string;
  phone?: string;
}

export interface ExchangeProposal {
  id: string;
  sender: string;
  receiver: string;
  senderPost: string;
  receiverPost: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  created: string;
  completedBy?: string[];
}

export interface ChatMessage {
  mine: boolean;
  text: string;
  time: string;
}

export interface Conversation {
  name: string;
  avatar: string;
  city: string;
  post: string;
  messages: ChatMessage[];
}

export interface NotificationItem {
  id: number | string;
  icon: string;
  text: string;
  time: string;
  unread: boolean;
}

export interface ReviewItem {
  name: string;
  rating: number;
  text: string;
  time: string;
}

export interface ReportItem {
  by: string;
  item: string;
  reason: string;
  status: string;
}
