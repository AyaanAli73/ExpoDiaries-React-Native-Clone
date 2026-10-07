import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppHeader } from '@/components/layout/app-header';
import { ScreenContainer } from '@/components/layout/screen-container';
import {
  Avatar,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Icon,
  Input,
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/stores/use-auth-store';
import { Colors, Spacing } from '@/theme';

export default function EditProfileScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const { user, updateUser } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [title, setTitle] = useState(user?.title || '');
  const [company, setCompany] = useState(user?.company || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [linkedin, setLinkedin] = useState(user?.socialLinks?.linkedin || '');
  const [twitter, setTwitter] = useState(user?.socialLinks?.twitter || '');
  const [github, setGithub] = useState(user?.socialLinks?.github || '');

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Full Name is required.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Validation Error', 'Work Email is required.');
      return;
    }

    updateUser({
      name: name.trim(),
      title: title.trim(),
      company: company.trim(),
      phone: phone.trim(),
      email: email.trim(),
      website: website.trim(),
      bio: bio.trim(),
      socialLinks: {
        linkedin: linkedin.trim(),
        twitter: twitter.trim(),
        github: github.trim(),
      },
    });

    Alert.alert('Profile Saved', 'Your digital business card and profile have been updated.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <ScreenContainer
      header={
        <AppHeader
          title="Edit Profile"
          subtitle="Update personal info, company, contact channels, and socials"
          action={
            <Button
              label="Cancel"
              variant="ghost"
              size="sm"
              onPress={() => router.back()}
              aria-label="Cancel editing"
            />
          }
        />
      }>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Avatar Preview */}
        <Animated.View entering={FadeInDown.duration(260)} style={styles.section}>
          <Card density="comfortable">
            <CardContent style={styles.avatarRow}>
              <Avatar
                name={name || 'User'}
                source={user?.avatarUrl ? { uri: user.avatarUrl } : undefined}
                size="xl"
              />
              <View style={{ flex: 1, gap: 4 }}>
                <CardTitle level={3}>{name || 'Attendee Name'}</CardTitle>
                <Button
                  label="Change Photo"
                  variant="outline"
                  size="sm"
                  leftIcon="Camera"
                  onPress={() =>
                    Alert.alert(
                      'Photo Updated',
                      'Mock photo upload: High-resolution badge avatar updated.'
                    )
                  }
                  aria-label="Upload new photo"
                />
              </View>
            </CardContent>
          </Card>
        </Animated.View>

        {/* 1. Primary Information */}
        <Animated.View entering={FadeInDown.duration(260).delay(60)} style={styles.section}>
          <Card density="comfortable">
            <CardHeader>
              <View style={styles.headerRow}>
                <Icon name="User" size={18} color={theme.primary} />
                <CardTitle level={2}>Personal & Professional</CardTitle>
              </View>
            </CardHeader>
            <CardContent style={styles.cardInner}>
              <Input
                label="Full Name *"
                placeholder="Alex Mercer"
                value={name}
                onChangeText={setName}
              />
              <Input
                label="Job Title"
                placeholder="VP of Global Events & Partnerships"
                value={title}
                onChangeText={setTitle}
              />
              <Input
                label="Company / Organization"
                placeholder="Acme Corporation"
                value={company}
                onChangeText={setCompany}
              />
              <Input
                label="Professional Bio"
                placeholder="Brief summary for trade-show attendees…"
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={3}
                style={{ height: 72 }}
              />
            </CardContent>
          </Card>
        </Animated.View>

        {/* 2. Direct Contact Channels */}
        <Animated.View entering={FadeInDown.duration(260).delay(120)} style={styles.section}>
          <Card density="comfortable">
            <CardHeader>
              <View style={styles.headerRow}>
                <Icon name="Phone" size={18} color={theme.primary} />
                <CardTitle level={2}>Contact Channels</CardTitle>
              </View>
            </CardHeader>
            <CardContent style={styles.cardInner}>
              <Input
                label="Work Email *"
                placeholder="alex@acme.io"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Input
                label="Phone Number"
                placeholder="+1 (415) 555-0182"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <Input
                label="Official Website"
                placeholder="https://acme.io"
                value={website}
                onChangeText={setWebsite}
                keyboardType="url"
                autoCapitalize="none"
              />
            </CardContent>
          </Card>
        </Animated.View>

        {/* 3. Social Profiles */}
        <Animated.View entering={FadeInDown.duration(260).delay(180)} style={styles.section}>
          <Card density="comfortable">
            <CardHeader>
              <View style={styles.headerRow}>
                <Icon name="Share2" size={18} color={theme.primary} />
                <CardTitle level={2}>Social Networks</CardTitle>
              </View>
            </CardHeader>
            <CardContent style={styles.cardInner}>
              <Input
                label="LinkedIn Profile"
                placeholder="https://linkedin.com/in/alex-mercer"
                value={linkedin}
                onChangeText={setLinkedin}
                keyboardType="url"
                autoCapitalize="none"
              />
              <Input
                label="X / Twitter Handle or URL"
                placeholder="https://x.com/alexmercer"
                value={twitter}
                onChangeText={setTwitter}
                autoCapitalize="none"
              />
              <Input
                label="GitHub URL"
                placeholder="https://github.com/alexmercer"
                value={github}
                onChangeText={setGithub}
                keyboardType="url"
                autoCapitalize="none"
              />
            </CardContent>
          </Card>
        </Animated.View>

        {/* Submit Actions */}
        <View style={styles.submitSection}>
          <Button
            label="Save Profile Changes"
            variant="primary"
            size="lg"
            leftIcon="Check"
            onPress={handleSave}
            aria-label="Save changes to profile"
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xs,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  cardInner: {
    gap: Spacing.sm,
  },
  submitSection: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
});
