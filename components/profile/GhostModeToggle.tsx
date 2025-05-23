import React from 'react';
import { View, Text, StyleSheet, Switch, Platform } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZE } from '../../utils/constants';

interface GhostModeToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export const GhostModeToggle: React.FC<GhostModeToggleProps> = ({
  value,
  onValueChange,
  disabled = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {value ? (
          <EyeOff size={24} color={COLORS.gray600} />
        ) : (
          <Eye size={24} color={COLORS.primary} />
        )}
      </View>
      
      <View style={styles.textContainer}>
        <Text style={styles.title}>
          {value ? 'Ghost Mode Active' : 'Share My Location'}
        </Text>
        <Text style={styles.description}>
          {value
            ? 'You are invisible to others on the map, but you can still see them.'
            : 'Others can see your location on the map.'}
        </Text>
      </View>
      
      <Switch
        value={!value}
        onValueChange={(newValue) => onValueChange(!newValue)}
        trackColor={{ false: COLORS.gray300, true: COLORS.primary }}
        thumbColor={
          Platform.OS === 'android' ? COLORS.white : undefined
        }
        ios_backgroundColor={COLORS.gray300}
        disabled={disabled}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    marginVertical: SPACING.sm,
  },
  iconContainer: {
    marginRight: SPACING.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.gray800,
    marginBottom: 2,
  },
  description: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray600,
  },
});