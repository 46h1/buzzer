import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../utils/constants';
import { RadiusOptions } from '../../services/location';

interface RadiusSelectorProps {
  selectedRadius: RadiusOptions;
  onSelectRadius: (radius: RadiusOptions) => void;
}

export const RadiusSelector: React.FC<RadiusSelectorProps> = ({
  selectedRadius,
  onSelectRadius,
}) => {
  const radiusOptions = [
    { label: '100m', value: RadiusOptions.SMALL },
    { label: '1km', value: RadiusOptions.MEDIUM },
    { label: '10km', value: RadiusOptions.LARGE },
  ];
  
  return (
    <View style={styles.container}>
      {radiusOptions.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.option,
            selectedRadius === option.value && styles.selectedOption,
          ]}
          onPress={() => onSelectRadius(option.value)}
        >
          <Text
            style={[
              styles.optionText,
              selectedRadius === option.value && styles.selectedOptionText,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.xs,
    marginBottom: SPACING.md,
    alignSelf: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  option: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    marginHorizontal: SPACING.xs,
  },
  selectedOption: {
    backgroundColor: COLORS.primary,
  },
  optionText: {
    color: COLORS.gray700,
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
  },
  selectedOptionText: {
    color: COLORS.white,
  },
});