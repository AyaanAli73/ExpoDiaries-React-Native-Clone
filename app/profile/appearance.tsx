import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppHeader } from '@/components/layout/app-header';
import { ScreenContainer } from '@/components/layout/screen-container';
import {
  AppText,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Divider,
  Icon,
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppStore } from '@/stores/use-app-store';
import { useSettingsStore } from '@/stores/use-settings-store';
import { Colors, Radius, Spacing } from '@/theme';

type ThemeMode = 'system' | 'light' | 'dark';
type FontScale = 'standard' | 'large' | 'xlarge';

const ACCENT_COLORS = [
  { name: 'Indigo', hex: '#4F46E5' },
  { name: 'Emerald', hex: '#059669' },
  { name: 'Violet', hex: '#7C3AED' },
  { name: 'Blue', hex: '#2563EB' },
  { name: 'Amber', hex: '#D97706' },
];

export default function AppearanceScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const { density, setDensity } = useAppStore();
  const { themeMode, setThemeMode } = useSettingsStore();

  const [activeAccent, setActiveAccent] = useState('#4F46E5');
  const [highContrast, setHighContrast] = useState(false);
  const [tabularFigures, setTabularFigures] = useState(true);
  const [fontScale, setFontScale] = useState<FontScale>('standard');

  return (
    <ScreenContainer
      header={
        <AppHeader
          title="Appearance"
          subtitle="Theme, visual density, contrast, and typography styling"
          action={
            <Button
              label="Back"
              variant="outline"
              size="sm"
              leftIcon="ChevronLeft"
              onPress={() => router.back()}
              aria-label="Back to profile hub"
            />
          }
        />
      }>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* 1. Theme Mode Selection */}
        <Animated.View entering={FadeInDown.duration(260)} style={styles.section}>
          <Card density="comfortable">
            <CardHeader>
              <View style={styles.headerRow}>
                <Icon name="Moon" size={18} color={theme.primary} />
                <CardTitle level={2}>Color Scheme</CardTitle>
              </View>
            </CardHeader>
            <CardContent style={styles.cardInner}>
              <View style={styles.themeOptionsRow}>
                {[
                  { key: 'system', label: 'System Auto', icon: 'Smartphone' },
                  { key: 'light', label: 'Light', icon: 'Sun' },
                  { key: 'dark', label: 'Dark', icon: 'Moon' },
                ].map((item) => {
                  const isSelected = themeMode === item.key;
                  return (
                    <Pressable
                      key={item.key}
                      accessibilityRole="button"
                      accessibilityLabel={`Set ${item.label} theme`}
                      onPress={() => setThemeMode(item.key as ThemeMode)}
                      style={[
                        styles.themeButton,
                        {
                          backgroundColor: isSelected
                            ? theme.primarySubtle
                            : theme.surfaceSubtle,
                          borderColor: isSelected ? theme.primary : theme.border,
                        },
                      ]}>
                      <Icon
                        name={item.icon as any}
                        size={20}
                        color={isSelected ? theme.primary : theme.textMuted}
                      />
                      <AppText
                        variant="caption"
                        weight={isSelected ? 'bold' : 'medium'}
                        color={isSelected ? 'primary' : undefined}>
                        {item.label}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </CardContent>
          </Card>
        </Animated.View>

        {/* 2. Information Density */}
        <Animated.View entering={FadeInDown.duration(260).delay(60)} style={styles.section}>
          <Card density="comfortable">
            <CardHeader>
              <View style={styles.headerRow}>
                <Icon name="Layout" size={18} color={theme.primary} />
                <CardTitle level={2}>Information Density</CardTitle>
              </View>
            </CardHeader>
            <CardContent style={styles.cardInner}>
              <View style={styles.densityRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Set Comfortable Density"
                  onPress={() => setDensity('comfortable')}
                  style={[
                    styles.densityCard,
                    {
                      backgroundColor:
                        density === 'comfortable' ? theme.primarySubtle : theme.surfaceSubtle,
                      borderColor: density === 'comfortable' ? theme.primary : theme.border,
                    },
                  ]}>
                  <View style={{ gap: 2 }}>
                    <AppText
                      variant="body"
                      weight={density === 'comfortable' ? 'bold' : 'semibold'}
                      color={density === 'comfortable' ? 'primary' : undefined}>
                      Comfortable
                    </AppText>
                    <AppText variant="caption" color="secondary">
                      Spacious padding and touch targets for mobile trade-floor scanning
                    </AppText>
                  </View>
                  <Badge
                    label={density === 'comfortable' ? 'ACTIVE' : 'SELECT'}
                    variant={density === 'comfortable' ? 'primary' : 'outline'}
                    size="sm"
                  />
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Set Compact Density"
                  onPress={() => setDensity('compact')}
                  style={[
                    styles.densityCard,
                    {
                      backgroundColor:
                        density === 'compact' ? theme.primarySubtle : theme.surfaceSubtle,
                      borderColor: density === 'compact' ? theme.primary : theme.border,
                    },
                  ]}>
                  <View style={{ gap: 2 }}>
                    <AppText
                      variant="body"
                      weight={density === 'compact' ? 'bold' : 'semibold'}
                      color={density === 'compact' ? 'primary' : undefined}>
                      Compact
                    </AppText>
                    <AppText variant="caption" color="secondary">
                      Dense information display showing more lead records on screen
                    </AppText>
                  </View>
                  <Badge
                    label={density === 'compact' ? 'ACTIVE' : 'SELECT'}
                    variant={density === 'compact' ? 'primary' : 'outline'}
                    size="sm"
                  />
                </Pressable>
              </View>
            </CardContent>
          </Card>
        </Animated.View>

        {/* 3. Accent Palette */}
        <Animated.View entering={FadeInDown.duration(260).delay(120)} style={styles.section}>
          <Card density="comfortable">
            <CardHeader>
              <View style={styles.headerRow}>
                <Icon name="Palette" size={18} color={theme.primary} />
                <CardTitle level={2}>Brand Accent Color</CardTitle>
              </View>
            </CardHeader>
            <CardContent style={styles.cardInner}>
              <View style={styles.accentGrid}>
                {ACCENT_COLORS.map((col) => {
                  const isSelected = activeAccent === col.hex;
                  return (
                    <Pressable
                      key={col.hex}
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${col.name} accent`}
                      onPress={() => setActiveAccent(col.hex)}
                      style={[
                        styles.accentPill,
                        {
                          backgroundColor: isSelected
                            ? theme.primarySubtle
                            : theme.surfaceSubtle,
                          borderColor: isSelected ? col.hex : theme.border,
                        },
                      ]}>
                      <View style={[styles.colorBubble, { backgroundColor: col.hex }]} />
                      <AppText
                        variant="caption"
                        weight={isSelected ? 'bold' : 'medium'}
                        color={isSelected ? 'primary' : undefined}>
                        {col.name}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </CardContent>
          </Card>
        </Animated.View>

        {/* 4. Accessibility & Typography Controls */}
        <Animated.View entering={FadeInDown.duration(260).delay(180)} style={styles.section}>
          <Card density="comfortable">
            <CardHeader>
              <View style={styles.headerRow}>
                <Icon name="Type" size={18} color={theme.primary} />
                <CardTitle level={2}>Accessibility & Typography</CardTitle>
              </View>
            </CardHeader>
            <CardContent style={styles.cardInner}>
              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <AppText variant="body" weight="semibold">
                    High Contrast Borders
                  </AppText>
                  <AppText variant="caption" color="secondary">
                    Darken card borders and text contrast for harsh sunlit outdoor booths
                  </AppText>
                </View>
                <Switch
                  value={highContrast}
                  onValueChange={setHighContrast}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor={theme.surface}
                  style={styles.switchScale}
                />
              </View>

              <Divider />

              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <AppText variant="body" weight="semibold">
                    Tabular Figures for Numerals
                  </AppText>
                  <AppText variant="caption" color="secondary">
                    Align numerical digits evenly for KPI cards and lead count tables
                  </AppText>
                </View>
                <Switch
                  value={tabularFigures}
                  onValueChange={setTabularFigures}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor={theme.surface}
                  style={styles.switchScale}
                />
              </View>

              <Divider />

              {/* Font Scale Selector */}
              <View style={{ gap: Spacing.xs }}>
                <AppText variant="caption" color="secondary" weight="semibold">
                  Font Scale Preference:
                </AppText>
                <View style={styles.fontScaleRow}>
                  {[
                    { key: 'standard', label: 'Standard (100%)' },
                    { key: 'large', label: 'Large (115%)' },
                    { key: 'xlarge', label: 'Extra Large (130%)' },
                  ].map((fs) => (
                    <Pressable
                      key={fs.key}
                      accessibilityRole="button"
                      accessibilityLabel={`Set font scale ${fs.label}`}
                      onPress={() => setFontScale(fs.key as FontScale)}
                      style={[
                        styles.fontScalePill,
                        {
                          backgroundColor:
                            fontScale === fs.key ? theme.primarySubtle : theme.surfaceSubtle,
                          borderColor: fontScale === fs.key ? theme.primary : theme.border,
                        },
                      ]}>
                      <AppText
                        variant="caption"
                        weight={fontScale === fs.key ? 'bold' : 'medium'}
                        color={fontScale === fs.key ? 'primary' : undefined}>
                        {fs.label}
                      </AppText>
                    </Pressable>
                  ))}
                </View>
              </View>
            </CardContent>
          </Card>
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  cardInner: {
    gap: Spacing.sm,
  },
  themeOptionsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  themeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: Radius.medium,
    borderWidth: 1.5,
  },
  densityRow: {
    gap: Spacing.xs,
  },
  densityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.sm,
    borderRadius: Radius.medium,
    borderWidth: 1.5,
    gap: Spacing.sm,
  },
  accentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  accentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: Radius.full,
    borderWidth: 1.5,
  },
  colorBubble: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  toggleInfo: {
    flex: 1,
    gap: 2,
  },
  switchScale: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  fontScaleRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  fontScalePill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: Radius.medium,
    borderWidth: 1,
  },
});
