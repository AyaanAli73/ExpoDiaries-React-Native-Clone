import React, { forwardRef, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
} from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Input, InputProps } from '@/components/ui/input';
import { Colors, Spacing } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface SearchInputProps extends Omit<InputProps, 'leftAccessory' | 'rightAccessory'> {
  debounceMs?: number;
  onDebouncedChange?: (text: string) => void;
  onClear?: () => void;
  loading?: boolean;
}

export const SearchInput = forwardRef<TextInput, SearchInputProps>(function SearchInput(
  {
    value,
    defaultValue,
    onChangeText,
    onDebouncedChange,
    debounceMs = 300,
    onClear,
    loading = false,
    placeholder = 'Search…',
    containerStyle,
    ...props
  },
  ref
) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const [internalValue, setInternalValue] = useState(value ?? defaultValue ?? '');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync with controlled value
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  const handleChangeText = (text: string) => {
    if (value === undefined) {
      setInternalValue(text);
    }
    onChangeText?.(text);

    if (onDebouncedChange) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onDebouncedChange(text);
      }, debounceMs);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleClear = () => {
    if (value === undefined) {
      setInternalValue('');
    }
    onChangeText?.('');
    onDebouncedChange?.('');
    onClear?.();
  };

  const hasContent = internalValue.length > 0;

  return (
    <Input
      ref={ref}
      value={value !== undefined ? value : internalValue}
      onChangeText={handleChangeText}
      placeholder={placeholder}
      accessibilityRole="search"
      autoCapitalize="none"
      autoCorrect={false}
      returnKeyType="search"
      clearButtonMode="never"
      leftAccessory={
        <Icon name="Search" size={16} color={theme.textMuted} />
      }
      rightAccessory={
        loading ? (
          <ActivityIndicator size="small" color={theme.primary} />
        ) : hasContent ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            aria-label="Clear search"
            onPress={handleClear}
            hitSlop={8}
            style={styles.clearButton}>
            <Icon name="X" size={14} color={theme.textMuted} />
          </Pressable>
        ) : null
      }
      containerStyle={containerStyle}
      {...props}
    />
  );
});

const styles = StyleSheet.create({
  clearButton: {
    padding: Spacing.xs - 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
