import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { AppHeader } from '@/components/layout/app-header';
import { ScreenContainer } from '@/components/layout/screen-container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heading, Text } from '@/components/ui/typography';
import { leadsService } from '@/services/leads.service';
import { useAppStore } from '@/stores/use-app-store';

export default function ExportLeadsScreen() {
  const activeEventId = useAppStore((state) => state.activeEventId);
  const [exportedCsv, setExportedCsv] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const csv = await leadsService.exportLeadsCsv(activeEventId);
      setExportedCsv(csv);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer
      header={
        <AppHeader
          title="Export CSV"
          subtitle="Download or synchronize CRM-ready lead dataset"
          action={
            <Button
              label="Done"
              variant="ghost"
              size="sm"
              onPress={() => router.back()}
            />
          }
        />
      }>
      <Card>
        <CardHeader>
          <CardTitle>Export Parameters</CardTitle>
        </CardHeader>
        <CardContent style={styles.content}>
          <Text variant="secondary">
            Generates standard CSV containing attendee contact info, booth notes, timestamps, and staff attribution.
          </Text>

          <Button
            label={loading ? 'Generating CSV…' : 'Generate Export File'}
            variant="primary"
            size="lg"
            leftIcon="Download"
            loading={loading}
            onPress={handleExport}
            style={styles.exportBtn}
          />

          {exportedCsv && (
            <View style={styles.previewBox}>
              <Badge label="CSV READY" variant="success" showDot />
              <Heading level={4}>Export Preview</Heading>
              <Text variant="code" numberOfLines={6}>
                {exportedCsv}
              </Text>
            </View>
          )}
        </CardContent>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
  },
  exportBtn: {
    marginTop: 8,
  },
  previewBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    marginTop: 12,
  },
});
