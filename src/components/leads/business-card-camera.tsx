import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { CameraType, CameraView, FlashMode, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import {
  AppText,
  Button,
  Icon,
  IconButton,
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  DEMO_BUSINESS_CARDS,
  DemoCardPreset,
} from '@/services/ocr/mock-card-ocr.provider';
import { ocrService } from '@/services/ocr/ocr.service';
import { createLeadDraftFromOCR, LeadDraft } from '@/services/ocr/ocr.types';
import { Colors, Radius, Spacing } from '@/theme';
import { CreateLeadInput, Lead } from '@/types/lead';

import { LeadDraftReview } from './lead-draft-review';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FRAME_WIDTH = Math.min(SCREEN_WIDTH - 48, 360);
const FRAME_HEIGHT = Math.round(FRAME_WIDTH / 1.75); // Standard 3.5:2 business card aspect ratio

export type CameraCaptureStage = 'camera' | 'confirm_photo' | 'processing' | 'review';

export interface BusinessCardCameraProps {
  onLeadSaved: (createdInput: CreateLeadInput, andScanNext?: boolean) => Promise<Lead | void>;
  onClose?: () => void;
  defaultEventId?: string;
  defaultEventName?: string;
  defaultBoothNumber?: string;
}

export function BusinessCardCamera({
  onLeadSaved,
  onClose,
  defaultEventId = 'evt-2026-ces',
  defaultEventName = 'CES 2026 International',
  defaultBoothNumber = 'North Hall #N-408',
}: BusinessCardCameraProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  // Camera State
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [torch, setTorch] = useState(false);

  // Flow State
  const [stage, setStage] = useState<CameraCaptureStage>('camera');
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
  const [leadDraft, setLeadDraft] = useState<LeadDraft | null>(null);
  const [processingStatus, setProcessingStatus] = useState('Detecting card boundaries…');
  const [isSavingLead, setIsSavingLead] = useState(false);

  // Presets Drawer Modal
  const [presetsVisible, setPresetsVisible] = useState(false);

  // Scanning laser animation
  const laserTranslateY = useSharedValue(0);

  useEffect(() => {
    laserTranslateY.value = withRepeat(
      withTiming(FRAME_HEIGHT - 6, {
        duration: 1800,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      true
    );
  }, [laserTranslateY]);

  const laserStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: laserTranslateY.value }],
  }));

  // Toggle Flash Modes (off -> on -> auto)
  const cycleFlash = () => {
    setFlash((current) => {
      if (current === 'off') return 'on';
      if (current === 'on') return 'auto';
      return 'off';
    });
  };

  // 1. Capture Image from Camera
  const handleCapture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.88,
        skipProcessing: false,
      });

      if (photo?.uri) {
        setCapturedImageUri(photo.uri);
        setStage('confirm_photo');
      }
    } catch {
      // Fallback to demo preset if hardware capture fails or in simulator
      handleSelectPreset(DEMO_BUSINESS_CARDS[0]);
    }
  };

  // 2. Retake photo
  const handleRetake = () => {
    setCapturedImageUri(null);
    setLeadDraft(null);
    setStage('camera');
  };

  // 3. Confirm captured photo and trigger OCR Processing
  const handleConfirmAndProcess = async (uriOverride?: string) => {
    const targetUri = uriOverride || capturedImageUri;
    if (!targetUri) return;

    setStage('processing');
    setProcessingStatus('Detecting card boundaries & contrast…');

    try {
      const step1Timer = setTimeout(() => {
        setProcessingStatus('Extracting contact typography & OCR tokens…');
      }, 250);

      const step2Timer = setTimeout(() => {
        setProcessingStatus('Structuring LeadDraft fields & confidence scoring…');
      }, 500);

      const ocrResult = await ocrService.processCard(targetUri);

      clearTimeout(step1Timer);
      clearTimeout(step2Timer);

      const draft = createLeadDraftFromOCR(ocrResult, targetUri, {
        eventId: defaultEventId,
        eventName: defaultEventName,
        boothNumber: defaultBoothNumber,
        temperature: 'hot',
      });

      setLeadDraft(draft);
      setStage('review');
    } catch {
      // In case of error, fallback to preset draft
      const preset = DEMO_BUSINESS_CARDS[0];
      const fallbackResult = await ocrService.processCard(preset.imageUri);
      const draft = createLeadDraftFromOCR(fallbackResult, preset.imageUri, {
        eventId: defaultEventId,
        eventName: defaultEventName,
        boothNumber: defaultBoothNumber,
      });
      setLeadDraft(draft);
      setStage('review');
    }
  };

  // 4. Quick preset selection for trade-show demos
  const handleSelectPreset = (preset: DemoCardPreset) => {
    setPresetsVisible(false);
    setCapturedImageUri(preset.imageUri);
    handleConfirmAndProcess(preset.imageUri);
  };

  // 5. Save lead handler from Review UI
  const handleSaveDraft = async (finalInput: CreateLeadInput, andScanNext = false) => {
    setIsSavingLead(true);
    try {
      const result = await onLeadSaved(finalInput, andScanNext);
      if (andScanNext) {
        // Reset to camera stage immediately for the next card
        setCapturedImageUri(null);
        setLeadDraft(null);
        setStage('camera');
      }
      return result;
    } finally {
      setIsSavingLead(false);
    }
  };

  // =========================================================================
  // STAGE 4: REVIEW DRAFT
  // =========================================================================
  if (stage === 'review' && leadDraft) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.reviewHeader, { borderBottomColor: theme.border }]}>
          <IconButton
            icon="ChevronLeft"
            size="sm"
            variant="ghost"
            accessibilityLabel="Back to camera"
            onPress={handleRetake}
          />
          <View style={styles.reviewHeaderTitleCol}>
            <AppText weight="bold" variant="heading">
              Review Scanned Lead
            </AppText>
            <AppText variant="caption" color="secondary">
              Verify extracted attributes before saving to pipeline
            </AppText>
          </View>
          {onClose && (
            <IconButton
              icon="X"
              size="sm"
              variant="ghost"
              accessibilityLabel="Close capture"
              onPress={onClose}
            />
          )}
        </View>

        <LeadDraftReview
          draft={leadDraft}
          onSave={handleSaveDraft}
          onRetake={handleRetake}
          isSaving={isSavingLead}
        />
      </View>
    );
  }

  // =========================================================================
  // PERMISSION NOT GRANTED FALLBACK
  // =========================================================================
  if (!permission?.granted) {
    return (
      <View style={[styles.container, styles.permissionCenter, { backgroundColor: '#090D16' }]}>
        <View style={styles.permissionCard}>
          <View style={styles.cameraIconCircle}>
            <Icon name="Camera" size={32} color="#FFFFFF" />
          </View>

          <AppText weight="bold" variant="heading" style={styles.whiteText}>
            Camera Access Needed
          </AppText>

          <AppText variant="body" style={styles.mutedWhiteText}>
            Allow camera access to scan business cards and capture trade-show leads instantly on the expo floor.
          </AppText>

          <View style={styles.permissionActions}>
            <Button
              label="Grant Camera Permission"
              variant="primary"
              size="lg"
              leftIcon="Camera"
              onPress={requestPermission}
            />

            <Button
              label="Load Demo Card Preset"
              variant="outline"
              size="md"
              leftIcon="Sparkles"
              onPress={() => setPresetsVisible(true)}
            />

            {onClose && (
              <Button
                label="Cancel"
                variant="ghost"
                size="md"
                onPress={onClose}
              />
            )}
          </View>
        </View>

        {/* Demo Cards Presets Modal */}
        <Modal
          visible={presetsVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setPresetsVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
              <View style={styles.modalHeader}>
                <AppText weight="bold" variant="heading">
                  Select Demo Business Card
                </AppText>
                <IconButton
                  icon="X"
                  size="sm"
                  variant="ghost"
                  accessibilityLabel="Close"
                  onPress={() => setPresetsVisible(false)}
                />
              </View>

              <AppText variant="caption" color="secondary" style={{ marginBottom: Spacing.md }}>
                Instant simulation presets for trade-show walk-throughs:
              </AppText>

              {DEMO_BUSINESS_CARDS.map((p) => (
                <Pressable
                  key={p.id}
                  style={[styles.presetItem, { borderColor: theme.border }]}
                  onPress={() => handleSelectPreset(p)}>
                  <Image source={{ uri: p.imageUri }} style={styles.presetImage} contentFit="cover" />
                  <View style={{ flex: 1, gap: 2 }}>
                    <AppText weight="bold" variant="body">
                      {p.name}
                    </AppText>
                    <AppText variant="caption" color="secondary" numberOfLines={1}>
                      {p.label}
                    </AppText>
                  </View>
                  <Icon name="ChevronRight" size={16} color={theme.textMuted} />
                </Pressable>
              ))}
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // =========================================================================
  // CAMERA / CONFIRM / PROCESSING VIEW
  // =========================================================================
  return (
    <View style={styles.cameraScreenContainer}>
      {/* Background Camera Preview or Frozen Snapshot */}
      {stage === 'confirm_photo' || stage === 'processing' ? (
        <Image
          source={{ uri: capturedImageUri || '' }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
      ) : (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
          flash={flash}
          enableTorch={torch}
          mode="picture"
        />
      )}

      {/* Dark Mask Vignette Outside Viewfinder */}
      <View style={styles.vignetteOverlay} pointerEvents="none" />

      {/* Top Header Control Bar */}
      <View style={styles.cameraHeaderBar}>
        {onClose ? (
          <IconButton
            icon="X"
            size="md"
            variant="ghost"
            accessibilityLabel="Close camera"
            onPress={onClose}
            style={styles.circleControlBtn}
          />
        ) : (
          <View style={{ width: 44 }} />
        )}

        {/* Status / Flash Indicator */}
        <View style={styles.headerPills}>
          <Pressable
            onPress={cycleFlash}
            style={styles.flashPill}
            accessibilityRole="button"
            accessibilityLabel={`Flash mode: ${flash}. Tap to change.`}>
            <Icon
              name={flash === 'off' ? 'ZapOff' : 'Zap'}
              size={16}
              color={flash === 'off' ? '#94A3B8' : '#F59E0B'}
            />
            <AppText variant="caption" weight="bold" style={styles.flashText}>
              FLASH {flash.toUpperCase()}
            </AppText>
          </Pressable>

          <Pressable
            onPress={() => setTorch((v) => !v)}
            style={[styles.torchPill, torch ? styles.torchActive : null]}
            accessibilityRole="button"
            accessibilityLabel={`Torch ${torch ? 'on' : 'off'}`}>
            <Icon name="Sun" size={14} color={torch ? '#F59E0B' : '#94A3B8'} />
          </Pressable>
        </View>

        {/* Flip Camera Facing */}
        <IconButton
          icon="RefreshCw"
          size="md"
          variant="ghost"
          accessibilityLabel="Flip camera facing"
          onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}
          style={styles.circleControlBtn}
        />
      </View>

      {/* Centered Scanning Reticle Frame */}
      <View style={styles.centerContainer} pointerEvents="box-none">
        <View style={[styles.viewfinderFrame, { width: FRAME_WIDTH, height: FRAME_HEIGHT }]}>
          {/* Viewfinder Corner Alignment Guides */}
          <View style={[styles.cornerBracket, styles.topLeftBracket]} />
          <View style={[styles.cornerBracket, styles.topRightBracket]} />
          <View style={[styles.cornerBracket, styles.bottomLeftBracket]} />
          <View style={[styles.cornerBracket, styles.bottomRightBracket]} />

          {/* Animated Laser Scanning Line */}
          {stage === 'camera' || stage === 'processing' ? (
            <Animated.View style={[styles.scanningLaserLine, laserStyle]}>
              <View style={styles.laserGlow} />
            </Animated.View>
          ) : null}

          {/* Processing HUD Overlay */}
          {stage === 'processing' && (
            <Animated.View entering={FadeIn.duration(200)} style={styles.processingHud}>
              <View style={styles.processingSpinnerCircle}>
                <Icon name="Cpu" size={28} color="#38BDF8" />
              </View>

              <AppText weight="bold" variant="body" style={styles.processingTitleText}>
                SCANNING BUSINESS CARD
              </AppText>

              <AppText variant="caption" style={styles.processingSubtitleText}>
                {processingStatus}
              </AppText>

              <View style={styles.processingBadge}>
                <AppText variant="caption" weight="semibold" style={styles.processingBadgeText}>
                  MOCK OCR ENGINE ACTIVE
                </AppText>
              </View>
            </Animated.View>
          )}
        </View>

        {/* Frame Guidance Message */}
        {stage === 'camera' && (
          <View style={styles.guidancePill}>
            <Icon name="Scan" size={14} color="#38BDF8" />
            <AppText variant="caption" weight="medium" style={styles.guidanceText}>
              Align business card inside frame
            </AppText>
          </View>
        )}
      </View>

      {/* Bottom Controls Area */}
      <View style={styles.bottomControlsBar}>
        {stage === 'confirm_photo' ? (
          /* ========================================================= */
          /* CONFIRM PHOTO STAGE CONTROLS                              */
          /* ========================================================= */
          <Animated.View entering={FadeInDown.duration(200)} style={styles.confirmControlsRow}>
            <Button
              label="Retake"
              variant="outline"
              size="lg"
              leftIcon="RotateCcw"
              onPress={handleRetake}
              style={styles.confirmBtn}
            />

            <Button
              label="Confirm & Scan"
              variant="primary"
              size="lg"
              leftIcon="Sparkles"
              onPress={() => handleConfirmAndProcess()}
              style={styles.confirmBtn}
            />
          </Animated.View>
        ) : stage === 'processing' ? (
          /* ========================================================= */
          /* PROCESSING STAGE CONTROLS (DISABLED PLACEHOLDER)          */
          /* ========================================================= */
          <View style={styles.processingBarPlaceholder}>
            <AppText variant="caption" style={styles.processingPlaceholderText}>
              Analyzing card optics and extracting structured contact data…
            </AppText>
          </View>
        ) : (
          /* ========================================================= */
          /* LIVE CAMERA STAGE CONTROLS                                */
          /* ========================================================= */
          <View style={styles.liveCameraControlsRow}>
            {/* Demo Presets Trigger */}
            <Pressable
              style={styles.presetsCircleBtn}
              onPress={() => setPresetsVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Open demo business card presets">
              <Icon name="Sparkles" size={20} color="#38BDF8" />
              <AppText variant="caption" weight="bold" style={styles.presetsBtnLabel}>
                PRESETS
              </AppText>
            </Pressable>

            {/* Main Shutter Button */}
            <Pressable
              style={({ pressed }) => [
                styles.shutterOuterCircle,
                { transform: [{ scale: pressed ? 0.92 : 1 }] },
              ]}
              onPress={handleCapture}
              accessibilityRole="button"
              accessibilityLabel="Capture photo of business card">
              <View style={styles.shutterInnerCircle} />
            </Pressable>

            {/* Event Context Pill */}
            <View style={styles.eventContextCol}>
              <Icon name="Calendar" size={14} color="#94A3B8" />
              <AppText variant="caption" style={styles.eventContextText} numberOfLines={1}>
                {defaultEventName.split(' ')[0]}
              </AppText>
            </View>
          </View>
        )}
      </View>

      {/* Demo Cards Presets Modal */}
      <Modal
        visible={presetsVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPresetsVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <View style={{ gap: 2 }}>
                <AppText weight="bold" variant="heading">
                  Demo Business Cards
                </AppText>
                <AppText variant="caption" color="secondary">
                  Tap to test instant OCR extraction with high-fidelity trade-show data
                </AppText>
              </View>
              <IconButton
                icon="X"
                size="sm"
                variant="ghost"
                accessibilityLabel="Close"
                onPress={() => setPresetsVisible(false)}
              />
            </View>

            <View style={{ gap: Spacing.sm, marginTop: Spacing.sm }}>
              {DEMO_BUSINESS_CARDS.map((p) => (
                <Pressable
                  key={p.id}
                  style={[styles.presetItem, { borderColor: theme.border }]}
                  onPress={() => handleSelectPreset(p)}>
                  <Image source={{ uri: p.imageUri }} style={styles.presetImage} contentFit="cover" />
                  <View style={{ flex: 1, gap: 2 }}>
                    <AppText weight="bold" variant="body">
                      {p.name}
                    </AppText>
                    <AppText variant="caption" color="secondary" numberOfLines={1}>
                      {p.label}
                    </AppText>
                  </View>
                  <Icon name="ChevronRight" size={16} color={theme.textMuted} />
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cameraScreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    gap: Spacing.xs,
  },
  reviewHeaderTitleCol: {
    flex: 1,
    gap: 1,
  },
  permissionCenter: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  permissionCard: {
    alignItems: 'center',
    gap: Spacing.md,
    maxWidth: 340,
    textAlign: 'center',
  },
  cameraIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  whiteText: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
  mutedWhiteText: {
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },
  permissionActions: {
    width: '100%',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  vignetteOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  cameraHeaderBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 32,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },
  circleControlBtn: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: 22,
  },
  headerPills: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flashPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  flashText: {
    color: '#FFFFFF',
    fontSize: 11,
  },
  torchPill: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  torchActive: {
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewfinderFrame: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    backgroundColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  cornerBracket: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#38BDF8',
  },
  topLeftBracket: {
    top: 4,
    left: 4,
    borderTopWidth: 3.5,
    borderLeftWidth: 3.5,
    borderTopLeftRadius: 8,
  },
  topRightBracket: {
    top: 4,
    right: 4,
    borderTopWidth: 3.5,
    borderRightWidth: 3.5,
    borderTopRightRadius: 8,
  },
  bottomLeftBracket: {
    bottom: 4,
    left: 4,
    borderBottomWidth: 3.5,
    borderLeftWidth: 3.5,
    borderBottomLeftRadius: 8,
  },
  bottomRightBracket: {
    bottom: 4,
    right: 4,
    borderBottomWidth: 3.5,
    borderRightWidth: 3.5,
    borderBottomRightRadius: 8,
  },
  scanningLaserLine: {
    position: 'absolute',
    left: 8,
    right: 8,
    height: 2.5,
    backgroundColor: '#38BDF8',
    borderRadius: 2,
    zIndex: 10,
  },
  laserGlow: {
    position: 'absolute',
    top: -3,
    bottom: -3,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(56, 189, 248, 0.45)',
    borderRadius: 4,
  },
  processingHud: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
    gap: 8,
    zIndex: 15,
  },
  processingSpinnerCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1.5,
    borderColor: '#38BDF8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  processingTitleText: {
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  processingSubtitleText: {
    color: '#94A3B8',
    textAlign: 'center',
  },
  processingBadge: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  processingBadgeText: {
    color: '#38BDF8',
    fontSize: 10,
  },
  guidancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
    marginTop: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  guidanceText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  bottomControlsBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 44 : 28,
    left: 20,
    right: 20,
    zIndex: 20,
  },
  confirmControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  confirmBtn: {
    flex: 1,
  },
  processingBarPlaceholder: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  processingPlaceholderText: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
  },
  liveCameraControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  presetsCircleBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(56, 189, 248, 0.4)',
    gap: 2,
  },
  presetsBtnLabel: {
    color: '#38BDF8',
    fontSize: 9,
  },
  shutterOuterCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  shutterInnerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },
  eventContextCol: {
    width: 60,
    alignItems: 'center',
    gap: 2,
  },
  eventContextText: {
    color: '#94A3B8',
    fontSize: 11,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: Radius.large,
    borderTopRightRadius: Radius.large,
    padding: Spacing.lg,
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  presetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.medium,
    gap: Spacing.md,
  },
  presetImage: {
    width: 60,
    height: 38,
    borderRadius: Radius.small,
  },
});
