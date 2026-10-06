import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { AppHeader } from '@/components/layout/app-header';
import { ScreenContainer } from '@/components/layout/screen-container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heading, Text } from '@/components/ui/typography';

export default function SecurityScreen() {
  return (
    <ScreenContainer
      header={
        <AppHeader
          title="Security & Sync"
          subtitle="Offline buffer, encryption, and telemetry status"
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
            <CardTitle>Offline Capture Vault</CardTitle>
          </CardHeader>
          <CardContent style={styles.content}>
            <View style={styles.row}>
              <View>
                <Heading level={4}>Pending Sync Queue</Heading>
                <Text variant="secondary">All captured leads synced to cloud</Text>
              </View>
              <Badge label="0 QUEUED" variant="success" showDot />
            </View>

            <View style={styles.row}>
              <View>
                <Heading level={4}>Local Data Encryption</Heading>
                <Text variant="secondary">AES-256 local lead payload encryption</Text>
              </View>
              <Badge label="ENABLED" variant="primary" />
            </View>

            <View style={styles.row}>
              <View>
                <Heading level={4}>Biometric Verification</Heading>
                <Text variant="secondary">Require biometric unlock for export</Text>
              </View>
              <Badge label="ACTIVE" variant="primary" />
            </View>
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
  content: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
