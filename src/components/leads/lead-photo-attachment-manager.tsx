import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import {
  AppText,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Icon,
  IconButton,
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Radius, Spacing } from '@/theme';
import { Attachment, CreateAttachmentInput } from '@/types/attachment';

interface LeadPhotoAttachmentManagerProps {
  leadId: string;
  eventId?: string;
  attachments: Attachment[];
  onAttachPhoto: (input: CreateAttachmentInput) => Promise<void>;
  onDeleteAttachment: (attachmentId: string) => Promise<void>;
  cardImageUri?: string;
  cardBackImageUri?: string;
}

const BOOTH_PRESET_PHOTOS = [
  {
    name: 'Booth Interaction Photo',
    uri: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80',
    caption: 'Booth meeting discussing enterprise pilot timeline.',
    size: 1140000,
  },
  {
    name: 'Whiteboard Architecture Sketch',
    uri: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&q=80',
    caption: 'Technical workflow diagram drawn during deep dive.',
    size: 890000,
  },
  {
    name: 'Product Sample / Spec Sheet',
    uri: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80',
    caption: 'Hardware sample specification sheet handed at booth.',
    size: 750000,
  },
  {
    name: 'Business Card (Reverse Side)',
    uri: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80',
    caption: 'Handwritten notes on reverse side of business card.',
    size: 620000,
  },
];

