import { useState, useEffect, useCallback } from 'react';
import {
  getUserChats,
  subscribeToUserChats,
  getChatMessages,
  subscribeToChatMessages,
  sendMessage,
  markMessagesAsRead,
  Chat,
  Message,
  createChat,
  generateChatId,
} from '../services/chat';
import { useAuth } from './useAuth';

export function useChat(chatId?: string) {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Subscribe to user chats
  useEffect(() => {
    if (!user) {
      setChats([]);
      return;
    }
    
    const unsubscribe = subscribeToUserChats(user.uid, (updatedChats) => {
      setChats(updatedChats);
    });
    
    return () => unsubscribe();
  }, [user]);
  
  // Subscribe to chat messages if chatId is provided
  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      return;
    }
    
    setLoading(true);
    
    const unsubscribe = subscribeToChatMessages(chatId, (updatedMessages) => {
      setMessages(updatedMessages);
      setLoading(false);
    });
    
    // Mark messages as read when chat is opened
    if (user) {
      markMessagesAsRead(chatId, user.uid).catch((err) => {
        console.error('Error marking messages as read:', err);
      });
    }
    
    return () => unsubscribe();
  }, [chatId, user]);
  
  // Send a message
  const sendChatMessage = async (text: string) => {
    if (!user || !chatId) {
      setError('Unable to send message');
      return null;
    }
    
    try {
      const messageId = await sendMessage(chatId, user.uid, text);
      return messageId;
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      return null;
    }
  };
  
  // Start or get a chat with another user
  const startChatWithUser = async (otherUserId: string) => {
    if (!user) {
      setError('You must be logged in to start a chat');
      return null;
    }
    
    try {
      setLoading(true);
      
      // Generate chat ID
      const chatId = generateChatId(user.uid, otherUserId);
      
      // Check if chat already exists in our local state
      const existingChat = chats.find((chat) => chat.id === chatId);
      
      if (existingChat) {
        return chatId;
      }
      
      // Create or get chat
      const newChatId = await createChat(user.uid, otherUserId);
      return newChatId;
    } catch (err) {
      console.error('Error starting chat:', err);
      setError('Failed to start chat');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Mark messages as read
  const markAsRead = useCallback(async () => {
    if (!user || !chatId) return;
    
    try {
      await markMessagesAsRead(chatId, user.uid);
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  }, [user, chatId]);
  
  return {
    chats,
    messages,
    loading,
    error,
    sendChatMessage,
    startChatWithUser,
    markAsRead,
  };
}