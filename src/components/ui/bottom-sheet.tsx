import React from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { Heading } from '@/components/ui/heading';
import { Icon } from '@/components/ui/icon';
import { Colors, Radius, Shadows, Spacing } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showHandle?: boolean;
  showCloseButton?: boolean;
  avoidKeyboard?: boolean;
  maxHeightPercent?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export function BottomSheet({
  visible,
  onClose,
  title,
  subtitle,
  children,
  footer,
  showHandle = true,
  showCloseButton = true,
  avoidKeyboard = true,
  maxHeightPercent = 85,
  className,
  style,
}: BottomSheetProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={avoidKeyboard && Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss bottom sheet"
          onPress={onClose}
          style={styles.backdrop}>
          <Pressable
            onPress={(e) => e.stopPropagation()}
            accessibilityViewIsModal={true}
            aria-modal={true}
            style={[
              styles.sheetContainer,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                maxHeight: `${maxHeightPercent}%`,
                paddingBottom: Math.max(insets.bottom, Spacing.md),
              },
              style,
            ]}
            className={className}>
            {showHandle && (
              <View style={styles.handleContainer}>
                <View
                  style={[
                    styles.handleBar,
                    { backgroundColor: theme.border },
                  ]}
                />
              </View>
            )}

            {(title || showCloseButton) && (
              <View style={styles.headerRow}>
                <View style={styles.titleContainer}>
                  {title && <Heading level={3}>{title}</Heading>}
                  {subtitle && (
                    <AppText variant="caption" color="muted" style={styles.subtitle}>
                      {subtitle}
                    </AppText>
                  )}
                </View>
                {showCloseButton && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                    onPress={onClose}
                    hitSlop={8}
                    style={styles.closeButton}>
                    <Icon name="X" size={18} color={theme.textSecondary} />
                  </Pressable>
                )}
              </View>
            )}

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled">
              {children}
            </ScrollView>

            {footer && <View style={styles.footerContainer}>{footer}</View>}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  sheetContainer: {
    width: '100%',
    maxWidth: 580,
    borderTopLeftRadius: Radius.large,
    borderTopRightRadius: Radius.large,
    borderTopWidth: 1,
    overflow: 'hidden',
    ...Shadows.modal,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: Radius.pill,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  titleContainer: {
    flex: 1,
  },
  subtitle: {
    marginTop: 2,
  },
  closeButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  footerContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128,128,128,0.15)',
  },
});
