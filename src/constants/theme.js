// PICK — Design System

export const COLORS = {
  // Core
  cream: '#FBF4E6',
  creamDark: '#F2E8D0',
  creamMid: '#EDE0C4',
  green: '#0F5B3C',
  greenDark: '#0A3D28',
  black: '#111111',
  white: '#FFFFFF',

  // Text — warmer browns
  textPrimary: '#2C1F0E',
  textSecondary: '#7A6248',
  textDim: '#B09A7E',
  textOnDark: '#FBF4E6',
  textOnDarkSoft: 'rgba(251,244,230,0.78)',

  // Surfaces — warm off-whites and tans
  surface: '#FFFAF2',
  surfaceSoft: '#F5ECD8',
  surfaceRaised: '#EDE0C4',

  // Borders — warm toned
  border: 'rgba(100,72,40,0.12)',
  borderStrong: 'rgba(100,72,40,0.22)',

  // Semantic
  warning: '#8B6914',
  warningBg: 'rgba(139,105,20,0.10)',
};

export const FONTS = {
  display: 'Saira_900Black',
  displayFallback: 'Georgia, serif',
  body: undefined,
};

export const RADIUS = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 28,
  full: 999,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  screen: 20,
};

export const SHADOW = {
  card: {
    shadowColor: '#6B4423',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  cardStrong: {
    shadowColor: '#6B4423',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 8,
  },
  nav: {
    shadowColor: '#6B4423',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 12,
  },
};

export const RESULT_LABELS = {
  BEST: 'Best pick',
  STRONG: 'Strong option',
  CONSIDER: 'Worth considering',
  SKIP: 'Skip this one',
  POST: 'Post this',
  HOLD: 'Hold for now',
};

export const FREE_PICKS_LIMIT = 999; // Set back to 5 before App Store submission
export const RC_ENTITLEMENT = 'pick_premium';
export const RC_OFFERING = 'default';
