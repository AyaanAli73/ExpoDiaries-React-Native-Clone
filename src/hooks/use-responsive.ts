import { useWindowDimensions } from 'react-native';

import { Breakpoints } from '@/constants/theme';

export interface ResponsiveInfo {
  width: number;
  height: number;
  isLandscape: boolean;
  isSmallPhone: boolean;
  isPhone: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  gridColumns: number;
  contentPadding: number;
}

/**
 * Custom hook for dynamic responsiveness
 * Supports small Android phones, large Android phones, iPhones, tablets, and web.
 * Adapts grid columns, padding, and layout dynamically without hardcoding screen sizes.
 */
export function useResponsive(): ResponsiveInfo {
  const { width, height } = useWindowDimensions();

  const isLandscape = width > height;
  const isSmallPhone = width < 380;
  const isPhone = width < Breakpoints.tablet;
  const isTablet = width >= Breakpoints.tablet && width < Breakpoints.desktop;
  const isDesktop = width >= Breakpoints.desktop;

  // Compute adaptive column count for card grids
  let gridColumns = 1;
  if (width >= Breakpoints.desktop) {
    gridColumns = 3;
  } else if (width >= Breakpoints.tablet || (isPhone && isLandscape)) {
    gridColumns = 2;
  } else {
    gridColumns = 1;
  }

  // Compute adaptive content padding
  let contentPadding = 16;
  if (isSmallPhone) {
    contentPadding = 12;
  } else if (isTablet) {
    contentPadding = 24;
  } else if (isDesktop) {
    contentPadding = 32;
  }

  return {
    width,
    height,
    isLandscape,
    isSmallPhone,
    isPhone,
    isTablet,
    isDesktop,
    gridColumns,
    contentPadding,
  };
}
