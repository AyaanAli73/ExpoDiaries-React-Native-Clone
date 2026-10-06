import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { AppHeader } from '@/components/layout/app-header';
import { ScreenContainer } from '@/components/layout/screen-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCreateEvent } from '@/hooks/use-events';

export default function NewEventScreen() {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [boothNumber, setBoothNumber] = useState('');
  const [leadGoal, setLeadGoal] = useState('200');

  const createMutation = useCreateEvent();

  const handleCreate = async () => {
    if (!name.trim()) return;

    await createMutation.mutateAsync({
      organizationId: 'org-acme',
      name: name.trim(),
      location: location.trim() || 'Convention Center',
      boothNumber: boothNumber.trim() || 'Booth 101',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 86400000 * 3).toISOString(),
      status: 'active',
      leadGoal: parseInt(leadGoal, 10) || 100,
      activeStaffCount: 2,
    });

    router.back();
  };

  return (
    <ScreenContainer
      header={
        <AppHeader
          title="Register Expo"
          subtitle="Configure new exhibition, trade show, or booth presence"
          action={
            <Button
              label="Cancel"
              variant="ghost"
              size="sm"
              onPress={() => router.back()}
            />
          }
        />
      }>
      <Card>
        <CardContent style={styles.form}>
          <Input
            label="Event Name"
            placeholder="e.g. Dreamforce 2026…"
            value={name}
            onChangeText={setName}
          />
          <Input
            label="Location / Convention Center"
            placeholder="e.g. Moscone Center, SF"
            value={location}
            onChangeText={setLocation}
          />
          <Input
            label="Booth Number"
            placeholder="e.g. Hall B, #304"
            value={boothNumber}
            onChangeText={setBoothNumber}
          />
          <Input
            label="Target Lead Goal"
            placeholder="250"
            keyboardType="number-pad"
            value={leadGoal}
            onChangeText={setLeadGoal}
          />

          <Button
            label={createMutation.isPending ? 'Saving…' : 'Create Event'}
            variant="primary"
            size="lg"
            loading={createMutation.isPending}
            onPress={handleCreate}
            style={styles.submitBtn}
          />
        </CardContent>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 12,
    paddingVertical: 16,
  },
  submitBtn: {
    marginTop: 12,
  },
});
