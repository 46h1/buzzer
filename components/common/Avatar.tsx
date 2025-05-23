import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZE } from '../../utils/constants';

interface AvatarProps {
  uri?: string | null;
  size?: number;
  name?: string;
  backgroundColor?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  size = 40,
  name = '',
  backgroundColor = COLORS.primary,
}) => {
  // Get initials from name (up to 2 characters)
  const getInitials = (): string => {
    if (!name) return '';
    
    const names = name.split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    return (
      names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase()
    );
  };
  
  const fontSize = size * 0.4;
  
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: uri ? COLORS.gray200 : backgroundColor,
        },
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={[
            styles.image,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        />
      ) : (
        <Text style={[styles.initials, { fontSize }]}>{getInitials()}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    color: COLORS.white,
    fontWeight: '600',
  },
});