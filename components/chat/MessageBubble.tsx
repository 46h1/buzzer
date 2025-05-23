import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Message } from '../../services/chat';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../utils/constants';
import { Check, CheckCheck } from 'lucide-react-native';

interface MessageBubbleProps {
  message: Message;
  isSender: boolean;
  showTimestamp?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isSender,
  showTimestamp = true,
}) => {
  // Format timestamp
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <View
      style={[
        styles.container,
        isSender ? styles.senderContainer : styles.receiverContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isSender ? styles.senderBubble : styles.receiverBubble,
        ]}
      >
        <Text style={isSender ? styles.senderText : styles.receiverText}>
          {message.text}
        </Text>
        
        {showTimestamp && (
          <View style={styles.timestampContainer}>
            <Text style={styles.timestamp}>
              {formatTime(message.timestamp)}
            </Text>
            
            {isSender && (
              <View style={styles.readStatus}>
                {message.isRead ? (
                  <CheckCheck size={12} color={COLORS.primary} />
                ) : (
                  <Check size={12} color={COLORS.gray400} />
                )}
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.xs,
    marginHorizontal: SPACING.md,
    maxWidth: '80%',
  },
  senderContainer: {
    alignSelf: 'flex-end',
  },
  receiverContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  senderBubble: {
    backgroundColor: COLORS.primary,
  },
  receiverBubble: {
    backgroundColor: COLORS.gray200,
  },
  senderText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
  },
  receiverText: {
    color: COLORS.gray800,
    fontSize: FONT_SIZE.md,
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timestamp: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray400,
    marginRight: 4,
  },
  readStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});