import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  Timestamp,
  orderBy,
  limit,
  onSnapshot,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import { getUserById } from './users';

// Buzz status enum
export enum BuzzStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
}

// Buzz interface
export interface Buzz {
  id: string;
  senderID: string;
  receiverID: string;
  timestamp: Date;
  status: BuzzStatus;
  senderName?: string;
  senderProfilePic?: string;
  receiverName?: string;
  receiverProfilePic?: string;
}

// Convert Firestore document to Buzz
export const convertToBuzz = (doc: QueryDocumentSnapshot<DocumentData>): Buzz => {
  const data = doc.data();
  
  return {
    id: doc.id,
    senderID: data.senderID,
    receiverID: data.receiverID,
    timestamp: data.timestamp?.toDate() || new Date(),
    status: data.status as BuzzStatus,
    senderName: data.senderName,
    senderProfilePic: data.senderProfilePic,
    receiverName: data.receiverName,
    receiverProfilePic: data.receiverProfilePic,
  };
};

// Send a buzz to another user
export const sendBuzz = async (
  senderID: string,
  receiverID: string
): Promise<string> => {
  try {
    // Get sender and receiver info to store in the buzz
    const sender = await getUserById(senderID);
    const receiver = await getUserById(receiverID);
    
    if (!sender || !receiver) {
      throw new Error('Sender or receiver not found');
    }
    
    // Create buzz document in Firestore
    const buzzRef = await addDoc(collection(db, 'buzzes'), {
      senderID,
      receiverID,
      timestamp: serverTimestamp(),
      status: BuzzStatus.PENDING,
      senderName: sender.displayName,
      senderProfilePic: sender.profilePictureUrl,
      receiverName: receiver.displayName,
      receiverProfilePic: receiver.profilePictureUrl,
    });
    
    // In a production app, trigger a cloud function to send FCM notification here
    
    return buzzRef.id;
  } catch (error) {
    console.error('Error sending buzz:', error);
    throw error;
  }
};

// Get buzzes for a user (sent or received)
export const getUserBuzzes = async (userId: string): Promise<Buzz[]> => {
  try {
    // Query buzzes where user is sender or receiver
    const buzzQuery = query(
      collection(db, 'buzzes'),
      where('senderID', '==', userId),
      orderBy('timestamp', 'desc')
    );
    
    const receivedBuzzQuery = query(
      collection(db, 'buzzes'),
      where('receiverID', '==', userId),
      orderBy('timestamp', 'desc')
    );
    
    const [sentSnapshot, receivedSnapshot] = await Promise.all([
      getDocs(buzzQuery),
      getDocs(receivedBuzzQuery),
    ]);
    
    const buzzes: Buzz[] = [];
    
    sentSnapshot.forEach((doc) => {
      buzzes.push(convertToBuzz(doc));
    });
    
    receivedSnapshot.forEach((doc) => {
      // Avoid duplicates if a buzz was both sent and received by the same user
      if (!buzzes.some((buzz) => buzz.id === doc.id)) {
        buzzes.push(convertToBuzz(doc));
      }
    });
    
    // Sort by timestamp, newest first
    return buzzes.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  } catch (error) {
    console.error('Error getting user buzzes:', error);
    throw error;
  }
};

// Get pending buzzes for a user
export const getPendingBuzzes = async (userId: string): Promise<Buzz[]> => {
  try {
    // Query buzzes where user is receiver and status is pending
    const buzzQuery = query(
      collection(db, 'buzzes'),
      where('receiverID', '==', userId),
      where('status', '==', BuzzStatus.PENDING),
      orderBy('timestamp', 'desc')
    );
    
    const snapshot = await getDocs(buzzQuery);
    
    const buzzes: Buzz[] = [];
    snapshot.forEach((doc) => {
      buzzes.push(convertToBuzz(doc));
    });
    
    return buzzes;
  } catch (error) {
    console.error('Error getting pending buzzes:', error);
    throw error;
  }
};

// Update buzz status (accept or decline)
export const updateBuzzStatus = async (
  buzzId: string,
  status: BuzzStatus
): Promise<void> => {
  try {
    const buzzRef = doc(db, 'buzzes', buzzId);
    await updateDoc(buzzRef, { status });
    
    // If buzz is accepted, create a chat between the users
    if (status === BuzzStatus.ACCEPTED) {
      const buzzDoc = await getDoc(buzzRef);
      
      if (buzzDoc.exists()) {
        const buzzData = buzzDoc.data();
        // In a production app, call a function to create a chat
        // createChat(buzzData.senderID, buzzData.receiverID);
      }
    }
  } catch (error) {
    console.error('Error updating buzz status:', error);
    throw error;
  }
};

// Subscribe to real-time updates for pending buzzes
export const subscribeToPendingBuzzes = (
  userId: string,
  callback: (buzzes: Buzz[]) => void
): (() => void) => {
  const buzzQuery = query(
    collection(db, 'buzzes'),
    where('receiverID', '==', userId),
    where('status', '==', BuzzStatus.PENDING),
    orderBy('timestamp', 'desc')
  );
  
  const unsubscribe = onSnapshot(
    buzzQuery,
    (snapshot) => {
      const buzzes: Buzz[] = [];
      
      snapshot.forEach((doc) => {
        buzzes.push(convertToBuzz(doc));
      });
      
      callback(buzzes);
    },
    (error) => {
      console.error('Error subscribing to pending buzzes:', error);
    }
  );
  
  return unsubscribe;
};