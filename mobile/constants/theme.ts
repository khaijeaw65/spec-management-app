export const colors = {
  light: {
    background: '#fafafa',
    card: '#ffffff',
    border: '#e4e4e7',
    textPrimary: '#09090b',
    textSecondary: '#71717a',
    pendingBg: '#fef3c7',
    reviewedBg: '#dcfce7',
    processingBg: '#dbeafe',
    dangerBg: '#fee2e2',
    sectionBg: '#f4f4f5',
    subtleBg: '#f8fafc',
  },
  dark: {
    background: '#09090b',
    card: '#18181b',
    border: '#3f3f46',
    textPrimary: '#fafafa',
    textSecondary: '#a1a1aa',
    pendingBg: '#451a03',
    reviewedBg: '#052e16',
    processingBg: '#172554',
    dangerBg: '#450a0a',
    sectionBg: '#18181b',
    subtleBg: '#1c1c1e',
  },
  primary: '#2563eb',
  success: '#16a34a',
  warning: '#f59e0b',
  danger: '#ef4444',
  processing: '#3b82f6',
  white: '#ffffff',
};

export type ThemeMode = 'light' | 'dark';
export type ModeColors = typeof colors.light;
