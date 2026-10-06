import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Link, router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import {
  AppText,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Chip,
  ErrorState,
  Icon,
  IconButton,
  Input,
  Screen,
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/stores/use-auth-store';
import { Colors, Radius, Spacing } from '@/theme';

interface DemoAccount {
  name: string;
  role: string;
  email: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  { name: 'Alex Mercer', role: 'Admin', email: 'alex@acme.io' },
  { name: 'Elena Rostova', role: 'Field Rep', email: 'elena@acme.io' },
  { name: 'David Chen', role: 'Booth Lead', email: 'david@acme.io' },
];

export default function LoginScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const { login, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  const [email, setEmail] = useState('alex@acme.io');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const selectDemoAccount = (account: DemoAccount) => {
    setEmail(account.email);
    setPassword('password123');
    setErrorMessage(null);
    setEmailError(null);
    setPasswordError(null);
  };

  const validate = (): boolean => {
    let isValid = true;
    setEmailError(null);
    setPasswordError(null);
    setErrorMessage(null);

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Work email is required');
      isValid = false;
    } else if (!emailPattern.test(email.trim())) {
      setEmailError('Please enter a valid work email address');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must contain at least 6 characters');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    setErrorMessage(null);
    try {
      await login({ email: email.trim(), password });
      router.replace('/(tabs)');
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || 'Unable to authenticate. Verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen
      scrollable
      statusBarStyle={scheme === 'dark' ? 'light' : 'dark'}
      contentContainerStyle={styles.screenContainer}>
      <View style={styles.contentWrapper}>
        {/* Brand Header */}
        <Animated.View
          entering={FadeInDown.duration(280).springify().damping(18)}
          style={styles.header}>
          <View style={styles.logoBadgeRow}>
            <View style={[styles.brandIconWrapper, { backgroundColor: theme.primarySubtle }]}>
              <Icon name="Layers" size={22} color={theme.primary} />
            </View>
            <Badge label="EXPODIARIES ENTERPRISE" variant="primary" showDot />
          </View>

          <CardTitle level={1} style={styles.headingTitle}>
            Sign In to Field Ops
          </CardTitle>
          <AppText color="secondary" variant="body" style={styles.headingSubtitle}>
            High-velocity event intelligence, badge scanning, and lead qualification for conference teams.
          </AppText>
        </Animated.View>

        {/* Demo Accounts Quick-Select */}
        <Animated.View
          entering={FadeInDown.duration(300).delay(50).springify().damping(18)}
          style={[styles.demoBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.demoHeaderRow}>
            <Icon name="Key" size={14} color={theme.primary} />
            <AppText variant="caption" weight="semibold" color="secondary" style={styles.demoTitle}>
              DEMO WORKSPACE ACCOUNTS (1-TAP FILL)
            </AppText>
          </View>
          <View style={styles.demoChipsRow}>
            {DEMO_ACCOUNTS.map((acc) => (
              <Chip
                key={acc.email}
                label={`${acc.name} (${acc.role})`}
                selected={email.toLowerCase() === acc.email.toLowerCase()}
                onPress={() => selectDemoAccount(acc)}
                size="sm"
              />
            ))}
          </View>
        </Animated.View>

        {/* Auth Error Banner */}
        {errorMessage ? (
          <ErrorState
            variant="banner"
            message={errorMessage}
            onRetry={() => handleLogin()}
            retryLabel="Retry"
          />
        ) : null}

        {/* Login Card */}
        <Animated.View entering={FadeInDown.duration(320).delay(90).springify().damping(18)}>
          <Card variant="elevated" density="comfortable" style={styles.loginCard}>
          <CardHeader>
            <CardTitle level={2}>Account Credentials</CardTitle>
            <CardDescription>Enter your registered enterprise credentials below.</CardDescription>
          </CardHeader>

          <CardContent style={styles.formContent}>
            <Input
              label="Work Email"
              placeholder="alex@acme.io…"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              spellCheck={false}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError(null);
              }}
              error={emailError ?? undefined}
              leftAccessory={<Icon name="Mail" size={16} color={theme.textMuted} />}
              required
            />

            <Input
              label="Password"
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              autoComplete="current-password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError(null);
              }}
              error={passwordError ?? undefined}
              leftAccessory={<Icon name="Lock" size={16} color={theme.textMuted} />}
              rightAccessory={
                <IconButton
                  icon={showPassword ? 'EyeOff' : 'Eye'}
                  size="sm"
                  variant="ghost"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              required
            />

            <Button
              label={loading ? 'Authenticating…' : 'Sign In'}
              variant="primary"
              size="lg"
              loading={loading}
              rightIcon={loading ? undefined : 'ArrowRight'}
              onPress={handleLogin}
              style={styles.submitBtn}
            />
          </CardContent>

          <CardFooter style={styles.cardFooter}>
            <Link href="/(auth)/forgot-password" asChild>
              <Button label="Forgot password?" variant="ghost" size="sm" />
            </Link>
            <Link href="/(auth)/register" asChild>
              <Button label="Create Account" variant="outline" size="sm" rightIcon="ChevronRight" />
            </Link>
          </CardFooter>
        </Card>
      </Animated.View>

        {/* Onboarding Quick Link */}
        <Animated.View
          entering={FadeInDown.duration(320).delay(130).springify().damping(18)}
          style={styles.onboardingLinkRow}>
          <AppText variant="caption" color="muted">
            First time setting up your exhibition booth?
          </AppText>
          <Button
            label="Run Onboarding Wizard"
            variant="ghost"
            size="sm"
            onPress={() => router.push('/onboarding')}
          />
        </Animated.View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 440,
    gap: Spacing.md,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  logoBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  brandIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: Radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingTitle: {
    textAlign: 'center',
    letterSpacing: -0.6,
  },
  headingSubtitle: {
    textAlign: 'center',
    maxWidth: 380,
    lineHeight: 19,
  },
  demoBox: {
    padding: Spacing.sm + 2,
    borderRadius: Radius.medium,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  demoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  demoTitle: {
    letterSpacing: 0.5,
    fontSize: 10,
  },
  demoChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  loginCard: {
    width: '100%',
  },
  formContent: {
    gap: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  submitBtn: {
    marginTop: Spacing.xs,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  onboardingLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
});