export function LeadPhotoAttachmentManager({
  leadId,
  eventId,
  attachments,
  onAttachPhoto,
  onDeleteAttachment,
  cardImageUri,
  cardBackImageUri,
}: LeadPhotoAttachmentManagerProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  const [selectedPhoto, setSelectedPhoto] = useState<Attachment | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter photo attachments
  const photoAttachments = attachments.filter((att) => att.fileType === 'image');

  // Synthesize legacy card images into previewable items if not already in attachments
  const allPhotos: Attachment[] = [
    ...(cardImageUri && !photoAttachments.some((a) => a.fileUri === cardImageUri)
      ? [
          {
            id: 'legacy-card-front',
            leadId,
            eventId,
            fileName: 'Business Card (Front Scan)',
            fileType: 'image' as const,
            fileUri: cardImageUri,
            fileSize: 850000,
            mimeType: 'image/jpeg',
            uploadedBy: 'Scanner',
            uploadedAt: new Date().toISOString(),
            source: 'scanner' as const,
          },
        ]
      : []),
    ...(cardBackImageUri && !photoAttachments.some((a) => a.fileUri === cardBackImageUri)
      ? [
          {
            id: 'legacy-card-back',
            leadId,
            eventId,
            fileName: 'Business Card (Back Scan)',
            fileType: 'image' as const,
            fileUri: cardBackImageUri,
            fileSize: 720000,
            mimeType: 'image/jpeg',
            uploadedBy: 'Scanner',
            uploadedAt: new Date().toISOString(),
            source: 'scanner' as const,
          },
        ]
      : []),
    ...photoAttachments,
  ];

  // 1. CAPTURE via Expo Camera / ImagePicker
  const handleCapturePhoto = async () => {
    try {
      setShowAddMenu(false);
      setIsProcessing(true);

      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          'Camera Permission Required',
          'Please grant camera permissions to capture photos for your lead records.'
        );
        setIsProcessing(false);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.85,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = `Booth_Photo_${Date.now()}.jpg`;

        await onAttachPhoto({
          leadId,
          eventId,
          fileName,
          fileType: 'image',
          fileUri: asset.uri,
          fileSize: asset.fileSize || 650000,
          mimeType: asset.mimeType || 'image/jpeg',
          width: asset.width,
          height: asset.height,
          source: 'camera',
          caption: 'Captured via camera on exhibition floor',
        });
      }
    } catch (err: any) {
      console.warn('Camera capture error:', err?.message || err);
      // Fallback preset demo photo if camera unavailable (e.g. web/simulator)
      const preset = BOOTH_PRESET_PHOTOS[0];
      await onAttachPhoto({
        leadId,
        eventId,
        fileName: preset.name,
        fileType: 'image',
        fileUri: preset.uri,
        fileSize: preset.size,
        mimeType: 'image/jpeg',
        source: 'camera',
        caption: preset.caption,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. PICK FROM GALLERY (multiple selection supported)
  const handlePickFromGallery = async () => {
    try {
      setShowAddMenu(false);
      setIsProcessing(true);

      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          'Photo Library Permission Required',
          'Please grant photo library access to attach photos from your gallery.'
        );
        setIsProcessing(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: 5,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        for (const asset of result.assets) {
          const fileName = asset.fileName || `Gallery_Photo_${Date.now()}.jpg`;
          await onAttachPhoto({
            leadId,
            eventId,
            fileName,
            fileType: 'image',
            fileUri: asset.uri,
            fileSize: asset.fileSize || 750000,
            mimeType: asset.mimeType || 'image/jpeg',
            width: asset.width,
            height: asset.height,
            source: 'gallery',
            caption: 'Attached from photo library',
          });
        }
      }
    } catch (err: any) {
      console.warn('Gallery pick error:', err?.message || err);
      // Fallback preset demo photo
      const preset = BOOTH_PRESET_PHOTOS[1];
      await onAttachPhoto({
        leadId,
        eventId,
        fileName: preset.name,
        fileType: 'image',
        fileUri: preset.uri,
        fileSize: preset.size,
        mimeType: 'image/jpeg',
        source: 'gallery',
        caption: preset.caption,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. ATTACH PRESET DEMO PHOTO
  const handleAttachPreset = async (preset: typeof BOOTH_PRESET_PHOTOS[0]) => {
    setShowAddMenu(false);
    setIsProcessing(true);
    try {
      await onAttachPhoto({
        leadId,
        eventId,
        fileName: preset.name,
        fileType: 'image',
        fileUri: preset.uri,
        fileSize: preset.size,
        mimeType: 'image/jpeg',
        source: 'camera',
        caption: preset.caption,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. DELETE ATTACHMENT
  const handleDeletePhoto = (attachment: Attachment) => {
    Alert.alert(
      'Delete Photo Attachment',
      `Are you sure you want to delete "${attachment.fileName}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (selectedPhoto?.id === attachment.id) {
              setSelectedPhoto(null);
            }
            await onDeleteAttachment(attachment.id);
          },
        },
      ]
    );
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1000) return `${Math.round(kb)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <Card variant="outline" density="comfortable" style={styles.card}>
      <CardHeader style={styles.header}>
        <View style={styles.titleGroup}>
          <Icon name="Camera" size={18} color={theme.primary} />
          <CardTitle level={2}>Lead Photos & Card Scans</CardTitle>
          <Badge label={`${allPhotos.length}`} variant="outline" size="sm" />
        </View>

        <Button
          label="+ Add Photo"
          variant="outline"
          size="sm"
          leftIcon="Plus"
          onPress={() => setShowAddMenu(!showAddMenu)}
        />
      </CardHeader>

      <CardContent style={styles.content}>
        {/* ============================================================ */}
        {/* ADD PHOTO ACTION SHEET / MENU                                */}
        {/* ============================================================ */}
        {showAddMenu && (
          <Animated.View
            entering={FadeIn.duration(200)}
            style={[
              styles.actionMenu,
              { backgroundColor: theme.secondary, borderColor: theme.border },
            ]}>
            <View style={styles.actionMenuHeader}>
              <AppText variant="caption" weight="bold">
                Attach New Photo to Lead
              </AppText>
              <IconButton
                icon="X"
                size="xs"
                variant="ghost"
                accessibilityLabel="Close photo attachment menu"
                onPress={() => setShowAddMenu(false)}
              />
            </View>

            {/* Primary Capture & Gallery Buttons */}
            <View style={styles.primaryActionButtons}>
              <Button
                label="Take Photo"
                variant="primary"
                size="sm"
                leftIcon="Camera"
                onPress={handleCapturePhoto}
                style={{ flex: 1 }}
              />
              <Button
                label="Pick from Gallery"
                variant="outline"
                size="sm"
                leftIcon="Image"
                onPress={handlePickFromGallery}
                style={{ flex: 1 }}
              />
            </View>

            {/* Quick On-Floor Demo Presets */}
            <View style={styles.presetsSection}>
              <AppText variant="caption" color="secondary" weight="semibold">
                Or quick-attach test photo:
              </AppText>
              <View style={styles.presetChipsWrap}>
                {BOOTH_PRESET_PHOTOS.map((preset) => (
                  <Button
                    key={preset.name}
                    label={preset.name}
                    variant="subtle"
                    size="sm"
                    leftIcon="Plus"
                    onPress={() => handleAttachPreset(preset)}
                  />
                ))}
              </View>
            </View>
          </Animated.View>
        )}

        {/* Loading Indicator when uploading */}
        {isProcessing && (
          <View style={styles.processingBar}>
            <Icon name="Clock" size={14} color={theme.primary} />
            <AppText variant="caption" color="secondary">
              Attaching photo to lead profile…
            </AppText>
          </View>
        )}

        {/* ============================================================ */}
        {/* PHOTOS HORIZONTAL SCROLL OR EMPTY STATE                      */}
        {/* ============================================================ */}
        {allPhotos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="Camera" size={28} color={theme.textMuted} />
            <AppText weight="semibold" variant="body">
              No Photos Attached Yet
            </AppText>
            <AppText variant="caption" color="secondary" style={styles.emptySubtext}>
              Capture trade show booth conversations, whiteboard sketches, or business cards.
            </AppText>
            <View style={styles.emptyActionsRow}>
              <Button
                label="Take Photo"
                variant="primary"
                size="sm"
                leftIcon="Camera"
                onPress={handleCapturePhoto}
              />
              <Button
                label="Choose from Gallery"
                variant="outline"
                size="sm"
                leftIcon="Image"
                onPress={handlePickFromGallery}
              />
            </View>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.photosScroll}>
            {allPhotos.map((photo, index) => (
              <Animated.View
                key={photo.id || photo.fileUri}
                entering={FadeInDown.duration(200).delay(index * 30)}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Inspect photo: ${photo.fileName}`}
                  onPress={() => setSelectedPhoto(photo)}
                  style={({ pressed }) => [
                    styles.thumbnailCard,
                    { borderColor: theme.border, backgroundColor: theme.surface },
                    pressed && { opacity: 0.85 },
                  ]}>
                  <Image
                    source={{ uri: photo.fileUri }}
                    style={styles.thumbnailImg}
                    contentFit="cover"
                  />

                  {/* Top-Right Delete Action Button */}
                  <View style={styles.thumbDeleteWrap}>
                    <IconButton
                      icon="Trash2"
                      size="xs"
                      variant="ghost"
                      accessibilityLabel={`Delete photo: ${photo.fileName}`}
                      onPress={() => handleDeletePhoto(photo)}
                      style={styles.thumbDeleteButton}
                    />
                  </View>

                  {/* Caption & Metadata Pill */}
                  <View style={styles.thumbFooter}>
                    <AppText
                      variant="caption"
                      weight="semibold"
                      numberOfLines={1}
                      style={styles.thumbTitle}>
                      {photo.fileName}
                    </AppText>
                    {Boolean(photo.fileSize) && (
                      <AppText variant="caption" style={styles.thumbSize}>
                        {formatFileSize(photo.fileSize)}
                      </AppText>
                    )}
                  </View>
                </Pressable>
              </Animated.View>
            ))}
          </ScrollView>
        )}
      </CardContent>

      {/* ============================================================ */}
      {/* FULL PREVIEW MODAL / LIGHTBOX                                */}
      {/* ============================================================ */}
      <Modal
        visible={Boolean(selectedPhoto)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPhoto(null)}>
        <View style={styles.modalBackdrop}>
          {/* Header Controls Bar */}
          <View style={styles.modalHeader}>
            <View style={{ flex: 1, gap: 2 }}>
              <AppText weight="bold" variant="body" style={{ color: '#FFFFFF' }} numberOfLines={1}>
                {selectedPhoto?.fileName || 'Photo Preview'}
              </AppText>
              <AppText variant="caption" style={{ color: '#94A3B8' }} numberOfLines={1}>
                {selectedPhoto?.caption || 'Lead Photo Attachment'}
                {selectedPhoto?.fileSize ? ` • ${formatFileSize(selectedPhoto.fileSize)}` : ''}
              </AppText>
            </View>

            <View style={styles.modalHeaderActions}>
              {selectedPhoto && (
                <IconButton
                  icon="Trash2"
                  size="md"
                  variant="ghost"
                  accessibilityLabel="Delete this photo"
                  onPress={() => {
                    if (selectedPhoto) handleDeletePhoto(selectedPhoto);
                  }}
                  style={{ backgroundColor: 'rgba(239, 68, 68, 0.25)' }}
                />
              )}

              <IconButton
                icon="X"
                size="md"
                variant="ghost"
                accessibilityLabel="Close photo preview"
                onPress={() => setSelectedPhoto(null)}
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
              />
            </View>
          </View>

          {/* Full Screen Image */}
          {selectedPhoto && (
            <View style={styles.modalImageContainer}>
              <Image
                source={{ uri: selectedPhoto.fileUri }}
                style={styles.modalImage}
                contentFit="contain"
              />
            </View>
          )}

          {/* Bottom Photo Metadata Footer */}
          {selectedPhoto && (
            <View style={styles.modalFooter}>
              {selectedPhoto.caption && (
                <View style={styles.modalCaptionWrap}>
                  <Icon name="MessageSquare" size={14} color="#94A3B8" />
                  <AppText variant="caption" style={{ color: '#E2E8F0', flex: 1 }}>
                    {selectedPhoto.caption}
                  </AppText>
                </View>
              )}
              <View style={styles.modalMetaPills}>
                {selectedPhoto.source && (
                  <Badge
                    label={selectedPhoto.source.toUpperCase()}
                    variant="outline"
                    size="sm"
                  />
                )}
                {selectedPhoto.uploadedAt && (
                  <Badge
                    label={new Intl.DateTimeFormat(undefined, {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    }).format(new Date(selectedPhoto.uploadedAt))}
                    variant="outline"
                    size="sm"
                  />
                )}
              </View>
            </View>
          )}
        </View>
      </Modal>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.large,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing.xs,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  content: {
    gap: Spacing.sm,
  },
  actionMenu: {
    padding: Spacing.sm,
    borderRadius: Radius.medium,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  actionMenuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  primaryActionButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  presetsSection: {
    gap: 4,
    paddingTop: 4,
  },
  presetChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  processingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.xs,
  },
  emptySubtext: {
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: Spacing.xs,
  },
  emptyActionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  photosScroll: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: 2,
  },
  thumbnailCard: {
    width: 136,
    height: 120,
    borderRadius: Radius.medium,
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
  },
  thumbnailImg: {
    width: '100%',
    height: 80,
  },
  thumbDeleteWrap: {
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 5,
  },
  thumbDeleteButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: Radius.full,
  },
  thumbFooter: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    gap: 1,
  },
  thumbTitle: {
    fontSize: 10,
  },
  thumbSize: {
    fontSize: 9,
    color: '#64748B',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.94)',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 44,
    gap: Spacing.sm,
    zIndex: 10,
  },
  modalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  modalImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  modalImage: {
    width: '100%',
    height: '100%',
    borderRadius: Radius.medium,
  },
  modalFooter: {
    paddingBottom: Spacing.xl,
    gap: Spacing.xs,
  },
  modalCaptionWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: Spacing.sm,
    borderRadius: Radius.medium,
  },
  modalMetaPills: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
});
