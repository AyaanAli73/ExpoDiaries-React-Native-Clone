import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { AppHeader } from '@/components/layout/app-header';
import { ScreenContainer } from '@/components/layout/screen-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/use-auth-store';

export default function EditProfileScreen() {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const handleSave = () => {
    if (user) {
      setUser({ ...user, name, email });
    }
    router.back();
  };

  return (
    <ScreenContainer
      header={
        <AppHeader
          title="Edit Profile"
          subtitle="Update personal info and booth badge name"
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
            label="Full Name"
            placeholder="Alex Mercer"
            value={name}
            onChangeText={setName}
          />
          <Input
            label="Email Address"
            placeholder="alex@acme.io"
            value={email}
            onChangeText={setEmail}
          />

          <Button
            label="Save Changes"
            variant="primary"
            size="lg"
            onPress={handleSave}
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
