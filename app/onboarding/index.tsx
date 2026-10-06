import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';

import {
  AppText,
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Chip,
  Divider,
  Icon,
  Input,
  Screen,
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { profileService } from '@/services/profile.service';
import { useAppStore } from '@/stores/use-app-store';
import { useAuthStore } from '@/stores/use-auth-store';
import { Colors, Radius, Shadows, Spacing } from '@/theme';
import { UserRole } from '@/types/auth';

type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6;

interface AvatarPreset {
  id: string;
  label: string;
  url: string;
}

const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: 'av-1',
    label: 'Alex M.',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
  },
  {
    id: 'av-2',
    label: 'Elena R.',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
  },
  {
    id: 'av-3',
    label: 'Marcus V.',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  },
  {
    id: 'av-4',
    label: 'Sarah C.',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
  },
  {
    id: 'av-5',
    label: 'David C.',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
  },
];

const ROLE_OPTIONS: { label: string; role: UserRole; description: string }[] = [
  {
    label: 'Event Director',
    role: 'admin',
    description: 'Full booth command, analytics, and CRM exports',
  },
  {
    label: 'Booth Lead',
    role: 'manager',
    description: 'Shift delegation, lead assignment, and targets',
  },
  {
    label: 'Field Sales Rep',
    role: 'field_staff',
    description: 'High-velocity badge scanning & qualification',
  },
  {
    label: 'Solutions Engineer',
    role: 'field_staff',
    description: 'Technical demos and architectural note capture',
  },
];

const INDUSTRY_PRESETS = [
  'Enterprise Software',
  'AI & Infrastructure',
  'Hardware & Robotics',
  'Fintech & Payments',
  'Biotech & Health',
  'Logistics & Supply',
];

const STEP_TITLES = [
  'Personal Information',
  'Company Information',
  'Job Title & Role',
  'Profile Photo',
  'Digital Profile Preview',
  'Completion',
];

