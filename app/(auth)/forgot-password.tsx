import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';

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
  Icon,
  Input,
  Screen,
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Radius, Spacing } from '@/theme';

export default function ForgotPasswordScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = async () => {
    setEmailError(null);
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Work email is required');
      return;
    }
    if (!emailPattern.test(email.trim())) {
      setEmailError('Please enter a valid work email address');
      return;
    }

    setLoading(true);
    // Simulate API dispatch
    await new Promise((resolve) => setTimeout(resolve, 600));
    setLoading(false);
    setSubmitted(true);
  };

  const handleResend = async () => {
    setResending(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setResending(false);
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
              <Icon name="KeyRound" size={22} color={theme.primary} />
            </View>
            <Badge label="SECURITY RECOVERY" variant="outline" />
          </View>

          <CardTitle level={1} style={styles.headingTitle}>
            Reset Account Password
          </CardTitle>
          <AppText color="secondary" variant="body" style={styles.headingSubtitle}>
            Enter the work email associated with your ExpoDiaries workspace to receive access instructions.
          </AppText>
        </View>

        <Card variant="elevated" style={styles.card}>
          {submitted ? (
            <>
              <CardHeader>
                <View style={styles.successBadgeRow}>
                  <Badge label="INSTRUCTIONS DISPATCHED" variant="success" showDot />
                </View>
                <CardTitle level={2}>Check Your Work Email</CardTitle>
                <CardDescription>
                  We have dispatched a secure 6-digit verification code and reset link to:
                </CardDescription>
                <View style={[styles.emailPill, { backgroundColor: theme.secondary }]}>
                  <AppText weight="semibold" style={{ color: theme.primary }}>
                    {email}
                  </AppText>
                </View>
              </CardHeader>

              <CardContent style={styles.successActions}>
                <AppText variant="caption" color="secondary" style={{ textAlign: 'center' }}>
                  Didn’t receive an email? Check your spam folder or trigger a new recovery link.
                </AppText>
                <Button
                  label={resending ? 'Resending…' : 'Resend Recovery Email'}
                  variant="outline"
                  size="md"
                  loading={resending}
                  leftIcon="RefreshCw"
                  onPress={handleResend}
                />
              </CardContent>

              <CardFooter style={styles.cardFooter}>
                <Link href="/(auth)/login" asChild>
                  <Button
                    label="Back to Sign In"
                    variant="primary"
                    size="md"
                    leftIcon="ArrowLeft"
                    style={{ width: '100%' }}
                  />
                </Link>
              </CardFooter>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle level={2}>Password Recovery</CardTitle>
                <CardDescription>
                  A recovery link with a temporary access token will be delivered to your registered email.
                </CardDescription>
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

                <Button
                  label={loading ? 'Dispatching Link…' : 'Send Recovery Link'}
                  variant="primary"
                  size="lg"
                  loading={loading}
                  rightIcon={loading ? undefined : 'Send'}
                  onPress={handleSubmit}
                  style={styles.submitBtn}
                />
              </CardContent>

              <CardFooter style={styles.cardFooter}>
                <Link href="/(auth)/login" asChild>
                  <Button label="Back to Sign In" variant="ghost" size="sm" leftIcon="ArrowLeft" />
                </Link>
              </CardFooter>
            </>
          )}
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
  card: {
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  successBadgeRow: {
    marginBottom: Spacing.xs,
  },
  emailPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.small,
    marginTop: Spacing.xs,
  },
  successActions: {
    gap: Spacing.sm,
    alignItems: 'center',
  },
});
