import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { AppHeader } from '@/components/layout/app-header';
import { ScreenContainer } from '@/components/layout/screen-container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heading, Text } from '@/components/ui/typography';

const mockTeam = [
  { id: '1', name: 'Alex Mercer', role: 'Booth Admin', email: 'alex@acme.io' },
  { id: '2', name: 'Elena Rostova', role: 'Field Specialist', email: 'elena@acme.io' },
  { id: '3', name: 'David Chen', role: 'Solutions Engineer', email: 'david@acme.io' },
];

export default function TeamManagementScreen() {
  return (
    <ScreenContainer
      header={
        <AppHeader
          title="Team Roster"
          subtitle="Manage credentials and field scanner permissions"
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
      <Card>
        <CardHeader>
          <CardTitle>Active Booth Staff ({mockTeam.length})</CardTitle>
        </CardHeader>
        <CardContent style={styles.list}>
          {mockTeam.map((member) => (
            <View key={member.id} style={styles.memberRow}>
              <View>
                <Heading level={4}>{member.name}</Heading>
                <Text variant="secondary">{member.email}</Text>
              </View>
              <Badge label={member.role.toUpperCase()} variant="primary" />
            </View>
          ))}
        </CardContent>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
});
