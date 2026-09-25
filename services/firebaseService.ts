import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  limit,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '@/lib/firebase';
import { Post, UserProfile, ExchangeProposal, Conversation, ReviewItem } from '@/types/exchange';
import { initialPosts, initialChats, initialProposals, initialReviews, initialUser } from '@/utils/seedData';

// --- AUTHENTICATION ---

export const googleProvider = new GoogleAuthProvider();

export async function loginWithEmail(email: string, pass: string): Promise<UserProfile> {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  const u = cred.user;
  return await getUserProfileOrCreate(u);
}

export async function registerWithEmail(
  email: string,
  pass: string,
  displayName: string,
  city: string = 'Chennai'
): Promise<UserProfile> {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  const u = cred.user;

  if (displayName) {
    try {
      await updateProfile(u, { displayName });
    } catch (e) {
      console.warn('Profile update warning:', e);
    }
  }

  const profile: UserProfile = {
    id: u.uid,
    name: displayName || email.split('@')[0],
    first: (displayName || email.split('@')[0]).split(' ')[0],
    city: city || 'Chennai',
    locality: 'Central',
    avatar: u.photoURL || initialUser.avatar,
    joined: 'Just now',
    rating: '5.0',
    exchanges: 0,
    email: u.email || email,
  };

  try {
    await setDoc(doc(db, 'users', u.uid), profile);
  } catch (e) {
    console.warn('Could not save user profile to Firestore:', e);
  }

  return profile;
}

export async function loginWithGoogle(): Promise<UserProfile> {
  const cred = await signInWithPopup(auth, googleProvider);
  return await getUserProfileOrCreate(cred.user);
}

export async function logoutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

export async function resetUserPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function updateUserProfileInFirestore(
  uid: string,
  updatedData: Partial<UserProfile>
): Promise<void> {
  if (auth.currentUser && updatedData.name) {
    try {
      await updateProfile(auth.currentUser, {
        displayName: updatedData.name,
        photoURL: updatedData.avatar || auth.currentUser.photoURL,
      });
    } catch (e) {
      console.warn('Auth profile update error:', e);
    }
  }

  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, updatedData, { merge: true });
  } catch (e) {
    console.warn('Firestore user profile update error:', e);
  }
}

export async function getUserProfileOrCreate(u: FirebaseUser): Promise<UserProfile> {
  try {
    const userDocRef = doc(db, 'users', u.uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (e) {
    console.warn('Firestore user fetch failed, using auth profile:', e);
  }

  const name = u.displayName || u.email?.split('@')[0] || 'Community Member';
  const profile: UserProfile = {
    id: u.uid,
    name,
    first: name.split(' ')[0],
    city: 'Chennai',
    locality: 'Central',
    avatar: u.photoURL || initialUser.avatar,
    joined: 'Recently',
    rating: '5.0',
    exchanges: 0,
    email: u.email || '',
  };

  try {
    await setDoc(doc(db, 'users', u.uid), profile, { merge: true });
  } catch (e) {
    console.warn('Could not write user profile:', e);
  }

  return profile;
}

export function onAuthChanged(callback: (user: UserProfile | null) => void) {
  return onAuthStateChanged(auth, async (u) => {
    if (u) {
      const profile = await getUserProfileOrCreate(u);
      callback(profile);
    } else {
      callback(null);
    }
  });
}

// --- STORAGE: IMAGE UPLOAD ---

export async function uploadPostImage(file: File): Promise<string> {
  try {
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const storageRef = ref(storage, `post_images/${filename}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.warn('Firebase Storage upload failed or not permitted, falling back to base64:', error);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }
}

// --- FIRESTORE: POSTS ---

export function subscribeToPosts(onUpdate: (posts: Post[]) => void) {
  const postsCollection = collection(db, 'posts');

  const unsubscribe = onSnapshot(
    postsCollection,
    async (snapshot) => {
      if (snapshot.empty) {
        // If collection in Firestore is empty, seed it with initialPosts
        try {
          for (const item of initialPosts) {
            await setDoc(doc(db, 'posts', item.id), item);
          }
        } catch (err) {
          console.warn('Could not seed initial posts to Firestore:', err);
          onUpdate(initialPosts);
          return;
        }
        onUpdate(initialPosts);
      } else {
        const postsList: Post[] = [];
        snapshot.forEach((doc) => {
          postsList.push({ ...doc.data(), id: doc.id } as Post);
        });
        onUpdate(postsList);
      }
    },
    (err) => {
      console.warn('Firestore posts snapshot error, using local fallback:', err);
      // Fallback
      onUpdate(initialPosts);
    }
  );

  return unsubscribe;
}

export async function addPostToFirestore(newPost: Post): Promise<void> {
  try {
    await setDoc(doc(db, 'posts', newPost.id), newPost);
  } catch (e) {
    console.warn('Failed to save post to Firestore:', e);
    throw e;
  }
}

export async function deletePostFromFirestore(postId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'posts', postId));
  } catch (e) {
    console.warn('Failed to delete post from Firestore:', e);
    throw e;
  }
}

// --- FIRESTORE: PROPOSALS ---

export function subscribeToProposals(onUpdate: (proposals: ExchangeProposal[]) => void) {
  const proposalsCollection = collection(db, 'proposals');

  const unsubscribe = onSnapshot(
    proposalsCollection,
    async (snapshot) => {
      if (snapshot.empty) {
        onUpdate(initialProposals);
      } else {
        const list: ExchangeProposal[] = [];
        snapshot.forEach((doc) => {
          list.push({ ...doc.data(), id: doc.id } as ExchangeProposal);
        });
        onUpdate(list);
      }
    },
    (err) => {
      console.warn('Firestore proposals snapshot error:', err);
      onUpdate(initialProposals);
    }
  );

  return unsubscribe;
}

export async function addProposalToFirestore(proposal: ExchangeProposal): Promise<void> {
  try {
    await setDoc(doc(db, 'proposals', proposal.id), proposal);
  } catch (e) {
    console.warn('Failed to save proposal to Firestore:', e);
  }
}

export async function updateProposalStatusInFirestore(
  id: string,
  status: 'accepted' | 'declined' | 'completed'
): Promise<void> {
  try {
    await updateDoc(doc(db, 'proposals', id), { status });
  } catch (e) {
    console.warn('Failed to update proposal in Firestore:', e);
  }
}

// --- FIRESTORE: CHATS ---

export function subscribeToChats(onUpdate: (chats: Record<string, Conversation>) => void) {
  const chatsCollection = collection(db, 'chats');

  const unsubscribe = onSnapshot(
    chatsCollection,
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate(initialChats);
      } else {
        const chatMap: Record<string, Conversation> = {};
        snapshot.forEach((doc) => {
          chatMap[doc.id] = doc.data() as Conversation;
        });
        onUpdate(chatMap);
      }
    },
    (err) => {
      console.warn('Firestore chats snapshot error:', err);
      onUpdate(initialChats);
    }
  );

  return unsubscribe;
}

export async function saveChatToFirestore(chatId: string, conversation: Conversation): Promise<void> {
  try {
    await setDoc(doc(db, 'chats', chatId), conversation);
  } catch (e) {
    console.warn('Failed to save chat to Firestore:', e);
  }
}
