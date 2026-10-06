import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Heading } from '@/components/ui/heading';
import { Icon, IconName } from '@/components/ui/icon';
import { Colors, Radius, Shadows, Spacing } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface SelectOption<T extends string | number = string | number> {
  label: string;
  value: T;
  icon?: IconName;
  description?: string;
}

export interface SelectFieldProps<T extends string | number = string | number> {
  label?: string;
  placeholder?: string;
  options: SelectOption<T>[];
  value?: T | null;
  onSelect: (value: T) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  containerStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function SelectField<T extends string | number = string | number>({
  label,
  placeholder = 'Select an option…',
  options,
  value,
  onSelect,
  error,
  helperText,
  disabled = false,
  required = false,
  className,
  containerStyle,
  accessibilityLabel,
}: SelectFieldProps<T>) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);
  const hasError = Boolean(error);

  const borderColor = hasError
    ? theme.danger
    : isOpen
      ? theme.primary
      : theme.border;

  const handleSelect = (val: T) => {
    onSelect(val);
    setIsOpen(false);
  };

  return (
    <View style={[styles.container, containerStyle]} className={className}>
      {label && (
        <View style={styles.labelRow}>
          <AppText weight="medium" style={styles.label}>
            {label}
          </AppText>
          {required && (
            <AppText style={{ color: theme.danger, marginLeft: 2 }}>*</AppText>
          )}
        </View>
      )}

      <Pressable
        accessibilityRole="combobox"
        accessibilityLabel={accessibilityLabel || label || placeholder}
        accessibilityState={{ expanded: isOpen, disabled }}
        aria-expanded={isOpen}
        aria-disabled={disabled}
        disabled={disabled}
        onPress={() => setIsOpen(true)}
        style={(state) => [
          styles.trigger,
          {
            backgroundColor: disabled ? theme.secondary : theme.surface,
            borderColor,
            borderWidth: isOpen ? 1.5 : 1,
            opacity: disabled ? 0.6 : 1,
            transform: [{ scale: state.pressed && !disabled ? 0.99 : 1 }],
          },
        ]}>
        <View style={styles.triggerContent}>
          {selectedOption?.icon && (
            <View style={styles.optionIconWrapper}>
              <Icon name={selectedOption.icon} size={16} color={theme.primary} />
            </View>
          )}
          <AppText
            style={{
              color: selectedOption ? theme.textPrimary : theme.textMuted,
              fontSize: 13,
            }}>
            {selectedOption ? selectedOption.label : placeholder}
          </AppText>
        </View>

        <Icon
          name={isOpen ? 'ChevronUp' : 'ChevronDown'}
          size={16}
          color={theme.textMuted}
        />
      </Pressable>

      {error ? (
        <AppText
          variant="caption"
          accessibilityLiveRegion="polite"
          style={[styles.feedback, { color: theme.danger }]}>
          {error}
        </AppText>
      ) : helperText ? (
        <AppText variant="caption" color="muted" style={styles.feedback}>
          {helperText}
        </AppText>
      ) : null}

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}>
        <Pressable
          accessibilityLabel="Close selection sheet"
          onPress={() => setIsOpen(false)}
          style={styles.modalBackdrop}>
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={[
              styles.modalSheet,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}>
            <View style={styles.sheetHeader}>
              <Heading level={3}>{label || 'Select Option'}</Heading>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close"
                onPress={() => setIsOpen(false)}
                hitSlop={8}>
                <Icon name="X" size={18} color={theme.textSecondary} />
              </Pressable>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => String(item.value)}
              style={styles.optionsList}
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => handleSelect(item.value)}
                    style={(state) => [
                      styles.optionItem,
                      {
                        backgroundColor: isSelected
                          ? theme.primarySubtle
                          : state.pressed
                            ? theme.secondary
                            : 'transparent',
                      },
                    ]}>
                    <View style={styles.optionDetails}>
                      {item.icon && (
                        <View style={styles.optionIconWrapper}>
                          <Icon
                            name={item.icon}
                            size={16}
                            color={isSelected ? theme.primary : theme.textSecondary}
                          />
                        </View>
                      )}
                      <View>
                        <AppText
                          weight={isSelected ? 'semibold' : 'normal'}
                          style={{
                            color: isSelected ? theme.primary : theme.textPrimary,
                            fontSize: 13,
                          }}>
                          {item.label}
                        </AppText>
                        {item.description && (
                          <AppText variant="caption" color="muted">
                            {item.description}
                          </AppText>
                        )}
                      </View>
                    </View>

                    {isSelected && (
                      <Icon name="Check" size={16} color={theme.primary} />
                    )}
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: 12,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radius.medium,
    minHeight: 38,
    paddingHorizontal: Spacing.md - 4,
  },
  triggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIconWrapper: {
    marginRight: Spacing.xs + 2,
  },
  feedback: {
    marginTop: Spacing.xs,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: Radius.large,
    borderTopRightRadius: Radius.large,
    borderTopWidth: 1,
    maxHeight: '65%',
    paddingBottom: Spacing.xl,
    ...Shadows.modal,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.15)',
  },
  optionsList: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.medium,
    marginVertical: 2,
  },
  optionDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
});
