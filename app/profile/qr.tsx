import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Rect } from 'react-native-svg';

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
import { generateQrMatrix } from '@/utils/qr-generator';

type QrMode = 'url' | 'vcard';

export default function QrProfileScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const { user } = useAuthStore();

  const [qrMode, setQrMode] = useState<QrMode>('url');
  const [copied, setCopied] = useState(false);

  const name = user?.name || 'Alex Mercer';
  const title = user?.title || 'VP of Global Events & Partnerships';
  const company = user?.company || 'Acme Corporation';
  const phone = user?.phone || '+1 (415) 555-0182';
  const email = user?.email || 'alex@acme.io';
  const website = user?.website || 'https://acme.io';
  const publicSlug = user?.publicProfileSlug || 'alex-mercer';
  const publicUrl = `https://expodiaries.app/p/${publicSlug}`;

  // Formulate real encoded payload based on mode
  const encodedPayload = useMemo(() => {
    if (qrMode === 'url') {
      return publicUrl;
    }
    return [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${name}`,
      `ORG:${company}`,
      `TITLE:${title}`,
      `TEL;TYPE=CELL:${phone}`,
      `EMAIL:${email}`,
      `URL:${website}`,
      'NOTE:CES 2026 Official Delegate Pass',
      'END:VCARD',
    ].join('\n');
  }, [qrMode, publicUrl, name, company, title, phone, email, website]);

  // Generate real QR boolean matrix (25x25)
  const matrix = useMemo(() => generateQrMatrix(encodedPayload), [encodedPayload]);
  const matrixSize = matrix.length;
  const pixelSize = 8;
  const qrSvgSize = matrixSize * pixelSize;

  // Support Action: Share
  const handleShare = () => {
    Alert.alert(
      'Share Public QR Pass',
      `Public Profile URL:\n${publicUrl}\n\nReady to dispatch via AirDrop, QR scanner, or messaging.`
    );
  };

  // Support Action: Copy
  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
    Alert.alert(
      'Copied to Clipboard',
      qrMode === 'url'
        ? `Public profile URL copied:\n${publicUrl}`
        : 'vCard 3.0 contact payload copied.'
    );
  };

  return (
    <ScreenContainer
      header={
        <AppHeader
          title="QR Profile Pass"
          subtitle="Real QR code pointing to public attendee profile URL"
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
        {/* 1. Mode Switcher (Public URL vs vCard) */}
        <Animated.View entering={FadeInDown.duration(260)} style={styles.section}>
          <Card density="compact">
            <CardContent style={styles.modeToggleRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Switch to Public Profile URL QR"
                onPress={() => setQrMode('url')}
                style={[
                  styles.modeButton,
                  qrMode === 'url' && {
                    backgroundColor: theme.primarySubtle,
                    borderColor: theme.primary,
                  },
                ]}>
                <Icon
                  name="Globe"
                  size={16}
                  color={qrMode === 'url' ? theme.primary : theme.textMuted}
                />
                <AppText
                  variant="caption"
                  weight={qrMode === 'url' ? 'bold' : 'medium'}
                  color={qrMode === 'url' ? 'primary' : undefined}>
                  Public Web URL
                </AppText>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Switch to vCard Phone Contact QR"
                onPress={() => setQrMode('vcard')}
                style={[
                  styles.modeButton,
                  qrMode === 'vcard' && {
                    backgroundColor: theme.primarySubtle,
                    borderColor: theme.primary,
                  },
                ]}>
                <Icon
                  name="UserCheck"
                  size={16}
                  color={qrMode === 'vcard' ? theme.primary : theme.textMuted}
                />
                <AppText
                  variant="caption"
                  weight={qrMode === 'vcard' ? 'bold' : 'medium'}
                  color={qrMode === 'vcard' ? 'primary' : undefined}>
                  vCard Contact Pass
                </AppText>
              </Pressable>
            </CardContent>
          </Card>
        </Animated.View>

        {/* 2. Hero QR Code Card */}
        <Animated.View entering={FadeInDown.duration(260).delay(60)} style={styles.section}>
          <Card density="comfortable">
            <CardContent style={styles.qrCardBody}>
              {/* Attendee Header */}
              <View style={styles.attendeeHeader}>
                <Avatar
                  name={name}
                  source={user?.avatarUrl ? { uri: user.avatarUrl } : undefined}
                  size="lg"
                />
                <View style={{ gap: 2, alignItems: 'center' }}>
                  <AppText variant="title" weight="bold">
                    {name}
                  </AppText>
                  <AppText variant="caption" color="secondary">
                    {title} • {company}
                  </AppText>
                  <Badge
                    label={qrMode === 'url' ? 'PUBLIC PROFILE LINK' : 'VCARD 3.0 ADDRESS BOOK'}
                    variant="primary"
                    size="sm"
                    showDot
                  />
                </View>
              </View>

              {/* Real SVG QR Code Container */}
              <View style={[styles.qrCodeWrapper, Shadows.modal]}>
                <Svg width={qrSvgSize} height={qrSvgSize} viewBox={`0 0 ${qrSvgSize} ${qrSvgSize}`}>
                  <Rect x="0" y="0" width={qrSvgSize} height={qrSvgSize} fill="#FFFFFF" />
                  {matrix.map((row, r) =>
                    row.map((filled, c) =>
                      filled ? (
                        <Rect
                          key={`${r}-${c}`}
                          x={c * pixelSize}
                          y={r * pixelSize}
                          width={pixelSize}
                          height={pixelSize}
                          fill="#0F172A"
                        />
                      ) : null
                    )
                  )}
                </Svg>
              </View>

              {/* Target Encoded URL */}
              <View style={[styles.urlBox, { backgroundColor: theme.surfaceSubtle }]}>
                <Icon name="Link2" size={16} color={theme.primary} />
                <AppText
                  variant="caption"
                  weight="semibold"
                  color="primary"
                  numberOfLines={1}
                  style={{ flex: 1 }}>
                  {qrMode === 'url' ? publicUrl : `vCard for ${name} (${phone})`}
                </AppText>
              </View>

              <AppText variant="caption" color="secondary" style={styles.scanInstruction}>
                Scan with any smartphone camera to open your public profile or save contact details instantly.
              </AppText>
            </CardContent>
          </Card>
        </Animated.View>

        {/* 3. Primary Actions: Share, Copy, Edit Profile */}
        <Animated.View entering={FadeInDown.duration(260).delay(120)} style={styles.section}>
          <Card density="comfortable">
            <CardContent style={styles.actionsBar}>
              <Button
                label="Share QR / Link"
                variant="primary"
                size="md"
                leftIcon="Share2"
                onPress={handleShare}
                aria-label="Share public QR pass"
                style={{ flex: 1 }}
              />
              <Button
                label={copied ? 'Copied!' : 'Copy URL'}
                variant="outline"
                size="md"
                leftIcon="Copy"
                onPress={handleCopy}
                aria-label="Copy public URL"
                style={{ flex: 1 }}
              />
              <Button
                label="Edit Profile"
                variant="outline"
                size="md"
                leftIcon="User"
                onPress={() => router.push('/profile/edit')}
                aria-label="Edit personal profile"
              />
            </CardContent>
          </Card>
        </Animated.View>

        {/* 4. Event Booth Attribution */}
        <Animated.View entering={FadeInDown.duration(260).delay(180)} style={styles.section}>
          <Card density="comfortable">
            <CardHeader>
              <View style={styles.headerRow}>
                <Icon name="MapPin" size={18} color={theme.primary} />
                <CardTitle level={2}>Booth Badge Attribution</CardTitle>
              </View>
            </CardHeader>
            <CardContent style={styles.cardInner}>
              <View style={styles.attrRow}>
                <AppText variant="caption" color="secondary">
                  Exhibitor Booth
                </AppText>
                <AppText variant="body" weight="semibold">
                  North Hall #N-408 / Booth #4209
                </AppText>
              </View>
              <Divider />
              <View style={styles.attrRow}>
                <AppText variant="caption" color="secondary">
                  Event Accreditation
                </AppText>
                <AppText variant="body" weight="semibold">
                  CES 2026 Las Vegas International
                </AppText>
              </View>
              <Divider />
              <View style={styles.attrRow}>
                <AppText variant="caption" color="secondary">
                  Public URL Slug
                </AppText>
                <Badge label={`/p/${publicSlug}`} variant="outline" size="sm" />
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
  modeToggleRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.medium,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  qrCardBody: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  attendeeHeader: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  qrCodeWrapper: {
    padding: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.large,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  urlBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
    borderRadius: Radius.medium,
  },
  scanInstruction: {
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: Spacing.sm,
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
  attrRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
