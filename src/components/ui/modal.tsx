import React from 'react';
import {
  Modal as RNModal,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Icon, IconName } from '@/components/ui/icon';
import { Colors, Radius, Shadows, Spacing } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type ModalSize = 'sm' | 'md' | 'lg';

export interface ModalAction {
  label: string;
  onPress: () => void;
  loading?: boolean;
  danger?: boolean;
  disabled?: boolean;
}

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  icon?: IconName;
  children?: React.ReactNode;
  primaryAction?: ModalAction;
  secondaryAction?: ModalAction;
  closeOnBackdropPress?: boolean;
  showCloseButton?: boolean;
  size?: ModalSize;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export function Modal({
  visible,
  onClose,
  title,
  description,
  icon,
  children,
  primaryAction,
  secondaryAction,
  closeOnBackdropPress = true,
  showCloseButton = true,
  size = 'md',
  className,
  style,
}: ModalProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  const maxWidth = {
    sm: 340,
    md: 420,
    lg: 520,
  }[size];

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss dialog backdrop"
        onPress={closeOnBackdropPress ? onClose : undefined}
        style={styles.backdrop}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          accessibilityViewIsModal={true}
          aria-modal={true}
          style={[
            styles.dialogContainer,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              maxWidth,
            },
            style,
          ]}
          className={className}>
          <View style={styles.header}>
            <View style={styles.titleArea}>
              {icon && (
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: primaryAction?.danger
                        ? theme.dangerBackground
                        : theme.secondary,
                    },
                  ]}>
                  <Icon
                    name={icon}
                    size={20}
                    color={primaryAction?.danger ? theme.danger : theme.primary}
                  />
                </View>
              )}
              <View style={styles.headerText}>
                {title && <Heading level={3}>{title}</Heading>}
                {description && (
                  <AppText variant="caption" color="secondary" style={styles.description}>
                    {description}
                  </AppText>
                )}
              </View>
            </View>

            {showCloseButton && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close dialog"
                onPress={onClose}
                hitSlop={8}
                style={styles.closeButton}>
                <Icon name="X" size={18} color={theme.textSecondary} />
              </Pressable>
            )}
          </View>

          {children && <View style={styles.body}>{children}</View>}

          {(primaryAction || secondaryAction) && (
            <View style={styles.actions}>
              {secondaryAction && (
                <Button
                  label={secondaryAction.label}
                  variant="outline"
                  size="md"
                  disabled={secondaryAction.disabled}
                  onPress={secondaryAction.onPress}
                />
              )}
              {primaryAction && (
                <Button
                  label={primaryAction.label}
                  variant={primaryAction.danger ? 'danger' : 'primary'}
                  size="md"
                  loading={primaryAction.loading}
                  disabled={primaryAction.disabled}
                  onPress={primaryAction.onPress}
                />
              )}
            </View>
          )}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  dialogContainer: {
    width: '100%',
    borderRadius: Radius.large,
    borderWidth: 1,
    overflow: 'hidden',
    padding: Spacing.lg,
    ...Shadows.modal,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  titleArea: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.sm,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: Radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  description: {
    marginTop: 2,
  },
  closeButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  body: {
    marginVertical: Spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
});