export default function OnboardingScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const insets = useSafeAreaInsets();

  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const setActiveWorkspace = useAppStore((state) => state.setActiveWorkspace);

  const [step, setStep] = useState<OnboardingStep>(1);
  const [saving, setSaving] = useState(false);

  // Field states
  const [name, setName] = useState(user?.name || 'Alex Mercer');
  const [email, setEmail] = useState(user?.email || 'alex@acme.io');
  const [phone, setPhone] = useState(user?.phone || '+1 (555) 234-8901');

  const [company, setCompany] = useState(user?.company || 'Acme Systems Inc.');
  const [website, setWebsite] = useState(user?.website || 'https://acme.io');
  const [selectedIndustry, setSelectedIndustry] = useState(INDUSTRY_PRESETS[1]);

  const [jobTitle, setJobTitle] = useState(user?.title || 'Lead Solutions Architect');
  const [selectedRole, setSelectedRole] = useState<UserRole>(user?.role || 'admin');
  const [headline, setHeadline] = useState('Enterprise Edge & Sovereign Telemetry');

  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string>(
    user?.avatarUrl || AVATAR_PRESETS[0].url
  );
  const [customAvatarInput, setCustomAvatarInput] = useState('');

  // Field validation errors
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    website?: string;
    jobTitle?: string;
  }>({});

  // 1. Validation logic per step
  const validateStep1 = (): boolean => {
    const newErrors: typeof errors = {};
    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Work email is required';
    } else if (!emailPattern.test(email.trim())) {
      newErrors.email = 'Enter a valid work email address';
    }

    const phoneClean = phone.replace(/[^0-9+]/g, '');
    if (!phone.trim()) {
      newErrors.phone = 'Direct phone number is required';
    } else if (phoneClean.length < 7) {
      newErrors.phone = 'Enter a valid direct phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: typeof errors = {};
    if (!company.trim()) {
      newErrors.company = 'Company name is required';
    } else if (company.trim().length < 2) {
      newErrors.company = 'Company name must be at least 2 characters';
    }

    const urlPattern =
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
    if (!website.trim()) {
      newErrors.website = 'Company website is required';
    } else if (!urlPattern.test(website.trim())) {
      newErrors.website = 'Enter a valid website URL (e.g. acme.io)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: typeof errors = {};
    if (!jobTitle.trim()) {
      newErrors.jobTitle = 'Official job title is required';
    } else if (jobTitle.trim().length < 2) {
      newErrors.jobTitle = 'Job title must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 2. Stepper navigation
  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;

    if (step < 6) {
      setStep((prev) => (prev + 1) as OnboardingStep);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as OnboardingStep);
    }
  };

  // 3. Final submission & persistence
  const handleFinalize = async () => {
    setSaving(true);

    const formattedWebsite = website.startsWith('http')
      ? website
      : `https://${website}`;

    const profileData = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      company: company.trim(),
      website: formattedWebsite,
      title: jobTitle.trim(),
      avatarUrl: selectedAvatarUrl,
      role: selectedRole,
      bio: headline.trim(),
      onboardingCompleted: true,
    };

    try {
      // 1. Store in Zustand Auth Store
      updateUser(profileData);

      // 2. Store in Zustand App Store
      setActiveWorkspace({
        id: 'ws-acme-active',
        name: company.trim(),
        slug: company.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        plan: 'enterprise',
        memberCount: 18,
      });

      // 3. Persist through Service & Repository boundaries
      await Promise.all([
        profileService.updateUserProfile(profileData),
        profileService.updateCompany('comp-acme-1', {
          name: company.trim(),
          website: formattedWebsite,
        }),
      ]);

      setSaving(false);
      setStep(6);
    } catch {
      // Fallback safe continuation
      setSaving(false);
      setStep(6);
    }
  };

  const currentRoleObj =
    ROLE_OPTIONS.find((r) => r.role === selectedRole) || ROLE_OPTIONS[0];

  const progressPercent = Math.round((step / 6) * 100);

  return (
    <Screen scrollable={false} statusBarStyle={scheme === 'dark' ? 'light' : 'dark'}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}>
        {/* Top Sticky Progress Stepper */}
        <View
          style={[
            styles.stepperBar,
            {
              backgroundColor: theme.surface,
              borderBottomColor: theme.border,
              paddingTop: Math.max(insets.top, 12),
            },
          ]}>
          <View style={styles.stepperTopRow}>
            <View style={styles.stepperTitleCol}>
              <View style={styles.stepBadgeRow}>
                <Badge label={`STEP ${step} OF 6`} variant="primary" size="sm" />
                <AppText variant="caption" color="muted">
                  {progressPercent}% Complete
                </AppText>
              </View>
              <AppText weight="bold" variant="body" style={styles.currentStepTitle}>
                {STEP_TITLES[step - 1]}
              </AppText>
            </View>

            {step > 1 && step < 6 && (
              <Button
                label="Back"
                variant="ghost"
                size="sm"
                leftIcon="ArrowLeft"
                onPress={handleBack}
              />
            )}
          </View>

          {/* Progress Line */}
          <View style={[styles.progressTrack, { backgroundColor: theme.secondary }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPercent}%`, backgroundColor: theme.primary },
              ]}
            />
          </View>

          {/* Step Pill Indicators */}
          <View style={styles.stepPillsRow}>
            {[1, 2, 3, 4, 5, 6].map((s) => {
              const isActive = s === step;
              const isDone = s < step;
              return (
                <Pressable
                  key={s}
                  onPress={() => s < step && setStep(s as OnboardingStep)}
                  accessibilityRole="button"
                  accessibilityLabel={`Go to step ${s}: ${STEP_TITLES[s - 1]}`}
                  style={[
                    styles.stepPill,
                    {
                      backgroundColor: isActive
                        ? theme.primary
                        : isDone
                          ? theme.success
                          : theme.border,
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>

        {/* Scrollable Form Content */}
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 80 },
          ]}
          keyboardShouldPersistTaps="handled">
          <Animated.View key={step} entering={FadeIn.duration(260)} style={styles.mainWrapper}>
            {/* STEP 1: PERSONAL INFORMATION */}
            {step === 1 && (
              <Card variant="elevated" style={styles.stepCard}>
                <CardHeader>
                  <View style={styles.headerIconRow}>
                    <View
                      style={[
                        styles.iconBox,
                        { backgroundColor: theme.primarySubtle },
                      ]}>
                      <Icon name="User" size={20} color={theme.primary} />
                    </View>
                    <Badge label="IDENTITY & CONTACT" variant="outline" />
                  </View>
                  <CardTitle level={2}>Personal Information</CardTitle>
                  <CardDescription>
                    Provide your professional credentials for attendee badges and CRM lead assignments.
                  </CardDescription>
                </CardHeader>

                <CardContent style={styles.formGap}>
                  <Input
                    label="Full Name"
                    placeholder="e.g. Alex Mercer"
                    value={name}
                    onChangeText={(val) => {
                      setName(val);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    error={errors.name}
                    autoComplete="name"
                    required
                  />

                  <Input
                    label="Work Email"
                    placeholder="alex@acme.io"
                    value={email}
                    onChangeText={(val) => {
                      setEmail(val);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    error={errors.email}
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    spellCheck={false}
                    required
                  />

                  <Input
                    label="Direct Phone Number"
                    placeholder="+1 (555) 234-8901"
                    value={phone}
                    onChangeText={(val) => {
                      setPhone(val);
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                    }}
                    error={errors.phone}
                    autoComplete="tel"
                    keyboardType="phone-pad"
                    helperText="Printed on digital QR card for reciprocal exchange"
                    required
                  />
                </CardContent>

                <CardFooter style={styles.stepFooter}>
                  <View />
                  <Button
                    label="Continue: Company Details"
                    variant="primary"
                    size="lg"
                    rightIcon="ArrowRight"
                    onPress={handleNext}
                  />
                </CardFooter>
              </Card>
            )}

            {/* STEP 2: COMPANY INFORMATION */}
            {step === 2 && (
              <Card variant="elevated" style={styles.stepCard}>
                <CardHeader>
                  <View style={styles.headerIconRow}>
                    <View
                      style={[
                        styles.iconBox,
                        { backgroundColor: theme.primarySubtle },
                      ]}>
                      <Icon name="Building" size={20} color={theme.primary} />
                    </View>
                    <Badge label="ORGANIZATION & BOOTH" variant="outline" />
                  </View>
                  <CardTitle level={2}>Company Information</CardTitle>
                  <CardDescription>
                    Enter your organization details for booth affiliation and digital collateral distribution.
                  </CardDescription>
                </CardHeader>

                <CardContent style={styles.formGap}>
                  <Input
                    label="Company / Organization Name"
                    placeholder="e.g. Acme Systems Inc."
                    value={company}
                    onChangeText={(val) => {
                      setCompany(val);
                      if (errors.company)
                        setErrors((prev) => ({ ...prev, company: undefined }));
                    }}
                    error={errors.company}
                    autoComplete="organization"
                    required
                  />

                  <Input
                    label="Company Website"
                    placeholder="https://acme.io"
                    value={website}
                    onChangeText={(val) => {
                      setWebsite(val);
                      if (errors.website)
                        setErrors((prev) => ({ ...prev, website: undefined }));
                    }}
                    error={errors.website}
                    autoCapitalize="none"
                    autoComplete="url"
                    keyboardType="url"
                    spellCheck={false}
                    leftAccessory={<Icon name="Globe" size={16} color={theme.textMuted} />}
                    required
                  />

                  {/* Industry Presets */}
                  <View style={styles.presetBlock}>
                    <AppText variant="caption" weight="semibold" color="secondary">
                      PRIMARY BOOTH INDUSTRY
                    </AppText>
                    <View style={styles.chipsRow}>
                      {INDUSTRY_PRESETS.map((ind) => (
                        <Chip
                          key={ind}
                          label={ind}
                          selected={selectedIndustry === ind}
                          onPress={() => setSelectedIndustry(ind)}
                          size="sm"
                        />
                      ))}
                    </View>
                  </View>
                </CardContent>

                <CardFooter style={styles.stepFooter}>
                  <Button
                    label="Back"
                    variant="ghost"
                    size="md"
                    leftIcon="ArrowLeft"
                    onPress={handleBack}
                  />
                  <Button
                    label="Continue: Role & Title"
                    variant="primary"
                    size="lg"
                    rightIcon="ArrowRight"
                    onPress={handleNext}
                  />
                </CardFooter>
              </Card>
            )}

            {/* STEP 3: JOB TITLE / ROLE */}
            {step === 3 && (
              <Card variant="elevated" style={styles.stepCard}>
                <CardHeader>
                  <View style={styles.headerIconRow}>
                    <View
                      style={[
                        styles.iconBox,
                        { backgroundColor: theme.primarySubtle },
                      ]}>
                      <Icon name="Briefcase" size={20} color={theme.primary} />
                    </View>
                    <Badge label="POSITION & PERMISSIONS" variant="outline" />
                  </View>
                  <CardTitle level={2}>Job Title & Exhibition Role</CardTitle>
                  <CardDescription>
                    Specify your official designation and select your operational role for event permissions.
                  </CardDescription>
                </CardHeader>

                <CardContent style={styles.formGap}>
                  <Input
                    label="Official Job Title"
                    placeholder="e.g. Lead Solutions Architect"
                    value={jobTitle}
                    onChangeText={(val) => {
                      setJobTitle(val);
                      if (errors.jobTitle)
                        setErrors((prev) => ({ ...prev, jobTitle: undefined }));
                    }}
                    error={errors.jobTitle}
                    required
                  />

                  <Input
                    label="Digital Badge Headline (Optional)"
                    placeholder="e.g. Enterprise Edge & Sovereign Telemetry"
                    value={headline}
                    onChangeText={setHeadline}
                    helperText="Displayed under your title on your digital card"
                  />

                  {/* Role Cards */}
                  <View style={styles.presetBlock}>
                    <AppText variant="caption" weight="semibold" color="secondary">
                      SELECT EXHIBITION BOOTH ROLE
                    </AppText>
                    <View style={styles.roleCardsGrid}>
                      {ROLE_OPTIONS.map((item) => {
                        const isSelected = selectedRole === item.role;
                        return (
                          <Pressable
                            key={item.label}
                            accessibilityRole="button"
                            accessibilityLabel={item.label}
                            onPress={() => setSelectedRole(item.role)}
                            style={[
                              styles.roleSelectCard,
                              {
                                borderColor: isSelected ? theme.primary : theme.border,
                                backgroundColor: isSelected
                                  ? theme.primarySubtle
                                  : theme.surface,
                                borderWidth: isSelected ? 2 : 1,
                              },
                            ]}>
                            <View style={styles.roleCardTop}>
                              <AppText
                                weight="bold"
                                variant="body"
                                style={{
                                  color: isSelected ? theme.primary : theme.textPrimary,
                                }}>
                                {item.label}
                              </AppText>
                              <Icon
                                name={isSelected ? 'CheckCircle2' : 'Circle'}
                                size={18}
                                color={isSelected ? theme.primary : theme.textMuted}
                              />
                            </View>
                            <AppText variant="caption" color="secondary">
                              {item.description}
                            </AppText>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                </CardContent>

                <CardFooter style={styles.stepFooter}>
                  <Button
                    label="Back"
                    variant="ghost"
                    size="md"
                    leftIcon="ArrowLeft"
                    onPress={handleBack}
                  />
                  <Button
                    label="Continue: Profile Photo"
                    variant="primary"
                    size="lg"
                    rightIcon="ArrowRight"
                    onPress={handleNext}
                  />
                </CardFooter>
              </Card>
            )}

            {/* STEP 4: PROFILE PHOTO */}
            {step === 4 && (
              <Card variant="elevated" style={styles.stepCard}>
                <CardHeader>
                  <View style={styles.headerIconRow}>
                    <View
                      style={[
                        styles.iconBox,
                        { backgroundColor: theme.primarySubtle },
                      ]}>
                      <Icon name="Camera" size={20} color={theme.primary} />
                    </View>
                    <Badge label="HEADSHOT & BADGE IMAGE" variant="outline" />
                  </View>
                  <CardTitle level={2}>Profile Photo</CardTitle>
                  <CardDescription>
                    Select an executive headshot preset or enter a custom portrait URL for your digital pass.
                  </CardDescription>
                </CardHeader>

                <CardContent style={styles.formGap}>
                  {/* Big Live Avatar Preview */}
                  <View style={styles.avatarPreviewCenter}>
                    <View style={styles.avatarBadgeWrapper}>
                      <Image
                        source={{ uri: selectedAvatarUrl }}
                        style={styles.largeAvatarImage}
                      />
                      <View
                        style={[
                          styles.verifiedLiveDot,
                          {
                            backgroundColor: theme.success,
                            borderColor: theme.surface,
                          },
                        ]}
                      />
                    </View>
                    <AppText weight="bold" variant="body">
                      {name}
                    </AppText>
                    <Badge label={jobTitle} variant="primary" />
                  </View>

                  <Divider />

                  {/* Preset Library */}
                  <View style={styles.presetBlock}>
                    <AppText variant="caption" weight="semibold" color="secondary">
                      EXECUTIVE HEADSHOT LIBRARY
                    </AppText>
                    <View style={styles.avatarPresetsGrid}>
                      {AVATAR_PRESETS.map((p) => {
                        const isSelected = selectedAvatarUrl === p.url;
                        return (
                          <Pressable
                            key={p.id}
                            accessibilityRole="button"
                            accessibilityLabel={`Select photo of ${p.label}`}
                            onPress={() => setSelectedAvatarUrl(p.url)}
                            style={[
                              styles.presetPhotoItem,
                              {
                                borderColor: isSelected ? theme.primary : theme.border,
                                borderWidth: isSelected ? 3 : 1,
                              },
                            ]}>
                            <Image source={{ uri: p.url }} style={styles.presetThumb} />
                            {isSelected && (
                              <View
                                style={[
                                  styles.presetSelectedBadge,
                                  { backgroundColor: theme.primary },
                                ]}>
                                <Icon name="Check" size={10} color="#FFFFFF" />
                              </View>
                            )}
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  {/* Custom URL Input */}
                  <Input
                    label="Or Enter Custom Image URL"
                    placeholder="https://images.unsplash.com/..."
                    value={customAvatarInput}
                    onChangeText={(val) => {
                      setCustomAvatarInput(val);
                      if (val.startsWith('http')) {
                        setSelectedAvatarUrl(val);
                      }
                    }}
                    autoCapitalize="none"
                    leftAccessory={<Icon name="Link" size={16} color={theme.textMuted} />}
                  />
                </CardContent>

                <CardFooter style={styles.stepFooter}>
                  <Button
                    label="Back"
                    variant="ghost"
                    size="md"
                    leftIcon="ArrowLeft"
                    onPress={handleBack}
                  />
                  <Button
                    label="Preview Digital Profile"
                    variant="primary"
                    size="lg"
                    rightIcon="ArrowRight"
                    onPress={handleNext}
                  />
                </CardFooter>
              </Card>
            )}

            {/* STEP 5: DIGITAL PROFILE PREVIEW */}
            {step === 5 && (
              <View style={styles.previewContainer}>
                {/* Header notice */}
                <View style={styles.previewNotice}>
                  <Badge label="DIGITAL SMART PASS PREVIEW" variant="primary" showDot />
                  <CardTitle level={2} style={{ textAlign: 'center' }}>
                    Review Your Digital Badge
                  </CardTitle>
                  <AppText color="secondary" variant="body" style={{ textAlign: 'center' }}>
                    This verified pass is exchanged instantly when attendees tap your NFC or scan your badge QR code.
                  </AppText>
                </View>

                {/* PREMIUM DIGITAL BADGE CARD */}
                <View
                  style={[
                    styles.executivePassCard,
                    {
                      backgroundColor: theme.surfaceElevated,
                      borderColor: theme.border,
                    },
                    Shadows.elevated,
                  ]}>
                  {/* Lanyard Clip Slot */}
                  <View style={styles.lanyardHoleContainer}>
                    <View
                      style={[
                        styles.lanyardHole,
                        { backgroundColor: theme.background, borderColor: theme.border },
                      ]}
                    />
                  </View>

                  {/* Pass Header */}
                  <View style={styles.passHeaderStrip}>
                    <View style={styles.passBrandRow}>
                      <Icon name="Layers" size={18} color={theme.primary} />
                      <AppText weight="bold" variant="body" style={styles.passBrandText}>
                        EXPODIARIES
                      </AppText>
                      <Badge label="VIP EXHIBITOR" variant="primary" size="sm" />
                    </View>
                    <AppText variant="caption" color="muted" tabular>
                      ID: #EXPO-2026-VIP
                    </AppText>
                  </View>

                  <Divider />

                  {/* Avatar & Core Identity */}
                  <View style={styles.passBodyRow}>
                    <View style={styles.passAvatarWrap}>
                      <Image
                        source={{ uri: selectedAvatarUrl }}
                        style={styles.passAvatarImg}
                      />
                      <View
                        style={[
                          styles.liveStatusPill,
                          {
                            backgroundColor: theme.success,
                            borderColor: theme.surfaceElevated,
                          },
                        ]}>
                        <Icon name="Check" size={10} color="#FFFFFF" />
                      </View>
                    </View>

                    <View style={styles.passIdentityCol}>
                      <AppText weight="bold" variant="title" style={styles.passName}>
                        {name}
                      </AppText>
                      <AppText
                        weight="semibold"
                        variant="body"
                        style={{ color: theme.primary }}>
                        {jobTitle}
                      </AppText>
                      <View style={styles.passCompanyRow}>
                        <Icon name="Building" size={14} color={theme.textMuted} />
                        <AppText variant="caption" weight="bold">
                          {company}
                        </AppText>
                      </View>
                    </View>
                  </View>

                  {headline ? (
                    <View
                      style={[
                        styles.headlineBox,
                        {
                          backgroundColor: theme.secondary,
                          borderColor: theme.border,
                        },
                      ]}>
                      <AppText
                        variant="caption"
                        color="secondary"
                        style={styles.headlineText}>
                        “{headline}”
                      </AppText>
                    </View>
                  ) : null}

                  {/* Contact Badges Row */}
                  <View style={styles.passContactGrid}>
                    <View
                      style={[
                        styles.contactPill,
                        {
                          backgroundColor: theme.surface,
                          borderColor: theme.border,
                        },
                      ]}>
                      <Icon name="Mail" size={13} color={theme.primary} />
                      <AppText variant="caption" numberOfLines={1} style={{ flex: 1 }}>
                        {email}
                      </AppText>
                    </View>

                    <View
                      style={[
                        styles.contactPill,
                        {
                          backgroundColor: theme.surface,
                          borderColor: theme.border,
                        },
                      ]}>
                      <Icon name="Phone" size={13} color={theme.primary} />
                      <AppText variant="caption" numberOfLines={1} style={{ flex: 1 }}>
                        {phone}
                      </AppText>
                    </View>

                    <View
                      style={[
                        styles.contactPill,
                        {
                          backgroundColor: theme.surface,
                          borderColor: theme.border,
                        },
                      ]}>
                      <Icon name="Globe" size={13} color={theme.primary} />
                      <AppText variant="caption" numberOfLines={1} style={{ flex: 1 }}>
                        {website}
                      </AppText>
                    </View>
                  </View>

                  <Divider />

                  {/* Simulated QR Reciprocal Code */}
                  <View style={styles.qrSection}>
                    <View
                      style={[
                        styles.qrCodeBox,
                        {
                          backgroundColor: '#FFFFFF',
                          borderColor: theme.border,
                        },
                      ]}>
                      <Icon name="QrCode" size={88} color="#0F172A" />
                    </View>
                    <View style={styles.qrTextCol}>
                      <Badge label="NFC SMART CODE" variant="success" size="sm" showDot />
                      <AppText weight="semibold" variant="caption">
                        Instant Reciprocal Scan
                      </AppText>
                      <AppText variant="caption" color="muted">
                        Attendees point device camera to exchange lead telemetry
                      </AppText>
                    </View>
                  </View>

                  {/* Holographic Security Footer */}
                  <View
                    style={[
                      styles.hologramFooter,
                      {
                        backgroundColor: theme.secondary,
                        borderTopColor: theme.border,
                      },
                    ]}>
                    <Icon name="ShieldCheck" size={14} color={theme.primary} />
                    <AppText variant="caption" color="muted" style={{ fontSize: 10 }}>
                      VERIFIED ENCRYPTED CREDENTIAL • EXPO OPERATIONS CLOUD
                    </AppText>
                  </View>
                </View>

                {/* Edit Shortcuts */}
                <View style={styles.quickEditRow}>
                  <Button
                    label="Edit Identity"
                    variant="outline"
                    size="sm"
                    onPress={() => setStep(1)}
                  />
                  <Button
                    label="Edit Company"
                    variant="outline"
                    size="sm"
                    onPress={() => setStep(2)}
                  />
                  <Button
                    label="Change Photo"
                    variant="outline"
                    size="sm"
                    onPress={() => setStep(4)}
                  />
                </View>

                {/* CTA Action */}
                <View style={styles.previewActions}>
                  <Button
                    label={saving ? 'Activating Profile…' : 'Confirm & Complete Onboarding'}
                    variant="primary"
                    size="lg"
                    loading={saving}
                    rightIcon={saving ? undefined : 'CheckCircle2'}
                    onPress={handleFinalize}
                  />
                </View>
              </View>
            )}

            {/* STEP 6: COMPLETION */}
            {step === 6 && (
              <Card variant="elevated" style={styles.stepCard}>
                <CardHeader style={{ alignItems: 'center' }}>
                  <View
                    style={[
                      styles.celebrationCircle,
                      { backgroundColor: theme.successBackground },
                    ]}>
                    <Icon name="CheckCircle2" size={44} color={theme.success} />
                  </View>
                  <Badge label="WORKSPACE READY" variant="success" showDot />
                  <CardTitle level={1} style={{ textAlign: 'center', marginTop: 4 }}>
                    Onboarding Completed!
                  </CardTitle>
                  <CardDescription style={{ textAlign: 'center' }}>
                    Your executive profile and exhibition booth operations are synchronized. You are ready to scan attendee badges and capture leads.
                  </CardDescription>
                </CardHeader>

                <CardContent style={styles.formGap}>
                  <View
                    style={[
                      styles.summaryPillBox,
                      {
                        backgroundColor: theme.secondary,
                        borderColor: theme.border,
                      },
                    ]}>
                    <View style={styles.summaryItemRow}>
                      <Avatar
                        name={name}
                        source={{ uri: selectedAvatarUrl }}
                        size="md"
                      />
                      <View style={{ flex: 1, gap: 2 }}>
                        <AppText weight="bold" variant="body">
                          {name}
                        </AppText>
                        <AppText variant="caption" color="secondary">
                          {jobTitle} • {company}
                        </AppText>
                      </View>
                      <Badge label={currentRoleObj.label} variant="primary" />
                    </View>

                    <Divider />

                    <View style={styles.summaryDetailsList}>
                      <View style={styles.summaryDetailRow}>
                        <AppText variant="caption" color="muted">Direct Phone:</AppText>
                        <AppText variant="caption" weight="semibold">{phone}</AppText>
                      </View>
                      <View style={styles.summaryDetailRow}>
                        <AppText variant="caption" color="muted">Work Email:</AppText>
                        <AppText variant="caption" weight="semibold">{email}</AppText>
                      </View>
                      <View style={styles.summaryDetailRow}>
                        <AppText variant="caption" color="muted">Company URL:</AppText>
                        <AppText variant="caption" weight="semibold">{website}</AppText>
                      </View>
                    </View>
                  </View>
                </CardContent>

                <CardFooter style={styles.completionFooter}>
                  <Button
                    label="Enter Field Command Center"
                    variant="primary"
                    size="lg"
                    rightIcon="ArrowRight"
                    onPress={() => router.replace('/(tabs)')}
                    style={{ width: '100%' }}
                  />

                  <Button
                    label="View Digital Profile in Account"
                    variant="outline"
                    size="md"
                    leftIcon="User"
                    onPress={() => router.replace('/(tabs)/profile')}
                    style={{ width: '100%', marginTop: Spacing.xs }}
                  />
                </CardFooter>
              </Card>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  stepperBar: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  stepperTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  stepperTitleCol: {
    gap: 2,
  },
  stepBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  currentStepTitle: {
    letterSpacing: -0.3,
  },
  progressTrack: {
    height: 4,
    borderRadius: Radius.pill,
    overflow: 'hidden',
    marginTop: Spacing.xs,
    width: '100%',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.pill,
  },
  stepPillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
    gap: 4,
  },
  stepPill: {
    flex: 1,
    height: 3,
    borderRadius: Radius.pill,
  },
  scrollContent: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
  },
  mainWrapper: {
    width: '100%',
    maxWidth: 540,
    gap: Spacing.md,
  },
  stepCard: {
    width: '100%',
  },
  headerIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: Radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formGap: {
    gap: Spacing.sm + 2,
  },
  stepFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  presetBlock: {
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  roleCardsGrid: {
    gap: Spacing.xs,
  },
  roleSelectCard: {
    padding: Spacing.sm + 2,
    borderRadius: Radius.medium,
    gap: 2,
  },
  roleCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarPreviewCenter: {
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  avatarBadgeWrapper: {
    position: 'relative',
    marginBottom: Spacing.xs,
  },
  largeAvatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  verifiedLiveDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPresetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  presetPhotoItem: {
    width: 58,
    height: 58,
    borderRadius: 29,
    overflow: 'hidden',
    position: 'relative',
  },
  presetThumb: {
    width: '100%',
    height: '100%',
  },
  presetSelectedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewContainer: {
    width: '100%',
    gap: Spacing.md,
    alignItems: 'center',
  },
  previewNotice: {
    alignItems: 'center',
    gap: Spacing.xs,
    maxWidth: 420,
  },
  executivePassCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: Radius.large + 4,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  lanyardHoleContainer: {
    alignItems: 'center',
    paddingTop: 8,
  },
  lanyardHole: {
    width: 44,
    height: 8,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  passHeaderStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  passBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  passBrandText: {
    letterSpacing: 0.5,
    fontSize: 12,
  },
  passBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  passAvatarWrap: {
    position: 'relative',
  },
  passAvatarImg: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  liveStatusPill: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passIdentityCol: {
    flex: 1,
    gap: 3,
  },
  passName: {
    letterSpacing: -0.4,
  },
  passCompanyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headlineBox: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radius.medium,
    borderWidth: 1,
  },
  headlineText: {
    fontStyle: 'italic',
    lineHeight: 16,
  },
  passContactGrid: {
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  contactPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 6,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.medium,
    borderWidth: 1,
  },
  qrSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  qrCodeBox: {
    width: 104,
    height: 104,
    borderRadius: Radius.medium,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrTextCol: {
    flex: 1,
    gap: 4,
  },
  hologramFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs + 2,
    borderTopWidth: 1,
  },
  quickEditRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    justifyContent: 'center',
  },
  previewActions: {
    width: '100%',
    maxWidth: 440,
    marginTop: Spacing.xs,
  },
  celebrationCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  summaryPillBox: {
    padding: Spacing.md,
    borderRadius: Radius.large,
    borderWidth: 1,
    gap: Spacing.md,
  },
  summaryItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  summaryDetailsList: {
    gap: 6,
  },
  summaryDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completionFooter: {
    flexDirection: 'column',
    alignItems: 'center',
  },
});
