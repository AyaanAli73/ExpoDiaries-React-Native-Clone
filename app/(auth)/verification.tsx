import React, { useEffect, useState } from 'react';
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
  Input,
  Screen,
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/stores/use-auth-store';
import { Colors, Radius, Spacing } from '@/theme';

export default function VerificationScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const {
    verificationPendingEmail,
    verifyOtp,
    isLoading,
    error: storeError,
  } = useAuthStore();

  const targetEmail = verificationPendingEmail || 'alex@acme.io';

  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(45);
  const [resending, setResending] = useState(false);
  const [resendNotice, setResendNotice] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  const handleFillDemoCode = () => {
    setCode('123456');
    setLocalError(null);
  };

  const handleVerify = async (codeToVerify = code) => {
    setLocalError(null);
    if (!codeToVerify.trim()) {
      setLocalError('Please enter the 6-digit verification code');
      return;
    }
    if (codeToVerify.trim().length !== 6) {
      setLocalError('Verification code must be exactly 6 digits');
      return;
    }

    const ok = await verifyOtp(codeToVerify.trim());
    if (ok) {
      setSuccess(true);
      setTimeout(() => {
        router.replace('/onboarding');
      }, 1000);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResendNotice(null);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setResending(false);
    setCountdown(45);
    setResendNotice(`A fresh 6-digit code was dispatched to ${targetEmail}`);
  };

  return (
    <Screen
      scrollable
      statusBarStyle={scheme === 'dark' ? 'light' : 'dark'}
      contentContainerStyle={styles.screenContainer}>
      <View style={styles.contentWrapper}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.brandIconWrapper, { backgroundColor: theme.primarySubtle }]}>
            <Icon name="ShieldCheck" size={24} color={theme.primary} />
          </View>
          <Badge label="TWO-STEP VERIFICATION" variant="primary" showDot />
          <CardTitle level={1} style={styles.headingTitle}>
            Verify Your Email
          </CardTitle>
          <AppText color="secondary" variant="body" style={styles.headingSubtitle}>
            We have dispatched a 6-digit confirmation code to verify your enterprise access.
          </AppText>
        </View>

        {/* Target Email Box */}
        <View style={[styles.emailBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Icon name="Mail" size={16} color={theme.primary} />
          <AppText weight="semibold" variant="body" style={{ flex: 1 }}>
            {targetEmail}
          </AppText>
          <Link href="/(auth)/register" asChild>
            <Button label="Change" variant="ghost" size="sm" />
          </Link>
        </View>

        {/* Demo Code Quick-Fill Chip */}
        <View style={styles.demoFillRow}>
          <Chip
            label="1-Tap Demo Code: 123456"
            selected={code === '123456'}
            onPress={handleFillDemoCode}
            size="sm"
          />
        </View>

        {/* Error State */}
        {(localError || storeError) && (
          <ErrorState
            variant="banner"
            message={localError || storeError || 'Invalid code'}
            onRetry={() => handleVerify()}
            retryLabel="Retry"
          />
        )}

        {/* Resend Notice */}
        {resendNotice && (
          <View style={[styles.noticePill, { backgroundColor: theme.primarySubtle, borderColor: theme.primary }]}>
            <Icon name="CheckCircle" size={14} color={theme.primary} />
            <AppText variant="caption" style={{ color: theme.primary, flex: 1 }}>
              {resendNotice}
            </AppText>
          </View>
        )}

        {/* Success Card */}
        {success ? (
          <Card variant="elevated" style={styles.card}>
            <CardContent style={styles.successContent}>
              <View style={[styles.successIconCircle, { backgroundColor: theme.successBackground }]}>
                <Icon name="CheckCircle2" size={36} color={theme.success} />
              </View>
              <CardTitle level={2} style={{ textAlign: 'center' }}>
                Account Verified!
              </CardTitle>
              <AppText color="secondary" variant="body" style={{ textAlign: 'center' }}>
                Welcome to ExpoDiaries. Transitioning directly into your field operations command center…
              </AppText>
            </CardContent>
          </Card>
        ) : (
          <Card variant="elevated" style={styles.card}>
            <CardHeader>
              <CardTitle level={2}>Enter 6-Digit Code</CardTitle>
              <CardDescription>
                Check your work inbox or enter demo code <AppText weight="bold">123456</AppText>.
              </CardDescription>
            </CardHeader>

            <CardContent style={styles.formContent}>
              <Input
                label="Verification PIN"
                placeholder="123456"
                keyboardType="number-pad"
                maxLength={6}
                value={code}
                onChangeText={(val) => {
                  setCode(val);
                  if (val.length === 6) {
                    handleVerify(val);
                  }
                }}
                leftAccessory={<Icon name="Key" size={16} color={theme.textMuted} />}
                inputStyle={styles.pinInput}
              />

              <Button
                label={isLoading ? 'Verifying Code…' : 'Verify & Continue'}
                variant="primary"
                size="lg"
                loading={isLoading}
                rightIcon={isLoading ? undefined : 'ArrowRight'}
                onPress={() => handleVerify()}
                style={styles.submitBtn}
              />
            </CardContent>

            <CardFooter style={styles.cardFooter}>
              {countdown > 0 ? (
                <AppText variant="caption" color="muted">
                  Resend code in {countdown}s
                </AppText>
              ) : (
                <Button
                  label={resending ? 'Sending…' : 'Resend Code'}
                  variant="outline"
                  size="sm"
                  loading={resending}
                  leftIcon="RefreshCw"
                  onPress={handleResend}
                />
              )}

              <Link href="/(auth)/login" asChild>
                <Button label="Back to Sign In" variant="ghost" size="sm" />
              </Link>
            </CardFooter>
          </Card>
        )}
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
  brandIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: Radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
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
  emailBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm + 2,
    borderRadius: Radius.medium,
    borderWidth: 1,
  },
  demoFillRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  noticePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
    borderRadius: Radius.medium,
    borderWidth: 1,
  },
  card: {
    width: '100%',
  },
  formContent: {
    gap: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  pinInput: {
    letterSpacing: 4,
    fontSize: 18,
    fontWeight: '700',
  },
  submitBtn: {
    marginTop: Spacing.xs,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  successContent: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
