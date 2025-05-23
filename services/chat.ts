import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
  arrayUnion,
  onSnapshot,
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
  setDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { getUserById } from './users';

// Chat interface
export interface Chat {
  id: string;
  participants: string[];
  participantInfo: Record<string, { displayName: string; profilePictureUrl: string }>;
  lastMessageText: string;
  lastMessageTimestamp: Date;
  createdAt: Date;
  unreadCount: Record<string, number>;
}

// Message interface
export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isRead: boolean;
}

// Convert Firestore document to Chat
export const convertToChat = (doc: QueryDocumentSnapshot<DocumentData>): Chat => {
  const data = doc.data();
  
  return {
    id: doc.id,
    participants: data.participants || [],
    participantInfo: data.participantInfo || {},
    lastMessageText: data.lastMessageText || '',
    lastMessageTimestamp: data.lastMessageTimestamp?.toDate() || new Date(),
    createdAt: data.createdAt?.toDate() || new Date(),
    unreadCount: data.unreadCount || {},
  };
};

// Convert Firestore document to Message
export const convertToMessage = (
  doc: QueryDocumentSnapshot<DocumentData>,
  chatId: string
): Message => {
  const data = doc.data();
  
  return {
    id: doc.id,
    chatId,
    senderId: data.senderId,
    text: data.text,
    timestamp: data.timestamp?.toDate() || new Date(),
    isRead: data.isRead || false,
  };
};

// Generate a chat ID between two users
export const generateChatId = (userId1: string, userId2: string): string => {
  return [userId1, userId2].sort().join('_');
};

// Create a new chat between two users
export const createChat = async (userId1: string, userId2: string): Promise<string> => {
  try {
    // Get user information
    const [user1, user2] = await Promise.all([
      getUserById(userId1),
      getUserById(userId2),
    ]);
    
    if (!user1 || !user2) {
      throw new Error('One or both users not found');
    }
    
    // Generate a consistent chat ID
    const chatId = generateChatId(userId1, userId2);
    
    // Check if chat already exists
    const chatRef = doc(db, 'chats', chatId);
    const chatDoc = await getDoc(chatRef);
    
    if (chatDoc.exists()) {
      return chatId; // Chat already exists
    }
    
    // Create participant info map
    const participantInfo: Record<string, { displayName: string; profilePictureUrl: string }> = {
      [userId1]: {
        displayName: user1.displayName,
        profilePictureUrl: user1.profilePictureUrl,
      },
      [userId2]: {
        displayName: user2.displayName,
        profilePictureUrl: user2.profilePictureUrl,
      },
    };
    
    // Create unreadCount map
    const unreadCount: Record<string, number> = {
      [userId1]: 0,
      [userId2]: 0,
    };
    
    // Create the chat document
    await setDoc(chatRef, {
      participants: [userId1, userId2],
      participantInfo,
      lastMessageText: '',
      lastMessageTimestamp: serverTimestamp(),
      createdAt: serverTimestamp(),
      unreadCount,
    });
    
    return chatId;
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error;
  }
};

// Get user chats
export const getUserChats = async (userId: string): Promise<Chat[]> => {
  try {
    const chatsQuery = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', userId),
      orderBy('lastMessageTimestamp', 'desc')
    );
    
    const snapshot = await getDocs(chatsQuery);
    
    const chats: Chat[] = [];
    snapshot.forEach((doc) => {
      chats.push(convertToChat(doc));
    });
    
    return chats;
  } catch (error) {
    console.error('Error getting user chats:', error);
    throw error;
  }
};

// Subscribe to user chats in real-time
export const subscribeToUserChats = (
  userId: string,
  callback: (chats: Chat[]) => void
): (() => void) => {
  const chatsQuery = query(
    collection(db, 'chats'),
    where('participants', 'array-contains', userId),
    orderBy('lastMessageTimestamp', 'desc')
  );
  
  const unsubscribe = onSnapshot(
    chatsQuery,
    (snapshot) => {
      const chats: Chat[] = [];
      snapshot.forEach((doc) => {
        chats.push(convertToChat(doc));
      });
      callback(chats);
    },
    (error) => {
      console.error('Error subscribing to user chats:', error);
    }
  );
  
  return unsubscribe;
};

// Get chat messages
export const getChatMessages = async (chatId: string): Promise<Message[]> => {
  try {
    const messagesQuery = query(
      collection(db, `chats/${chatId}/messages`),
      orderBy('timestamp', 'asc')
    );
    
    const snapshot = await getDocs(messagesQuery);
    
    const messages: Message[] = [];
    snapshot.forEach((doc) => {
      messages.push(convertToMessage(doc, chatId));
    });
    
    return messages;
  } catch (error) {
    console.error('Error getting chat messages:', error);
    throw error;
  }
};

// Subscribe to chat messages in real-time
export const subscribeToChatMessages = (
  chatId: string,
  callback: (messages: Message[]) => void
): (() => void) => {
  const messagesQuery = query(
    collection(db, `chats/${chatId}/messages`),
    orderBy('timestamp', 'asc')
  );
  
  const unsubscribe = onSnapshot(
    messagesQuery,
    (snapshot) => {
      const messages: Message[] = [];
      snapshot.forEach((doc) => {
        messages.push(convertToMessage(doc, chatId));
      });
      callback(messages);
    },
    (error) => {
      console.error('Error subscribing to chat messages:', error);
    }
  );
  
  return unsubscribe;
};

// Send a message in a chat
export const sendMessage = async (
  chatId: string,
  senderId: string,
  text: string
): Promise<string> => {
  try {
    // Get the chat
    const chatRef = doc(db, 'chats', chatId);
    const chatDoc = await getDoc(chatRef);
    
    if (!chatDoc.exists()) {
      throw new Error('Chat not found');
    }
    
    const chatData = chatDoc.data();
    
    // Identify the other participant
    const recipientId = chatData.participants.find((id: string) => id !== senderId);
    
    if (!recipientId) {
      throw new Error('Recipient not found');
    }
    
    // Add the message to the messages subcollection
    const messageRef = await addDoc(collection(db, `chats/${chatId}/messages`), {
      senderId,
      text,
      timestamp: serverTimestamp(),
      isRead: false,
    });
    
    // Update the chat with the last message
    const unreadCountUpdate: Record<string, number> = {};
    unreadCountUpdate[recipientId] = (chatData.unreadCount?.[recipientId] || 0) + 1;
    
    await updateDoc(chatRef, {
      lastMessageText: text,
      lastMessageTimestamp: serverTimestamp(),
      [`unreadCount.${recipientId}`]: (chatData.unreadCount?.[recipientId] || 0) + 1,
    });
    
    return messageRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Mark messages as read
export const markMessagesAsRead = async (
  chatId: string,
  userId: string
): Promise<void> => {
  try {
    // Update unread count for this user
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      [`unreadCount.${userId}`]: 0,
    });
    
    // Get unread messages
    const messagesQuery = query(
      collection(db, `chats/${chatId}/messages`),
      where('isRead', '==', false),
      where('senderId', '!=', userId)
    );
    
    const snapshot = await getDocs(messagesQuery);
    
    // Mark each message as read
    const batch = db.batch();
    
    snapshot.forEach((doc) => {
      const messageRef = doc.ref;
      batch.update(messageRef, { isRead: true });
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};