import React from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

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
import { Colors, Spacing } from '@/theme';

export default function MyProfileScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const { user } = useAuthStore();

  const name = user?.name || 'Alex Mercer';
  const title = user?.title || 'VP of Global Events & Partnerships';
  const company = user?.company || 'Acme Corporation';
  const email = user?.email || 'alex@acme.io';
  const phone = user?.phone || '+1 (415) 555-0182';
  const website = user?.website || 'https://acme.io';
  const bio =
    user?.bio ||
    'Driving enterprise trade-show partnerships and smart edge telemetry across global expos.';
  const linkedin = user?.socialLinks?.linkedin || 'https://linkedin.com/in/alex-mercer';
  const twitter = user?.socialLinks?.twitter || 'https://x.com/alexmercer';
  const github = user?.socialLinks?.github || 'https://github.com/alexmercer';
  const publicSlug = user?.publicProfileSlug || 'alex-mercer';
  const publicUrl = `https://expodiaries.app/p/${publicSlug}`;

  const handleShareProfile = () => {
    Alert.alert(
      'Share Public Profile',
      `Public Profile URL:\n${publicUrl}\n\nReady to dispatch via native share sheet or messaging.`
    );
  };

  const handleCopyLink = () => {
    Alert.alert('Copied to Clipboard', `Public profile link copied:\n${publicUrl}`);
  };

  return (
    <ScreenContainer
      header={
        <AppHeader
          title="My Profile"
          subtitle="Personal credentials, contact info, and event badge"
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
        {/* 1. Profile Hero Card */}
        <Animated.View entering={FadeInDown.duration(260)} style={styles.section}>
          <Card density="comfortable">
            <CardContent style={styles.heroContent}>
              <View style={styles.avatarRow}>
                <Avatar
                  name={name}
                  source={user?.avatarUrl ? { uri: user.avatarUrl } : undefined}
                  size="xl"
                />
                <View style={styles.heroInfoCol}>
                  <View style={styles.nameRow}>
                    <AppText variant="title" weight="bold">
                      {name}
                    </AppText>
                    <Badge label={user?.role?.toUpperCase() || 'ADMIN'} variant="primary" size="sm" />
                  </View>
                  <AppText variant="body" weight="medium" color="secondary">
                    {title}
                  </AppText>
                  <AppText variant="caption" weight="bold" color="primary">
                    {company}
                  </AppText>
                </View>
              </View>

              <AppText variant="caption" color="secondary" style={styles.bioText}>
                {bio}
              </AppText>

              <Divider />

              {/* Quick Actions Row */}
              <View style={styles.quickActionsRow}>
                <Button
                  label="Edit Profile"
                  variant="outline"
                  size="sm"
                  leftIcon="User"
                  onPress={() => router.push('/profile/edit')}
                  aria-label="Edit personal profile"
                />
                <Button
                  label="Digital Card"
                  variant="outline"
                  size="sm"
                  leftIcon="CreditCard"
                  onPress={() => router.push('/profile/card' as any)}
                  aria-label="View digital business card"
                />
                <Button
                  label="QR Pass"
                  variant="primary"
                  size="sm"
                  leftIcon="QrCode"
                  onPress={() => router.push('/profile/qr' as any)}
                  aria-label="Show QR code"
                />
              </View>
            </CardContent>
          </Card>
        </Animated.View>

        {/* 2. Trade Show Event Assignment */}
        <Animated.View entering={FadeInDown.duration(260).delay(60)} style={styles.section}>
          <Card density="comfortable">
            <CardHeader>
              <View style={styles.headerRow}>
                <Icon name="Calendar" size={18} color={theme.primary} />
                <CardTitle level={2}>Event & Booth Credentials</CardTitle>
              </View>
            </CardHeader>
            <CardContent style={styles.cardInner}>
              <View style={styles.infoRow}>
                <AppText variant="caption" color="secondary">
                  Active Trade Show
                </AppText>
                <AppText variant="body" weight="semibold">
                  CES 2026 Las Vegas
                </AppText>
              </View>
              <Divider />
              <View style={styles.infoRow}>
                <AppText variant="caption" color="secondary">
                  Exhibitor Booth
                </AppText>
                <Badge label="North Hall #N-408 / Booth #4209" variant="outline" size="sm" />
              </View>
              <Divider />
              <View style={styles.infoRow}>
                <AppText variant="caption" color="secondary">
                  Staff Identifier
                </AppText>
                <AppText variant="caption" weight="semibold" tabular>
                  {user?.id || 'usr-1'} • Verified Staff
                </AppText>
              </View>
            </CardContent>
          </Card>
        </Animated.View>

        {/* 3. Direct Contact Channels */}
        <Animated.View entering={FadeInDown.duration(260).delay(120)} style={styles.section}>
          <Card density="comfortable">
            <CardHeader>
              <View style={styles.headerRow}>
                <Icon name="Mail" size={18} color={theme.primary} />
                <CardTitle level={2}>Contact Information</CardTitle>
              </View>
            </CardHeader>
            <CardContent style={styles.cardInner}>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel={`Email ${email}`}
                onPress={() => Linking.openURL(`mailto:${email}`)}
                style={styles.contactRow}>
                <View style={styles.contactLeft}>
                  <Icon name="Mail" size={16} color={theme.primary} />
                  <AppText variant="caption" color="secondary">
                    Work Email
                  </AppText>
                </View>
                <AppText variant="body" weight="semibold">
                  {email}
                </AppText>
              </Pressable>

              <Divider />

              <Pressable
                accessibilityRole="link"
                accessibilityLabel={`Call ${phone}`}
                onPress={() => Linking.openURL(`tel:${phone}`)}
                style={styles.contactRow}>
                <View style={styles.contactLeft}>
                  <Icon name="Phone" size={16} color={theme.primary} />
                  <AppText variant="caption" color="secondary">
                    Mobile Phone
                  </AppText>
                </View>
                <AppText variant="body" weight="semibold">
                  {phone}
                </AppText>
              </Pressable>

              <Divider />

              <Pressable
                accessibilityRole="link"
                accessibilityLabel={`Visit website ${website}`}
                onPress={() => Linking.openURL(website)}
                style={styles.contactRow}>
                <View style={styles.contactLeft}>
                  <Icon name="Globe" size={16} color={theme.primary} />
                  <AppText variant="caption" color="secondary">
                    Company Website
                  </AppText>
                </View>
                <AppText variant="body" weight="semibold" color="primary">
                  {website}
                </AppText>
              </Pressable>
            </CardContent>
          </Card>
        </Animated.View>

        {/* 4. Social Links */}
        <Animated.View entering={FadeInDown.duration(260).delay(180)} style={styles.section}>
          <Card density="comfortable">
            <CardHeader>
              <View style={styles.headerRow}>
                <Icon name="Share2" size={18} color={theme.primary} />
                <CardTitle level={2}>Public Social Links</CardTitle>
              </View>
            </CardHeader>
            <CardContent style={styles.cardInner}>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel="Open LinkedIn Profile"
                onPress={() => Linking.openURL(linkedin)}
                style={styles.contactRow}>
                <View style={styles.contactLeft}>
                  <Icon name="Briefcase" size={16} color={theme.primary} />
                  <AppText variant="body" weight="semibold">
                    LinkedIn
                  </AppText>
                </View>
                <AppText variant="caption" color="primary" numberOfLines={1}>
                  {linkedin}
                </AppText>
              </Pressable>

              <Divider />

              <Pressable
                accessibilityRole="link"
                accessibilityLabel="Open X Twitter Profile"
                onPress={() => Linking.openURL(twitter)}
                style={styles.contactRow}>
                <View style={styles.contactLeft}>
                  <Icon name="AtSign" size={16} color={theme.primary} />
                  <AppText variant="body" weight="semibold">
                    X / Twitter
                  </AppText>
                </View>
                <AppText variant="caption" color="primary" numberOfLines={1}>
                  {twitter}
                </AppText>
              </Pressable>

              <Divider />

              <Pressable
                accessibilityRole="link"
                accessibilityLabel="Open GitHub Profile"
                onPress={() => Linking.openURL(github)}
                style={styles.contactRow}>
                <View style={styles.contactLeft}>
                  <Icon name="Code" size={16} color={theme.primary} />
                  <AppText variant="body" weight="semibold">
                    GitHub
                  </AppText>
                </View>
                <AppText variant="caption" color="primary" numberOfLines={1}>
                  {github}
                </AppText>
              </Pressable>
            </CardContent>
          </Card>
        </Animated.View>

        {/* 5. Public Profile URL Card */}
        <Animated.View entering={FadeInDown.duration(260).delay(220)} style={styles.section}>
          <Card density="comfortable">
            <CardContent style={styles.cardInner}>
              <View style={{ gap: 2 }}>
                <AppText variant="caption" color="secondary" weight="semibold">
                  Public Profile Web Link:
                </AppText>
                <AppText variant="body" weight="bold" color="primary" numberOfLines={1}>
                  {publicUrl}
                </AppText>
              </View>
              <View style={styles.publicUrlActions}>
                <Button
                  label="Copy Link"
                  variant="outline"
                  size="sm"
                  leftIcon="Copy"
                  onPress={handleCopyLink}
                  aria-label="Copy public profile link"
                />
                <Button
                  label="Share Link"
                  variant="primary"
                  size="sm"
                  leftIcon="Share2"
                  onPress={handleShareProfile}
                  aria-label="Share public profile link"
                />
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
  heroContent: {
    gap: Spacing.md,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  heroInfoCol: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  bioText: {
    lineHeight: 18,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  publicUrlActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.xs,
    marginTop: 4,
  },
});
