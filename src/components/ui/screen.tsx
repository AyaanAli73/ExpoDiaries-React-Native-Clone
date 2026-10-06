import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { Colors, Spacing } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useResponsive } from '@/hooks/use-responsive';

export interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  onRefresh?: () => Promise<void> | void;
  refreshing?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  safeAreaEdges?: ('top' | 'right' | 'bottom' | 'left')[];
  statusBarStyle?: 'light' | 'dark' | 'auto';
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  className?: string;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  keyboardAvoiding?: boolean;
  testID?: string;
}

export function Screen({
  children,
  scrollable = true,
  onRefresh,
  refreshing = false,
  header,
  footer,
  safeAreaEdges = ['top', 'left', 'right'],
  statusBarStyle,
  backgroundColor,
  style,
  contentContainerStyle,
  className,
  keyboardShouldPersistTaps = 'handled',
  keyboardAvoiding = Platform.OS === 'ios',
  testID,
}: ScreenProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const insets = useSafeAreaInsets();
  const { contentPadding, isTablet, isDesktop } = useResponsive();

  const resolvedBg = backgroundColor || theme.background;
  const bottomInset = insets.bottom > 0 ? insets.bottom : Spacing.md;

  const innerContent = (
    <View
      style={[
        styles.maxWidthContainer,
        { paddingHorizontal: contentPadding },
      ]}>
      {children}
    </View>
  );

  const screenBody = scrollable ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: bottomInset + Spacing.lg },
        (isTablet || isDesktop) && styles.alignCenter,
        contentContainerStyle,
      ]}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      keyboardDismissMode="on-drag"
      bounces={true}
      overScrollMode="always"
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        ) : undefined
      }>
      {innerContent}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.flex,
        (isTablet || isDesktop) && styles.alignCenter,
        { paddingBottom: bottomInset },
        contentContainerStyle,
      ]}>
      {innerContent}
    </View>
  );

  return (
    <SafeAreaView
      edges={safeAreaEdges}
      testID={testID}
      style={[styles.root, { backgroundColor: resolvedBg }, style]}
      className={className}>
      <StatusBar style={statusBarStyle || (scheme === 'dark' ? 'light' : 'dark')} />
      {header && <View style={styles.headerContainer}>{header}</View>}
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
          style={styles.flex}>
          {screenBody}
        </KeyboardAvoidingView>
      ) : (
        screenBody
      )}
      {footer && <View style={styles.footerContainer}>{footer}</View>}
    </SafeAreaView>
  );
}

// Backward compatibility alias
export const ScreenContainer = Screen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  headerContainer: {
    zIndex: 10,
  },
  footerContainer: {
    zIndex: 10,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: Spacing.xs,
  },
  alignCenter: {
    alignItems: 'center',
  },
  maxWidthContainer: {
    width: '100%',
    maxWidth: 1200,
    flex: 1,
  },
});
