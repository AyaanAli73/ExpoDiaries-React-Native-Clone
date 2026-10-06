import React, { useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ScreenContainer } from '@/components/layout/screen-container';
import {
  AppText,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Divider,
  EmptyState,
  Icon,
  IconButton,
  Skeleton,
  Toast,
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  useEvent,
  useExhibitor,
  useToggleBookmarkExhibitor,
  useToggleExhibitorItinerary,
} from '@/hooks/use-events';
import { Colors, Radius, Spacing } from '@/theme';

export default function ExhibitorDetailScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  const { id } = useLocalSearchParams<{ id: string }>();
  const exhibitorId = id || 'exh-1';

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // We query for the exhibitor with default event fallback
  const { data: exhibitor, isLoading } = useExhibitor('evt-2026-ces', exhibitorId);
  const { data: event } = useEvent(exhibitor?.eventId || 'evt-2026-ces');
  const toggleBookmarkMutation = useToggleBookmarkExhibitor();
  const toggleItineraryMutation = useToggleExhibitorItinerary();

  const handleToggleBookmark = async () => {
    if (!exhibitor) return;
    try {
      await toggleBookmarkMutation.mutateAsync(exhibitor.id);
      setToastMessage(
        exhibitor.isBookmarked
          ? `Removed “${exhibitor.name}” from target exhibitors`
          : `Saved “${exhibitor.name}” to target exhibitors`
      );
    } catch {
      setToastMessage('Could not update bookmark');
    }
  };

  const handleToggleItinerary = async () => {
    if (!exhibitor) return;
    try {
      const res = await toggleItineraryMutation.mutateAsync({
        eventId: exhibitor.eventId || 'evt-2026-ces',
        exhibitorId: exhibitor.id,
      });
      setToastMessage(
        res.inItinerary
          ? `Added ${exhibitor.name} booth visit to your itinerary`
          : `Removed ${exhibitor.name} from your itinerary`
      );
    } catch {
      setToastMessage('Could not update itinerary');
    }
  };

  const handleOpenWebsite = () => {
    if (exhibitor?.website) {
      Linking.openURL(exhibitor.website).catch(() => {
        setToastMessage(`Unable to open ${exhibitor.website}`);
      });
    }
  };

  const handleLocateOnFloor = () => {
    if (exhibitor) {
      router.push({
        pathname: '/events/[id]',
        params: { id: exhibitor.eventId, initialTab: 'floor' },
      });
    }
  };

  const isBookmarked = Boolean(exhibitor?.isBookmarked);

  return (
    <ScreenContainer
      safeAreaEdges={['left', 'right']}
      header={
        <View
          style={[
            styles.headerBar,
            { backgroundColor: theme.surface, borderBottomColor: theme.border },
          ]}>
          <IconButton
            icon="ChevronLeft"
            size="sm"
            variant="ghost"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
          />
          <View style={styles.headerTitleCol}>
            <AppText weight="bold" variant="body" numberOfLines={1}>
              {exhibitor?.name || 'Exhibitor Profile'}
            </AppText>
            <AppText variant="caption" color="secondary" numberOfLines={1}>
              {event?.name || 'Conference Showcase'}
            </AppText>
          </View>
          <View style={styles.headerRightActions}>
            <IconButton
              icon={
                <Icon
                  name={isBookmarked ? 'BookmarkCheck' : 'Bookmark'}
                  size={18}
                  color={isBookmarked ? theme.primary : theme.textPrimary}
                />
              }
              size="sm"
              variant="ghost"
              accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Bookmark exhibitor'}
              onPress={handleToggleBookmark}
            />
            <IconButton
              icon="Share2"
              size="sm"
              variant="ghost"
              accessibilityLabel="Share exhibitor profile"
              onPress={() => setToastMessage('Exhibitor booth link copied')}
            />
          </View>
        </View>
      }>
      {/* Toast Notification */}
      <Toast
        visible={Boolean(toastMessage)}
        message={toastMessage || ''}
        type="success"
        duration={2500}
        onDismiss={() => setToastMessage(null)}
      />

      {isLoading ? (
        <View style={{ gap: Spacing.md, paddingVertical: Spacing.md }}>
          <Skeleton width="100%" height={160} style={{ borderRadius: Radius.large }} />
          <Skeleton width="100%" height={120} style={{ borderRadius: Radius.medium }} />
          <Skeleton width="100%" height={180} style={{ borderRadius: Radius.large }} />
        </View>
      ) : !exhibitor ? (
        <EmptyState
          icon="Building2"
          title="Exhibitor Profile Not Found"
          description="The selected company booth information could not be retrieved."
          actionLabel="Back to Event"
          onAction={() => router.back()}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* 1. HERO COMPANY PROFILE CARD */}
          <Animated.View entering={FadeInDown.duration(280).springify().damping(18)}>
            <Card variant="elevated" density="comfortable" style={styles.heroCard}>
              <View style={styles.heroCompanyRow}>
                {exhibitor.logoUrl ? (
                  <Image
                    source={{ uri: exhibitor.logoUrl }}
                    style={styles.companyLogo}
                    contentFit="cover"
                  />
                ) : (
                  <View
                    style={[
                      styles.logoPlaceholder,
                      { backgroundColor: theme.primarySubtle },
                    ]}>
                    <Icon name="Building2" size={32} color={theme.primary} />
                  </View>
                )}

                <View style={styles.companyTitleCol}>
                  <View style={styles.badgeRow}>
                    <Badge label={exhibitor.category} variant="primary" size="sm" />
                    {exhibitor.featured && (
                      <Badge label="FEATURED" variant="success" size="sm" showDot />
                    )}
                  </View>
                  <CardTitle level={1} style={styles.companyName}>
                    {exhibitor.name}
                  </CardTitle>
                  <AppText variant="caption" color="secondary">
                    {exhibitor.headquarters || 'Global Headquarters'}
                  </AppText>
                </View>
              </View>

              <Divider style={{ marginVertical: Spacing.sm }} />

              {/* Booth Location Banner Card */}
              <View
                style={[
                  styles.boothLocationCard,
                  { backgroundColor: theme.secondary, borderColor: theme.border },
                ]}>
                <View style={styles.boothIconBox}>
                  <Icon name="Home" size={20} color={theme.primary} />
                </View>
                <View style={styles.boothTextCol}>
                  <View style={{ flexDirection: 'row', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                    <Badge label={`Booth ${exhibitor.boothNumber}`} variant="primary" size="sm" />
                    <Badge label={`Hall: ${exhibitor.hall || 'North Hall'}`} variant="outline" size="sm" />
                  </View>
                  <AppText weight="bold" variant="body">
                    {exhibitor.boothNumber} • {exhibitor.hall || 'North Hall'}
                  </AppText>
                  <AppText variant="caption" color="muted">
                    {exhibitor.floorPlanLocation || `${exhibitor.hall || 'North Hall'} • Level 1 Pavilion`}
                  </AppText>
                </View>

                <Button
                  label="Locate"
                  variant="primary"
                  size="sm"
                  leftIcon="Map"
                  onPress={handleLocateOnFloor}
                />
              </View>
            </Card>
          </Animated.View>

          {/* 2. OVERVIEW & DESCRIPTION */}
          <Animated.View entering={FadeInDown.duration(300).delay(60).springify().damping(18)}>
            <Card variant="elevated" density="comfortable">
              <CardHeader>
                <View style={styles.cardHeaderTitleRow}>
                  <Icon name="FileText" size={16} color={theme.primary} />
                  <CardTitle level={2}>Company Overview</CardTitle>
                </View>
              </CardHeader>
              <CardContent style={styles.overviewBody}>
                <AppText variant="body" color="primary" style={styles.overviewParagraph}>
                  {exhibitor.description ||
                    'Leading enterprise technology provider delivering high-performance products and solutions for modern corporate workloads.'}
                </AppText>

                {/* Tags */}
                {exhibitor.tags?.length > 0 && (
                  <View style={styles.tagsContainer}>
                    {exhibitor.tags.map((t) => (
                      <Badge key={t} label={`#${t}`} variant="outline" size="sm" />
                    ))}
                  </View>
                )}
              </CardContent>
            </Card>
          </Animated.View>

          {/* 3. SHOWCASE PRODUCTS & SERVICES */}
          {exhibitor.products?.length > 0 && (
            <Animated.View entering={FadeInDown.duration(300).delay(100).springify().damping(18)}>
              <Card variant="elevated" density="comfortable">
                <CardHeader>
                  <View style={styles.cardHeaderTitleRow}>
                    <Icon name="Package" size={16} color={theme.primary} />
                    <CardTitle level={2}>Featured Products on Floor</CardTitle>
                  </View>
                  <CardDescription>
                    Live interactive hardware, APIs, and product demos accessible at this booth.
                  </CardDescription>
                </CardHeader>
                <CardContent style={styles.productsList}>
                  {exhibitor.products.map((prod, idx) => (
                    <View
                      key={prod}
                      style={[
                        styles.productItem,
                        { borderColor: theme.border, backgroundColor: theme.surfaceElevated },
                      ]}>
                      <View style={[styles.productNumberBox, { backgroundColor: theme.primarySubtle }]}>
                        <AppText weight="bold" variant="caption" style={{ color: theme.primary }}>
                          {idx + 1}
                        </AppText>
                      </View>
                      <View style={styles.productTextCol}>
                        <AppText weight="bold" variant="body">
                          {prod}
                        </AppText>
                        <AppText variant="caption" color="secondary">
                          Live demo available at {exhibitor.boothNumber}
                        </AppText>
                      </View>
                      <Icon name="ChevronRight" size={16} color={theme.textMuted} />
                    </View>
                  ))}
                </CardContent>
              </Card>
            </Animated.View>
          )}

          {/* 4. CONTACT & TRADE SHOW LOGISTICS */}
          <Animated.View entering={FadeInDown.duration(300).delay(140).springify().damping(18)}>
            <Card variant="elevated" density="comfortable">
              <CardHeader>
                <View style={styles.cardHeaderTitleRow}>
                  <Icon name="PhoneCall" size={16} color={theme.primary} />
                  <CardTitle level={2}>Direct Contact & Logistics</CardTitle>
                </View>
              </CardHeader>
              <CardContent style={styles.contactDetails}>
                {exhibitor.website && (
                  <Pressable
                    accessibilityRole="link"
                    accessibilityLabel={`Open website: ${exhibitor.website}`}
                    onPress={handleOpenWebsite}
                    style={styles.contactRow}>
                    <View style={styles.contactIconLabel}>
                      <Icon name="Globe" size={15} color={theme.primary} />
                      <AppText variant="caption" color="secondary">
                        Website
                      </AppText>
                    </View>
                    <View style={styles.linkTextRow}>
                      <AppText
                        variant="caption"
                        weight="semibold"
                        style={{ color: theme.primary }}
                        numberOfLines={1}>
                        {exhibitor.website.replace('https://', '')}
                      </AppText>
                      <Icon name="ExternalLink" size={12} color={theme.primary} />
                    </View>
                  </Pressable>
                )}

                {exhibitor.contactEmail && (
                  <View style={styles.contactRow}>
                    <View style={styles.contactIconLabel}>
                      <Icon name="Mail" size={15} color={theme.primary} />
                      <AppText variant="caption" color="secondary">
                        Inquiries
                      </AppText>
                    </View>
                    <AppText variant="caption" weight="semibold">
                      {exhibitor.contactEmail}
                    </AppText>
                  </View>
                )}

                {exhibitor.contactPhone && (
                  <View style={styles.contactRow}>
                    <View style={styles.contactIconLabel}>
                      <Icon name="Phone" size={15} color={theme.primary} />
                      <AppText variant="caption" color="secondary">
                        Phone
                      </AppText>
                    </View>
                    <AppText variant="caption" weight="semibold" tabular>
                      {exhibitor.contactPhone}
                    </AppText>
                  </View>
                )}

                <View style={styles.contactRow}>
                  <View style={styles.contactIconLabel}>
                    <Icon name="Users" size={15} color={theme.primary} />
                    <AppText variant="caption" color="secondary">
                      Booth Staff
                    </AppText>
                  </View>
                  <AppText variant="caption" weight="semibold" tabular>
                    {exhibitor.staffOnDutyCount || 3} Representatives Present
                  </AppText>
                </View>
              </CardContent>
            </Card>
          </Animated.View>

          {/* 5. ACTION BUTTONS */}
          <Animated.View
            entering={FadeInDown.duration(300).delay(180).springify().damping(18)}
            style={styles.actionBlock}>
            {/* Add to Itinerary Button */}
            <Button
              label={exhibitor.isInItinerary ? 'In Itinerary (Remove)' : 'Add to Itinerary'}
              variant={exhibitor.isInItinerary ? 'secondary' : 'primary'}
              size="lg"
              leftIcon={exhibitor.isInItinerary ? 'Check' : 'CalendarPlus'}
              loading={toggleItineraryMutation.isPending}
              onPress={handleToggleItinerary}
              style={{ width: '100%' }}
            />

            <Button
              label={isBookmarked ? 'Saved to Target Exhibitors' : 'Bookmark Exhibitor'}
              variant={isBookmarked ? 'subtle' : 'outline'}
              size="md"
              leftIcon={isBookmarked ? 'BookmarkCheck' : 'Bookmark'}
              onPress={handleToggleBookmark}
              style={{ width: '100%' }}
            />

            <Button
              label="Locate on Floor Plan"
              variant="ghost"
              size="md"
              leftIcon="Compass"
              onPress={handleLocateOnFloor}
              style={{ width: '100%' }}
            />
          </Animated.View>
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    gap: Spacing.xs,
  },
  headerTitleCol: {
    flex: 1,
    gap: 1,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scrollContent: {
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    paddingBottom: Spacing.xl + 20,
  },
  heroCard: {
    borderRadius: Radius.large,
  },
  heroCompanyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  companyLogo: {
    width: 64,
    height: 64,
    borderRadius: Radius.medium,
  },
  logoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: Radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyTitleCol: {
    flex: 1,
    gap: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  companyName: {
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.3,
  },
  boothLocationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm + 2,
    borderRadius: Radius.medium,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  boothIconBox: {
    width: 38,
    height: 38,
    borderRadius: Radius.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boothTextCol: {
    flex: 1,
    gap: 2,
  },
  cardHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  overviewBody: {
    gap: Spacing.md,
  },
  overviewParagraph: {
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  productsList: {
    gap: Spacing.sm,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: Radius.medium,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  productNumberBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productTextCol: {
    flex: 1,
    gap: 2,
  },
  contactDetails: {
    gap: Spacing.sm,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  contactIconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  linkTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBlock: {
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
});
