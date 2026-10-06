import React from 'react';
import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  View,
  ViewProps,
  ViewStyle,
  TextStyle,
} from 'react-native';

import { Heading } from '@/components/ui/heading';
import { AppText } from '@/components/ui/app-text';
import { Colors, Radius, Shadows, Spacing } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type CardVariant = 'default' | 'elevated' | 'outline' | 'flat';

export type CardDensity = 'comfortable' | 'compact';

export interface CardProps extends Omit<ViewProps, 'style'> {
  variant?: CardVariant;
  density?: CardDensity;
  interactive?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  className?: string;
  style?: StyleProp<ViewStyle> | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
  accessibilityLabel?: string;
}

export function Card({
  variant = 'default',
  density = 'comfortable',
  interactive = false,
  disabled = false,
  onPress,
  children,
  style,
  className,
  accessibilityLabel,
  ...props
}: CardProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  const isInteractive = interactive || Boolean(onPress);

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: theme.surfaceElevated,
          borderColor: theme.border,
          borderWidth: 1,
          ...Shadows.elevated,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: theme.border,
          borderWidth: 1,
        };
      case 'flat':
        return {
          backgroundColor: theme.secondary,
          borderColor: 'transparent',
          borderWidth: 0,
        };
      case 'default':
      default:
        return {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          borderWidth: 1,
          ...Shadows.subtle,
        };
    }
  };

  const containerStyle: ViewStyle = {
    borderRadius: density === 'compact' ? Radius.medium : Radius.large,
    ...getVariantStyles(),
  };

  if (isInteractive && onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        style={(state) => [
          styles.base,
          containerStyle,
          {
            opacity: disabled ? 0.6 : state.pressed ? 0.92 : 1,
            transform: [{ scale: state.pressed && !disabled ? 0.98 : 1 }],
          },
          typeof style === 'function' ? style(state) : style,
        ]}
        className={className}
        {...(props as PressableProps)}>
        {children}
      </Pressable>
    );
  }

  return (
    <View
      style={[
        styles.base,
        containerStyle,
        style as StyleProp<ViewStyle>,
      ]}
      className={className}
      {...props}>
      {children}
    </View>
  );
}

export interface CardHeaderProps extends ViewProps {
  className?: string;
}

export function CardHeader({ children, style, className, ...props }: CardHeaderProps) {
  return (
    <View style={[styles.header, style]} className={className} {...props}>
      {children}
    </View>
  );
}

export interface CardTitleProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4;
  className?: string;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}

export function CardTitle({
  children,
  level = 3,
  className,
  style,
  numberOfLines,
}: CardTitleProps) {
  return (
    <Heading
      level={level}
      className={className}
      style={style}
      numberOfLines={numberOfLines}>
      {children}
    </Heading>
  );
}

export interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
  style?: StyleProp<TextStyle>;
}

export function CardDescription({ children, className, style }: CardDescriptionProps) {
  return (
    <AppText color="secondary" variant="caption" className={className} style={[styles.description, style]}>
      {children}
    </AppText>
  );
}

export interface CardContentProps extends ViewProps {
  className?: string;
}

export function CardContent({ children, style, className, ...props }: CardContentProps) {
  return (
    <View style={[styles.content, style]} className={className} {...props}>
      {children}
    </View>
  );
}

export interface CardFooterProps extends ViewProps {
  className?: string;
}

export function CardFooter({ children, style, className, ...props }: CardFooterProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  return (
    <View
      style={[
        styles.footer,
        { borderTopColor: theme.border },
        style,
      ]}
      className={className}
      {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  description: {
    marginTop: Spacing.xs,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  footer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
