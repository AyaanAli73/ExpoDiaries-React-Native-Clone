import React, { useState } from 'react';
import {
  Linking,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {
  AppText,
  Avatar,
  Badge,
  Button,
  Icon,
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Radius, Shadows, Spacing } from '@/theme';
import { AuthUser } from '@/types/auth';

interface DigitalBusinessCardProps {
  user: AuthUser | null;
  boothLocation?: string;
  eventName?: string;
  onOpenQrModal: () => void;
}

export function DigitalBusinessCard({
  user,
  boothLocation = 'Booth #4209 (AI Pavilion)',
  eventName = 'CES 2026 Las Vegas',
  onOpenQrModal,
}: DigitalBusinessCardProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const [isFlipped, setIsFlipped] = useState(false);
  const flipRotation = useSharedValue(0);

  const name = user?.name || 'Alex Mercer';
  const email = user?.email || 'alex@acme.io';
  const phone = user?.phone || '+1 (415) 555-0182';
  const company = user?.company || 'Acme Corporation';
  const title = user?.title || 'VP of Global Events';
  const website = user?.website || 'https://acme.io';
  const linkedin = user?.socialLinks?.linkedin || 'https://linkedin.com/in/alex-mercer';
  const twitter = user?.socialLinks?.twitter || 'https://x.com/alexmercer';
  const github = user?.socialLinks?.github || 'https://github.com/alexmercer';

  const handleFlip = () => {
    const nextFlipped = !isFlipped;
    setIsFlipped(nextFlipped);
    flipRotation.value = withTiming(nextFlipped ? 180 : 0, { duration: 400 });
  };

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = `${interpolate(flipRotation.value, [0, 180], [0, 180])}deg`;
    const opacity = interpolate(flipRotation.value, [0, 89, 90, 180], [1, 1, 0, 0]);
    return {
      transform: [{ perspective: 1000 }, { rotateY }],
      opacity,
      zIndex: isFlipped ? 0 : 1,
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = `${interpolate(flipRotation.value, [0, 180], [180, 360])}deg`;
    const opacity = interpolate(flipRotation.value, [0, 89, 90, 180], [0, 0, 1, 1]);
    return {
      transform: [{ perspective: 1000 }, { rotateY }],
      opacity,
      zIndex: isFlipped ? 1 : 0,
    };
  });

  return (
    <View style={styles.cardContainer}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Digital business card for ${name}. Double tap to flip.`}
        onPress={handleFlip}
        style={styles.cardPressable}>
        {/* FRONT OF CARD */}
        <Animated.View
          style={[
            styles.cardFace,
            frontAnimatedStyle,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
            Shadows.card,
          ]}>
          {/* Card Lanyard Header & NFC Accent */}
          <View style={styles.cardTopRow}>
            <View style={styles.lanyardHole} />
            <View style={styles.nfcRow}>
              <Icon name="Wifi" size={16} color={theme.primary} />
              <AppText variant="caption" color="secondary" weight="semibold">
                NFC READY
              </AppText>
            </View>
          </View>

          {/* Attendee Details */}
          <View style={styles.frontBody}>
            <Avatar
              name={name}
              source={user?.avatarUrl ? { uri: user.avatarUrl } : undefined}
              size="xl"
            />
            <View style={styles.frontNameCol}>
              <View style={styles.nameVerifiedRow}>
                <AppText weight="bold" variant="title">
                  {name}
                </AppText>
                <Badge label="PASS" variant="primary" size="sm" />
              </View>
              <AppText variant="body" weight="medium" color="secondary">
                {title}
              </AppText>
              <AppText variant="caption" weight="bold" color="primary">
                {company}
              </AppText>
            </View>
          </View>

          {/* Card Footer: Event & Booth Station */}
          <View
            style={[
              styles.cardFooter,
              { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
            ]}>
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="caption" color="muted" style={{ fontSize: 10 }}>
                OFFICIAL DELEGATE BADGE
              </AppText>
              <AppText variant="caption" weight="semibold" numberOfLines={1}>
                {eventName} • {boothLocation}
              </AppText>
            </View>
            <AppText variant="caption" color="primary" weight="bold" style={{ fontSize: 11 }}>
              Tap to Flip ↻
            </AppText>
          </View>
        </Animated.View>

        {/* BACK OF CARD */}
        <Animated.View
          style={[
            styles.cardFace,
            styles.cardBack,
            backAnimatedStyle,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
            Shadows.card,
          ]}>
          <View style={styles.cardTopRow}>
            <View style={{ gap: 2 }}>
              <AppText weight="bold" variant="body">
                Direct Contact Channels
              </AppText>
              <AppText variant="caption" color="secondary">
                {company} • {eventName}
              </AppText>
            </View>
            <Badge label="FLIPPED" variant="outline" size="sm" />
          </View>

          {/* Contact Links */}
          <View style={styles.backContactList}>
            <Pressable
              accessibilityRole="link"
              accessibilityLabel={`Call ${phone}`}
              onPress={() => phone && Linking.openURL(`tel:${phone}`)}
              style={styles.contactItem}>
              <Icon name="Phone" size={16} color={theme.primary} />
              <AppText variant="caption" weight="medium">
                {phone}
              </AppText>
            </Pressable>

            <Pressable
              accessibilityRole="link"
              accessibilityLabel={`Email ${email}`}
              onPress={() => email && Linking.openURL(`mailto:${email}`)}
              style={styles.contactItem}>
              <Icon name="Mail" size={16} color={theme.primary} />
              <AppText variant="caption" weight="medium">
                {email}
              </AppText>
            </Pressable>

            <Pressable
              accessibilityRole="link"
              accessibilityLabel={`Visit website ${website}`}
              onPress={() => website && Linking.openURL(website)}
              style={styles.contactItem}>
              <Icon name="Globe" size={16} color={theme.primary} />
              <AppText variant="caption" weight="medium">
                {website}
              </AppText>
            </Pressable>

            {/* Social Links Row */}
            <View style={styles.socialRow}>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel="Open LinkedIn"
                onPress={() => Linking.openURL(linkedin)}
                style={styles.socialChip}>
                <Icon name="Briefcase" size={12} color={theme.primary} />
                <AppText variant="caption" weight="medium" style={{ fontSize: 10 }}>
                  LinkedIn
                </AppText>
              </Pressable>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel="Open X Twitter"
                onPress={() => Linking.openURL(twitter)}
                style={styles.socialChip}>
                <Icon name="AtSign" size={12} color={theme.primary} />
                <AppText variant="caption" weight="medium" style={{ fontSize: 10 }}>
                  X
                </AppText>
              </Pressable>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel="Open GitHub"
                onPress={() => Linking.openURL(github)}
                style={styles.socialChip}>
                <Icon name="Code" size={12} color={theme.primary} />
                <AppText variant="caption" weight="medium" style={{ fontSize: 10 }}>
                  GitHub
                </AppText>
              </Pressable>
            </View>
          </View>

          {/* Card Back Actions */}
          <View style={styles.backActionsRow}>
            <Button
              label="Open QR Pass"
              variant="primary"
              size="sm"
              leftIcon="QrCode"
              onPress={onOpenQrModal}
            />
            <Button
              label="Flip Back ↺"
              variant="outline"
              size="sm"
              onPress={handleFlip}
            />
          </View>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    height: 250,
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
    borderWidth: 1.5,
    padding: Spacing.md,
    justifyContent: 'space-between',
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lanyardHole: {
    width: 32,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  nfcRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  frontBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  frontNameCol: {
    flex: 1,
    gap: 2,
  },
  nameVerifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.xs + 2,
    borderRadius: Radius.medium,
    borderWidth: 1,
  },
  backContactList: {
    gap: Spacing.xs + 2,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: 2,
  },
  backActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.xs,
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingTop: 2,
  },
  socialChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
});
