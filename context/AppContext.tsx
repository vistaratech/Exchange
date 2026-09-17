'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Post, UserProfile, ExchangeProposal, Conversation, NotificationItem, ReviewItem } from '@/types/exchange';
import { initialUser, initialChats, initialProposals, initialNotifications, initialReviews } from '@/utils/seedData';
import { createClient } from '@/utils/supabase/client';

interface ToastData {
  id: string;
  message: string;
  kind?: 'success' | 'error';
}

interface AppContextType {
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  isLoadingPosts: boolean;
  saved: string[];
  toggleSave: (id: string) => void;
  chats: Record<string, Conversation>;
  sendMessage: (chatId: string, text: string) => void;
  proposals: ExchangeProposal[];
  createProposal: (targetPostId: string, offerPostId: string, message: string) => void;
  updateProposalStatus: (id: string, status: 'accepted' | 'declined' | 'completed') => void;
  notifications: NotificationItem[];
  markNotificationsAsRead: () => void;
  reviews: ReviewItem[];
  addReview: (proposalId: string, rating: number, text: string) => void;
  submitReport: (postId: string, postTitle: string, reason: string, details?: string) => Promise<void>;
  toast: (message: string, kind?: 'success' | 'error') => void;
  search: string;
  setSearch: (value: string) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isSafetyModalOpen: boolean;
  setIsSafetyModalOpen: (open: boolean) => void;
  isGuidelinesModalOpen: boolean;
  setIsGuidelinesModalOpen: (open: boolean) => void;
  proposalModalTargetId: string | null;
  setProposalModalTargetId: (id: string | null) => void;
  refreshPosts: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState<boolean>(true);
  const [saved, setSaved] = useState<string[]>([]);
  const [chats, setChats] = useState<Record<string, Conversation>>({});
  const [proposals, setProposals] = useState<ExchangeProposal[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [search, setSearch] = useState<string>('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState<boolean>(false);
  const [isGuidelinesModalOpen, setIsGuidelinesModalOpen] = useState<boolean>(false);
  const [proposalModalTargetId, setProposalModalTargetId] = useState<string | null>(null);

  const supabase = createClient();

  // Load real posts from Supabase database
  const refreshPosts = async () => {
    setIsLoadingPosts(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        // If Supabase table isn't created yet or network issue
        console.warn('Supabase posts table note:', error.message);
      } else if (data && data.length > 0) {
        const formatted: Post[] = data.map((item: any) => ({
          id: item.id,
          user_id: item.user_id,
          owner: item.owner_name || 'Community Member',
          avatar: item.owner_avatar || initialUser.avatar,
          title: item.title,
          condition: item.condition,
          category: item.category,
          city: item.city,
          locality: item.locality || '',
          wanted: item.wanted || 'Open to any exchange',
          description: item.description,
          image: item.image,
          time: new Date(item.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          exchanges: 0,
          rating: '5.0',
          mine: user ? item.user_id === user.id : false,
          status: item.status,
        }));
        setPosts(formatted);
      } else {
        // Table exists but has 0 posts yet
        setPosts([]);
      }
    } catch (err) {
      console.warn('Error fetching live posts:', err);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  // Load user session from Supabase on mount
  useEffect(() => {
    const fetchUserAndData = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const fullName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Member';
          setUser({
            id: authUser.id,
            name: fullName,
            first: fullName.split(' ')[0],
            city: authUser.user_metadata?.city || 'Chennai',
            locality: authUser.user_metadata?.locality || 'Central',
            avatar: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || authUser.user_metadata?.avatar || initialUser.avatar,
            joined: new Date(authUser.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            rating: '5.0',
            exchanges: 0,
            email: authUser.email,
          });

          // Fetch real exchange proposals for this user
          try {
            const { data: propData } = await supabase
              .from('exchange_proposals')
              .select('*')
              .or(`sender_id.eq.${authUser.id},receiver_id.eq.${authUser.id}`)
              .order('created_at', { ascending: false });

            if (propData && propData.length > 0) {
              setProposals(
                propData.map((p: any) => ({
                  id: p.id,
                  sender: p.sender_name,
                  receiver: p.receiver_name,
                  senderPost: p.sender_post_id,
                  receiverPost: p.receiver_post_id,
                  message: p.message || '',
                  status: p.status || 'pending',
                  created: new Date(p.created_at).toLocaleDateString(),
                }))
              );
            } else {
              setProposals([]);
            }
          } catch (propErr) {
            console.warn('Proposals fetch error:', propErr);
            setProposals([]);
          }
        } else {
          setProposals([]);
        }
      } catch (err) {
        console.warn('Supabase auth check:', err);
      }

      await refreshPosts();
    };

    fetchUserAndData();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = session.user;
        const fullName = u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'Member';
        setUser({
          id: u.id,
          name: fullName,
          first: fullName.split(' ')[0],
          city: u.user_metadata?.city || 'Chennai',
          locality: u.user_metadata?.locality || 'Central',
          avatar: u.user_metadata?.avatar_url || u.user_metadata?.picture || u.user_metadata?.avatar || initialUser.avatar,
          joined: 'Recently',
          rating: '5.0',
          exchanges: 0,
          email: u.email,
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const toast = (message: string, kind: 'success' | 'error' = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3300);
  };

  const toggleSave = (id: string) => {
    setSaved((prev) => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter((item) => item !== id) : [...prev, id];
      toast(exists ? 'Removed from saved.' : 'Saved for your next exchange.');
      return updated;
    });
  };

  const sendMessage = (chatId: string, text: string) => {
    if (!text.trim()) return;
    setChats((prev) => {
      const chat = prev[chatId];
      if (!chat) return prev;
      return {
        ...prev,
        [chatId]: {
          ...chat,
          messages: [
            ...chat.messages,
            { mine: true, text: text.trim(), time: 'Just now' },
          ],
        },
      };
    });
  };

  const createProposal = async (targetPostId: string, offerPostId: string, message: string) => {
    const targetPost = posts.find((p) => p.id === targetPostId);
    if (!targetPost) return;

    let createdId = `x-${Date.now()}`;
    try {
      if (user?.id) {
        const { data: propRow } = await supabase
          .from('exchange_proposals')
          .insert({
            sender_id: user.id,
            receiver_id: targetPost.user_id || null,
            sender_name: user.first || user.name,
            receiver_name: targetPost.owner,
            sender_post_id: offerPostId,
            receiver_post_id: targetPostId,
            message,
            status: 'pending',
          })
          .select()
          .single();
        if (propRow) createdId = propRow.id;
      }
    } catch (err) {
      console.warn('Supabase proposal insert note:', err);
    }

    const newProposal: ExchangeProposal = {
      id: createdId,
      sender: user?.first || 'You',
      receiver: targetPost.owner,
      senderPost: offerPostId,
      receiverPost: targetPostId,
      message,
      status: 'pending',
      created: 'Just now',
    };

    setProposals((prev) => [newProposal, ...prev]);
    setNotifications((prev) => [
      {
        id: Date.now(),
        icon: '↔',
        text: `Your exchange proposal was sent to ${targetPost.owner}.`,
        time: 'Just now',
        unread: true,
      },
      ...prev,
    ]);
    toast('Exchange proposal sent.');
    setProposalModalTargetId(null);
  };

  const updateProposalStatus = (id: string, status: 'accepted' | 'declined' | 'completed') => {
    setProposals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );

    const statusIcon = status === 'accepted' ? 'accepted' : status === 'completed' ? 'completed' : 'declined';
    const text =
      status === 'accepted'
        ? 'Exchange agreed. Chat with member to coordinate meetup.'
        : status === 'completed'
        ? 'Exchange completed — thank you for confirming!'
        : 'Proposal declined.';

    setNotifications((prev) => [
      { id: Date.now(), icon: statusIcon, text, time: 'Just now', unread: true },
      ...prev,
    ]);
    toast(text);
  };

  const markNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    toast('All caught up.');
  };

  const addReview = (proposalId: string, rating: number, text: string) => {
    const p = proposals.find((prop) => prop.id === proposalId);
    const person = p ? (p.sender === user?.first ? p.receiver : p.sender) : 'Community Member';
    setReviews((prev) => [
      {
        name: person,
        rating,
        text: text || 'Great person. Smooth exchange.',
        time: 'Just now',
      },
      ...prev,
    ]);
    toast('Review submitted. Thank you!');
  };

  const submitReport = async (postId: string, postTitle: string, reason: string, details?: string) => {
    try {
      await supabase.from('reports').insert({
        reporter_id: user?.id || null,
        post_id: postId,
        post_title: postTitle,
        reason,
        details: details || '',
        status: 'Open',
      });
      toast('Report logged for community moderation. Thank you for keeping EXCHANGE safe.');
    } catch (err) {
      toast('Report logged. Thank you for keeping EXCHANGE safe.');
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        posts,
        setPosts,
        isLoadingPosts,
        saved,
        toggleSave,
        chats,
        sendMessage,
        proposals,
        createProposal,
        updateProposalStatus,
        notifications,
        markNotificationsAsRead,
        reviews,
        addReview,
        submitReport,
        toast,
        search,
        setSearch,
        isCreateModalOpen,
        setIsCreateModalOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isSafetyModalOpen,
        setIsSafetyModalOpen,
        isGuidelinesModalOpen,
        setIsGuidelinesModalOpen,
        proposalModalTargetId,
        setProposalModalTargetId,
        refreshPosts,
      }}
    >
      {children}
      <div id="toast-region" className="toast-region" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.kind || 'success'}`}>
            {t.message}
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
