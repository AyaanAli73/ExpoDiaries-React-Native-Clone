import React, { useEffect, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { Icon, type IconName } from '@/components/ui/icon';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Radius, Spacing } from '@/theme';

type ThemeColors = (typeof Colors)[keyof typeof Colors];

interface TabRoute {
  key: string;
  name: string;
  params?: unknown;
}

export interface AppTabBarProps {
  state: {
    index: number;
    routes: {
      key: string;
      name: string;
      params?: unknown;
    }[];
  };
  descriptors: Record<string, any>;
  navigation: {
    emit: (event: any) => any;
    navigate: (name: string, params?: any) => void;
  };
  insets?: any;
}

interface TabMeta {
  name: string;
  label: string;
  icon: IconName;
  isCenterAction?: boolean;
}

const TAB_CONFIG: Record<string, TabMeta> = {
  index: {
    name: 'index',
    label: 'Home',
    icon: 'LayoutDashboard',
  },
  events: {
    name: 'events',
    label: 'Events',
    icon: 'Calendar',
  },
  leads: {
    name: 'leads',
    label: 'Leads',
    icon: 'Users',
  },
  capture: {
    name: 'capture',
    label: 'Capture',
    icon: 'QrCode',
    isCenterAction: true,
  },
  profile: {
    name: 'profile',
    label: 'Profile',
    icon: 'User',
  },
};

interface AnimatedTabItemProps {
  label: string;
  icon: IconName;
  isFocused: boolean;
  isCenter?: boolean;
  onPress: () => void;
  onLongPress: () => void;
  theme: ThemeColors;
}

function AnimatedTabItem({
  label,
  icon,
  isFocused,
  isCenter,
  onPress,
  onLongPress,
  theme,
}: AnimatedTabItemProps) {
  const [scaleAnim] = useState(() => new Animated.Value(1));
  const [indicatorAnim] = useState(() => new Animated.Value(isFocused ? 1 : 0));

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isFocused ? 1.05 : 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(indicatorAnim, {
        toValue: isFocused ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocused, scaleAnim, indicatorAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: isCenter ? 0.92 : 0.94,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: isFocused ? 1.05 : 1,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  if (isCenter) {
    return (
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: isFocused }}
        accessibilityLabel={`${label} tab, rapid lead scanner`}
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.centerTabContainer}>
        <Animated.View
          style={[
            styles.centerTabItem,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}>
          <View
            style={[
              styles.centerIconWrapper,
              {
                backgroundColor: theme.primary,
                borderColor: theme.surface,
              },
            ]}>
            <Icon name={icon} size={22} color="#FFFFFF" />
          </View>
          <AppText
            weight={isFocused ? 'bold' : 'semibold'}
            style={[
              styles.tabLabelText,
              {
                color: isFocused ? theme.primary : theme.textSecondary,
              },
            ]}>
            {label}
          </AppText>
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={`${label} tab`}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabItemContainer}>
      <Animated.View
        style={[
          styles.tabItem,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}>
        <View
          style={[
            styles.tabIconWrapper,
            isFocused && {
              backgroundColor: theme.primarySubtle,
            },
          ]}>
          <Icon
            name={icon}
            size={20}
            color={isFocused ? theme.primary : theme.textMuted}
          />
        </View>

        <AppText
          weight={isFocused ? 'bold' : 'medium'}
          style={[
            styles.tabLabelText,
            {
              color: isFocused ? theme.primary : theme.textMuted,
            },
          ]}>
          {label}
        </AppText>

        <Animated.View
          style={[
            styles.activeTabIndicator,
            {
              backgroundColor: theme.primary,
              opacity: indicatorAnim,
              transform: [{ scaleX: indicatorAnim }],
            },
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

export function AppTabBar({ state, descriptors, navigation }: AppTabBarProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const insets = useSafeAreaInsets();

  // Exactly 5 mobile tabs in order: Home, Events, Leads, Capture, Profile
  const orderedTabNames = ['index', 'events', 'leads', 'capture', 'profile'];

  const activeRoutes = orderedTabNames
    .map((name) => state.routes.find((r: TabRoute) => r.name === name))
    .filter((r): r is TabRoute => Boolean(r));

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}>
      <View style={styles.tabsRow}>
        {activeRoutes.map((route: TabRoute) => {
          const isFocused = state.routes[state.index]?.name === route.name;
          const { options } = descriptors[route.key] || {};
          const meta = TAB_CONFIG[route.name] || {
            name: route.name,
            label: options?.title || route.name,
            icon: 'Circle' as IconName,
          };

          const label = meta.label;
          const isCenter = Boolean(meta.isCenterAction);

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <AnimatedTabItem
              key={route.key}
              label={label}
              icon={meta.icon}
              isFocused={isFocused}
              isCenter={isCenter}
              onPress={onPress}
              onLongPress={onLongPress}
              theme={theme}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    borderTopWidth: 1,
    paddingTop: 6,
    zIndex: 30,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.xs,
  },
  tabItemContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItem: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    position: 'relative',
    gap: 3,
  },
  tabIconWrapper: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabelText: {
    fontSize: 10,
    letterSpacing: 0.1,
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: -4,
    width: 16,
    height: 3,
    borderRadius: Radius.pill,
  },
  centerTabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
    gap: 2,
  },
  centerIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
});
