import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import {
  AppText,
  Badge,
  Button,
  Card,
  CardContent,
  Heading,
  Icon,
  type IconName,
  Screen,
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/stores/use-auth-store';
import { Colors, Radius, Spacing } from '@/theme';

interface FeatureCardProps {
  icon: IconName;
  title: string;
  description: string;
}

function FeatureItem({ icon, title, description }: FeatureCardProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  return (
    <Card style={styles.featureCard}>
      <CardContent style={styles.featureContent}>
        <View style={[styles.featureIconBox, { backgroundColor: theme.primarySubtle }]}>
          <Icon name={icon} size={20} color={theme.primary} />
        </View>
        <View style={styles.featureTextCol}>
          <AppText weight="bold" variant="body">
            {title}
          </AppText>
          <AppText variant="caption" color="secondary" style={styles.featureDesc}>
            {description}
          </AppText>
        </View>
      </CardContent>
    </Card>
  );
}

export default function WelcomeScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const { login, isAuthenticated } = useAuthStore();

  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  const handleQuickDemo = async () => {
    await login({ email: 'alex@acme.io', password: 'password123' });
    router.replace('/(tabs)');
  };

  return (
    <Screen
      scrollable
      statusBarStyle={scheme === 'dark' ? 'light' : 'dark'}
      contentContainerStyle={styles.container}>
      <View style={styles.contentWrapper}>
        {/* Brand Header */}
        <Animated.View
          entering={FadeInDown.duration(280).springify().damping(18)}
          style={styles.header}>
          <View style={[styles.brandIcon, { backgroundColor: theme.primarySubtle, borderColor: theme.border }]}>
            <Icon name="Layers" size={32} color={theme.primary} />
          </View>
          <Badge label="EXPODIARIES PLATFORM" variant="primary" showDot />
          <Heading level={1} style={styles.heroTitle}>
            Field Operations & Event Intelligence
          </Heading>
          <AppText color="secondary" variant="body" style={styles.heroSubtitle}>
            Equip your exhibition booth team with rapid badge scanning, offline capture, and automated prospect qualification.
          </AppText>
        </Animated.View>

        {/* Feature Highlights */}
        <Animated.View
          entering={FadeInDown.duration(300).delay(60).springify().damping(18)}
          style={styles.featuresList}>
          <FeatureItem
            icon="QrCode"
            title="Instant Badge & Card Capture"
            description="High-resolution QR barcode scanner and business card OCR with automatic field parsing."
          />
          <FeatureItem
            icon="Zap"
            title="Offline-First Field Sync"
            description="Capture leads seamlessly in convention centers with zero Wi-Fi. Syncs automatically when online."
          />
          <FeatureItem
            icon="Target"
            title="Automated Lead Qualification"
            description="Score prospects based on decision-making authority and trigger automated follow-up workflows."
          />
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View
          entering={FadeInDown.duration(320).delay(110).springify().damping(18)}
          style={styles.actionsContainer}>
          <Button
            label="Sign In to Account"
            variant="primary"
            size="lg"
            rightIcon="ArrowRight"
            onPress={() => router.push('/(auth)/login')}
          />

          <Button
            label="Create Organization Account"
            variant="outline"
            size="lg"
            leftIcon="UserPlus"
            onPress={() => router.push('/(auth)/register')}
          />

          <View style={[styles.demoRow, { borderColor: theme.border, backgroundColor: theme.surface }]}>
            <View style={{ flex: 1 }}>
              <AppText weight="semibold" variant="caption">
                Evaluator 1-Tap Access
              </AppText>
              <AppText variant="caption" color="secondary">
                Explore as Alex Mercer (Admin)
              </AppText>
            </View>
            <Button
              label="Instant Demo"
              variant="subtle"
              size="sm"
              leftIcon="Sparkles"
              onPress={handleQuickDemo}
            />
          </View>
        </Animated.View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 480,
    gap: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  brandIcon: {
    width: 64,
    height: 64,
    borderRadius: Radius.large,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  heroTitle: {
    textAlign: 'center',
    letterSpacing: -0.6,
  },
  heroSubtitle: {
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 400,
  },
  featuresList: {
    gap: Spacing.sm,
  },
  featureCard: {
    width: '100%',
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  featureIconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTextCol: {
    flex: 1,
    gap: 2,
  },
  featureDesc: {
    lineHeight: 16,
  },
  actionsContainer: {
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  demoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.sm + 2,
    borderRadius: Radius.medium,
    borderWidth: 1,
    marginTop: Spacing.xs,
  },
});
