import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { AppHeader } from '@/components/layout/app-header';
import { ScreenContainer } from '@/components/layout/screen-container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heading, Text } from '@/components/ui/typography';
import { useStaffPerformance } from '@/hooks/use-analytics';
import { useAppStore } from '@/stores/use-app-store';

export default function AnalyticsReportsScreen() {
  const activeEventId = useAppStore((state) => state.activeEventId);
  const { data: staffPerformance } = useStaffPerformance(activeEventId);

  return (
    <ScreenContainer
      header={
        <AppHeader
          title="Staff Leaderboard"
          subtitle="Booth staff capture velocity & qualification ranking"
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
      <View style={styles.section}>
        <Card>
          <CardHeader>
            <CardTitle>Individual Performance Breakdown</CardTitle>
          </CardHeader>
          <CardContent style={styles.list}>
            {staffPerformance?.map((member, index) => (
              <View key={member.staffId} style={styles.memberRow}>
                <View style={styles.leftCol}>
                  <Badge label={`#${index + 1}`} variant="primary" />
                  <View>
                    <Heading level={4}>{member.staffName}</Heading>
                    <Text variant="secondary">{member.qualifiedCount} qualified leads</Text>
                  </View>
                </View>
                <View style={styles.rightCol}>
                  <Heading level={4} tabular>{member.leadsCaptured}</Heading>
                  <Text variant="caption">Total</Text>
                </View>
              </View>
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
  list: {
    gap: 14,
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rightCol: {
    alignItems: 'flex-end',
  },
});
