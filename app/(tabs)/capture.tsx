import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import {
  BusinessCardCamera,
  QuickQualifyModal,
} from '@/components/leads';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Icon,
  Screen,
  Toast,
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCaptureLead } from '@/hooks/use-leads';
import { OCRResult } from '@/services/ocr/ocr.types';
import { useAppStore } from '@/stores/use-app-store';
import { useCaptureStore } from '@/stores/use-capture-store';
import { Colors, Radius, Spacing } from '@/theme';
import { CreateLeadInput } from '@/types/lead';

export default function TabCaptureScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const activeEventId = useAppStore((state) => state.activeEventId);
  const { activeMode, setActiveMode } = useCaptureStore();
  const captureMutation = useCaptureLead();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [extractedOcrResult, setExtractedOcrResult] = useState<OCRResult | null>(null);
  const [capturedCardImageUri, setCapturedCardImageUri] = useState<string | undefined>(undefined);
  const [showQualifyModal, setShowQualifyModal] = useState(false);

  // Scanning beam animation for Badge Scan
  const beamY = useSharedValue(0);

  useEffect(() => {
    beamY.value = withRepeat(
      withTiming(180, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [beamY]);

  const animatedBeamStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: beamY.value }],
  }));

  const handleSimulateBadgeScan = () => {
    const mockBadgePresets: OCRResult[] = [
      {
        isMock: true,
        confidence: 0.99,
        fields: {
          firstName: 'David',
          lastName: 'Kim',
          title: 'Staff Site Reliability Engineer',
          company: 'Stripe Global',
          email: 'david.kim@stripe.com',
          phone: '+1 (555) 234-5678',
          website: 'stripe.com',
          address: 'South San Francisco, CA',
        },
        fieldConfidences: {
          firstName: 1,
          lastName: 1,
          title: 0.98,
          company: 1,
          email: 1,
          phone: 0.95,
          website: 0.92,
          address: 0.9,
        },
        rawText: 'STRIPE%DAVID%KIM%STAFF_SRE%998877',
        providerNotice: 'Badge Barcode / QR Decode Simulation',
        processingTimeMs: 120,
      },
      {
        isMock: true,
        confidence: 0.98,
        fields: {
          firstName: 'Jessica',
          lastName: 'Alvarez',
          title: 'Director of Product Management',
          company: 'Datadog Systems',
          email: 'jessica.alvarez@datadoghq.com',
          phone: '+1 (415) 890-1122',
          website: 'datadoghq.com',
          address: 'New York, NY',
        },
        fieldConfidences: {
          firstName: 1,
          lastName: 1,
          title: 0.95,
          company: 0.98,
          email: 1,
          phone: 0.92,
          website: 0.95,
          address: 0.88,
        },
        rawText: 'DATADOG%JESSICA%ALVAREZ%DIRECTOR_PRODUCT',
        providerNotice: 'Badge Barcode / QR Decode Simulation',
        processingTimeMs: 110,
      },
    ];

    const chosen = mockBadgePresets[Math.floor(Math.random() * mockBadgePresets.length)];
    setExtractedOcrResult(chosen);
    setCapturedCardImageUri(undefined);
    setShowQualifyModal(true);
  };

  const handleLeadSavedFromCamera = async (leadInput: CreateLeadInput) => {
    const saved = await captureMutation.mutateAsync(leadInput);
    setToastMessage(`Saved ${saved.firstName} ${saved.lastName} (${saved.company || 'Lead'})!`);
    return saved;
  };

  const handleSaveBadgeLead = async (leadInput: CreateLeadInput, openDetail = false) => {
    const saved = await captureMutation.mutateAsync(leadInput);
    setToastMessage(`Saved ${saved.firstName} ${saved.lastName} (${saved.company})!`);

    if (openDetail) {
      router.push(`/leads/${saved.id}` as never);
    }
  };

  // FULL-BLEED BUSINESS CARD CAMERA CAPTURE MODE
  if (activeMode === 'business_card') {
    return (
      <View style={styles.fullScreenCameraContainer}>
        <Toast
          visible={Boolean(toastMessage)}
          message={toastMessage || ''}
          type="success"
          duration={3000}
          onDismiss={() => setToastMessage(null)}
        />

        {/* Floating Top Mode Selector Pill */}
        <View style={styles.floatingModeBar}>
          <Button
            label="Card OCR"
            variant="primary"
            size="sm"
            leftIcon="Camera"
            onPress={() => setActiveMode('business_card')}
          />
          <Button
            label="Badge Scan"
            variant="outline"
            size="sm"
            leftIcon="QrCode"
            onPress={() => setActiveMode('badge_scan')}
          />
          <Button
            label="Manual"
            variant="outline"
            size="sm"
            leftIcon="Plus"
            onPress={() => router.push('/capture/manual')}
          />
        </View>

        <BusinessCardCamera
          onLeadSaved={handleLeadSavedFromCamera}
          defaultEventId={activeEventId || 'evt-2026-ces'}
          defaultEventName="CES 2026 International"
          defaultBoothNumber="North Hall #N-408"
        />
      </View>
    );
  }

  // BADGE SCAN MODE
  return (
    <Screen scrollable safeAreaEdges={['left', 'right']} contentContainerStyle={styles.container}>
      <Toast
        visible={Boolean(toastMessage)}
        message={toastMessage || ''}
        type="success"
        duration={3000}
        onDismiss={() => setToastMessage(null)}
      />

      <View style={styles.contentWrapper}>
        {/* Mode Selector Chips */}
        <Animated.View
          entering={FadeInDown.duration(280).springify().damping(18)}
          style={styles.modeRow}>
          <Button
            label="Business Card OCR"
            variant="outline"
            size="sm"
            leftIcon="Camera"
            onPress={() => setActiveMode('business_card')}
          />
          <Button
            label="Badge QR Scan"
            variant={activeMode === 'badge_scan' ? 'primary' : 'outline'}
            size="sm"
            leftIcon="QrCode"
            onPress={() => setActiveMode('badge_scan')}
          />
          <Button
            label="Manual Entry"
            variant="outline"
            size="sm"
            leftIcon="Plus"
            onPress={() => router.push('/capture/manual')}
          />
        </Animated.View>

        {/* Badge Scanner View */}
        <Animated.View entering={FadeInDown.duration(320).delay(80).springify().damping(18)}>
          <Card variant="elevated" density="comfortable" style={styles.viewportCard}>
            <CardHeader style={{ alignItems: 'center' }}>
              <Badge label="OPTICAL SENSOR ACTIVE" variant="success" showDot size="sm" />
              <CardTitle level={2} style={{ textAlign: 'center', marginTop: 6 }}>
                Badge Scanner Viewport Ready
              </CardTitle>
              <CardDescription style={{ textAlign: 'center' }}>
                Position attendee lanyard barcode or RFID badge inside the bounding frame.
              </CardDescription>
            </CardHeader>

            <CardContent style={styles.viewportContent}>
              <View
                style={[
                  styles.reticleBox,
                  {
                    borderColor: theme.primary,
                    backgroundColor: theme.primarySubtle,
                  },
                ]}>
                <Icon name="Scan" size={54} color={theme.primary} />
                <Animated.View
                  style={[
                    styles.reticleScanLine,
                    { backgroundColor: theme.primary },
                    animatedBeamStyle,
                  ]}
                />
              </View>

              <View style={styles.actionBlock}>
                <Button
                  label="Scan & Qualify Badge ⚡"
                  variant="primary"
                  size="lg"
                  leftIcon="Zap"
                  onPress={handleSimulateBadgeScan}
                  style={{ width: '100%' }}
                />

                <Button
                  label="View Lead Database"
                  variant="ghost"
                  size="sm"
                  rightIcon="ChevronRight"
                  onPress={() => router.push('/(tabs)/leads')}
                />
              </View>
            </CardContent>
          </Card>
        </Animated.View>
      </View>

      {/* Quick Qualify Drawer */}
      <QuickQualifyModal
        visible={showQualifyModal}
        onClose={() => setShowQualifyModal(false)}
        ocrResult={extractedOcrResult}
        cardImageUri={capturedCardImageUri}
        eventId={activeEventId}
        onSaveLead={handleSaveBadgeLead}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  fullScreenCameraContainer: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
  },
  floatingModeBar: {
    position: 'absolute',
    top: 12,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    zIndex: 30,
  },
  container: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 500,
    gap: Spacing.md,
  },
  modeRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    justifyContent: 'center',
  },
  viewportCard: {
    width: '100%',
    borderRadius: Radius.large,
  },
  viewportContent: {
    alignItems: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  reticleBox: {
    width: 220,
    height: 220,
    borderRadius: Radius.large,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  reticleScanLine: {
    position: 'absolute',
    top: 10,
    left: 20,
    right: 20,
    height: 3,
    borderRadius: 1.5,
  },
  actionBlock: {
    width: '100%',
    gap: Spacing.sm,
    alignItems: 'center',
  },
});
