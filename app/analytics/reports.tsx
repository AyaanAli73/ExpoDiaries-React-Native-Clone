import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppHeader } from '@/components/layout/app-header';
import { ResponsiveGrid } from '@/components/layout/responsive-grid';
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
import { useStaffPerformance } from '@/hooks/use-analytics';
import { useAppStore } from '@/stores/use-app-store';
import { Colors, Spacing } from '@/theme';

export default function AnalyticsReportsScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const activeEventId = useAppStore((state) => state.activeEventId);
  const { data: staffPerformance = [] } = useStaffPerformance(activeEventId);

  const totalCaptured = staffPerformance.reduce((sum, s) => sum + s.leadsCaptured, 0);
  const totalQualified = staffPerformance.reduce((sum, s) => sum + s.qualifiedCount, 0);
  const avgConversion =
    totalCaptured > 0 ? Number(((totalQualified / totalCaptured) * 100).toFixed(1)) : 0;

  return (
    <ScreenContainer
      header={
        <AppHeader
          title="Staff Performance Reports"
          subtitle="Booth staff throughput, qualification rates, and velocity"
          action={
            <Button
              label="Back"
              variant="outline"
              size="sm"
              leftIcon="ChevronLeft"
              onPress={() => router.back()}
            />
          }
        />
      }>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        {/* 1. Executive Team Summary */}
        <Animated.View entering={FadeInDown.duration(260)}>
          <ResponsiveGrid gap={10} columns={3}>
            <Card density="compact">
              <CardContent style={styles.kpiBox}>
                <AppText variant="caption" color="secondary">
                  Team Captured
                </AppText>
                <AppText variant="title" weight="bold" tabular>
                  {totalCaptured}
                </AppText>
                <Badge label="ROSTER TOTAL" variant="primary" size="sm" />
              </CardContent>
            </Card>

            <Card density="compact">
              <CardContent style={styles.kpiBox}>
                <AppText variant="caption" color="secondary">
                  Avg. Conversion
                </AppText>
                <AppText variant="title" weight="bold" color="success" tabular>
                  {avgConversion}%
                </AppText>
                <AppText variant="caption" color="muted">
                  {totalQualified} qualified
                </AppText>
              </CardContent>
            </Card>

            <Card density="compact">
              <CardContent style={styles.kpiBox}>
                <AppText variant="caption" color="secondary">
                  Top Performer
                </AppText>
                <AppText variant="body" weight="bold" numberOfLines={1}>
                  {staffPerformance[0]?.staffName || 'Alex Mercer'}
                </AppText>
                <Badge label="#1 RANK" variant="success" size="sm" showDot />
              </CardContent>
            </Card>
          </ResponsiveGrid>
        </Animated.View>

        {/* 2. Detailed Staff Performance Cards */}
        <View style={styles.sectionHeader}>
          <Icon name="Award" size={16} color={theme.primary} />
          <CardTitle level={2}>Field Representative Leaderboard</CardTitle>
        </View>

        <View style={styles.list}>
          {staffPerformance.map((member, index) => {
            const conversionRate =
              member.conversionRate ||
              (member.leadsCaptured > 0
                ? Number(((member.qualifiedCount / member.leadsCaptured) * 100).toFixed(1))
                : 0);

            return (
              <Animated.View
                key={member.staffId}
                entering={FadeInDown.duration(260).delay(index * 60)}>
                <Card density="comfortable" style={styles.memberCard}>
                  <CardHeader>
                    <View style={styles.cardHeaderRow}>
                      <View style={styles.leftInfoRow}>
                        <Badge
                          label={`RANK #${index + 1}`}
                          variant={index === 0 ? 'primary' : 'outline'}
                          size="sm"
                        />
                        <Avatar name={member.staffName} size="md" />
                        <View style={{ gap: 2 }}>
                          <CardTitle level={3}>{member.staffName}</CardTitle>
                          <AppText variant="caption" color="secondary">
                            Avg. Score: {member.averageScore}/100 • {member.hourlyVelocity || 8.5}/hr velocity
                          </AppText>
                        </View>
                      </View>
                      <Badge
                        label={`${conversionRate}% CONV.`}
                        variant={conversionRate >= 50 ? 'success' : 'outline'}
                        size="md"
                      />
                    </View>
                  </CardHeader>

                  <CardContent style={styles.cardContent}>
                    {/* Performance Progress Bar */}
                    <View style={styles.progressSection}>
                      <View style={styles.progressLabels}>
                        <AppText variant="caption" color="secondary">
                          Qualification Funnel ({member.qualifiedCount} of {member.leadsCaptured} leads)
                        </AppText>
                        <AppText variant="caption" weight="bold" tabular>
                          {conversionRate}%
                        </AppText>
                      </View>
                      <View style={styles.barTrack}>
                        <View
                          style={[
                            styles.barFill,
                            {
                              width: `${Math.min(100, conversionRate)}%`,
                              backgroundColor: theme.primary,
                            },
                          ]}
                        />
                      </View>
                    </View>

                    <Divider />

                    <View style={styles.footerRow}>
                      <View style={styles.metricItem}>
                        <AppText variant="caption" color="muted">
                          Total Captured
                        </AppText>
                        <AppText variant="body" weight="bold" tabular>
                          {member.leadsCaptured} leads
                        </AppText>
                      </View>
                      <View style={styles.metricItem}>
                        <AppText variant="caption" color="muted">
                          Qualified Prospects
                        </AppText>
                        <AppText variant="body" weight="bold" color="primary" tabular>
                          {member.qualifiedCount} accounts
                        </AppText>
                      </View>
                      <View style={styles.metricItem}>
                        <AppText variant="caption" color="muted">
                          Lead Quality Index
                        </AppText>
                        <AppText variant="body" weight="bold" color="success" tabular>
                          {member.averageScore} pts
                        </AppText>
                      </View>
                    </View>
                  </CardContent>
                </Card>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  kpiBox: {
    gap: 4,
    alignItems: 'flex-start',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  list: {
    gap: Spacing.sm,
  },
  memberCard: {
    borderWidth: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  cardContent: {
    gap: Spacing.sm,
  },
  progressSection: {
    gap: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricItem: {
    gap: 2,
    alignItems: 'flex-start',
  },
});
