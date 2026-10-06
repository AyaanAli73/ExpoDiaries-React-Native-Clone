import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Link, router } from 'expo-router';

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

const ROLE_OPTIONS = [
  'Booth Lead',
  'Field Sales Rep',
  'Solution Architect',
  'Event Director',
];

export default function RegisterScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const register = useAuthStore((state) => state.register);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState(ROLE_OPTIONS[0]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Field errors
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [orgError, setOrgError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const validate = (): boolean => {
    let isValid = true;
    setNameError(null);
    setEmailError(null);
    setOrgError(null);
    setPasswordError(null);
    setErrorMessage(null);

    if (!name.trim()) {
      setNameError('Full name is required');
      isValid = false;
    } else if (name.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
      isValid = false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Work email is required');
      isValid = false;
    } else if (!emailPattern.test(email.trim())) {
      setEmailError('Enter a valid work email address');
      isValid = false;
    }

    if (!organizationName.trim()) {
      setOrgError('Organization / Company name is required');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must contain at least 8 characters');
      isValid = false;
    }

    return isValid;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    setErrorMessage(null);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        organizationName: organizationName.trim(),
        password,
      });
      // Navigate to verification code confirmation
      router.push('/(auth)/verification');
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || 'Registration failed. Please try again.');
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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoBadgeRow}>
            <View style={[styles.brandIconWrapper, { backgroundColor: theme.primarySubtle }]}>
              <Icon name="UserPlus" size={22} color={theme.primary} />
            </View>
            <Badge label="WORKSPACE SETUP" variant="primary" showDot />
          </View>

          <CardTitle level={1} style={styles.headingTitle}>
            Create Organization Account
          </CardTitle>
          <AppText color="secondary" variant="body" style={styles.headingSubtitle}>
            Provision your event lead workspace, connect booth staff, and unlock badge capture.
          </AppText>
        </View>

        {/* Global Error Banner */}
        {errorMessage ? (
          <ErrorState
            variant="banner"
            message={errorMessage}
            onRetry={() => handleRegister()}
            retryLabel="Retry"
          />
        ) : null}

        {/* Register Card */}
        <Card variant="elevated" style={styles.registerCard}>
          <CardHeader>
            <CardTitle level={2}>Account & Organization Details</CardTitle>
            <CardDescription>All fields are required for enterprise workspace access.</CardDescription>
          </CardHeader>

          <CardContent style={styles.formContent}>
            <Input
              label="Full Name"
              placeholder="e.g. Alex Mercer"
              autoComplete="name"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (nameError) setNameError(null);
              }}
              error={nameError ?? undefined}
              leftAccessory={<Icon name="User" size={16} color={theme.textMuted} />}
              required
            />

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
              label="Organization / Company"
              placeholder="e.g. Acme Systems Inc."
              autoComplete="organization"
              value={organizationName}
              onChangeText={(text) => {
                setOrganizationName(text);
                if (orgError) setOrgError(null);
              }}
              error={orgError ?? undefined}
              leftAccessory={<Icon name="Building" size={16} color={theme.textMuted} />}
              required
            />

            {/* Role Selector */}
            <View style={styles.roleSection}>
              <AppText variant="caption" weight="semibold" color="secondary" style={styles.roleLabel}>
                YOUR BOOTH ROLE
              </AppText>
              <View style={styles.roleChipsRow}>
                {ROLE_OPTIONS.map((role) => (
                  <Chip
                    key={role}
                    label={role}
                    selected={selectedRole === role}
                    onPress={() => setSelectedRole(role)}
                    size="sm"
                  />
                ))}
              </View>
            </View>

            <Input
              label="Password"
              placeholder="At least 8 characters…"
              secureTextEntry={!showPassword}
              autoComplete="new-password"
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
              label={loading ? 'Creating Account…' : 'Create Organization Account'}
              variant="primary"
              size="lg"
              loading={loading}
              rightIcon={loading ? undefined : 'ArrowRight'}
              onPress={handleRegister}
              style={styles.submitBtn}
            />
          </CardContent>

          <CardFooter style={styles.cardFooter}>
            <AppText variant="caption" color="secondary">
              Already have an organization workspace?
            </AppText>
            <Link href="/(auth)/login" asChild>
              <Button label="Sign In" variant="ghost" size="sm" />
            </Link>
          </CardFooter>
        </Card>
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
  registerCard: {
    width: '100%',
  },
  formContent: {
    gap: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  roleSection: {
    marginVertical: Spacing.xs,
    gap: Spacing.xs,
  },
  roleLabel: {
    letterSpacing: 0.5,
    fontSize: 11,
  },
  roleChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  submitBtn: {
    marginTop: Spacing.xs,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
  },
});
