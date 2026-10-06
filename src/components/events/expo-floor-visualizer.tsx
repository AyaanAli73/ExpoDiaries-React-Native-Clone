import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import {
  AppText,
  Badge,
  BottomSheet,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  Icon,
  IconButton,
  Input,
  Skeleton,
  Toast,
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  useBooths,
  useHalls,
  useTagUserLocation,
  useToggleExhibitorItinerary,
  useUserTaggedLocation,
} from '@/hooks/use-events';
import { Colors, Radius, Shadows, Spacing } from '@/theme';
import { Booth } from '@/types/booth';
import { FloorMapHall } from '@/types/floor-map';

interface ExpoFloorVisualizerProps {
  eventId: string;
  initialBoothNumber?: string;
  onFullScreenToggle?: () => void;
  isFullScreen?: boolean;
}

type FloorViewMode = 'grid' | 'aisles';

export function ExpoFloorVisualizer({
  eventId,
  initialBoothNumber,
  onFullScreenToggle,
  isFullScreen = false,
}: ExpoFloorVisualizerProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  // Queries
  const { data: halls = [], isLoading: loadingHalls } = useHalls(eventId);
  const { data: allBooths = [], isLoading: loadingBooths } = useBooths(eventId);
  const { data: taggedLocation } = useUserTaggedLocation(eventId);

  // Mutations
  const tagLocationMutation = useTagUserLocation();
  const toggleItineraryMutation = useToggleExhibitorItinerary();

  // State
  const [selectedHallId, setSelectedHallId] = useState<string>('hall-north');
  const [viewMode, setViewMode] = useState<FloorViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooth, setSelectedBooth] = useState<Booth | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync initial booth if provided
  useEffect(() => {
    if (!initialBoothNumber || allBooths.length === 0) return;

    const timer = setTimeout(() => {
      const target = allBooths.find(
        (b) => b.boothNumber.toLowerCase() === initialBoothNumber.toLowerCase()
      );
      if (target) {
        setSelectedBooth(target);
        const matchingHall = halls.find(
          (h) =>
            h.name === target.hall ||
            target.hall.toLowerCase().includes(h.name.toLowerCase().split(' ')[0])
        );
        if (matchingHall) {
          setSelectedHallId(matchingHall.id);
        }
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [initialBoothNumber, allBooths, halls]);

  // Active hall object
  const activeHall: FloorMapHall | undefined = useMemo(() => {
    return halls.find((h) => h.id === selectedHallId) || halls[0];
  }, [halls, selectedHallId]);

  // Filter booths by active hall
  const hallBooths = useMemo(() => {
    if (!activeHall) return allBooths;
    return allBooths.filter(
      (b) => b.hall === activeHall.name || b.hall.toLowerCase().includes(activeHall.name.toLowerCase().split(' ')[0])
    );
  }, [allBooths, activeHall]);

  // Filter booths by search query
  const filteredBooths = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return hallBooths;

    return hallBooths.filter(
      (b) =>
        b.boothNumber.toLowerCase().includes(q) ||
        (b.exhibitorName && b.exhibitorName.toLowerCase().includes(q)) ||
        (b.category && b.category.toLowerCase().includes(q)) ||
        (b.aisle && b.aisle.toLowerCase().includes(q))
    );
  }, [hallBooths, searchQuery]);

  // Group booths by aisle for Aisle Directory mode
  const boothsByAisle = useMemo(() => {
    const map = new Map<string, Booth[]>();
    filteredBooths.forEach((b) => {
      const aisleName = b.aisle || 'General Floor';
      const existing = map.get(aisleName) || [];
      existing.push(b);
      map.set(aisleName, existing);
    });
    return Array.from(map.entries()).map(([aisle, booths]) => ({ aisle, booths }));
  }, [filteredBooths]);

  // Handle location check-in / tagging
  const handleTagLocation = async (booth: Booth) => {
    try {
      await tagLocationMutation.mutateAsync({ eventId, boothId: booth.id });
      setToastMessage(`Tagged your location at ${booth.boothNumber}`);
      setSelectedBooth({ ...booth, isTaggedLocation: true });
    } catch {
      setToastMessage('Could not update location tag');
    }
  };

  // Handle Itinerary Toggle
  const handleToggleItinerary = async (booth: Booth) => {
    if (!booth.exhibitorId) {
      setToastMessage('No exhibitor linked to this booth');
      return;
    }
    try {
      const res = await toggleItineraryMutation.mutateAsync({
        eventId,
        exhibitorId: booth.exhibitorId,
      });
      setToastMessage(
        res.inItinerary
          ? `Added ${booth.exhibitorName} to itinerary`
          : `Removed from itinerary`
      );
    } catch {
      setToastMessage('Could not update itinerary');
    }
  };

  // Lead capture action
  const handleAddLeadForBooth = (booth: Booth) => {
    setSelectedBooth(null);
    router.push({
      pathname: '/capture',
      params: {
        boothNumber: booth.boothNumber,
        companyName: booth.exhibitorName,
      },
    } as never);
  };

  return (
    <View style={styles.container}>
      {/* Toast Notification */}
      <Toast
        visible={Boolean(toastMessage)}
        message={toastMessage || ''}
        type="success"
        duration={2500}
        onDismiss={() => setToastMessage(null)}
      />

      {/* ============================================================ */}
      {/* 1. CURRENT USER LOCATION CHECK-IN BANNER                     */}
      {/* ============================================================ */}
      <View
        style={[
          styles.locationBanner,
          {
            backgroundColor: taggedLocation ? theme.primarySubtle : theme.surfaceElevated,
            borderColor: taggedLocation ? theme.primary : theme.border,
          },
        ]}>
        <View style={styles.locationBannerLeft}>
          <View
            style={[
              styles.locationDotBeacon,
              { backgroundColor: taggedLocation ? theme.primary : theme.textMuted },
            ]}
          />
          <View style={{ gap: 1 }}>
            <AppText variant="caption" weight="bold" color="primary">
              {taggedLocation ? 'Your Current Location' : 'No Location Tagged'}
            </AppText>
            <AppText variant="caption" color="secondary" numberOfLines={1}>
              {taggedLocation
                ? `${taggedLocation.boothNumber} (${taggedLocation.exhibitorName || 'Assigned'})`
                : 'Tap any booth cell below to check-in on the floor.'}
            </AppText>
          </View>
        </View>

        {taggedLocation && (
          <Button
            label="View"
            variant="outline"
            size="sm"
            onPress={() => setSelectedBooth(taggedLocation)}
          />
        )}
      </View>

      {/* ============================================================ */}
      {/* 2. HALL SELECTOR TABS                                        */}
      {/* ============================================================ */}
      <View style={styles.hallSelectorSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hallScroll}>
          {loadingHalls ? (
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <Skeleton width={120} height={36} style={{ borderRadius: Radius.pill }} />
              <Skeleton width={120} height={36} style={{ borderRadius: Radius.pill }} />
            </View>
          ) : (
            halls.map((hall) => {
              const isSelected = selectedHallId === hall.id;
              return (
                <Pressable
                  key={hall.id}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`${hall.name}, ${hall.level}`}
                  onPress={() => setSelectedHallId(hall.id)}
                  style={({ pressed }) => [
                    styles.hallTabBtn,
                    {
                      backgroundColor: isSelected ? theme.primary : theme.surface,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                    pressed && { opacity: 0.8 },
                  ]}>
                  {hall.hasHostBooth && (
                    <AppText style={{ color: isSelected ? '#FFFFFF' : theme.success, fontSize: 11 }}>
                      ★
                    </AppText>
                  )}
                  <AppText
                    weight={isSelected ? 'bold' : 'medium'}
                    variant="caption"
                    style={{ color: isSelected ? '#FFFFFF' : theme.textSecondary }}>
                    {hall.name}
                  </AppText>
                  <View
                    style={[
                      styles.hallCountBadge,
                      {
                        backgroundColor: isSelected
                          ? 'rgba(255, 255, 255, 0.25)'
                          : theme.surfaceElevated,
                      },
                    ]}>
                    <AppText
                      variant="caption"
                      weight="bold"
                      tabular
                      style={{
                        fontSize: 10,
                        color: isSelected ? '#FFFFFF' : theme.textMuted,
                      }}>
                      {hall.totalBooths}
                    </AppText>
                  </View>
                </Pressable>
              );
            })
          )}
        </ScrollView>
      </View>

      {/* ============================================================ */}
      {/* 3. TOOLBAR: BOOTH SEARCH & MODE TOGGLES                      */}
      {/* ============================================================ */}
      <View style={styles.toolbarRow}>
        <View style={styles.searchBox}>
          <Input
            placeholder="Search booth #, company, or category…"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            spellCheck={false}
            leftAccessory={<Icon name="Search" size={15} color={theme.textMuted} />}
            clearButtonMode="while-editing"
          />
        </View>

        <View style={styles.toolbarRightActions}>
          {/* Zoom Toggle */}
          <View style={[styles.zoomToggleGroup, { borderColor: theme.border, backgroundColor: theme.surface }]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="1x zoom scale"
              onPress={() => setZoomScale(1)}
              style={[
                styles.zoomBtn,
                zoomScale === 1 && { backgroundColor: theme.primarySubtle },
              ]}>
              <AppText variant="caption" weight="bold" tabular style={{ fontSize: 11 }}>
                1x
              </AppText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="1.3x zoom scale"
              onPress={() => setZoomScale(1.3)}
              style={[
                styles.zoomBtn,
                zoomScale === 1.3 && { backgroundColor: theme.primarySubtle },
              ]}>
              <AppText variant="caption" weight="bold" tabular style={{ fontSize: 11 }}>
                1.3x
              </AppText>
            </Pressable>
          </View>

          {/* Mode Switcher */}
          <View style={[styles.modeToggleGroup, { borderColor: theme.border, backgroundColor: theme.surface }]}>
            <IconButton
              icon="Grid"
              size="sm"
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              accessibilityLabel="Switch to floor map grid mode"
              onPress={() => setViewMode('grid')}
            />
            <IconButton
              icon="List"
              size="sm"
              variant={viewMode === 'aisles' ? 'primary' : 'ghost'}
              accessibilityLabel="Switch to aisle list mode"
              onPress={() => setViewMode('aisles')}
            />
          </View>

          {onFullScreenToggle && (
            <IconButton
              icon={isFullScreen ? 'Minimize2' : 'Maximize2'}
              size="sm"
              variant="outline"
              accessibilityLabel={isFullScreen ? 'Exit full screen' : 'Expand full screen map'}
              onPress={onFullScreenToggle}
            />
          )}
        </View>
      </View>

      {/* Search results banner if searching */}
      {searchQuery.trim().length > 0 && (
        <View style={styles.searchResultStrip}>
          <AppText variant="caption" color="secondary">
            Showing {filteredBooths.length} matching booths for “{searchQuery}”
          </AppText>
        </View>
      )}

      {/* ============================================================ */}
      {/* 4. MAP LEGEND STRIP                                          */}
      {/* ============================================================ */}
      <View style={[styles.legendBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.success }]} />
          <AppText variant="caption" weight="semibold">Your Host Booth</AppText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.primary }]} />
          <AppText variant="caption" weight="semibold">Partner Exhibitor</AppText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
          <AppText variant="caption" weight="semibold">You Are Here 📍</AppText>
        </View>
      </View>

      {/* ============================================================ */}
      {/* 5. STRUCTURED FLOOR MAP (NOT a static screenshot!)            */}
      {/* ============================================================ */}
      {loadingBooths ? (
        <View style={{ gap: Spacing.sm, paddingVertical: Spacing.md }}>
          <Skeleton width="100%" height={280} style={{ borderRadius: Radius.large }} />
        </View>
      ) : filteredBooths.length === 0 ? (
        <EmptyState
          icon="Map"
          title="No Booths in This View"
          description="Try selecting a different hall or clearing search keywords."
          actionLabel="Clear Filters"
          onAction={() => setSearchQuery('')}
        />
      ) : viewMode === 'grid' ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.mapCanvasScroll}>
          <Card
            variant="elevated"
            style={[
              styles.floorMapCanvas,
              {
                borderColor: theme.border,
                backgroundColor: theme.surface,
                transform: [{ scale: zoomScale }],
              },
            ]}>
            {/* Floor Map Header Aisle Indicators */}
            <View style={styles.canvasHallHeader}>
              <View style={styles.canvasEntranceBadge}>
                <Icon name="ArrowDown" size={12} color={theme.textMuted} />
                <AppText variant="caption" color="muted" weight="bold" style={{ fontSize: 10 }}>
                  MAIN PAVILION ENTRANCE
                </AppText>
              </View>
              <AppText variant="caption" color="secondary" weight="semibold">
                {activeHall?.name || 'Convention Pavilion'} • {activeHall?.level}
              </AppText>
            </View>

            {/* Structured Booth Grid Matrix */}
            <View style={styles.structuredGridContainer}>
              {boothsByAisle.map(({ aisle, booths }) => (
                <View key={aisle} style={styles.aisleBlock}>
                  <View style={[styles.aisleSignpost, { borderBottomColor: theme.border }]}>
                    <Icon name="Navigation" size={11} color={theme.primary} />
                    <AppText variant="caption" weight="bold" color="primary" style={{ fontSize: 11 }}>
                      {aisle.toUpperCase()}
                    </AppText>
                  </View>

                  <View style={styles.boothsRowInAisle}>
                    {booths.map((booth) => {
                      const isHost = booth.isHostBooth;
                      const isSelected = selectedBooth?.id === booth.id;
                      const isUserHere =
                        taggedLocation?.id === booth.id || Boolean(booth.isTaggedLocation);
                      const leadsCount = booth.capturedLeadsCount || 0;

                      return (
                        <Pressable
                          key={booth.id}
                          accessibilityRole="button"
                          accessibilityLabel={`Booth ${booth.boothNumber}, ${booth.exhibitorName || 'Available'}`}
                          onPress={() => setSelectedBooth(booth)}
                          style={({ pressed }) => [
                            styles.boothBox,
                            {
                              backgroundColor: isHost
                                ? theme.successSubtle
                                : isSelected
                                  ? theme.primarySubtle
                                  : isUserHere
                                    ? '#EFF6FF'
                                    : theme.surfaceElevated,
                              borderColor: isSelected
                                ? theme.primary
                                : isHost
                                  ? theme.success
                                  : isUserHere
                                    ? '#3B82F6'
                                    : theme.border,
                              borderWidth: isSelected || isHost || isUserHere ? 2 : 1,
                              transform: [{ scale: pressed ? 0.95 : 1 }],
                            },
                            (isHost || isSelected) && Shadows.subtle,
                          ]}>
                          {/* Beacons Top Row */}
                          <View style={styles.boothBeaconsRow}>
                            {isHost && (
                              <View style={[styles.hostStarBadge, { backgroundColor: theme.success }]}>
                                <AppText style={styles.hostStarText}>★</AppText>
                              </View>
                            )}

                            {isUserHere && (
                              <View style={styles.userLocationPinBadge}>
                                <AppText style={{ fontSize: 10 }}>📍</AppText>
                              </View>
                            )}
                          </View>

                          {/* Booth Number */}
                          <AppText
                            weight="bold"
                            variant="caption"
                            style={[
                              styles.boothCodeText,
                              isHost && { color: theme.success },
                              isSelected && { color: theme.primary },
                              isUserHere && { color: '#2563EB' },
                            ]}
                            numberOfLines={1}>
                            {booth.boothNumber.split('#')[1] || booth.boothNumber}
                          </AppText>

                          {/* Exhibitor Name */}
                          <AppText
                            variant="caption"
                            color={isHost ? 'primary' : 'secondary'}
                            weight={isHost ? 'semibold' : 'normal'}
                            numberOfLines={1}
                            style={styles.boothCompanyName}>
                            {booth.exhibitorName?.split(' ')[0] || 'Available'}
                          </AppText>

                          {/* Captured Leads Count Badge */}
                          <View
                            style={[
                              styles.leadsCountPill,
                              {
                                backgroundColor:
                                  leadsCount > 0
                                    ? isHost
                                      ? theme.success
                                      : theme.primary
                                    : theme.border,
                              },
                            ]}>
                            <AppText
                              variant="caption"
                              weight="bold"
                              tabular
                              style={{ color: '#FFFFFF', fontSize: 9 }}>
                              {leadsCount > 0 ? `${leadsCount} leads` : '0 leads'}
                            </AppText>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          </Card>
        </ScrollView>
      ) : (
        /* Aisle Directory List Mode */
        <View style={styles.aislesListContainer}>
          {boothsByAisle.map(({ aisle, booths }) => (
            <Card key={aisle} variant="elevated" density="comfortable" style={styles.aisleDirectoryCard}>
              <CardHeader style={styles.aisleCardHeader}>
                <View style={styles.aisleHeaderLeft}>
                  <Icon name="Navigation" size={15} color={theme.primary} />
                  <CardTitle level={2}>{aisle}</CardTitle>
                </View>
                <Badge label={`${booths.length} Booths`} variant="outline" size="sm" />
              </CardHeader>
              <CardContent style={styles.aisleBoothsList}>
                {booths.map((b) => {
                  const isHost = b.isHostBooth;
                  const isUserHere = taggedLocation?.id === b.id;

                  return (
                    <Pressable
                      key={b.id}
                      accessibilityRole="button"
                      accessibilityLabel={`View ${b.boothNumber} details`}
                      onPress={() => setSelectedBooth(b)}
                      style={[
                        styles.aisleBoothListItem,
                        { borderColor: theme.border },
                        isHost && { backgroundColor: theme.successSubtle },
                      ]}>
                      <View style={styles.boothListInfoCol}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Badge
                            label={b.boothNumber}
                            variant={isHost ? 'success' : 'primary'}
                            size="sm"
                          />
                          {isUserHere && (
                            <Badge label="YOU ARE HERE 📍" variant="primary" size="sm" />
                          )}
                        </View>
                        <AppText weight="bold" variant="body">
                          {b.exhibitorName || 'Available Sponsor Booth'}
                        </AppText>
                        <AppText variant="caption" color="secondary">
                          {b.category || 'General Technology'} • {b.dimensions}
                        </AppText>
                      </View>

                      <View style={styles.boothListRightCol}>
                        <Badge
                          label={`${b.capturedLeadsCount || 0} leads`}
                          variant={isHost ? 'success' : 'outline'}
                          size="sm"
                        />
                        <Icon name="ChevronRight" size={16} color={theme.textMuted} />
                      </View>
                    </Pressable>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </View>
      )}

      {/* ============================================================ */}
      {/* 6. BOOTH DETAILS BOTTOM SHEET                                */}
      {/* ============================================================ */}
      <BottomSheet
        visible={Boolean(selectedBooth)}
        onClose={() => setSelectedBooth(null)}
        title={selectedBooth?.boothNumber || 'Booth Details'}
        subtitle={`${selectedBooth?.hall || 'North Hall'} • ${selectedBooth?.aisle || 'Main Aisle'}`}>
        {selectedBooth && (
          <View style={styles.sheetContent}>
            {/* Company Profile Header */}
            <View style={styles.sheetCompanyRow}>
              {selectedBooth.logoUrl ? (
                <Image
                  source={{ uri: selectedBooth.logoUrl }}
                  style={styles.sheetCompanyLogo}
                  contentFit="cover"
                />
              ) : (
                <View
                  style={[
                    styles.sheetLogoPlaceholder,
                    { backgroundColor: theme.primarySubtle },
                  ]}>
                  <Icon name="Building2" size={24} color={theme.primary} />
                </View>
              )}

              <View style={styles.sheetCompanyInfoCol}>
                <View style={styles.sheetBadgesRow}>
                  {selectedBooth.isHostBooth && (
                    <Badge label="HOST BOOTH" variant="success" size="sm" showDot />
                  )}
                  {selectedBooth.category && (
                    <Badge label={selectedBooth.category} variant="primary" size="sm" />
                  )}
                </View>
                <CardTitle level={2}>{selectedBooth.exhibitorName || 'Available Booth'}</CardTitle>
                <AppText variant="caption" color="secondary">
                  {selectedBooth.dimensions} • {selectedBooth.status.toUpperCase()}
                </AppText>
              </View>
            </View>

            {/* Description */}
            {selectedBooth.description && (
              <AppText variant="caption" color="secondary" style={styles.sheetDescText}>
                {selectedBooth.description}
              </AppText>
            )}

            {/* Captured Leads Metric Card */}
            <View
              style={[
                styles.sheetLeadStatCard,
                {
                  backgroundColor: selectedBooth.isHostBooth
                    ? theme.successSubtle
                    : theme.surfaceElevated,
                  borderColor: selectedBooth.isHostBooth ? theme.success : theme.border,
                },
              ]}>
              <View style={styles.leadStatLeft}>
                <Icon
                  name="Users"
                  size={20}
                  color={selectedBooth.isHostBooth ? theme.success : theme.primary}
                />
                <View style={{ gap: 2 }}>
                  <AppText weight="bold" variant="body" tabular>
                    {selectedBooth.capturedLeadsCount || 0} Leads Captured
                  </AppText>
                  <AppText variant="caption" color="secondary">
                    {selectedBooth.hotLeadsCount || 0} high-priority hot qualifiers
                  </AppText>
                </View>
              </View>

              <Button
                label="+ Add Lead"
                variant="primary"
                size="sm"
                leftIcon="UserPlus"
                onPress={() => handleAddLeadForBooth(selectedBooth)}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.sheetActionsList}>
              {/* Location Tagging / Check-In Button */}
              <Button
                label={
                  taggedLocation?.id === selectedBooth.id
                    ? 'Current Location (Tagged 📍)'
                    : 'Tag As My Location (Check-In)'
                }
                variant={taggedLocation?.id === selectedBooth.id ? 'secondary' : 'outline'}
                size="md"
                leftIcon="MapPin"
                onPress={() => handleTagLocation(selectedBooth)}
                style={{ width: '100%' }}
              />

              {/* Add to Itinerary Button */}
              {selectedBooth.exhibitorId && (
                <Button
                  label="Add Booth Visit to Itinerary"
                  variant="outline"
                  size="md"
                  leftIcon="CalendarPlus"
                  onPress={() => handleToggleItinerary(selectedBooth)}
                  style={{ width: '100%' }}
                />
              )}

              {/* View Exhibitor Details */}
              {selectedBooth.exhibitorId && (
                <Button
                  label="View Full Exhibitor Profile"
                  variant="primary"
                  size="md"
                  rightIcon="ChevronRight"
                  onPress={() => {
                    setSelectedBooth(null);
                    router.push(`/events/exhibitor/${selectedBooth.exhibitorId}` as never);
                  }}
                  style={{ width: '100%' }}
                />
              )}
            </View>
          </View>
        )}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  locationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.sm,
    borderRadius: Radius.medium,
    borderWidth: 1,
  },
  locationBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  locationDotBeacon: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  hallSelectorSection: {
    paddingVertical: 2,
  },
  hallScroll: {
    gap: 8,
    paddingHorizontal: 2,
  },
  hallTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  hallCountBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radius.pill,
  },
  toolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  searchBox: {
    flex: 1,
  },
  toolbarRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  zoomToggleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.medium,
    borderWidth: 1,
    overflow: 'hidden',
  },
  zoomBtn: {
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  modeToggleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.medium,
    borderWidth: 1,
    padding: 2,
  },
  searchResultStrip: {
    paddingHorizontal: 4,
  },
  legendBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.medium,
    borderWidth: 1,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Map Canvas
  mapCanvasScroll: {
    paddingVertical: Spacing.xs,
  },
  floorMapCanvas: {
    borderRadius: Radius.large,
    borderWidth: 1.5,
    padding: Spacing.md,
    minWidth: 440,
    gap: Spacing.md,
  },
  canvasHallHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: Spacing.sm,
  },
  canvasEntranceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  structuredGridContainer: {
    gap: Spacing.lg,
  },
  aisleBlock: {
    gap: Spacing.xs,
  },
  aisleSignpost: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderBottomWidth: 1,
    paddingBottom: 4,
  },
  boothsRowInAisle: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingTop: 6,
  },
  boothBox: {
    width: 125,
    height: 105,
    borderRadius: Radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    position: 'relative',
  },
  boothBeaconsRow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hostStarBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hostStarText: {
    color: '#FFFFFF',
    fontSize: 10,
  },
  userLocationPinBadge: {
    position: 'absolute',
    right: 0,
  },
  boothCodeText: {
    fontSize: 13,
  },
  boothCompanyName: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  leadsCountPill: {
    position: 'absolute',
    bottom: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },

  // Aisle Directory Mode
  aislesListContainer: {
    gap: Spacing.md,
  },
  aisleDirectoryCard: {
    borderRadius: Radius.large,
  },
  aisleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aisleHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  aisleBoothsList: {
    gap: Spacing.xs,
  },
  aisleBoothListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: Radius.medium,
    borderWidth: 1,
  },
  boothListInfoCol: {
    flex: 1,
    gap: 2,
  },
  boothListRightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  // Bottom Sheet Details
  sheetContent: {
    gap: Spacing.md,
    paddingTop: Spacing.xs,
  },
  sheetCompanyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  sheetCompanyLogo: {
    width: 48,
    height: 48,
    borderRadius: Radius.small,
  },
  sheetLogoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: Radius.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetCompanyInfoCol: {
    flex: 1,
    gap: 2,
  },
  sheetBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  sheetDescText: {
    lineHeight: 18,
  },
  sheetLeadStatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: Radius.medium,
    borderWidth: 1,
  },
  leadStatLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  sheetActionsList: {
    gap: Spacing.sm,
    paddingTop: 4,
  },
});
