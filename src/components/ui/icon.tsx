import React from 'react';
import { ColorValue } from 'react-native';
import * as LucideIcons from 'lucide-react-native';

import { Colors } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type IconName = keyof typeof LucideIcons;

const iconRegistry: Record<string, React.ElementType> = LucideIcons as unknown as Record<
  string,
  React.ElementType
>;

export interface IconProps {
  name: IconName;
  size?: number;
  color?: ColorValue | string;
  strokeWidth?: number;
  className?: string;
}

/**
 * Normalized Icon Component
 * Provides clean access to Lucide icons with automatic theme awareness and accessible sizing.
 */
export function Icon({
  name,
  size = 20,
  color,
  strokeWidth = 2,
}: IconProps) {
  const scheme = useColorScheme();
  const defaultColor = Colors[scheme].text;

  const IconComponent = iconRegistry[name] || iconRegistry.HelpCircle || null;

  if (!IconComponent) {
    return null;
  }

  return (
    <IconComponent
      size={size}
      color={color || defaultColor}
      strokeWidth={strokeWidth}
      aria-hidden="true"
    />
  );
}
