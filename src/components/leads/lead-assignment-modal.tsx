import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import {
  AppText,
  Avatar,
  Badge,
  BottomSheet,
  Icon,
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { mockTeamMembers } from '@/repositories/mocks/team.mock';
import { Colors, Radius, Shadows, Spacing } from '@/theme';
import { TeamMember } from '@/types/team';

interface LeadAssignmentModalProps {
  visible: boolean;
  onClose: () => void;
  currentAssigneeId?: string;
  onAssignMember: (member: TeamMember) => void;
}

export function LeadAssignmentModal({
  visible,
  onClose,
  currentAssigneeId,
  onAssignMember,
}: LeadAssignmentModalProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      maxHeightPercent={0.75}
      title="Assign Lead to Team Member">
      <View style={styles.container}>
        <AppText variant="caption" color="secondary">
          Route this contact to the appropriate sales specialist or booth account executive:
        </AppText>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}>
          {mockTeamMembers.map((member) => {
            const isAssigned =
              currentAssigneeId === member.userId || currentAssigneeId === member.id;

            return (
              <Pressable
                key={member.id}
                accessibilityRole="button"
                accessibilityLabel={`Assign lead to ${member.name}`}
                onPress={() => {
                  onAssignMember(member);
                  onClose();
                }}
                style={({ pressed }) => [
                  styles.memberCard,
                  {
                    backgroundColor: isAssigned ? theme.primarySubtle : theme.surface,
                    borderColor: isAssigned ? theme.primary : theme.border,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  },
                  isAssigned && Shadows.subtle,
                ]}>
                <Avatar name={member.name} size="md" />

                <View style={styles.memberInfoCol}>
                  <View style={styles.memberNameRow}>
                    <AppText weight="bold" variant="body">
                      {member.name}
                    </AppText>
                    {isAssigned && (
                      <Badge label="CURRENT ASSIGNEE" variant="primary" size="sm" showDot />
                    )}
                  </View>
                  <AppText variant="caption" color="secondary" numberOfLines={1}>
                    {member.title || member.role.replace('_', ' ').toUpperCase()}
                  </AppText>
                  <AppText variant="caption" color="muted" style={{ fontSize: 11 }}>
                    {member.leadsCapturedCount} active leads • {member.email}
                  </AppText>
                </View>

                <Icon
                  name={isAssigned ? 'CheckCircle2' : 'ChevronRight'}
                  size={20}
                  color={isAssigned ? theme.primary : theme.textMuted}
                />
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    flex: 1,
  },
  listContainer: {
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: Radius.medium,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  memberInfoCol: {
    flex: 1,
    gap: 2,
  },
  memberNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
