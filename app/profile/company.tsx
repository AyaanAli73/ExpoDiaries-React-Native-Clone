import React, { useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppHeader } from '@/components/layout/app-header';
import { ScreenContainer } from '@/components/layout/screen-container';
import {
  AppText,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Divider,
  Icon,
  IconButton,
  Input,
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppStore } from '@/stores/use-app-store';
import { Colors, Radius, Shadows, Spacing } from '@/theme';

export default function CompanyScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const { activeWorkspace } = useAppStore();

  const [companyName, setCompanyName] = useState('Acme Corporation');
  const [industry, setIndustry] = useState('Enterprise Event Intelligence & AI Hardware');
  const [booth, setBooth] = useState('North Hall #N-408 / Booth #4209');
  const [website, setWebsite] = useState('https://acme.io');
  const [description] = useState(
    'Acme Corporation builds next-generation edge badge scanners, real-time attendee telemetry, and automated lead capture workflows for global tier-1 expos and conferences.'
  );

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(companyName);
  const [editIndustry, setEditIndustry] = useState(industry);
  const [editBooth, setEditBooth] = useState(booth);
  const [editWebsite, setEditWebsite] = useState(website);

  const handleSaveCompany = () => {
    setCompanyName(editName.trim() || 'Acme Corporation');
    setIndustry(editIndustry.trim() || 'Enterprise Event Intelligence');
    setBooth(editBooth.trim() || 'Booth #4209');
    setWebsite(editWebsite.trim() || 'https://acme.io');
    setIsEditModalVisible(false);
    Alert.alert('Company Updated', 'Company credentials updated across all attendee passes.');
  };

  const handleShareCompany = () => {
    Alert.alert(
      'Share Exhibitor Profile',
      `Exhibitor: ${companyName}\nBooth: ${booth}\nWebsite: ${website}\n\nReady to share badge pass via native share sheet.`
    );
  };

  return (
    <ScreenContainer
      header={
        <AppHeader
          title="Company"
          subtitle="Organization profile, trade-show booth, and exhibitor details"
          action={
            <Button
              label="Back"
              variant="outline"
              size="sm"
              leftIcon="ChevronLeft"
              onPress={() => router.back()}
              aria-label="Back to main profile hub"
            />
          }
        />
      }>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* 1. Company Brand Hero Card */}
        <Animated.View entering={FadeInDown.duration(260)} style={styles.section}>
          <Card density="comfortable">
            <CardContent style={styles.heroContent}>
              <View style={styles.brandTopRow}>
                <View
                  style={[
                    styles.logoBox,
                    { backgroundColor: theme.primarySubtle, borderColor: theme.border },
                  ]}>
                  <Icon name="Building" size={28} color={theme.primary} />
                </View>
                <View style={styles.brandInfoCol}>
                  <View style={styles.companyTitleRow}>
                    <CardTitle level={2}>{companyName}</CardTitle>
                    <Badge label="VERIFIED EXHIBITOR" variant="success" size="sm" showDot />
                  </View>
                  <AppText variant="caption" color="secondary">
                    {industry}
                  </AppText>
                  <AppText variant="caption" weight="bold" color="primary">
                    📍 {booth}
                  </AppText>
                </View>
              </View>

              <AppText variant="caption" color="secondary" style={styles.descriptionText}>
                {description}
              </AppText>

              <Divider />

              {/* Action Buttons */}
              <View style={styles.heroActionsRow}>
                <Button
                  label="Edit Details"
                  variant="outline"
                  size="sm"
                  leftIcon="Edit3"
                  onPress={() => {
                    setEditName(companyName);
                    setEditIndustry(industry);
                    setEditBooth(booth);
                    setEditWebsite(website);
                    setIsEditModalVisible(true);
                  }}
                  aria-label="Edit company details"
                />
                <Button
                  label="Team Roster"
                  variant="outline"
                  size="sm"
                  leftIcon="Users"
                  onPress={() => router.push('/profile/team')}
                  aria-label="View booth staff roster"
                />
                <Button
                  label="Share Card"
                  variant="primary"
                  size="sm"
                  leftIcon="Share2"
                  onPress={handleShareCompany}
                  aria-label="Share company exhibitor card"
                />
              </View>
            </CardContent>
          </Card>
        </Animated.View>

        {/* 2. Workspace & Subscription Credentials */}
        <Animated.View entering={FadeInDown.duration(260).delay(60)} style={styles.section}>
          <Card density="comfortable">
            <CardHeader>
              <View style={styles.headerRow}>
                <Icon name="Shield" size={18} color={theme.primary} />
                <CardTitle level={2}>Exhibitor Credentials & Plan</CardTitle>
              </View>
            </CardHeader>
            <CardContent style={styles.cardInner}>
              <View style={styles.infoRow}>
                <AppText variant="caption" color="secondary">
                  Organization ID
                </AppText>
                <AppText variant="caption" weight="semibold" tabular>
                  org-acme-ces2026
                </AppText>
              </View>
              <Divider />
              <View style={styles.infoRow}>
                <AppText variant="caption" color="secondary">
                  Subscription Tier
                </AppText>
                <Badge label={activeWorkspace.plan.toUpperCase()} variant="primary" size="sm" />
              </View>
              <Divider />
              <View style={styles.infoRow}>
                <AppText variant="caption" color="secondary">
                  Staff Seats Allocated
                </AppText>
                <AppText variant="caption" weight="bold" tabular>
                  18 Active Seats • Unlimited Badges
                </AppText>
              </View>
              <Divider />
              <View style={styles.infoRow}>
                <AppText variant="caption" color="secondary">
                  Active Event
                </AppText>
                <AppText variant="body" weight="semibold">
                  CES 2026 Las Vegas International
                </AppText>
              </View>
            </CardContent>
          </Card>
        </Animated.View>

        {/* 3. Online Presence & Channels */}
        <Animated.View entering={FadeInDown.duration(260).delay(120)} style={styles.section}>
          <Card density="comfortable">
            <CardHeader>
              <View style={styles.headerRow}>
                <Icon name="Globe" size={18} color={theme.primary} />
                <CardTitle level={2}>Online Presence</CardTitle>
              </View>
            </CardHeader>
            <CardContent style={styles.cardInner}>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel={`Open company website ${website}`}
                onPress={() => Linking.openURL(website)}
                style={styles.channelRow}>
                <View style={styles.channelLeft}>
                  <Icon name="Globe" size={16} color={theme.primary} />
                  <AppText variant="caption" color="secondary">
                    Official Website
                  </AppText>
                </View>
                <AppText variant="body" weight="semibold" color="primary">
                  {website}
                </AppText>
              </Pressable>

              <Divider />

              <Pressable
                accessibilityRole="link"
                accessibilityLabel="Open company LinkedIn"
                onPress={() => Linking.openURL('https://linkedin.com/company/acme-corp')}
                style={styles.channelRow}>
                <View style={styles.channelLeft}>
                  <Icon name="Briefcase" size={16} color={theme.primary} />
                  <AppText variant="caption" color="secondary">
                    LinkedIn
                  </AppText>
                </View>
                <AppText variant="caption" color="primary">
                  linkedin.com/company/acme-corp
                </AppText>
              </Pressable>

              <Divider />

              <Pressable
                accessibilityRole="link"
                accessibilityLabel="Open company X / Twitter"
                onPress={() => Linking.openURL('https://x.com/acmecorp')}
                style={styles.channelRow}>
                <View style={styles.channelLeft}>
                  <Icon name="AtSign" size={16} color={theme.primary} />
                  <AppText variant="caption" color="secondary">
                    X / Twitter
                  </AppText>
                </View>
                <AppText variant="caption" color="primary">
                  @acmecorp
                </AppText>
              </Pressable>
            </CardContent>
          </Card>
        </Animated.View>
      </ScrollView>

      {/* Edit Company Modal */}
      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
              Shadows.modal,
            ]}>
            <View style={styles.modalHeaderRow}>
              <CardTitle level={2}>Edit Company Details</CardTitle>
              <IconButton
                icon="X"
                size="sm"
                variant="ghost"
                accessibilityLabel="Close edit dialog"
                onPress={() => setIsEditModalVisible(false)}
              />
            </View>

            <Input
              label="Company Name"
              value={editName}
              onChangeText={setEditName}
              placeholder="Acme Corporation"
            />
            <Input
              label="Industry / Sector"
              value={editIndustry}
              onChangeText={setEditIndustry}
              placeholder="Enterprise Event Intelligence"
            />
            <Input
              label="Trade Show Booth Location"
              value={editBooth}
              onChangeText={setEditBooth}
              placeholder="Booth #4209"
            />
            <Input
              label="Official Website"
              value={editWebsite}
              onChangeText={setEditWebsite}
              placeholder="https://acme.io"
              autoCapitalize="none"
              keyboardType="url"
            />

            <View style={styles.modalActions}>
              <Button
                label="Cancel"
                variant="outline"
                size="md"
                onPress={() => setIsEditModalVisible(false)}
              />
              <Button
                label="Save Changes"
                variant="primary"
                size="md"
                onPress={handleSaveCompany}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  heroContent: {
    gap: Spacing.md,
  },
  brandTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  logoBox: {
    width: 56,
    height: 56,
    borderRadius: Radius.medium,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandInfoCol: {
    flex: 1,
    gap: 3,
  },
  companyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  descriptionText: {
    lineHeight: 18,
  },
  heroActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  cardInner: {
    gap: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  channelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  channelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    padding: Spacing.md,
    borderRadius: Radius.large,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
});
