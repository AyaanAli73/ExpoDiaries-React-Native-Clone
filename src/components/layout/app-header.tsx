import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heading, Text } from '@/components/ui/typography';
import { Colors } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppStore } from '@/stores';

export interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showWorkspaceBadge?: boolean;
  action?: React.ReactNode;
  style?: ViewStyle;
}

export function AppHeader({
  title,
  subtitle,
  showWorkspaceBadge = true,
  action,
  style,
}: AppHeaderProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const { activeWorkspace, themePreference, setThemePreference } = useAppStore();

  const toggleTheme = () => {
    if (themePreference === 'dark') {
      setThemePreference('light');
    } else {
      setThemePreference('dark');
    }
  };

  return (
    <View style={[styles.container, { borderBottomColor: theme.borderSubtle }, style]}>
      <View style={styles.leftCol}>
        {showWorkspaceBadge && (
          <View style={styles.workspaceRow}>
            <Badge label={activeWorkspace.name} variant="outline" showDot />
            <Text variant="caption" style={styles.planLabel}>
              {activeWorkspace.plan}
            </Text>
          </View>
        )}
        {title && (
          <Heading level={2} style={styles.title}>
            {title}
          </Heading>
        )}
        {subtitle && (
          <Text variant="secondary" style={styles.subtitle}>
            {subtitle}
          </Text>
        )}
      </View>

      <View style={styles.rightCol}>
        <Button
          variant="ghost"
          size="sm"
          label=""
          leftIcon={scheme === 'dark' ? 'Sun' : 'Moon'}
          onPress={toggleTheme}
          accessibilityLabel={`Switch to ${scheme === 'dark' ? 'light' : 'dark'} mode`}
          style={styles.themeBtn}
        />
        {action}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  leftCol: {
    flex: 1,
    paddingRight: 12,
  },
  workspaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  planLabel: {
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 2,
  },
  subtitle: {
    marginTop: 2,
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeBtn: {
    width: 34,
    height: 34,
    paddingHorizontal: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
