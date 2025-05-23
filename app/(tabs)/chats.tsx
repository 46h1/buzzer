import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { MessageSquareOff } from 'lucide-react-native';
import { useChat } from '../../hooks/useChat';
import { ChatItem } from '../../components/chat/ChatItem';
import { LoadingIndicator } from '../../components/common/LoadingIndicator';
import { COLORS, SPACING, FONT_SIZE } from '../../utils/constants';

export default function ChatsScreen() {
  const { chats, loading } = useChat();
  const router = useRouter();
  
  const handleChatPress = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };
  
  const renderEmptyComponent = () => {
    return (
      <View style={styles.emptyContainer}>
        <MessageSquareOff size={60} color={COLORS.gray400} />
        <Text style={styles.emptyTitle}>No chats yet</Text>
        <Text style={styles.emptyText}>
          When you connect with friends, your conversations will appear here.
        </Text>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      {loading ? (
        <LoadingIndicator message="Loading chats..." />
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatItem chat={item} onPress={handleChatPress} />
          )}
          contentContainerStyle={chats.length === 0 && styles.fullHeight}
          ListEmptyComponent={renderEmptyComponent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  fullHeight: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '600',
    color: COLORS.gray800,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray600,
    textAlign: 'center',
    maxWidth: 300,
  },
});