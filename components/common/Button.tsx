import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../utils/constants';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
  ...props
}) => {
  const getButtonStyles = (): ViewStyle => {
    let buttonStyle: ViewStyle = {
      ...styles.button,
      ...styles[`button${size.charAt(0).toUpperCase() + size.slice(1)}`],
    };
    
    if (fullWidth) {
      buttonStyle = { ...buttonStyle, ...styles.fullWidth };
    }
    
    switch (variant) {
      case 'primary':
        buttonStyle = { ...buttonStyle, ...styles.buttonPrimary };
        break;
      case 'secondary':
        buttonStyle = { ...buttonStyle, ...styles.buttonSecondary };
        break;
      case 'outline':
        buttonStyle = { ...buttonStyle, ...styles.buttonOutline };
        break;
      case 'ghost':
        buttonStyle = { ...buttonStyle, ...styles.buttonGhost };
        break;
      case 'danger':
        buttonStyle = { ...buttonStyle, ...styles.buttonDanger };
        break;
    }
    
    return buttonStyle;
  };
  
  const getTextStyles = (): TextStyle => {
    let labelStyle: TextStyle = {
      ...styles.text,
      ...styles[`text${size.charAt(0).toUpperCase() + size.slice(1)}`],
    };
    
    switch (variant) {
      case 'primary':
        labelStyle = { ...labelStyle, ...styles.textPrimary };
        break;
      case 'secondary':
        labelStyle = { ...labelStyle, ...styles.textSecondary };
        break;
      case 'outline':
        labelStyle = { ...labelStyle, ...styles.textOutline };
        break;
      case 'ghost':
        labelStyle = { ...labelStyle, ...styles.textGhost };
        break;
      case 'danger':
        labelStyle = { ...labelStyle, ...styles.textDanger };
        break;
    }
    
    return labelStyle;
  };
  
  return (
    <TouchableOpacity
      style={[getButtonStyles(), style]}
      disabled={loading || props.disabled}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'outline' || variant === 'ghost'
              ? COLORS.primary
              : COLORS.white
          }
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={[getTextStyles(), icon && styles.textWithIcon, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.md,
  },
  buttonSmall: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    minHeight: 32,
  },
  buttonMedium: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    minHeight: 40,
  },
  buttonLarge: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    minHeight: 48,
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
  },
  buttonSecondary: {
    backgroundColor: COLORS.secondary,
  },
  buttonDanger: {
    backgroundColor: COLORS.error,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  textSmall: {
    fontSize: FONT_SIZE.sm,
  },
  textMedium: {
    fontSize: FONT_SIZE.md,
  },
  textLarge: {
    fontSize: FONT_SIZE.lg,
  },
  textPrimary: {
    color: COLORS.white,
  },
  textSecondary: {
    color: COLORS.white,
  },
  textDanger: {
    color: COLORS.white,
  },
  textOutline: {
    color: COLORS.primary,
  },
  textGhost: {
    color: COLORS.primary,
  },
  textWithIcon: {
    marginLeft: SPACING.sm,
  },
  fullWidth: {
    width: '100%',
  },
});