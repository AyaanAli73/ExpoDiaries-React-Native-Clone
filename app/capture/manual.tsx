import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { AppHeader } from '@/components/layout/app-header';
import { ScreenContainer } from '@/components/layout/screen-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCaptureLead } from '@/hooks/use-leads';
import { useAppStore } from '@/stores/use-app-store';

export default function ManualCaptureScreen() {
  const activeEventId = useAppStore((state) => state.activeEventId);
  const captureMutation = useCaptureLead();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    if (!firstName.trim() || !lastName.trim()) return;

    await captureMutation.mutateAsync({
      eventId: activeEventId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      company: company.trim(),
      title: title.trim(),
      email: email.trim(),
      phone: phone.trim(),
      notes: notes.trim(),
      status: 'new',
      score: 60,
      tags: ['Manual Entry'],
      captureSource: 'manual',
      capturedByStaffId: 'usr-1',
    });

    router.replace('/(tabs)/leads');
  };

  return (
    <ScreenContainer
      header={
        <AppHeader
          title="Manual Lead Entry"
          subtitle="Direct contact ingestion form"
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
            label="First Name *"
            placeholder="Jane"
            value={firstName}
            onChangeText={setFirstName}
          />
          <Input
            label="Last Name *"
            placeholder="Doe"
            value={lastName}
            onChangeText={setLastName}
          />
          <Input
            label="Company"
            placeholder="Enterprise Inc."
            value={company}
            onChangeText={setCompany}
          />
          <Input
            label="Job Title"
            placeholder="Senior Architect"
            value={title}
            onChangeText={setTitle}
          />
          <Input
            label="Work Email"
            placeholder="jane@enterprise.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <Input
            label="Phone"
            placeholder="+1 (555) 000-0000"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <Input
            label="Booth Notes"
            placeholder="Product interests, follow-up timeline…"
            multiline
            numberOfLines={3}
            value={notes}
            onChangeText={setNotes}
          />

          <Button
            label={captureMutation.isPending ? 'Saving…' : 'Record Lead'}
            variant="primary"
            size="lg"
            loading={captureMutation.isPending}
            onPress={handleSubmit}
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
