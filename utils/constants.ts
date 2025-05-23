// App constants
export const APP_NAME = 'FriendFinder';

// Colors
export const COLORS = {
  primary: '#3B82F6', // Blue
  primaryDark: '#2563EB',
  primaryLight: '#93C5FD',
  
  secondary: '#10B981', // Green
  secondaryDark: '#059669',
  secondaryLight: '#6EE7B7',
  
  accent: '#8B5CF6', // Purple
  accentDark: '#7C3AED',
  accentLight: '#C4B5FD',
  
  success: '#22C55E',
  warning: '#F97316',
  error: '#EF4444',
  
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  
  white: '#FFFFFF',
  black: '#000000',
};

// Spacing (8px grid)
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Font sizes
export const FONT_SIZE = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  heading: 24,
  largeHeading: 32,
};

// Font weights
export const FONT_WEIGHT = {
  regular: '400',
  medium: '500',
  bold: '700',
};

// Border radius
export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 9999,
};

// Z-index
export const Z_INDEX = {
  base: 0,
  above: 1,
  dropdown: 10,
  modal: 100,
};

// Animations
export const ANIMATION = {
  duration: {
    short: 150,
    medium: 300,
    long: 500,
  },
};

// Location update interval in milliseconds
export const LOCATION_UPDATE_INTERVAL = 30000; // 30 seconds

// Map defaults
export const MAP_DEFAULTS = {
  initialRegion: {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  defaultZoom: 15,
};

// Radius options in meters
export const RADIUS_OPTIONS = [
  { label: '100m', value: 100 },
  { label: '1km', value: 1000 },
  { label: '10km', value: 10000 },
];