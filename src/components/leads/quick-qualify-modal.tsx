import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import Animated, { FadeInDown } from 'react-native-reanimated';

import {
  AppText,
  Avatar,
  Badge,
  BottomSheet,
  Button,
  Card,
  Chip,
  Icon,
  IconButton,
  Input,
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { mockTeamMembers } from '@/repositories/mocks/team.mock';
import { OCRResult } from '@/services/ocr/ocr.types';
import { Colors, Radius, Shadows, Spacing } from '@/theme';
import { CreateLeadInput, LeadPriority } from '@/types/lead';

import { VoiceNoteRecorder } from './voice-note-recorder';

interface QuickQualifyModalProps {
  visible: boolean;
  onClose: () => void;
  ocrResult?: OCRResult | null;
  cardImageUri?: string;
  eventId: string;
  onSaveLead: (leadInput: CreateLeadInput, openDetail?: boolean) => Promise<void>;
}

type Temperature = 'hot' | 'warm' | 'cold';

const QUICK_TAGS = [
  'Decision Maker',
  'Budget Approved',
  'Demo Requested',
  'Competitor Switch',
  'VIP Attendee',
  'Urgent Quote',
  'Partner Opportunity',
];

export function QuickQualifyModal({
  visible,
  onClose,
  ocrResult,
  cardImageUri,
  eventId,
  onSaveLead,
}: QuickQualifyModalProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  // Editable Contact Fields
  const [firstName, setFirstName] = useState(ocrResult?.fields.firstName || '');
  const [lastName, setLastName] = useState(ocrResult?.fields.lastName || '');
  const [company, setCompany] = useState(ocrResult?.fields.company || '');
  const [title, setTitle] = useState(ocrResult?.fields.title || '');
  const [email, setEmail] = useState(ocrResult?.fields.email || '');
  const [phone, setPhone] = useState(ocrResult?.fields.phone || '');
  const [website, setWebsite] = useState(ocrResult?.fields.website || '');

  // Qualification State
  const [temperature, setTemperature] = useState<Temperature>('warm');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Demo Requested']);
  const [budgetRange, setBudgetRange] = useState<
    'under_25k' | '25k_100k' | '100k_500k' | 'over_500k'
  >('25k_100k');
  const [decisionRole, setDecisionRole] = useState<
    'decision_maker' | 'influencer' | 'evaluator' | 'end_user'
  >('decision_maker');
  const [purchaseTimeline, setPurchaseTimeline] = useState<
    'immediate' | 'quarter' | 'year' | 'exploring'
  >('quarter');

  // Notes & Voice Notes
  const [notes, setNotes] = useState('');
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [voiceNoteUri, setVoiceNoteUri] = useState<string | undefined>(undefined);
  const [voiceNoteDuration, setVoiceNoteDuration] = useState<number | undefined>(undefined);
  const [voiceNoteTranscript, setVoiceNoteTranscript] = useState<string | undefined>(undefined);

  // Assignment
  const [assignedMemberId, setAssignedMemberId] = useState<string>('usr-alex-1');

  // UI States
  const [showEditFields, setShowEditFields] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state if ocrResult changes
  React.useEffect(() => {
    if (!ocrResult) return;

    const timer = setTimeout(() => {
      setFirstName(ocrResult.fields.firstName);
      setLastName(ocrResult.fields.lastName);
      setCompany(ocrResult.fields.company);
      setTitle(ocrResult.fields.title);
      setEmail(ocrResult.fields.email);
      setPhone(ocrResult.fields.phone);
      setWebsite(ocrResult.fields.website || '');
    }, 0);

    return () => clearTimeout(timer);
  }, [ocrResult]);

  // Dynamic Lead Score Calculation (0 - 100)
  const computedScore = useMemo(() => {
    let score = 40;

    // Contact completeness
    if (email) score += 10;
    if (phone) score += 10;

    // Temperature weighting
    if (temperature === 'hot') score += 25;
    else if (temperature === 'warm') score += 12;
    else score -= 10;

    // Budget & Authority
    if (budgetRange === 'over_500k' || budgetRange === '100k_500k') score += 10;
    if (decisionRole === 'decision_maker') score += 10;
    if (purchaseTimeline === 'immediate') score += 10;

    // Tags
    if (selectedTags.includes('Budget Approved')) score += 5;
    if (selectedTags.includes('Urgent Quote')) score += 5;

    return Math.min(100, Math.max(10, score));
  }, [email, phone, temperature, budgetRange, decisionRole, purchaseTimeline, selectedTags]);

  const priority: LeadPriority =
    temperature === 'hot'
      ? 'urgent'
      : temperature === 'warm'
        ? 'high'
        : 'medium';

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSave = async (openDetail = false) => {
    setIsSaving(true);

    const assignedMember = mockTeamMembers.find((m) => m.userId === assignedMemberId || m.id === assignedMemberId);

    const leadInput: CreateLeadInput = {
      eventId,
      firstName: firstName.trim() || 'Attendee',
      lastName: lastName.trim() || 'Lead',
      company: company.trim() || 'Exhibition Attendee',
      title: title.trim(),
      email: email.trim(),
      phone: phone.trim(),
      website: website.trim(),
      notes: notes.trim(),
      status: 'qualified',
      score: computedScore,
      priority,
      temperature,
      budgetRange,
      decisionRole,
      purchaseTimeline,
      tags: selectedTags,
      captureSource: ocrResult ? 'business_card' : 'manual',
      capturedByStaffId: 'usr-1',
      assignedToId: assignedMemberId,
      assignedToName: assignedMember?.name || 'Alex Mercer',
      cardImageUri,
      ocrConfidence: ocrResult?.confidence,
      ocrRawText: ocrResult?.rawText,
      voiceNoteUri,
      voiceNoteDurationSeconds: voiceNoteDuration,
      voiceNoteTranscript,
    };

    try {
      await onSaveLead(leadInput, openDetail);
      setIsSaving(false);
      onClose();
    } catch {
      setIsSaving(false);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      maxHeightPercent={0.9}
      title="Rapid Lead Qualification">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Contact Banner & OCR Confidence */}
        <Card variant="elevated" density="comfortable" style={styles.contactSummaryCard}>
          <View style={styles.contactSummaryRow}>
            {cardImageUri ? (
              <Image source={{ uri: cardImageUri }} style={styles.cardMiniThumb} contentFit="cover" />
            ) : (
              <Avatar name={`${firstName} ${lastName}`} size="lg" />
            )}

            <View style={styles.contactInfoCol}>
              <View style={styles.nameScoreRow}>
                <AppText weight="bold" variant="heading" numberOfLines={1}>
                  {firstName} {lastName}
                </AppText>
                <Badge
                  label={`SCORE ${computedScore}`}
                  variant={computedScore >= 75 ? 'success' : computedScore >= 45 ? 'warning' : 'outline'}
                  size="sm"
                  showDot
                />
              </View>

              <AppText variant="caption" weight="semibold" style={{ color: theme.primary }} numberOfLines={1}>
                {title || 'Trade Show Attendee'}
              </AppText>
              <AppText variant="caption" color="secondary" numberOfLines={1}>
                {company || 'Company'}
              </AppText>

              {/* OCR Transparency Badge */}
              {ocrResult && (
                <View style={styles.ocrInfoRow}>
                  <Badge label="MOCK OCR EXTRACTED (94% CONFIDENCE)" variant="outline" size="sm" />
                </View>
              )}
            </View>

            <IconButton
              icon={showEditFields ? 'ChevronUp' : 'Edit3'}
              size="sm"
              variant="ghost"
              accessibilityLabel={showEditFields ? 'Collapse fields' : 'Edit contact info'}
              onPress={() => setShowEditFields(!showEditFields)}
            />
          </View>

          {/* Quick-Correction Expandable Fields */}
          {showEditFields && (
            <Animated.View entering={FadeInDown.duration(200)} style={styles.editFieldsGrid}>
              <Input label="First Name" value={firstName} onChangeText={setFirstName} />
              <Input label="Last Name" value={lastName} onChangeText={setLastName} />
              <Input label="Company" value={company} onChangeText={setCompany} />
              <Input label="Job Title" value={title} onChangeText={setTitle} />
              <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
              <Input label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            </Animated.View>
          )}
        </Card>

        {/* 1-Tap Temperature Selector (Core Fast Trade Show Action) */}
        <View style={styles.section}>
          <AppText variant="caption" weight="bold" color="secondary" style={styles.sectionTitle}>
            LEAD TEMPERATURE (1-TAP HEAT QUALIFIER)
          </AppText>

          <View style={styles.tempSelectorRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Mark Hot lead"
              onPress={() => setTemperature('hot')}
              style={({ pressed }) => [
                styles.tempButton,
                {
                  borderColor: temperature === 'hot' ? theme.danger : theme.border,
                  backgroundColor: temperature === 'hot' ? theme.dangerSubtle : theme.surface,
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                },
                temperature === 'hot' && Shadows.subtle,
              ]}>
              <AppText style={styles.tempEmoji}>🔥</AppText>
              <AppText weight="bold" variant="body" style={temperature === 'hot' ? { color: theme.danger } : {}}>
                HOT
              </AppText>
              <AppText variant="caption" color="secondary" style={{ fontSize: 10 }}>
                Immediate Buy
              </AppText>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Mark Warm lead"
              onPress={() => setTemperature('warm')}
              style={({ pressed }) => [
                styles.tempButton,
                {
                  borderColor: temperature === 'warm' ? theme.warning : theme.border,
                  backgroundColor: temperature === 'warm' ? theme.warningSubtle : theme.surface,
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                },
                temperature === 'warm' && Shadows.subtle,
              ]}>
              <AppText style={styles.tempEmoji}>⚡</AppText>
              <AppText weight="bold" variant="body" style={temperature === 'warm' ? { color: theme.warning } : {}}>
                WARM
              </AppText>
              <AppText variant="caption" color="secondary" style={{ fontSize: 10 }}>
                Active Evaluation
              </AppText>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Mark Cold lead"
              onPress={() => setTemperature('cold')}
              style={({ pressed }) => [
                styles.tempButton,
                {
                  borderColor: temperature === 'cold' ? theme.primary : theme.border,
                  backgroundColor: temperature === 'cold' ? theme.primarySubtle : theme.surface,
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                },
                temperature === 'cold' && Shadows.subtle,
              ]}>
              <AppText style={styles.tempEmoji}>❄️</AppText>
              <AppText weight="bold" variant="body" style={temperature === 'cold' ? { color: theme.primary } : {}}>
                COLD
              </AppText>
              <AppText variant="caption" color="secondary" style={{ fontSize: 10 }}>
                Casual / Info Only
              </AppText>
            </Pressable>
          </View>
        </View>

        {/* Quick Qualification Tag Chips */}
        <View style={styles.section}>
          <AppText variant="caption" weight="bold" color="secondary" style={styles.sectionTitle}>
            FIELD QUALIFICATION SIGNALS
          </AppText>
          <View style={styles.tagsWrapRow}>
            {QUICK_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <Chip
                  key={tag}
                  label={tag}
                  selected={isSelected}
                  onPress={() => toggleTag(tag)}
                  size="sm"
                />
              );
            })}
          </View>
        </View>

        {/* BANT Parameters (Fast Selectors) */}
        <View style={styles.section}>
          <AppText variant="caption" weight="bold" color="secondary" style={styles.sectionTitle}>
            BUDGET & PURCHASING TIMELINE
          </AppText>

          <View style={styles.bantRow}>
            <View style={styles.bantCol}>
              <AppText variant="caption" color="secondary">
                Budget Range:
              </AppText>
              <View style={styles.miniChipsRow}>
                {(['under_25k', '25k_100k', '100k_500k', 'over_500k'] as const).map((b) => (
                  <Chip
                    key={b}
                    label={b === 'under_25k' ? '<$25k' : b === '25k_100k' ? '$25k-$100k' : b === '100k_500k' ? '$100k-$500k' : '$500k+'}
                    selected={budgetRange === b}
                    onPress={() => setBudgetRange(b)}
                    size="sm"
                  />
                ))}
              </View>
            </View>

            <View style={styles.bantCol}>
              <AppText variant="caption" color="secondary">
                Role Authority:
              </AppText>
              <View style={styles.miniChipsRow}>
                {(['decision_maker', 'influencer', 'evaluator', 'end_user'] as const).map((r) => (
                  <Chip
                    key={r}
                    label={
                      r === 'decision_maker'
                        ? 'Decision Maker'
                        : r === 'influencer'
                          ? 'Influencer'
                          : r === 'evaluator'
                            ? 'Evaluator'
                            : 'End User'
                    }
                    selected={decisionRole === r}
                    onPress={() => setDecisionRole(r)}
                    size="sm"
                  />
                ))}
              </View>
            </View>

            <View style={styles.bantCol}>
              <AppText variant="caption" color="secondary">
                Timeline:
              </AppText>
              <View style={styles.miniChipsRow}>
                {(['immediate', 'quarter', 'year', 'exploring'] as const).map((t) => (
                  <Chip
                    key={t}
                    label={t === 'immediate' ? '<30 Days' : t === 'quarter' ? 'This Quarter' : t === 'year' ? 'Next Year' : 'Exploring'}
                    selected={purchaseTimeline === t}
                    onPress={() => setPurchaseTimeline(t)}
                    size="sm"
                  />
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Lead Assignment Foundation */}
        <View style={styles.section}>
          <AppText variant="caption" weight="bold" color="secondary" style={styles.sectionTitle}>
            ASSIGN LEAD TO BOOTH REP
          </AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.assigneesRow}>
            {mockTeamMembers.slice(0, 4).map((member) => {
              const isSelected = assignedMemberId === member.userId || assignedMemberId === member.id;
              return (
                <Pressable
                  key={member.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Assign to ${member.name}`}
                  onPress={() => setAssignedMemberId(member.userId)}
                  style={[
                    styles.assigneePill,
                    {
                      borderColor: isSelected ? theme.primary : theme.border,
                      backgroundColor: isSelected ? theme.primarySubtle : theme.surface,
                    },
                  ]}>
                  <Avatar name={member.name} size="sm" />
                  <View style={{ gap: 1 }}>
                    <AppText variant="caption" weight={isSelected ? 'bold' : 'medium'}>
                      {member.name.split(' ')[0]}
                    </AppText>
                    <AppText variant="caption" color="secondary" style={{ fontSize: 9 }}>
                      {member.role === 'admin' ? 'Lead AE' : 'Booth Rep'}
                    </AppText>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Voice Note & Quick Notes */}
        <View style={styles.section}>
          <View style={styles.notesHeaderRow}>
            <AppText variant="caption" weight="bold" color="secondary">
              ON-FLOOR BOOTH OBSERVATIONS
            </AppText>
            <Button
              label={showVoiceRecorder ? 'Hide Mic' : '+ Voice Memo'}
              variant="outline"
              size="sm"
              leftIcon="Mic"
              onPress={() => setShowVoiceRecorder(!showVoiceRecorder)}
            />
          </View>

          {showVoiceRecorder && (
            <Animated.View entering={FadeInDown.duration(200)} style={{ marginBottom: Spacing.sm }}>
              <VoiceNoteRecorder
                onSaveVoiceNote={(uri, dur, trans) => {
                  setVoiceNoteUri(uri);
                  setVoiceNoteDuration(dur);
                  setVoiceNoteTranscript(trans);
                  setShowVoiceRecorder(false);
                }}
                onCancel={() => setShowVoiceRecorder(false)}
              />
            </Animated.View>
          )}

          {voiceNoteUri && (
            <View style={[styles.recordedAudioPill, { backgroundColor: theme.primarySubtle, borderColor: theme.primary }]}>
              <Icon name="Mic" size={16} color={theme.primary} />
              <View style={{ flex: 1 }}>
                <AppText variant="caption" weight="bold" style={{ color: theme.primary }}>
                  Voice Memo Attached ({voiceNoteDuration}s)
                </AppText>
                <AppText variant="caption" numberOfLines={1} color="secondary">
                  {voiceNoteTranscript || 'Audio note saved.'}
                </AppText>
              </View>
              <IconButton
                icon="X"
                size="sm"
                variant="ghost"
                accessibilityLabel="Remove voice note"
                onPress={() => {
                  setVoiceNoteUri(undefined);
                  setVoiceNoteDuration(undefined);
                  setVoiceNoteTranscript(undefined);
                }}
              />
            </View>
          )}

          <Input
            placeholder="Type quick trade show notes (e.g. Needs pricing deck by Monday)…"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Action Buttons: 1-Tap Save & Next vs Full Profile */}
        <View style={styles.footerActions}>
          <Button
            label={isSaving ? 'Recording…' : 'Save & Next Lead ⚡'}
            variant="primary"
            size="lg"
            loading={isSaving}
            onPress={() => handleSave(false)}
            style={{ flex: 1 }}
          />
          <Button
            label="Save & Open Profile"
            variant="outline"
            size="lg"
            disabled={isSaving}
            onPress={() => handleSave(true)}
          />
        </View>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing['2xl'],
    gap: Spacing.md,
  },
  contactSummaryCard: {
    borderRadius: Radius.large,
  },
  contactSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  cardMiniThumb: {
    width: 64,
    height: 48,
    borderRadius: Radius.small,
  },
  contactInfoCol: {
    flex: 1,
    gap: 2,
  },
  nameScoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ocrInfoRow: {
    paddingTop: 2,
  },
  editFieldsGrid: {
    gap: Spacing.xs,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
    marginTop: Spacing.sm,
  },
  section: {
    gap: Spacing.xs,
  },
  sectionTitle: {
    letterSpacing: 0.5,
  },
  tempSelectorRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  tempButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: 4,
    borderRadius: Radius.medium,
    borderWidth: 2,
    gap: 2,
  },
  tempEmoji: {
    fontSize: 20,
  },
  tagsWrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  bantRow: {
    gap: Spacing.sm,
  },
  bantCol: {
    gap: 4,
  },
  miniChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  assigneesRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: 2,
  },
  assigneePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  notesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordedAudioPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.medium,
    borderWidth: 1,
  },
  footerActions: {
    flexDirection: 'column',
    gap: Spacing.xs,
    paddingTop: Spacing.sm,
  },
});
