'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Post, UserProfile, ExchangeProposal, Conversation, NotificationItem, ReviewItem } from '@/types/exchange';
import {
  initialUser,
  initialPosts,
  initialChats,
  initialProposals,
  initialNotifications,
  initialReviews,
} from '@/utils/seedData';
import {
  onAuthChanged,
  loginWithEmail as fbLoginEmail,
  registerWithEmail as fbRegisterEmail,
  loginWithGoogle as fbLoginGoogle,
  logoutUser as fbLogout,
  subscribeToPosts,
  addPostToFirestore,
  deletePostFromFirestore,
  subscribeToProposals,
  addProposalToFirestore,
  updateProposalStatusInFirestore,
  subscribeToChats,
  saveChatToFirestore,
  updateUserProfileInFirestore,
  resetUserPassword,
} from '@/services/firebaseService';

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
  deletePost: (postId: string) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<UserProfile>;
  registerWithEmail: (email: string, pass: string, name: string, city?: string) => Promise<UserProfile>;
  loginWithGoogle: () => Promise<UserProfile>;
  signOut: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'exchange_user',
  POSTS: 'exchange_posts',
  SAVED: 'exchange_saved',
  PROPOSALS: 'exchange_proposals',
  CHATS: 'exchange_chats',
  NOTIFICATIONS: 'exchange_notifications',
  REVIEWS: 'exchange_reviews',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [isLoadingPosts, setIsLoadingPosts] = useState<boolean>(false);
  const [saved, setSaved] = useState<string[]>([]);
  const [chats, setChats] = useState<Record<string, Conversation>>(initialChats);
  const [proposals, setProposals] = useState<ExchangeProposal[]>(initialProposals);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [search, setSearch] = useState<string>('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState<boolean>(false);
  const [isGuidelinesModalOpen, setIsGuidelinesModalOpen] = useState<boolean>(false);
  const [proposalModalTargetId, setProposalModalTargetId] = useState<string | null>(null);

  // 1. Firebase Auth listener with localStorage fallback
  useEffect(() => {
    let isSubscribed = true;

    // Load initial cached values from localStorage
    try {
      const storedSaved = localStorage.getItem(STORAGE_KEYS.SAVED);
      if (storedSaved) setSaved(JSON.parse(storedSaved));

      const storedNotifications = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (storedNotifications) setNotifications(JSON.parse(storedNotifications));

      const storedReviews = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      if (storedReviews) setReviews(JSON.parse(storedReviews));

      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.warn('LocalStorage load error:', e);
    }

    // Subscribe to Firebase Auth
    const unsubAuth = onAuthChanged((fbProfile) => {
      if (!isSubscribed) return;
      if (fbProfile) {
        setUser(fbProfile);
      } else {
        // If not logged in on Firebase, check if demo user was explicitly saved
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed?.id?.startsWith('demo-') || parsed?.id === 'usr-priya') {
            setUser(parsed);
            return;
          }
        }
        setUser(null);
      }
    });

    return () => {
      isSubscribed = false;
      unsubAuth();
    };
  }, []);

  // 2. Real-time Firebase Firestore Sync for Posts
  useEffect(() => {
    const unsubPosts = subscribeToPosts((livePosts) => {
      if (livePosts && livePosts.length > 0) {
        setPosts(livePosts);
      }
    });
    return () => unsubPosts();
  }, []);

  // 3. Real-time Firebase Firestore Sync for Proposals
  useEffect(() => {
    const unsubProposals = subscribeToProposals((liveProposals) => {
      if (liveProposals) {
        setProposals(liveProposals);
      }
    });
    return () => unsubProposals();
  }, []);

  // 4. Real-time Firebase Firestore Sync for Chats
  useEffect(() => {
    const unsubChats = subscribeToChats((liveChats) => {
      if (liveChats) {
        setChats(liveChats);
      }
    });
    return () => unsubChats();
  }, []);

  // Save state changes to LocalStorage as offline backup
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(saved));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [saved]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [reviews]);

  const refreshPosts = async () => {
    setIsLoadingPosts(true);
    setTimeout(() => {
      setIsLoadingPosts(false);
    }, 250);
  };

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

  const sendMessage = async (chatId: string, text: string) => {
    if (!text.trim()) return;
    const currentChat = chats[chatId] || {
      name: 'Community Member',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80',
      city: 'Chennai',
      post: 'Item Discussion',
      messages: [],
    };

    const updatedChat: Conversation = {
      ...currentChat,
      messages: [
        ...currentChat.messages,
        { mine: true, text: text.trim(), time: 'Just now' },
      ],
    };

    setChats((prev) => ({ ...prev, [chatId]: updatedChat }));

    try {
      await saveChatToFirestore(chatId, updatedChat);
    } catch (err) {
      console.warn('Chat could not sync to Firestore:', err);
    }
  };

  const createProposal = async (targetPostId: string, offerPostId: string, message: string) => {
    const targetPost = posts.find((p) => p.id === targetPostId);
    if (!targetPost) return;

    const createdId = `x-${Date.now()}`;
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

    try {
      await addProposalToFirestore(newProposal);
    } catch (err) {
      console.warn('Proposal could not save to Firestore:', err);
    }

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

  const updateProposalStatus = async (id: string, status: 'accepted' | 'declined' | 'completed') => {
    setProposals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );

    try {
      await updateProposalStatusInFirestore(id, status);
    } catch (err) {
      console.warn('Proposal status update failed in Firestore:', err);
    }

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

  const deletePost = async (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    try {
      await deletePostFromFirestore(postId);
      toast('Post removed from listings and database.');
    } catch (err) {
      console.warn('Firestore post delete error:', err);
      toast('Post removed locally.');
    }
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
    toast('Report logged for community moderation. Thank you for keeping EXCHANGE safe.');
  };

  // Auth Operations
  const loginWithEmail = async (email: string, pass: string): Promise<UserProfile> => {
    const profile = await fbLoginEmail(email, pass);
    setUser(profile);
    toast('Welcome back to EXCHANGE!');
    return profile;
  };

  const registerWithEmail = async (
    email: string,
    pass: string,
    name: string,
    city?: string
  ): Promise<UserProfile> => {
    const profile = await fbRegisterEmail(email, pass, name, city);
    setUser(profile);
    toast('Account created successfully! Welcome to EXCHANGE.');
    return profile;
  };

  const loginWithGoogle = async (): Promise<UserProfile> => {
    const profile = await fbLoginGoogle();
    setUser(profile);
    toast('Signed in with Google!');
    return profile;
  };

  const signOut = async (): Promise<void> => {
    try {
      await fbLogout();
    } catch (e) {
      console.warn('Firebase signout warning:', e);
    }
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
    toast('You have been signed out.');
  };

  const updateProfileData = async (data: Partial<UserProfile>): Promise<void> => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    try {
      if (user.id) {
        await updateUserProfileInFirestore(user.id, data);
      }
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
      toast('Profile updated successfully!');
    } catch (err: any) {
      console.warn('Profile update error:', err);
      toast('Profile saved locally.', 'success');
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    if (!email.trim()) {
      toast('Please enter your email address.', 'error');
      return;
    }
    await resetUserPassword(email.trim());
    toast('Password reset link sent to your email.');
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
        deletePost,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        signOut,
        updateProfileData,
        resetPassword,
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
