import React, { useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Icon, IconName } from '@/components/ui/icon';
import { Colors, Radius } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarShape = 'circle' | 'rounded' | 'square';
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';

export interface AvatarProps {
  source?: ImageSourcePropType | { uri: string };
  name?: string;
  size?: AvatarSize | number;
  shape?: AvatarShape;
  status?: AvatarStatus | null;
  fallbackIcon?: IconName;
  className?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

function getInitials(name?: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Generate consistent background color based on name string
function getAvatarBg(name?: string, isDark?: boolean): string {
  if (!name) return isDark ? '#1E293B' : '#E2E8F0';
  const palette = isDark
    ? ['#1E3A8A', '#064E3B', '#78350F', '#581C87', '#701A75', '#312E81']
    : ['#DBEAFE', '#D1FAE5', '#FEF3C7', '#F3E8FF', '#FCE7F3', '#E0E7FF'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % palette.length;
  return palette[index];
}

export function Avatar({
  source,
  name,
  size = 'md',
  shape = 'circle',
  status,
  fallbackIcon = 'User',
  className,
  style,
  accessibilityLabel,
}: AvatarProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const [imageError, setImageError] = useState(false);

  // Compute dimensions
  const dimension = ((): number => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'xs':
        return 24;
      case 'sm':
        return 30;
      case 'lg':
        return 44;
      case 'xl':
        return 56;
      case 'md':
      default:
        return 36;
    }
  })();

  const borderRadius = ((): number => {
    switch (shape) {
      case 'rounded':
        return dimension >= 44 ? Radius.large : Radius.medium;
      case 'square':
        return Radius.small;
      case 'circle':
      default:
        return Radius.pill;
    }
  })();

  const initials = getInitials(name);
  const showImage = source && !imageError;
  const isDark = scheme === 'dark';
  const defaultBg = getAvatarBg(name, isDark);
  const textColor = isDark ? theme.textPrimary : theme.primary;

  const statusColors: Record<AvatarStatus, string> = {
    online: theme.success,
    busy: theme.danger,
    away: theme.warning,
    offline: theme.textMuted,
  };

  const statusSize = Math.max(8, Math.round(dimension * 0.28));

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel || (name ? `${name}'s avatar` : 'Avatar')}
      style={[
        styles.container,
        {
          width: dimension,
          height: dimension,
          borderRadius,
          backgroundColor: defaultBg,
        },
        style,
      ]}
      className={className}>
      {showImage ? (
        <Image
          source={source}
          onError={() => setImageError(true)}
          style={[
            styles.image,
            {
              width: dimension,
              height: dimension,
              borderRadius,
            },
          ]}
          resizeMode="cover"
        />
      ) : initials ? (
        <AppText
          weight="semibold"
          style={{
            fontSize: Math.round(dimension * 0.38),
            color: textColor,
          }}>
          {initials}
        </AppText>
      ) : (
        <Icon
          name={fallbackIcon}
          size={Math.round(dimension * 0.5)}
          color={textColor}
        />
      )}

      {status && (
        <View
          style={[
            styles.statusDot,
            {
              width: statusSize,
              height: statusSize,
              borderRadius: Radius.pill,
              backgroundColor: statusColors[status],
              borderColor: theme.surface,
              borderWidth: Math.max(1.5, Math.round(statusSize * 0.2)),
              bottom: shape === 'circle' ? 0 : -2,
              right: shape === 'circle' ? 0 : -2,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  image: {
    overflow: 'hidden',
  },
  statusDot: {
    position: 'absolute',
  },
});
