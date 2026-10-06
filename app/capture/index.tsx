import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import {
  BusinessCardCamera,
  QuickQualifyModal,
} from '@/components/leads';
import { AppHeader } from '@/components/layout/app-header';
import { ScreenContainer } from '@/components/layout/screen-container';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Icon,
  Toast,
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCaptureLead } from '@/hooks/use-leads';
import { OCRResult } from '@/services/ocr/ocr.types';
import { useAppStore } from '@/stores/use-app-store';
import { useCaptureStore } from '@/stores/use-capture-store';
import { Colors, Radius, Spacing } from '@/theme';
import { CreateLeadInput } from '@/types/lead';

export default function CaptureScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const activeEventId = useAppStore((state) => state.activeEventId);
  const { activeMode, setActiveMode } = useCaptureStore();
  const captureMutation = useCaptureLead();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [extractedOcrResult, setExtractedOcrResult] = useState<OCRResult | null>(null);
  const [capturedCardImageUri, setCapturedCardImageUri] = useState<string | undefined>(undefined);
  const [showQualifyModal, setShowQualifyModal] = useState(false);

  const handleSimulateBadgeScan = () => {
    const mockBadge: OCRResult = {
      isMock: true,
      confidence: 0.99,
      fields: {
        firstName: 'Elena',
        lastName: 'Moretti',
        title: 'Chief Operating Officer',
        company: 'Apex Supply Systems',
        email: 'elena.moretti@apexsupply.io',
        phone: '+1 (415) 777-9812',
        website: 'apexsupply.io',
        address: 'San Jose, CA',
      },
      fieldConfidences: {
        firstName: 1,
        lastName: 1,
        title: 0.98,
        company: 1,
        email: 1,
        phone: 0.96,
        website: 0.94,
        address: 0.9,
      },
      rawText: 'APEX%ELENA%MORETTI%COO%887766',
      providerNotice: 'Badge Barcode / RFID Decode Simulation',
      processingTimeMs: 120,
    };

    setExtractedOcrResult(mockBadge);
    setCapturedCardImageUri(undefined);
    setShowQualifyModal(true);
  };

  const handleSaveLead = async (leadInput: CreateLeadInput) => {
    const saved = await captureMutation.mutateAsync(leadInput);
    setToastMessage(`Saved ${saved.firstName} ${saved.lastName} (${saved.company})!`);
    return saved;
  };

  // If in Business Card mode, render full-bleed Camera experience with scanning frame & OCR
  if (activeMode === 'business_card') {
    return (
      <View style={styles.fullScreen}>
        <Toast
          visible={Boolean(toastMessage)}
          message={toastMessage || ''}
          type="success"
          duration={3000}
          onDismiss={() => setToastMessage(null)}
        />
        <BusinessCardCamera
          onLeadSaved={handleSaveLead}
          onClose={() => router.back()}
          defaultEventId={activeEventId || 'evt-2026-ces'}
          defaultEventName="CES 2026 International"
          defaultBoothNumber="North Hall #N-408"
        />
      </View>
    );
  }

  return (
    <ScreenContainer
      header={
        <AppHeader
          title="Rapid On-Floor Capture"
          subtitle="Business Card OCR & Badge Ingestion"
          action={
            <Button
              label="Close"
              variant="ghost"
              size="sm"
              onPress={() => router.back()}
            />
          }
        />
      }>
      <Toast
        visible={Boolean(toastMessage)}
        message={toastMessage || ''}
        type="success"
        duration={3000}
        onDismiss={() => setToastMessage(null)}
      />

      <View style={styles.content}>
        {/* Mode Selector Chips */}
        <Animated.View
          entering={FadeInDown.duration(260)}
          style={styles.modeRow}>
          <Button
            label="Business Card OCR"
            variant="outline"
            size="sm"
            leftIcon="Camera"
            onPress={() => setActiveMode('business_card')}
          />
          <Button
            label="Badge Scan"
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
        <Animated.View entering={FadeInDown.duration(280)}>
          <Card variant="elevated" density="comfortable" style={styles.badgeCard}>
            <CardHeader style={{ alignItems: 'center' }}>
              <Badge label="LANYARD / BADGE SCANNER" variant="success" showDot size="sm" />
              <CardTitle level={2} style={{ textAlign: 'center', marginTop: 6 }}>
                Badge Scanner Viewport Ready
              </CardTitle>
              <CardDescription style={{ textAlign: 'center' }}>
                Position attendee badge barcode or QR within frame.
              </CardDescription>
            </CardHeader>

            <CardContent style={styles.badgeContent}>
              <View
                style={[
                  styles.reticle,
                  { borderColor: theme.primary, backgroundColor: theme.primarySubtle },
                ]}>
                <Icon name="Scan" size={48} color={theme.primary} />
              </View>

              <Button
                label="Scan & Qualify Badge ⚡"
                variant="primary"
                size="lg"
                loading={captureMutation.isPending}
                leftIcon="Zap"
                onPress={handleSimulateBadgeScan}
                style={{ width: '100%' }}
              />
            </CardContent>
          </Card>
        </Animated.View>
      </View>

      {/* Rapid Qualify Drawer */}
      <QuickQualifyModal
        visible={showQualifyModal}
        onClose={() => setShowQualifyModal(false)}
        ocrResult={extractedOcrResult}
        cardImageUri={capturedCardImageUri}
        eventId={activeEventId}
        onSaveLead={async (leadInput, openDetail) => {
          await handleSaveLead(leadInput);
          if (openDetail) {
            router.replace('/(tabs)/leads' as never);
          }
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    gap: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  modeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    justifyContent: 'center',
  },
  badgeCard: {
    width: '100%',
    borderRadius: Radius.large,
  },
  badgeContent: {
    alignItems: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  reticle: {
    width: 180,
    height: 180,
    borderRadius: Radius.large,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
