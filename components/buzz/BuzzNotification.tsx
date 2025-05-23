import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../utils/constants';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { Buzz } from '../../services/buzz';

interface BuzzNotificationProps {
  buzz: Buzz;
  onAccept: (buzzId: string) => void;
  onDecline: (buzzId: string) => void;
}

export const BuzzNotification: React.FC<BuzzNotificationProps> = ({
  buzz,
  onAccept,
  onDecline,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Avatar
          uri={buzz.senderProfilePic}
          name={buzz.senderName || ''}
          size={48}
        />
        <View style={styles.headerText}>
          <Text style={styles.name}>{buzz.senderName || 'Someone'}</Text>
          <Text style={styles.subtitle}>sent you a buzz!</Text>
        </View>
      </View>
      
      <Text style={styles.message}>
        Buzz back to start chatting with {buzz.senderName || 'them'}.
      </Text>
      
      <View style={styles.actions}>
        <Button
          title="Decline"
          variant="outline"
          size="small"
          onPress={() => onDecline(buzz.id)}
          style={styles.button}
        />
        <Button
          title="Buzz Back"
          variant="primary"
          size="small"
          onPress={() => onAccept(buzz.id)}
          style={styles.button}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  headerText: {
    marginLeft: SPACING.md,
  },
  name: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray600,
  },
  message: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray700,
    marginBottom: SPACING.md,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    marginLeft: SPACING.sm,
    minWidth: 100,
  },
});