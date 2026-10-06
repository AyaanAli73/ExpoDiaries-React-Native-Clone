import React, { useEffect } from 'react';
import { DimensionValue, StyleProp, ViewProps, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Colors, Radius } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type SkeletonVariant = 'rect' | 'circle' | 'text';

export interface SkeletonProps extends ViewProps {
  variant?: SkeletonVariant;
  width?: number | string;
  height?: number | string;
  borderRadius?: number | 'pill';
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export function Skeleton({
  variant = 'rect',
  width = '100%',
  height,
  borderRadius,
  style,
  className,
}: SkeletonProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  const opacity = useSharedValue(0.35);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.75, { duration: 850 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // Resolve shape metrics
  const resolvedHeight = ((): number | string => {
    if (height !== undefined) return height;
    switch (variant) {
      case 'circle':
        return typeof width === 'number' ? width : 40;
      case 'text':
        return 14;
      case 'rect':
      default:
        return 18;
    }
  })();

  const resolvedWidth = variant === 'circle' && height && typeof height === 'number' && width === '100%'
    ? height
    : width;

  const resolvedRadius = ((): number => {
    if (typeof borderRadius === 'number') return borderRadius;
    if (borderRadius === 'pill' || variant === 'circle') return Radius.pill;
    if (variant === 'text') return Radius.small;
    return Radius.medium;
  })();

  return (
    <Animated.View
      accessibilityElementsHidden={true}
      importantForAccessibility="no-hide-descendants"
      style={[
        {
          width: resolvedWidth as DimensionValue,
          height: resolvedHeight as DimensionValue,
          borderRadius: resolvedRadius,
          backgroundColor: theme.secondary,
        },
        animatedStyle,
        style,
      ]}
      className={className}
    />
  );
}
