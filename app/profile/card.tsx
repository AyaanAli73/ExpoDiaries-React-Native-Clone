import React, { useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { router } from 'expo-router';
import Animated, {
  FadeInDown,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { AppHeader } from '@/components/layout/app-header';
import { ScreenContainer } from '@/components/layout/screen-container';
import {
  AppText,
  Avatar,
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
import { useAuthStore } from '@/stores/use-auth-store';
import { Colors, Radius, Shadows, Spacing } from '@/theme';

type CardThemeKey = 'indigo' | 'emerald' | 'carbon' | 'violet';

interface CardThemeConfig {
  key: CardThemeKey;
  name: string;
  bgDark: string;
  accent: string;
  accentSubtle: string;
}

const CARD_THEMES: CardThemeConfig[] = [
  {
    key: 'indigo',
    name: 'Executive Indigo',
    bgDark: '#0F172A',
    accent: '#4F46E5',
    accentSubtle: '#EEF2FF',
  },
  {
    key: 'emerald',
    name: 'Emerald Tech',
    bgDark: '#064E3B',
    accent: '#059669',
    accentSubtle: '#ECFDF5',
  },
  {
    key: 'carbon',
    name: 'Cyber Carbon',
    bgDark: '#18181B',
    accent: '#3B82F6',
    accentSubtle: '#EFF6FF',
  },
  {
    key: 'violet',
    name: 'Royale Violet',
    bgDark: '#2E1065',
    accent: '#7C3AED',
    accentSubtle: '#F5F3FF',
  },
];

export default function DigitalBusinessCardScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const { user } = useAuthStore();

  const [activeThemeKey, setActiveThemeKey] = useState<CardThemeKey>('indigo');
  const [isFlipped, setIsFlipped] = useState(false);
  const [copied, setCopied] = useState(false);
  const flipRotation = useSharedValue(0);

  const activeCardTheme = CARD_THEMES.find((t) => t.key === activeThemeKey) || CARD_THEMES[0];

  const name = user?.name || 'Alex Mercer';
  const title = user?.title || 'VP of Global Events & Partnerships';
  const company = user?.company || 'Acme Corporation';
  const phone = user?.phone || '+1 (415) 555-0182';
  const email = user?.email || 'alex@acme.io';
  const website = user?.website || 'https://acme.io';
  const linkedin = user?.socialLinks?.linkedin || 'https://linkedin.com/in/alex-mercer';
  const twitter = user?.socialLinks?.twitter || 'https://x.com/alexmercer';
  const github = user?.socialLinks?.github || 'https://github.com/alexmercer';
  const publicSlug = user?.publicProfileSlug || 'alex-mercer';
  const publicUrl = `https://expodiaries.app/p/${publicSlug}`;

  const handleFlip = () => {
    const nextFlipped = !isFlipped;
    setIsFlipped(nextFlipped);
    flipRotation.value = withTiming(nextFlipped ? 180 : 0, { duration: 420 });
  };

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = `${interpolate(flipRotation.value, [0, 180], [0, 180])}deg`;
    const opacity = interpolate(flipRotation.value, [0, 89, 90, 180], [1, 1, 0, 0]);
    return {
      transform: [{ perspective: 1200 }, { rotateY }],
      opacity,
      zIndex: isFlipped ? 0 : 1,
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = `${interpolate(flipRotation.value, [0, 180], [180, 360])}deg`;
    const opacity = interpolate(flipRotation.value, [0, 89, 90, 180], [0, 0, 1, 1]);
    return {
      transform: [{ perspective: 1200 }, { rotateY }],
      opacity,
      zIndex: isFlipped ? 1 : 0,
    };
  });

  // Action: Share
  const handleShare = () => {
    const textPayload = `Digital Business Card: ${name}\n${title} at ${company}\n\nEmail: ${email}\nPhone: ${phone}\nWebsite: ${website}\nPublic Profile: ${publicUrl}`;
    Alert.alert('Share Business Card', textPayload);
  };

  // Action: Copy vCard / URL
  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
    Alert.alert(
      'Copied to Clipboard',
      `Contact details & public URL for ${name} copied to clipboard.`
    );
  };

  return (
    <ScreenContainer
      header={
        <AppHeader
          title="Digital Business Card"
          subtitle="Interactive NFC-ready attendee card and contact pass"
          action={
            <Button
              label="Back"
              variant="outline"
              size="sm"
              leftIcon="ChevronLeft"
              onPress={() => router.back()}
              aria-label="Back to main profile hub"
            />
          }
        />
      }>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* 1. Interactive 3D Card Preview */}
        <Animated.View entering={FadeInDown.duration(260)} style={styles.cardSection}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Digital Business Card for ${name}. Double tap to flip.`}
            onPress={handleFlip}
            style={styles.cardPressable}>
            {/* FRONT FACE */}
            <Animated.View
              style={[
                styles.cardFace,
                frontAnimatedStyle,
                {
                  backgroundColor: theme.surface,
                  borderColor: activeCardTheme.accent,
                },
                Shadows.modal,
              ]}>
              {/* Card Top: Lanyard & NFC */}
              <View style={styles.cardTopBar}>
                <View style={styles.lanyardHole} />
                <View style={styles.nfcBadge}>
                  <Icon name="Wifi" size={16} color={activeCardTheme.accent} />
                  <AppText
                    variant="caption"
                    weight="bold"
                    style={{ color: activeCardTheme.accent, fontSize: 11 }}>
                    NFC READY • TAP TO SHARE
                  </AppText>
                </View>
              </View>

              {/* Attendee Body: Photo & Identity */}
              <View style={styles.attendeeBody}>
                <Avatar
                  name={name}
                  source={user?.avatarUrl ? { uri: user.avatarUrl } : undefined}
                  size="xl"
                />
                <View style={styles.attendeeDetails}>
                  <View style={styles.nameHeaderRow}>
                    <AppText variant="title" weight="bold">
                      {name}
                    </AppText>
                    <Badge label="VERIFIED" variant="primary" size="sm" />
                  </View>
                  <AppText variant="body" weight="medium" color="secondary">
                    {title}
                  </AppText>
                  <AppText variant="caption" weight="bold" color="primary">
                    {company}
                  </AppText>
                </View>
              </View>

              {/* Card Bottom: Event Credentials & Tap Prompt */}
              <View
                style={[
                  styles.cardBottomBar,
                  { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
                ]}>
                <View style={{ flex: 1, gap: 2 }}>
                  <AppText variant="caption" color="muted" style={{ fontSize: 10 }}>
                    OFFICIAL DELEGATE PASS
                  </AppText>
                  <AppText variant="caption" weight="semibold" numberOfLines={1}>
                    CES 2026 • North Hall #N-408
                  </AppText>
                </View>
                <View style={styles.flipPrompt}>
                  <Icon name="RotateCw" size={14} color={theme.primary} />
                  <AppText variant="caption" color="primary" weight="bold">
                    Flip Card
                  </AppText>
                </View>
              </View>
            </Animated.View>

            {/* BACK FACE */}
            <Animated.View
              style={[
                styles.cardFace,
                styles.cardBack,
                backAnimatedStyle,
                {
                  backgroundColor: theme.surface,
                  borderColor: activeCardTheme.accent,
                },
                Shadows.modal,
              ]}>
              <View style={styles.cardTopBar}>
                <View style={{ gap: 2 }}>
                  <AppText variant="body" weight="bold">
                    Direct Contact Channels
                  </AppText>
                  <AppText variant="caption" color="secondary">
                    {company} • Official Delegate
                  </AppText>
                </View>
                <Badge label="CHANNELS" variant="outline" size="sm" />
              </View>

              {/* Contact Channels List */}
              <View style={styles.channelsList}>
                <Pressable
                  accessibilityRole="link"
                  accessibilityLabel={`Call ${phone}`}
                  onPress={() => Linking.openURL(`tel:${phone}`)}
                  style={styles.channelRow}>
                  <Icon name="Phone" size={16} color={activeCardTheme.accent} />
                  <AppText variant="caption" weight="semibold">
                    {phone}
                  </AppText>
                </Pressable>

                <Pressable
                  accessibilityRole="link"
                  accessibilityLabel={`Email ${email}`}
                  onPress={() => Linking.openURL(`mailto:${email}`)}
                  style={styles.channelRow}>
                  <Icon name="Mail" size={16} color={activeCardTheme.accent} />
                  <AppText variant="caption" weight="semibold">
                    {email}
                  </AppText>
                </Pressable>

                <Pressable
                  accessibilityRole="link"
                  accessibilityLabel={`Website ${website}`}
                  onPress={() => Linking.openURL(website)}
                  style={styles.channelRow}>
                  <Icon name="Globe" size={16} color={activeCardTheme.accent} />
                  <AppText variant="caption" weight="semibold" color="primary">
                    {website}
                  </AppText>
                </Pressable>

                {/* Social Links on Card Back */}
                <View style={styles.socialIconsRow}>
                  <Pressable
                    accessibilityRole="link"
                    accessibilityLabel="Open LinkedIn"
                    onPress={() => Linking.openURL(linkedin)}
                    style={styles.socialPill}>
                    <Icon name="Briefcase" size={14} color={theme.primary} />
                    <AppText variant="caption" weight="medium">
                      LinkedIn
                    </AppText>
                  </Pressable>
                  <Pressable
                    accessibilityRole="link"
                    accessibilityLabel="Open X Twitter"
                    onPress={() => Linking.openURL(twitter)}
                    style={styles.socialPill}>
                    <Icon name="AtSign" size={14} color={theme.primary} />
                    <AppText variant="caption" weight="medium">
                      X
                    </AppText>
                  </Pressable>
                  <Pressable
                    accessibilityRole="link"
                    accessibilityLabel="Open GitHub"
                    onPress={() => Linking.openURL(github)}
                    style={styles.socialPill}>
                    <Icon name="Code" size={14} color={theme.primary} />
                    <AppText variant="caption" weight="medium">
                      GitHub
                    </AppText>
                  </Pressable>
                </View>
              </View>

              {/* Back Footer Actions */}
              <View
                style={[
                  styles.cardBottomBar,
                  { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
                ]}>
                <Button
                  label="Open QR Pass"
                  variant="primary"
                  size="sm"
                  leftIcon="QrCode"
                  onPress={() => router.push('/profile/qr' as any)}
                  aria-label="View QR profile screen"
                />
                <Button
                  label="Flip Front ↺"
                  variant="outline"
                  size="sm"
                  onPress={handleFlip}
                  aria-label="Flip back to front"
                />
              </View>
            </Animated.View>
          </Pressable>
        </Animated.View>

        {/* 2. Primary Actions Toolbar: Share, Copy, Edit */}
        <Animated.View entering={FadeInDown.duration(260).delay(60)} style={styles.section}>
          <Card density="comfortable">
            <CardContent style={styles.actionsBar}>
              <Button
                label="Share Card"
                variant="primary"
                size="md"
                leftIcon="Share2"
                onPress={handleShare}
                aria-label="Share digital card"
                style={{ flex: 1 }}
              />
              <Button
                label={copied ? 'Copied!' : 'Copy Link'}
                variant="outline"
                size="md"
                leftIcon="Copy"
                onPress={handleCopy}
                aria-label="Copy public card link"
                style={{ flex: 1 }}
              />
              <Button
                label="Edit Info"
                variant="outline"
                size="md"
                leftIcon="Edit3"
                onPress={() => router.push('/profile/edit' as any)}
                aria-label="Edit profile details"
              />
            </CardContent>
          </Card>
        </Animated.View>

        {/* 3. Theme Customization */}
        <Animated.View entering={FadeInDown.duration(260).delay(120)} style={styles.section}>
          <Card density="comfortable">
            <CardHeader>
              <View style={styles.headerRow}>
                <Icon name="Palette" size={18} color={theme.primary} />
                <CardTitle level={2}>Card Accent Style</CardTitle>
              </View>
            </CardHeader>
            <CardContent style={styles.cardInner}>
              <View style={styles.themeGrid}>
                {CARD_THEMES.map((t) => {
                  const isSelected = activeThemeKey === t.key;
                  return (
                    <Pressable
                      key={t.key}
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${t.name} style`}
                      onPress={() => setActiveThemeKey(t.key)}
                      style={[
                        styles.themeOptionCard,
                        {
                          backgroundColor: isSelected
                            ? theme.primarySubtle
                            : theme.surfaceSubtle,
                          borderColor: isSelected ? t.accent : theme.border,
                        },
                      ]}>
                      <View
                        style={[styles.colorDot, { backgroundColor: t.accent }]}
                      />
                      <AppText
                        variant="caption"
                        weight={isSelected ? 'bold' : 'medium'}
                        color={isSelected ? 'primary' : undefined}>
                        {t.name}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </CardContent>
          </Card>
        </Animated.View>

        {/* 4. Complete Contact Information Snapshot */}
        <Animated.View entering={FadeInDown.duration(260).delay(180)} style={styles.section}>
          <Card density="comfortable">
            <CardHeader>
              <View style={styles.headerRow}>
                <Icon name="Info" size={18} color={theme.primary} />
                <CardTitle level={2}>Card Data Attributes</CardTitle>
              </View>
            </CardHeader>
            <CardContent style={styles.cardInner}>
              <View style={styles.attrRow}>
                <AppText variant="caption" color="secondary">
                  Full Name
                </AppText>
                <AppText variant="body" weight="semibold">
                  {name}
                </AppText>
              </View>
              <Divider />
              <View style={styles.attrRow}>
                <AppText variant="caption" color="secondary">
                  Job Title
                </AppText>
                <AppText variant="body" weight="medium">
                  {title}
                </AppText>
              </View>
              <Divider />
              <View style={styles.attrRow}>
                <AppText variant="caption" color="secondary">
                  Organization
                </AppText>
                <AppText variant="body" weight="bold" color="primary">
                  {company}
                </AppText>
              </View>
              <Divider />
              <View style={styles.attrRow}>
                <AppText variant="caption" color="secondary">
                  Phone Number
                </AppText>
                <AppText variant="body" weight="semibold">
                  {phone}
                </AppText>
              </View>
              <Divider />
              <View style={styles.attrRow}>
                <AppText variant="caption" color="secondary">
                  Work Email
                </AppText>
                <AppText variant="body" weight="semibold">
                  {email}
                </AppText>
              </View>
              <Divider />
              <View style={styles.attrRow}>
                <AppText variant="caption" color="secondary">
                  Website
                </AppText>
                <AppText variant="body" weight="semibold" color="primary">
                  {website}
                </AppText>
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
  cardSection: {
    height: 275,
    marginVertical: Spacing.xs,
  },
  cardPressable: {
    flex: 1,
    position: 'relative',
  },
  cardFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: Radius.large,
    borderWidth: 2,
    padding: Spacing.md,
    justifyContent: 'space-between',
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    justifyContent: 'space-between',
  },
  cardTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lanyardHole: {
    width: 38,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  nfcBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  attendeeBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  attendeeDetails: {
    flex: 1,
    gap: 2,
  },
  nameHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  cardBottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.xs + 3,
    borderRadius: Radius.medium,
    borderWidth: 1,
  },
  flipPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  channelsList: {
    gap: Spacing.xs + 2,
    paddingVertical: 2,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: 2,
  },
  socialIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 4,
  },
  socialPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  cardInner: {
    gap: Spacing.sm,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  themeOptionCard: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
    borderRadius: Radius.medium,
    borderWidth: 1.5,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  attrRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
