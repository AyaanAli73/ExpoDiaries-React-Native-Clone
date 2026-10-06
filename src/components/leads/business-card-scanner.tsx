import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import {
  AppText,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Icon,
  IconButton,
  Toast,
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  DEMO_BUSINESS_CARDS,
  DemoCardPreset,
} from '@/services/ocr/mock-card-ocr.provider';
import { ocrService } from '@/services/ocr/ocr.service';
import { OCRResult } from '@/services/ocr/ocr.types';
import { Colors, Radius, Shadows, Spacing } from '@/theme';

interface BusinessCardScannerProps {
  onCardExtracted: (result: OCRResult, imageUri: string) => void;
  onCancel?: () => void;
}

export function BusinessCardScanner({
  onCardExtracted,
  onCancel,
}: BusinessCardScannerProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<DemoCardPreset | null>(null);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Laser scanner beam animation
  const laserY = useSharedValue(0);

  useEffect(() => {
    laserY.value = withRepeat(
      withTiming(190, { duration: 1600, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [laserY]);

  const animatedLaserStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: laserY.value }],
  }));

  const handleCaptureCard = async (preset?: DemoCardPreset) => {
    const targetPreset = preset || selectedPreset || DEMO_BUSINESS_CARDS[0];
    setIsProcessing(true);

    try {
      const ocrResult = await ocrService.processCardImage(targetPreset.imageUri);
      setIsProcessing(false);
      onCardExtracted(ocrResult, targetPreset.imageUri);
    } catch {
      setIsProcessing(false);
      setToastMessage('OCR processing failed. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Toast
        visible={Boolean(toastMessage)}
        message={toastMessage || ''}
        type="error"
        duration={3000}
        onDismiss={() => setToastMessage(null)}
      />

      {/* Viewport Frame */}
      <View style={[styles.viewportCard, { backgroundColor: '#090D16' }]}>
        {/* Top Viewport Header Controls */}
        <View style={styles.viewportHeader}>
          <View style={styles.headerIndicator}>
            <View style={[styles.liveDot, { backgroundColor: theme.success }]} />
            <AppText variant="caption" weight="bold" style={{ color: '#FFFFFF' }}>
              VISION RETICLE 3.5:2
            </AppText>
          </View>

          <View style={styles.viewportControls}>
            <IconButton
              icon={flashlightOn ? 'Zap' : 'ZapOff'}
              size="sm"
              variant="ghost"
              accessibilityLabel={flashlightOn ? 'Turn off flash' : 'Turn on flash'}
              onPress={() => setFlashlightOn(!flashlightOn)}
              style={styles.controlBtn}
            />
            {onCancel && (
              <IconButton
                icon="X"
                size="sm"
                variant="ghost"
                accessibilityLabel="Close scanner"
                onPress={onCancel}
                style={styles.controlBtn}
              />
            )}
          </View>
        </View>

        {/* Bounding Card Reticle */}
        <View style={styles.reticleContainer}>
          <View style={styles.cardReticle}>
            {/* Corner Brackets */}
            <View style={[styles.cornerBracket, styles.bracketTL, { borderColor: theme.primary }]} />
            <View style={[styles.cornerBracket, styles.bracketTR, { borderColor: theme.primary }]} />
            <View style={[styles.cornerBracket, styles.bracketBL, { borderColor: theme.primary }]} />
            <View style={[styles.cornerBracket, styles.bracketBR, { borderColor: theme.primary }]} />

            {/* Background card preview when preset is active */}
            {selectedPreset && (
              <Image
                source={{ uri: selectedPreset.imageUri }}
                style={styles.cardImageBg}
                contentFit="cover"
              />
            )}

            {/* Scanning Laser Beam */}
            <Animated.View
              style={[
                styles.laserBeam,
                { backgroundColor: theme.primary, shadowColor: theme.primary },
                animatedLaserStyle,
              ]}
            />

            {/* Center Reticle Guidance */}
            <View style={styles.reticleCenterGuide}>
              <Icon name="Camera" size={28} color="rgba(255, 255, 255, 0.4)" />
              <AppText variant="caption" weight="semibold" style={{ color: '#FFFFFF', textAlign: 'center' }}>
                {isProcessing
                  ? 'Extracting contact typography…'
                  : selectedPreset
                    ? `${selectedPreset.name} (${selectedPreset.badge})`
                    : 'Fit business card inside brackets'}
              </AppText>
            </View>
          </View>
        </View>

        {/* Viewport Footer Status */}
        <View style={styles.viewportFooter}>
          <View style={styles.detectionPill}>
            <Icon name="CheckCircle" size={13} color={theme.success} />
            <AppText variant="caption" weight="medium" style={{ color: '#E2E8F0' }}>
              Edges Detected • Good Lighting
            </AppText>
          </View>

          {/* Transparent Mock OCR Service Attribution */}
          <View style={styles.attributionPill}>
            <Icon name="Cpu" size={12} color={theme.primary} />
            <AppText variant="caption" style={{ color: '#94A3B8', fontSize: 11 }}>
              Mock OCR Simulation • IBusinessCardOCRProvider Ready
            </AppText>
          </View>
        </View>
      </View>

      {/* Shutter Capture Button */}
      <View style={styles.shutterRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Capture business card photo"
          disabled={isProcessing}
          onPress={() => handleCaptureCard()}
          style={({ pressed }) => [
            styles.shutterOuterRing,
            { borderColor: theme.primary },
            pressed && { transform: [{ scale: 0.95 }] },
          ]}>
          <View style={[styles.shutterInnerButton, { backgroundColor: theme.primary }]}>
            {isProcessing ? (
              <Icon name="Loader" size={24} color="#FFFFFF" />
            ) : (
              <Icon name="Camera" size={24} color="#FFFFFF" />
            )}
          </View>
        </Pressable>
        <AppText variant="caption" weight="semibold" color="secondary">
          {isProcessing ? 'Analyzing OCR Text…' : 'Tap to Snap & Parse Card'}
        </AppText>
      </View>

      {/* Demo Trade-Show Preset Cards for 1-Tap Field Testing */}
      <Card variant="outline" density="comfortable" style={styles.presetsCard}>
        <CardHeader style={styles.presetsHeader}>
          <View style={styles.presetsTitleRow}>
            <Icon name="Sparkles" size={16} color={theme.primary} />
            <CardTitle level={3}>Demo Trade-Show Business Cards</CardTitle>
          </View>
          <Badge label="INSTANT TEST" variant="primary" size="sm" />
        </CardHeader>
        <CardContent style={styles.presetsContent}>
          <AppText variant="caption" color="secondary">
            Simulate snapping a physical attendee card on the exhibition floor with 1 tap:
          </AppText>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsList}>
            {DEMO_BUSINESS_CARDS.map((card) => {
              const isSelected = selectedPreset?.id === card.id;

              return (
                <Pressable
                  key={card.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Select demo card: ${card.name}`}
                  onPress={() => {
                    setSelectedPreset(card);
                    handleCaptureCard(card);
                  }}
                  style={({ pressed }) => [
                    styles.presetCardItem,
                    {
                      borderColor: isSelected ? theme.primary : theme.border,
                      backgroundColor: isSelected ? theme.primarySubtle : theme.surface,
                      transform: [{ scale: pressed ? 0.96 : 1 }],
                    },
                    isSelected && Shadows.subtle,
                  ]}>
                  <Image source={{ uri: card.imageUri }} style={styles.presetThumb} contentFit="cover" />
                  <View style={styles.presetMeta}>
                    <Badge label={card.badge} variant={isSelected ? 'primary' : 'outline'} size="sm" />
                    <AppText weight="bold" variant="caption" numberOfLines={1}>
                      {card.name}
                    </AppText>
                    <AppText variant="caption" color="secondary" numberOfLines={1} style={{ fontSize: 10 }}>
                      {card.fields.company.split(' ')[0]}
                    </AppText>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </CardContent>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
    width: '100%',
  },
  viewportCard: {
    borderRadius: Radius.large,
    overflow: 'hidden',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  viewportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  viewportControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  controlBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  reticleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
  },
  cardReticle: {
    width: '100%',
    maxWidth: 340,
    height: 200,
    borderRadius: Radius.medium,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cornerBracket: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderWidth: 3,
  },
  bracketTL: {
    top: 6,
    left: 6,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 4,
  },
  bracketTR: {
    top: 6,
    right: 6,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 4,
  },
  bracketBL: {
    bottom: 6,
    left: 6,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 4,
  },
  bracketBR: {
    bottom: 6,
    right: 6,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 4,
  },
  cardImageBg: {
    ...StyleSheet.absoluteFill,
    opacity: 0.35,
  },
  laserBeam: {
    position: 'absolute',
    top: 0,
    left: 10,
    right: 10,
    height: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
  reticleCenterGuide: {
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
  },
  viewportFooter: {
    alignItems: 'center',
    gap: 6,
  },
  detectionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  attributionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  shutterRow: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  shutterOuterRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 3,
  },
  shutterInnerButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
  },
  presetsCard: {
    borderRadius: Radius.large,
  },
  presetsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 4,
  },
  presetsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  presetsContent: {
    gap: Spacing.sm,
  },
  presetsList: {
    gap: Spacing.sm,
    paddingVertical: 4,
  },
  presetCardItem: {
    width: 140,
    borderRadius: Radius.medium,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 6,
    gap: 6,
  },
  presetThumb: {
    width: '100%',
    height: 60,
    borderRadius: Radius.small,
  },
  presetMeta: {
    gap: 2,
  },
});
