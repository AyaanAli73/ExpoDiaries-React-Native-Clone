import React, { forwardRef, useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Colors, Radius, Spacing } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface InputProps extends TextInputProps {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  leftAccessory?: React.ReactNode;
  rightAccessory?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  className?: string;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  {
    label,
    helperText,
    error,
    required = false,
    disabled = false,
    leftAccessory,
    rightAccessory,
    containerStyle,
    inputStyle,
    style,
    className,
    onFocus,
    onBlur,
    placeholder,
    ...props
  },
  ref
) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const [isFocused, setIsFocused] = useState(false);

  const hasError = Boolean(error);

  const borderColor = hasError
    ? theme.danger
    : isFocused
      ? theme.primary
      : theme.border;

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

      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: disabled ? theme.secondary : theme.surface,
            borderColor,
            borderWidth: isFocused ? 1.5 : 1,
            opacity: disabled ? 0.6 : 1,
          },
        ]}>
        {leftAccessory && <View style={styles.accessoryLeft}>{leftAccessory}</View>}

        <TextInput
          ref={ref}
          editable={!disabled}
          placeholder={placeholder}
          placeholderTextColor={theme.textMuted}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          accessibilityLabel={props.accessibilityLabel || label}
          accessibilityState={{ disabled }}
          aria-invalid={hasError}
          style={[
            styles.input,
            {
              color: theme.textPrimary,
            },
            inputStyle,
            style,
          ]}
          {...props}
        />

        {rightAccessory && <View style={styles.accessoryRight}>{rightAccessory}</View>}
      </View>

      {error ? (
        <AppText
          variant="caption"
          accessibilityLiveRegion="polite"
          style={[styles.feedback, { color: theme.danger }]}>
          {error}
        </AppText>
      ) : helperText ? (
        <AppText
          variant="caption"
          color="muted"
          style={styles.feedback}>
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
});

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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.medium,
    minHeight: 38,
    paddingHorizontal: Spacing.md - 4,
  },
  input: {
    flex: 1,
    fontSize: 13,
    paddingVertical: Spacing.sm,
  },
  accessoryLeft: {
    marginRight: Spacing.sm,
    justifyContent: 'center',
  },
  accessoryRight: {
    marginLeft: Spacing.sm,
    justifyContent: 'center',
  },
  feedback: {
    marginTop: Spacing.xs,
  },
});
