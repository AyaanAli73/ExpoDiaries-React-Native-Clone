import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import {
  AppText,
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Chip,
  Divider,
  Icon,
  IconButton,
  Input,
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { mockTeamMembers } from '@/repositories/mocks/team.mock';
import { LeadDraft } from '@/services/ocr/ocr.types';
import { Colors, Radius, Spacing } from '@/theme';
import { CreateLeadInput, Lead, LeadIntent, LeadPriority } from '@/types/lead';
import { VoiceNotePlayer } from './voice-note-player';
import { VoiceNoteRecorder } from './voice-note-recorder';

export interface LeadDraftReviewProps {
  draft: LeadDraft;
  onSave: (finalInput: CreateLeadInput, andScanNext?: boolean) => Promise<Lead | void>;
  onRetake: () => void;
  isSaving?: boolean;
}

const INTENT_OPTIONS: { value: LeadIntent; label: string; icon: string }[] = [
  { value: 'buying', label: 'Buying', icon: 'ShoppingCart' },
  { value: 'partnership', label: 'Partnership', icon: 'Handshake' },
  { value: 'information', label: 'Information', icon: 'Info' },
  { value: 'follow_up', label: 'Follow-up', icon: 'Calendar' },
  { value: 'other', label: 'Other', icon: 'Globe' },
];

const PRIORITY_OPTIONS: { value: LeadPriority; label: string; variant: 'danger' | 'warning' | 'outline' }[] = [
  { value: 'urgent', label: 'High Priority', variant: 'danger' },
  { value: 'medium', label: 'Medium Priority', variant: 'warning' },
  { value: 'low', label: 'Low Priority', variant: 'outline' },
];

const QUICK_HALL_OPTIONS = [
  'North Hall',
  'Central Hall',
  'West Hall',
  'Hall 3',
  'South Hall',
];

const QUICK_NOTE_TAGS = [
  'Active RFP',
  '100+ Seats',
  'Decision Maker',
  'Send Pricing Proposal',
  'Requested In-Person Demo',
  'Budget Approved',
  'Competitor Switch',
];

export function LeadDraftReview({
  draft,
  onSave,
  onRetake,
  isSaving = false,
}: LeadDraftReviewProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  // =========================================================================
  // 1. CONTACT INFORMATION
  // =========================================================================
  const [firstName, setFirstName] = useState(draft.firstName);
  const [lastName, setLastName] = useState(draft.lastName);
  const [title, setTitle] = useState(draft.title);
  const [company, setCompany] = useState(draft.company);
  const [email, setEmail] = useState(draft.email);
  const [phone, setPhone] = useState(draft.phone);
  const [address, setAddress] = useState(draft.address);
  const [website, setWebsite] = useState(draft.website);

  // =========================================================================
  // 2. QUALIFICATION PARAMETERS
  // =========================================================================
  const [temperature, setTemperature] = useState<'hot' | 'warm' | 'cold'>(draft.temperature || 'warm');
  const [intent, setIntent] = useState<LeadIntent>(draft.intent || 'buying');
  const [priority, setPriority] = useState<LeadPriority>(draft.priority || (temperature === 'hot' ? 'urgent' : 'medium'));

  // =========================================================================
  // 3. EVENT & LOGISTICS
  // =========================================================================
  const [eventName, setEventName] = useState(draft.eventName || 'CES 2026 International');
  const [hall, setHall] = useState(draft.hall || 'North Hall');
  const [boothNumber, setBoothNumber] = useState(draft.boothNumber || '#N-408');
  const [assignedMemberId, setAssignedMemberId] = useState(draft.assignedToId || 'usr-alex-1');

  // Follow-up Date (Tomorrow, 3 days, next week, 2 weeks)
  const [followUpDateOffsetDays, setFollowUpDateOffsetDays] = useState<number>(3);

  // =========================================================================
  // 4. NOTES
  // =========================================================================
  const [notes, setNotes] = useState(draft.notes || '');

  // =========================================================================
  // 5. ATTACHMENTS (Voice Memos & Card Scan)
  // =========================================================================
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [recordedVoiceUri, setRecordedVoiceUri] = useState<string | null>(null);
  const [voiceDuration, setVoiceDuration] = useState<number>(0);
  const [voiceTranscript, setVoiceTranscript] = useState<string | undefined>(undefined);
  const [voiceWaveform, setVoiceWaveform] = useState<number[] | undefined>(undefined);

  // Additional Photo Attachments
  const [additionalPhotos, setAdditionalPhotos] = useState<string[]>([]);
  const [previewModalUri, setPreviewModalUri] = useState<string | null>(null);

  const handleCapturePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required to capture photos.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        setAdditionalPhotos((prev) => [...prev, result.assets[0].uri]);
      }
    } catch {
      Alert.alert('Camera Error', 'Could not open camera.');
    }
  };

  const handlePickPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Photo library permission is required.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets) {
        const uris = result.assets.map((a) => a.uri).filter(Boolean);
        setAdditionalPhotos((prev) => [...prev, ...uris]);
      }
    } catch {
      Alert.alert('Gallery Error', 'Could not open photo library.');
    }
  };

  const handleRemovePhoto = (index: number) => {
    setAdditionalPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Lightbox & Accordions
  const [showCardModal, setShowCardModal] = useState(false);
  const [showRawText, setShowRawText] = useState(false);

  // Saved Confirmation State
  const [savedLead, setSavedLead] = useState<Lead | null>(null);

  // Calculate dynamic follow-up date string
  const followUpDueDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + followUpDateOffsetDays);
    return d.toISOString();
  }, [followUpDateOffsetDays]);

  const formattedFollowUpDate = useMemo(() => {
    try {
      const d = new Date(followUpDueDate);
      return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
      }).format(d);
    } catch {
      return followUpDueDate;
    }
  }, [followUpDueDate]);

  // Dynamic calculated composite score
  const calculatedScore = useMemo(() => {
    let score = temperature === 'hot' ? 80 : temperature === 'warm' ? 52 : 28;
    if (intent === 'buying') score += 15;
    else if (intent === 'partnership') score += 10;
    else if (intent === 'follow_up') score += 8;

    if (priority === 'urgent') score += 8;
    else if (priority === 'medium') score += 4;

    if (email && phone) score += 5;
    if (title && (title.toLowerCase().includes('director') || title.toLowerCase().includes('vp') || title.toLowerCase().includes('c-level') || title.toLowerCase().includes('head'))) {
      score += 5;
    }
    return Math.min(100, Math.max(10, score));
  }, [temperature, intent, priority, email, phone, title]);

  const assignedMember = useMemo(() => {
    return mockTeamMembers.find((m) => m.userId === assignedMemberId) || mockTeamMembers[0];
  }, [assignedMemberId]);

  // One-tap append note tag
  const handleAppendNoteTag = (tag: string) => {
    if (notes.includes(tag)) return;
    setNotes((prev) => (prev ? `${prev.trim()} • ${tag}` : tag));
  };

  // Build CreateLeadInput payload
  const buildLeadPayload = (): CreateLeadInput => {
    return {
      eventId: draft.eventId || 'evt-2026-ces',
      eventName: eventName.trim(),
      hall: hall.trim(),
      boothNumber: boothNumber.trim(),
      companyId: 'comp-acme-1',
      firstName: firstName.trim() || 'Attendee',
      lastName: lastName.trim() || '',
      email: email.trim(),
      phone: phone.trim(),
      company: company.trim() || 'Company',
      title: title.trim(),
      address: address.trim(),
      website: website.trim(),
      notes: notes.trim(),
      status: 'new',
      priority,
      score: calculatedScore,
      temperature,
      intent,
      followUpStatus: 'pending',
      followUpDueDate,
      assignedToId: assignedMember.userId,
      assignedToName: assignedMember.name,
      assignedAt: new Date().toISOString(),
      cardImageUri: draft.cardImageUri,
      cardBackImageUri: draft.cardBackImageUri,
      voiceNoteUri: recordedVoiceUri || undefined,
      voiceNoteDurationSeconds: recordedVoiceUri ? voiceDuration : undefined,
      voiceNoteTranscript: recordedVoiceUri ? voiceTranscript : undefined,
      ocrConfidence: draft.confidence,
      ocrRawText: draft.rawText,
      captureSource: 'business_card',
      capturedByStaffId: assignedMember.userId,
      additionalPhotoUris: additionalPhotos.length > 0 ? additionalPhotos : undefined,
      tags: [company, title, temperature.toUpperCase(), intent.toUpperCase()].filter(Boolean),
    };
  };

  // Save Lead and transition to Confirmation State
  const handleSave = async (andScanNext: boolean) => {
    const payload = buildLeadPayload();
    try {
      const result = await onSave(payload, andScanNext);
      if (!andScanNext) {
        if (result && typeof result === 'object' && 'id' in result) {
          setSavedLead(result as Lead);
        } else {
          // Construct client-side lead confirmation snapshot
          const fallbackLead: Lead = {
            id: `lead-${Date.now()}`,
            ...payload,
            companyId: payload.companyId || 'comp-acme-1',
            priority: payload.priority || 'medium',
            synced: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setSavedLead(fallbackLead);
        }
      }
    } catch {
      Alert.alert('Save Failed', 'Could not save lead record. Please retry.');
    }
  };

  // =========================================================================
  // VIEW: CONFIRMATION STATE
  // =========================================================================
  if (savedLead) {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.confirmationScroll}>
        <Animated.View entering={FadeIn.duration(260)} style={styles.confirmHeaderBlock}>
          <View style={[styles.confirmIconRing, { backgroundColor: theme.primarySubtle }]}>
            <Icon name="Check" size={32} color={theme.primary} />
          </View>
          <AppText weight="bold" variant="heading" style={{ textAlign: 'center' }}>
            Lead Successfully Qualified!
          </AppText>
          <AppText variant="caption" color="secondary" style={{ textAlign: 'center' }}>
            Added to pipeline, activity logged, and dashboard KPIs updated.
          </AppText>
        </Animated.View>

        {/* Lead Verified Summary Card */}
        <Animated.View entering={FadeInDown.duration(240).delay(80)}>
          <Card variant="elevated" density="comfortable" style={styles.confirmCard}>
            <View style={styles.confirmTopRow}>
              <Avatar
                name={`${savedLead.firstName} ${savedLead.lastName}`}
                size="lg"
              />
              <View style={{ flex: 1, gap: 2 }}>
                <View style={styles.confirmNameBadges}>
                  <AppText weight="bold" variant="body">
                    {savedLead.firstName} {savedLead.lastName}
                  </AppText>
                  <Badge
                    label={`SCORE ${savedLead.score}`}
                    variant={savedLead.temperature === 'hot' ? 'success' : 'warning'}
                    size="sm"
                    showDot
                  />
                </View>
                <AppText weight="semibold" variant="caption" style={{ color: theme.primary }}>
                  {savedLead.title || 'Attendee'}
                </AppText>
                <AppText variant="caption" color="secondary">
                  {savedLead.company || 'Company'}
                </AppText>
              </View>
            </View>

            <Divider />

            {/* Badges Grid */}
            <View style={styles.confirmBadgesRow}>
              <Badge
                label={`TEMP: ${savedLead.temperature?.toUpperCase()}`}
                variant={savedLead.temperature === 'hot' ? 'danger' : 'outline'}
                size="sm"
              />
              <Badge
                label={`INTENT: ${savedLead.intent?.toUpperCase() || 'BUYING'}`}
                variant="primary"
                size="sm"
              />
              <Badge
                label={`PRIORITY: ${savedLead.priority?.toUpperCase()}`}
                variant={savedLead.priority === 'urgent' ? 'danger' : 'outline'}
                size="sm"
              />
            </View>

            {/* Logistics Summary */}
            <View style={[styles.confirmContextBox, { backgroundColor: theme.secondary }]}>
              <View style={styles.confirmContextItem}>
                <Icon name="Calendar" size={14} color={theme.textMuted} />
                <AppText variant="caption" color="secondary">
                  {savedLead.eventName}
                </AppText>
              </View>
              <View style={styles.confirmContextItem}>
                <Icon name="MapPin" size={14} color={theme.primary} />
                <AppText variant="caption" weight="semibold" style={{ color: theme.primary }}>
                  {savedLead.hall ? `${savedLead.hall} • ` : ''}{savedLead.boothNumber}
                </AppText>
              </View>
              <View style={styles.confirmContextItem}>
                <Icon name="UserCheck" size={14} color={theme.textMuted} />
                <AppText variant="caption" color="secondary">
                  Assigned to {savedLead.assignedToName || 'Alex Mercer'}
                </AppText>
              </View>
              <View style={styles.confirmContextItem}>
                <Icon name="Clock" size={14} color={theme.textMuted} />
                <AppText variant="caption" color="secondary">
                  Follow-up: {formattedFollowUpDate}
                </AppText>
              </View>
            </View>

            {/* Note Snippet */}
            {savedLead.notes && (
              <View style={[styles.confirmNoteBox, { borderColor: theme.border }]}>
                <Icon name="MessageSquare" size={13} color={theme.primary} />
                <AppText variant="caption" style={{ flex: 1 }}>
                  “{savedLead.notes}”
                </AppText>
              </View>
            )}

            {/* Attachments Summary */}
            <View style={[styles.confirmAttachmentsRow, { borderTopColor: theme.border }]}>
              <Icon name="Paperclip" size={13} color={theme.textMuted} />
              <AppText variant="caption" color="secondary" weight="semibold">
                Attachments:
              </AppText>
              {savedLead.cardImageUri && (
                <Badge label="Card Scan (Front)" variant="outline" size="sm" />
              )}
              {savedLead.voiceNoteUri && (
                <Badge label="Voice Memo" variant="primary" size="sm" />
              )}
              {additionalPhotos.length > 0 && (
                <Badge label={`${additionalPhotos.length} Photo${additionalPhotos.length > 1 ? 's' : ''}`} variant="outline" size="sm" />
              )}
            </View>
          </Card>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View entering={FadeInDown.duration(240).delay(140)} style={styles.confirmActionsCol}>
          <Button
            label="View Full Lead Profile"
            variant="primary"
            size="lg"
            leftIcon="Users"
            onPress={() => router.replace(`/leads/${savedLead.id}` as never)}
          />

          <Button
            label="Scan Next Business Card"
            variant="outline"
            size="md"
            leftIcon="Camera"
            onPress={onRetake}
          />

          <Button
            label="Return to Leads Directory"
            variant="ghost"
            size="md"
            onPress={() => router.replace('/leads' as never)}
          />
        </Animated.View>
      </ScrollView>
    );
  }

  // =========================================================================
  // VIEW: EDITABLE QUALIFICATION REVIEW FORM
  // =========================================================================
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* ============================================================ */}
        {/* CARD THUMBNAIL & OCR ENGINE CONFIDENCE                       */}
        {/* ============================================================ */}
        <Card variant="outline" density="compact" style={styles.previewCard}>
          <View style={styles.previewRow}>
            {draft.cardImageUri ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Enlarge card scan"
                onPress={() => setShowCardModal(true)}
                style={styles.cardThumbPressable}>
                <Image
                  source={{ uri: draft.cardImageUri }}
                  style={styles.cardThumb}
                  contentFit="cover"
                />
                <View style={styles.cardZoomBadge}>
                  <Icon name="Maximize2" size={11} color="#FFFFFF" />
                </View>
              </Pressable>
            ) : null}

            <View style={styles.previewMetaCol}>
              <View style={styles.confidenceRow}>
                <Badge
                  label={`OCR ${(draft.confidence * 100).toFixed(0)}% MATCH`}
                  variant="success"
                  size="sm"
                  showDot
                />
                <Badge
                  label={draft.isMock ? 'CLOUD VISION MOCK' : 'CLOUD VISION API'}
                  variant="outline"
                  size="sm"
                />
              </View>
              <AppText variant="caption" color="secondary" numberOfLines={2}>
                {draft.providerNotice || 'Fields auto-extracted via machine vision.'}
              </AppText>
            </View>
          </View>

          {/* Raw OCR Text Accordion Toggle */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Toggle raw OCR text"
            onPress={() => setShowRawText(!showRawText)}
            style={[styles.rawTextToggle, { borderTopColor: theme.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon name="FileText" size={13} color={theme.textMuted} />
              <AppText variant="caption" color="secondary">
                {showRawText ? 'Hide Raw OCR Text' : 'View Extracted Text Stream'}
              </AppText>
            </View>
            <Icon
              name={showRawText ? 'ChevronUp' : 'ChevronDown'}
              size={14}
              color={theme.textMuted}
            />
          </Pressable>

          {showRawText && (
            <View style={[styles.rawTextBox, { backgroundColor: theme.secondary }]}>
              <AppText variant="caption" style={styles.rawTextContent}>
                {draft.rawText || 'No raw text stream captured.'}
              </AppText>
            </View>
          )}
        </Card>

        {/* ============================================================ */}
        {/* ============================================================ */}
        {/* SECTION 1: CONTACT                                           */}
        {/* ============================================================ */}
        <Card variant="elevated" density="comfortable" style={styles.sectionCard}>
          <CardHeader style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Icon name="Users" size={18} color={theme.primary} />
              <CardTitle level={2}>CONTACT</CardTitle>
            </View>
            <Badge label="EDITABLE" variant="outline" size="sm" />
          </CardHeader>

          <CardContent style={styles.sectionContent}>
            {/* First & Last Name */}
            <View style={styles.twoColRow}>
              <View style={styles.col}>
                <Input
                  label="First Name"
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="First name…"
                  autoCapitalize="words"
                />
              </View>
              <View style={styles.col}>
                <Input
                  label="Last Name"
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Last name…"
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Job Title & Company */}
            <Input
              label="Job Title"
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. VP of Global Supply Chain…"
            />
            <Input
              label="Company"
              value={company}
              onChangeText={setCompany}
              placeholder="e.g. Apex Dynamics Ltd…"
            />

            {/* Email & Phone */}
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="name@company.com…"
              keyboardType="email-address"
              autoCapitalize="none"
              leftAccessory={<Icon name="Mail" size={16} color={theme.textMuted} />}
            />
            <Input
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              placeholder="+1 (555) 000-0000…"
              keyboardType="phone-pad"
              leftAccessory={<Icon name="Phone" size={16} color={theme.textMuted} />}
            />

            {/* Address & Website */}
            <Input
              label="Address / City"
              value={address}
              onChangeText={setAddress}
              placeholder="City, Country…"
              leftAccessory={<Icon name="MapPin" size={16} color={theme.textMuted} />}
            />
            <Input
              label="Website"
              value={website}
              onChangeText={setWebsite}
              placeholder="company.com…"
              keyboardType="url"
              autoCapitalize="none"
              leftAccessory={<Icon name="Globe" size={16} color={theme.textMuted} />}
            />
          </CardContent>
        </Card>

        {/* ============================================================ */}
        {/* SECTION 2: QUALIFICATION                                     */}
        {/* ============================================================ */}
        <Card variant="elevated" density="comfortable" style={styles.sectionCard}>
          <CardHeader style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Icon name="Target" size={18} color={theme.primary} />
              <CardTitle level={2}>QUALIFICATION</CardTitle>
            </View>
            <Badge
              label={`SCORE ${calculatedScore}`}
              variant={temperature === 'hot' ? 'success' : 'warning'}
              size="sm"
              showDot
            />
          </CardHeader>

          <CardContent style={styles.sectionContent}>
            {/* TEMPERATURE (Hot, Warm, Cold) */}
            <View style={styles.fieldGroup}>
              <AppText variant="caption" weight="bold" color="secondary">
                TEMPERATURE
              </AppText>
              <View style={styles.tempBoxesRow}>
                {[
                  { key: 'hot', label: 'HOT', emoji: '🔥', desc: 'Active Budget' },
                  { key: 'warm', label: 'WARM', emoji: '⚡', desc: 'Evaluating' },
                  { key: 'cold', label: 'COLD', emoji: '❄️', desc: 'Casual Visitor' },
                ].map((item) => {
                  const isSelected = temperature === item.key;
                  return (
                    <Pressable
                      key={item.key}
                      accessibilityRole="button"
                      accessibilityLabel={`Set temperature to ${item.label}`}
                      onPress={() => setTemperature(item.key as 'hot' | 'warm' | 'cold')}
                      style={({ pressed }) => [
                        styles.tempBox,
                        {
                          borderColor: isSelected ? theme.primary : theme.border,
                          backgroundColor: isSelected ? theme.primarySubtle : theme.surface,
                        },
                        pressed && { opacity: 0.8 },
                      ]}>
                      <AppText style={styles.tempEmoji}>{item.emoji}</AppText>
                      <AppText weight="bold" variant="caption" style={isSelected ? { color: theme.primary } : {}}>
                        {item.label}
                      </AppText>
                      <AppText variant="caption" style={styles.tempDesc}>
                        {item.desc}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* INTENT (Buying, Partnership, Information, Follow-up, Other) */}
            <View style={styles.fieldGroup}>
              <AppText variant="caption" weight="bold" color="secondary">
                INTENT
              </AppText>
              <View style={styles.chipsWrap}>
                {INTENT_OPTIONS.map((opt) => (
                  <Chip
                    key={opt.value}
                    label={opt.label}
                    selected={intent === opt.value}
                    onPress={() => setIntent(opt.value)}
                    size="sm"
                  />
                ))}
              </View>
            </View>

            {/* PRIORITY (High, Medium, Low) */}
            <View style={styles.fieldGroup}>
              <AppText variant="caption" weight="bold" color="secondary">
                PRIORITY
              </AppText>
              <View style={styles.chipsWrap}>
                {PRIORITY_OPTIONS.map((opt) => (
                  <Chip
                    key={opt.value}
                    label={opt.label}
                    selected={priority === opt.value}
                    onPress={() => setPriority(opt.value)}
                    size="sm"
                  />
                ))}
              </View>
            </View>
          </CardContent>
        </Card>

        {/* ============================================================ */}
        {/* SECTION 3: EVENT                                             */}
        {/* ============================================================ */}
        <Card variant="elevated" density="comfortable" style={styles.sectionCard}>
          <CardHeader style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Icon name="MapPin" size={18} color={theme.primary} />
              <CardTitle level={2}>EVENT</CardTitle>
            </View>
          </CardHeader>

          <CardContent style={styles.sectionContent}>
            {/* Event Name */}
            <Input
              label="Event Name"
              value={eventName}
              onChangeText={setEventName}
              placeholder="e.g. CES 2026 International…"
              leftAccessory={<Icon name="Calendar" size={16} color={theme.textMuted} />}
            />

            {/* Hall & Booth */}
            <View style={styles.twoColRow}>
              <View style={styles.col}>
                <Input
                  label="Hall / Pavilion"
                  value={hall}
                  onChangeText={setHall}
                  placeholder="e.g. North Hall…"
                />
              </View>
              <View style={styles.col}>
                <Input
                  label="Booth Number"
                  value={boothNumber}
                  onChangeText={setBoothNumber}
                  placeholder="e.g. #N-408…"
                />
              </View>
            </View>

            {/* Hall Quick Selection Chips */}
            <View style={styles.hallChipsRow}>
              {QUICK_HALL_OPTIONS.map((h) => (
                <Pressable
                  key={h}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${h}`}
                  onPress={() => setHall(h)}
                  style={[
                    styles.hallChip,
                    {
                      borderColor: hall === h ? theme.primary : theme.border,
                      backgroundColor: hall === h ? theme.primarySubtle : theme.secondary,
                    },
                  ]}>
                  <AppText variant="caption" style={hall === h ? { color: theme.primary, fontWeight: 'bold' } : {}}>
                    {h}
                  </AppText>
                </Pressable>
              ))}
            </View>

            <Divider />

            {/* Assigned Team Member Carousel */}
            <View style={styles.fieldGroup}>
              <AppText variant="caption" weight="bold" color="secondary">
                ASSIGNED TEAM MEMBER
              </AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.teamRow}>
                {mockTeamMembers.map((member) => {
                  const isAssigned = assignedMemberId === member.userId;
                  return (
                    <Pressable
                      key={member.userId}
                      accessibilityRole="button"
                      accessibilityLabel={`Assign lead to ${member.name}`}
                      onPress={() => setAssignedMemberId(member.userId)}
                      style={[
                        styles.memberPill,
                        {
                          borderColor: isAssigned ? theme.primary : theme.border,
                          backgroundColor: isAssigned ? theme.primarySubtle : theme.surface,
                        },
                      ]}>
                      <Avatar name={member.name} size="xs" />
                      <View style={{ gap: 1 }}>
                        <AppText weight="bold" variant="caption" style={isAssigned ? { color: theme.primary } : {}}>
                          {member.name}
                        </AppText>
                        <AppText variant="caption" style={{ fontSize: 10, color: theme.textMuted }}>
                          {member.title ? member.title.split(' ')[0] : 'Team'}
                        </AppText>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Follow-up Due Date */}
            <View style={styles.fieldGroup}>
              <View style={styles.followUpHeaderRow}>
                <AppText variant="caption" weight="bold" color="secondary">
                  FOLLOW-UP DUE DATE
                </AppText>
                <AppText variant="caption" weight="semibold" style={{ color: theme.primary }}>
                  {formattedFollowUpDate}
                </AppText>
              </View>

              <View style={styles.chipsWrap}>
                {[
                  { label: 'Tomorrow (+1d)', days: 1 },
                  { label: 'In 3 Days (+3d)', days: 3 },
                  { label: 'Next Week (+7d)', days: 7 },
                  { label: 'In 2 Weeks (+14d)', days: 14 },
                ].map((opt) => (
                  <Chip
                    key={opt.days}
                    label={opt.label}
                    selected={followUpDateOffsetDays === opt.days}
                    onPress={() => setFollowUpDateOffsetDays(opt.days)}
                    size="sm"
                  />
                ))}
              </View>
            </View>
          </CardContent>
        </Card>

        {/* ============================================================ */}
        {/* SECTION 4: NOTES                                             */}
        {/* ============================================================ */}
        <Card variant="elevated" density="comfortable" style={styles.sectionCard}>
          <CardHeader style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Icon name="MessageSquare" size={18} color={theme.primary} />
              <CardTitle level={2}>NOTES</CardTitle>
            </View>
          </CardHeader>

          <CardContent style={styles.sectionContent}>
            {/* Quick Tag Chips */}
            <View style={styles.chipsWrap}>
              {QUICK_NOTE_TAGS.map((tag) => (
                <Button
                  key={tag}
                  label={`+ ${tag}`}
                  variant="subtle"
                  size="sm"
                  onPress={() => handleAppendNoteTag(tag)}
                />
              ))}
            </View>

            {/* Multiline Notes Input */}
            <Input
              value={notes}
              onChangeText={setNotes}
              placeholder="Record immediate discussion takeaways, specific product requirements, and follow-up commitments…"
              multiline
              numberOfLines={4}
              style={{ minHeight: 80 }}
            />
          </CardContent>
        </Card>

        {/* ============================================================ */}
        {/* ============================================================ */}
        {/* SECTION 5: ATTACHMENTS                                       */}
        {/* ============================================================ */}
        <Card variant="elevated" density="comfortable" style={styles.sectionCard}>
          <CardHeader style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Icon name="Paperclip" size={18} color={theme.primary} />
              <CardTitle level={2}>ATTACHMENTS</CardTitle>
            </View>
            <Badge
              label={`${(draft.cardImageUri ? 1 : 0) + (recordedVoiceUri ? 1 : 0) + additionalPhotos.length} ATTACHED`}
              variant="outline"
              size="sm"
            />
          </CardHeader>

          <CardContent style={styles.sectionContent}>
            {/* Card Scan Thumbnail Pill */}
            {draft.cardImageUri && (
              <View style={[styles.attachmentPill, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                <Image source={{ uri: draft.cardImageUri }} style={styles.attachmentImg} contentFit="cover" />
                <View style={{ flex: 1, gap: 1 }}>
                  <AppText weight="bold" variant="caption">
                    Business Card Scan (Front)
                  </AppText>
                  <AppText variant="caption" color="secondary">
                    Machine vision OCR verified
                  </AppText>
                </View>
                <IconButton
                  icon="Maximize2"
                  size="sm"
                  variant="ghost"
                  accessibilityLabel="Preview card image"
                  onPress={() => {
                    setPreviewModalUri(draft.cardImageUri || null);
                    setShowCardModal(true);
                  }}
                />
              </View>
            )}

            {/* In-Line Voice Memo Recorder / Player */}
            {recordedVoiceUri ? (
              <View style={{ gap: 4 }}>
                <VoiceNotePlayer
                  audioUri={recordedVoiceUri}
                  durationSeconds={voiceDuration}
                  waveform={voiceWaveform}
                  transcript={voiceTranscript}
                  showDelete
                  onDelete={() => {
                    setRecordedVoiceUri(null);
                    setVoiceDuration(0);
                    setVoiceTranscript(undefined);
                  }}
                />
              </View>
            ) : showVoiceRecorder ? (
              <VoiceNoteRecorder
                onSaveVoiceNote={(uri, dur, trans, wave) => {
                  setRecordedVoiceUri(uri);
                  setVoiceDuration(dur);
                  setVoiceTranscript(trans);
                  setVoiceWaveform(wave);
                  setShowVoiceRecorder(false);
                }}
                onCancel={() => setShowVoiceRecorder(false)}
                title="Record Audio Memo for Lead"
              />
            ) : (
              <Button
                label="+ Record Voice Memo (Expo Audio)"
                variant="outline"
                size="sm"
                leftIcon="Mic"
                onPress={() => setShowVoiceRecorder(true)}
              />
            )}

            <Divider />

            {/* Photo Attachments Controls */}
            <View style={styles.photoSectionHeader}>
              <AppText variant="caption" weight="bold" color="secondary">
                ADDITIONAL PHOTOS ({additionalPhotos.length})
              </AppText>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <Button
                  label="Take Photo"
                  variant="subtle"
                  size="sm"
                  leftIcon="Camera"
                  onPress={handleCapturePhoto}
                />
                <Button
                  label="Pick Photo"
                  variant="subtle"
                  size="sm"
                  leftIcon="Image"
                  onPress={handlePickPhoto}
                />
              </View>
            </View>

            {/* Attached Photos List */}
            {additionalPhotos.map((photoUri, index) => (
              <View
                key={`${photoUri}-${index}`}
                style={[styles.attachmentPill, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                <Image source={{ uri: photoUri }} style={styles.attachmentImg} contentFit="cover" />
                <View style={{ flex: 1, gap: 1 }}>
                  <AppText weight="bold" variant="caption">
                    Attached Photo #{index + 1}
                  </AppText>
                  <AppText variant="caption" color="secondary">
                    Booth / Badge / Catalog collateral
                  </AppText>
                </View>
                <IconButton
                  icon="Maximize2"
                  size="sm"
                  variant="ghost"
                  accessibilityLabel="Preview photo"
                  onPress={() => {
                    setPreviewModalUri(photoUri);
                    setShowCardModal(true);
                  }}
                />
                <IconButton
                  icon="Trash2"
                  size="sm"
                  variant="ghost"
                  accessibilityLabel="Delete photo"
                  onPress={() => handleRemovePhoto(index)}
                />
              </View>
            ))}
          </CardContent>
        </Card>

        {/* ============================================================ */}
        {/* BOTTOM ACTIONS BAR                                           */}
        {/* ============================================================ */}
        <View style={styles.actionsBar}>
          <Button
            label="Save Lead"
            variant="primary"
            size="lg"
            leftIcon="Check"
            onPress={() => handleSave(false)}
            loading={isSaving}
            style={{ flex: 1 }}
          />

          <Button
            label="Save & Scan Next"
            variant="outline"
            size="lg"
            leftIcon="Zap"
            onPress={() => handleSave(true)}
            loading={isSaving}
          />
        </View>

        <Button
          label="Retake Photo"
          variant="ghost"
          size="sm"
          leftIcon="RotateCcw"
          onPress={onRetake}
          style={{ marginTop: Spacing.xs }}
        />
      </ScrollView>

      {/* Card / Photo Image Zoom Modal */}
      <Modal
        visible={showCardModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowCardModal(false);
          setPreviewModalUri(null);
        }}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalHeader}>
            <AppText weight="bold" variant="body" style={{ color: '#FFFFFF' }}>
              {previewModalUri && previewModalUri !== draft.cardImageUri
                ? 'Photo Attachment'
                : 'Scanned Business Card'}
            </AppText>
            <IconButton
              icon="X"
              size="md"
              variant="ghost"
              accessibilityLabel="Close image preview"
              onPress={() => {
                setShowCardModal(false);
                setPreviewModalUri(null);
              }}
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            />
          </View>
          {(previewModalUri || draft.cardImageUri) && (
            <Image
              source={{ uri: previewModalUri || draft.cardImageUri }}
              style={styles.modalImage}
              contentFit="contain"
            />
          )}
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    gap: Spacing.md,
    paddingBottom: Spacing['2xl'],
  },
  previewCard: {
    borderRadius: Radius.large,
    gap: Spacing.xs,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.xs,
  },
  cardThumbPressable: {
    width: 84,
    height: 52,
    borderRadius: Radius.small,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  cardThumb: {
    width: '100%',
    height: '100%',
  },
  cardZoomBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderRadius: Radius.full,
    padding: 3,
  },
  previewMetaCol: {
    flex: 1,
    gap: 4,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  rawTextToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    borderTopWidth: 1,
  },
  rawTextBox: {
    padding: Spacing.sm,
    borderRadius: Radius.small,
    marginTop: 4,
  },
  rawTextContent: {
    fontSize: 11,
    lineHeight: 16,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  sectionCard: {
    borderRadius: Radius.large,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing.xs,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  sectionContent: {
    gap: Spacing.sm,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  col: {
    flex: 1,
  },
  fieldGroup: {
    gap: 6,
  },
  tempBoxesRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  tempBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: Radius.medium,
    borderWidth: 1.5,
    gap: 2,
  },
  tempEmoji: {
    fontSize: 20,
  },
  tempDesc: {
    fontSize: 9,
    color: '#64748B',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  hallChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  hallChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  teamRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: 2,
  },
  memberPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1.5,
  },
  followUpHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attachmentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radius.medium,
    borderWidth: 1,
  },
  attachmentImg: {
    width: 48,
    height: 32,
    borderRadius: 4,
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  confirmationScroll: {
    padding: Spacing.md,
    gap: Spacing.md,
    paddingBottom: Spacing['2xl'],
  },
  confirmHeaderBlock: {
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.lg,
  },
  confirmIconRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  confirmCard: {
    borderRadius: Radius.large,
    gap: Spacing.md,
  },
  confirmTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  confirmNameBadges: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confirmBadgesRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  confirmContextBox: {
    padding: Spacing.sm,
    borderRadius: Radius.medium,
    gap: 6,
  },
  confirmContextItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  confirmNoteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: Spacing.sm,
    borderRadius: Radius.medium,
    borderWidth: 1,
  },
  confirmAttachmentsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    flexWrap: 'wrap',
  },
  photoSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  confirmActionsCol: {
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.94)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    top: 48,
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 10,
  },
  modalImage: {
    width: '100%',
    height: '75%',
    borderRadius: Radius.medium,
  },
});
