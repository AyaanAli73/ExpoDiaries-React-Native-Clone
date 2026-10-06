import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/layout/app-header';
import { ResponsiveGrid } from '@/components/layout/responsive-grid';
import { ScreenContainer } from '@/components/layout/screen-container';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heading, MetricDisplay, Text } from '@/components/ui/typography';
import { useEventAnalytics } from '@/hooks/use-analytics';
import { useAppStore } from '@/stores/use-app-store';

export default function AnalyticsScreen() {
  const activeEventId = useAppStore((state) => state.activeEventId);
  const { data: analytics } = useEventAnalytics(activeEventId);

  return (
    <ScreenContainer
      header={
        <AppHeader
          title="Booth Telemetry"
          subtitle="Real-time capture velocity, conversion rates, and quota attainment"
        />
      }>
      {/* Metric Cards Row */}
      <View style={styles.section}>
        <ResponsiveGrid gap={12} columns={3}>
          <Card>
            <CardContent>
              <MetricDisplay
                label="Conversion"
                value={`${analytics?.qualifiedLeads ?? 86}`}
                delta="52.4%"
                deltaPositive
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <MetricDisplay
                label="Velocity"
                value={`${analytics?.hourlyCaptureVelocity ?? 14.2}/hr`}
                delta="Peak Hour"
                deltaPositive
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <MetricDisplay
                label="Goal Progress"
                value={`${analytics?.goalProgressPercent ?? 65.6}%`}
              />
            </CardContent>
          </Card>
        </ResponsiveGrid>
      </View>

      {/* Capture Channel Breakdown */}
      <View style={styles.section}>
        <Card>
          <CardHeader>
            <CardTitle>Ingestion Channels</CardTitle>
          </CardHeader>
          <CardContent style={styles.channelGrid}>
            <View style={styles.channelItem}>
              <Text variant="caption">Badge QR Scanner</Text>
              <Heading level={4} tabular>98 leads</Heading>
              <Badge label="59.7%" variant="primary" />
            </View>
            <View style={styles.channelItem}>
              <Text variant="caption">Business Card OCR</Text>
              <Heading level={4} tabular>42 leads</Heading>
              <Badge label="25.6%" variant="default" />
            </View>
            <View style={styles.channelItem}>
              <Text variant="caption">Manual Rapid Form</Text>
              <Heading level={4} tabular>24 leads</Heading>
              <Badge label="14.7%" variant="default" />
            </View>
          </CardContent>
        </Card>
      </View>

      {/* Top Segment Tags */}
      <View style={styles.section}>
        <Card>
          <CardHeader>
            <CardTitle>Top Attendee Interests</CardTitle>
          </CardHeader>
          <CardContent style={styles.tagGrid}>
            {analytics?.topTags.map((t) => (
              <Badge key={t.tag} label={`${t.tag} (${t.count})`} variant="outline" />
            ))}
          </CardContent>
        </Card>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
  },
  channelGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  channelItem: {
    alignItems: 'flex-start',
    gap: 4,
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
