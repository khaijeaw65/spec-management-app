import { useColorScheme } from 'react-native';
import { colors } from '@/constants/theme';

export function useTheme() {
  const scheme = useColorScheme(); // 'light' | 'dark' | null
  const isDark = scheme === 'dark';
  const c = isDark ? colors.dark : colors.light;

  return { isDark, c, colors } as const;
}
