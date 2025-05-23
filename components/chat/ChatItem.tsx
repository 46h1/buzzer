import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Chat } from '../../services/chat';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../utils/constants';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../hooks/useAuth';

interface ChatItemProps {
  chat: Chat;
  onPress: (chatId: string) => void;
}

export const ChatItem: React.FC<ChatItemProps> = ({ chat, onPress }) => {
  const { user } = useAuth();
  
  if (!user) return null;
  
  // Get the other participant's info
  const otherParticipantId = chat.participants.find((id) => id !== user.uid);
  
  if (!otherParticipantId) return null;
  
  const otherParticipant = chat.participantInfo[otherParticipantId];
  
  // Get unread count for current user
  const unreadCount = chat.unreadCount?.[user.uid] || 0;
  
  // Format timestamp
  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // If today, show time
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If this week, show day name
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    
    // Otherwise show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };
  
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(chat.id)}
    >
      <Avatar
        uri={otherParticipant.profilePictureUrl}
        name={otherParticipant.displayName}
        size={50}
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {otherParticipant.displayName}
          </Text>
          <Text style={styles.time}>
            {formatTimestamp(chat.lastMessageTimestamp)}
          </Text>
        </View>
        
        <View style={styles.messageRow}>
          <Text style={styles.message} numberOfLines={1}>
            {chat.lastMessageText || 'No messages yet'}
          </Text>
          
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  content: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.gray800,
    flex: 1,
  },
  time: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray500,
    marginLeft: SPACING.sm,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  message: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray600,
    flex: 1,
  },
  badge: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.round,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: SPACING.sm,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
});