import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import Animated, { FadeIn } from 'react-native-reanimated';

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
import { Attachment } from '@/types/attachment';
import { Colors, Radius, Spacing } from '@/theme';

interface LeadPhotoGalleryProps {
  attachments: Attachment[];
  onAddPhoto: (fileName: string, fileUri: string, fileType: Attachment['fileType']) => void;
  cardImageUri?: string;
  cardBackImageUri?: string;
}

const SAMPLE_PHOTO_PRESETS = [
  {
    name: 'Business Card (Front)',
    uri: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80',
    type: 'image' as const,
  },
  {
    name: 'Business Card (Back Notes)',
    uri: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80',
    type: 'image' as const,
  },
  {
    name: 'Booth Discussion Photo',
    uri: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80',
    type: 'image' as const,
  },
  {
    name: 'Product Sample / Spec Sheet',
    uri: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80',
    type: 'image' as const,
  },
];

export function LeadPhotoGallery({
  attachments,
  onAddPhoto,
  cardImageUri,
  cardBackImageUri,
}: LeadPhotoGalleryProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);

  // Combine card images with other photo attachments
  const allPhotos = [
    ...(cardImageUri
      ? [
          {
            id: 'card-front',
            fileName: 'Business Card (Front)',
            fileUri: cardImageUri,
            fileType: 'image' as const,
          },
        ]
      : []),
    ...(cardBackImageUri
      ? [
          {
            id: 'card-back',
            fileName: 'Business Card (Back)',
            fileUri: cardBackImageUri,
            fileType: 'image' as const,
          },
        ]
      : []),
    ...attachments.filter((a) => a.fileType === 'image'),
  ];

  return (
    <Card variant="outline" density="comfortable" style={styles.galleryCard}>
      <CardHeader style={styles.header}>
        <View style={styles.titleGroup}>
          <Icon name="Image" size={18} color={theme.primary} />
          <CardTitle level={2}>Photos & Card Attachments</CardTitle>
          <Badge label={`${allPhotos.length}`} variant="outline" size="sm" />
        </View>

        <Button
          label="+ Add Photo"
          variant="outline"
          size="sm"
          leftIcon="Camera"
          onPress={() => setShowAddMenu(!showAddMenu)}
        />
      </CardHeader>

      <CardContent style={styles.content}>
        {/* Quick Add Presets Bar */}
        {showAddMenu && (
          <Animated.View
            entering={FadeIn.duration(200)}
            style={[styles.addMenuBox, { backgroundColor: theme.secondary, borderColor: theme.border }]}>
            <AppText variant="caption" weight="bold">
              Select Photo Type to Attach:
            </AppText>
            <View style={styles.presetsGrid}>
              {SAMPLE_PHOTO_PRESETS.map((preset) => (
                <Button
                  key={preset.name}
                  label={preset.name}
                  variant="subtle"
                  size="sm"
                  leftIcon="Plus"
                  onPress={() => {
                    onAddPhoto(preset.name, preset.uri, preset.type);
                    setShowAddMenu(false);
                  }}
                />
              ))}
            </View>
          </Animated.View>
        )}

        {/* Photos Grid */}
        {allPhotos.length === 0 ? (
          <View style={styles.emptyBox}>
            <Icon name="Camera" size={24} color={theme.textMuted} />
            <AppText variant="caption" color="secondary">
              No photos or card scans attached to this lead yet.
            </AppText>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photosRow}>
            {allPhotos.map((photo) => (
              <Pressable
                key={photo.id || photo.fileUri}
                accessibilityRole="button"
                accessibilityLabel={`View photo: ${photo.fileName}`}
                onPress={() => setSelectedPhoto(photo.fileUri)}
                style={({ pressed }) => [
                  styles.photoThumbWrapper,
                  { borderColor: theme.border },
                  pressed && { opacity: 0.8 },
                ]}>
                <Image source={{ uri: photo.fileUri }} style={styles.photoThumb} contentFit="cover" />
                <View style={styles.photoTagOverlay}>
                  <AppText variant="caption" numberOfLines={1} style={styles.photoTagText}>
                    {photo.fileName}
                  </AppText>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </CardContent>

      {/* Lightbox Modal */}
      <Modal visible={Boolean(selectedPhoto)} transparent animationType="fade" onRequestClose={() => setSelectedPhoto(null)}>
        <View style={styles.lightboxBackdrop}>
          <View style={styles.lightboxHeader}>
            <AppText weight="bold" variant="body" style={{ color: '#FFFFFF' }}>
              Photo Inspection View
            </AppText>
            <IconButton
              icon="X"
              size="md"
              variant="ghost"
              accessibilityLabel="Close photo preview"
              onPress={() => setSelectedPhoto(null)}
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            />
          </View>

          {selectedPhoto && (
            <Image source={{ uri: selectedPhoto }} style={styles.lightboxImage} contentFit="contain" />
          )}
        </View>
      </Modal>
    </Card>
  );
}

const styles = StyleSheet.create({
  galleryCard: {
    borderRadius: Radius.large,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  content: {
    gap: Spacing.sm,
  },
  addMenuBox: {
    padding: Spacing.sm,
    borderRadius: Radius.medium,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  photosRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: 2,
  },
  photoThumbWrapper: {
    width: 120,
    height: 90,
    borderRadius: Radius.medium,
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
  },
  photoThumb: {
    width: '100%',
    height: '100%',
  },
  photoTagOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  photoTagText: {
    color: '#FFFFFF',
    fontSize: 10,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: 6,
  },
  lightboxBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  lightboxHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    top: 48,
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 10,
  },
  lightboxImage: {
    width: '100%',
    height: '75%',
    borderRadius: Radius.medium,
  },
});
