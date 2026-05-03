import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  setDoc,
  getDoc,
  serverTimestamp,
  where
} from 'firebase/firestore';
import { db, auth } from './config';

export interface Message {
  id?: string;
  senderId: string;
  text: string;
  createdAt: any;
}

export interface ChatSession {
  id: string;
  users: string[];
  lastMessage: string;
  lastUpdated: any;
  otherUser?: any; // populated on client
}

// Generate a unique chat ID based on two user IDs
export const getChatId = (uid1: string, uid2: string) => {
  return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
};

export const sendMessage = async (receiverId: string, text: string) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Not authenticated");

  const chatId = getChatId(currentUser.uid, receiverId);
  const chatRef = doc(db, 'chats', chatId);

  // Ensure chat document exists and update last message
  await setDoc(chatRef, {
    users: [currentUser.uid, receiverId],
    lastMessage: text,
    lastUpdated: serverTimestamp()
  }, { merge: true });

  // Add message to subcollection
  await addDoc(collection(chatRef, 'messages'), {
    senderId: currentUser.uid,
    text,
    createdAt: serverTimestamp()
  });
};

export const subscribeToMessages = (otherUserId: string, callback: (messages: Message[]) => void) => {
  const currentUser = auth.currentUser;
  if (!currentUser) return () => {};

  const chatId = getChatId(currentUser.uid, otherUserId);
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Message[];
    callback(messages);
  });
};

export const subscribeToUserChats = (callback: (chats: ChatSession[]) => void) => {
  const currentUser = auth.currentUser;
  if (!currentUser) return () => {};

  const q = query(
    collection(db, 'chats'),
    where('users', 'array-contains', currentUser.uid),
    orderBy('lastUpdated', 'desc')
  );

  return onSnapshot(q, async (snapshot) => {
    const chatsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ChatSession[];
    
    // Fetch details of the other user in the chat
    const enrichedChats = await Promise.all(chatsData.map(async (chat) => {
      const otherUserId = chat.users.find(id => id !== currentUser.uid);
      if (otherUserId) {
        const userDoc = await getDoc(doc(db, 'users', otherUserId));
        if (userDoc.exists()) {
          chat.otherUser = { id: userDoc.id, ...userDoc.data() };
        }
      }
      return chat;
    }));
    
    callback(enrichedChats);
  });
};
