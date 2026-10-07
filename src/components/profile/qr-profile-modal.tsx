import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  View,
} from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import {
  AppText,
  Badge,
  Button,
  CardTitle,
  Divider,
  IconButton,
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Radius, Shadows, Spacing } from '@/theme';
import { AuthUser } from '@/types/auth';
import { generateQrMatrix } from '@/utils/qr-generator';

interface QrProfileModalProps {
  visible: boolean;
  onClose: () => void;
  user: AuthUser | null;
  boothLocation?: string;
  eventName?: string;
}

export function QrProfileModal({
  visible,
  onClose,
  user,
  boothLocation = 'Booth #4209',
  eventName = 'CES 2026 Las Vegas',
}: QrProfileModalProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const [copied, setCopied] = useState(false);

  const name = user?.name || 'Alex Mercer';
  const email = user?.email || 'alex@acme.io';
  const phone = user?.phone || '+1 (415) 555-0182';
  const company = user?.company || 'Acme Corporation';
  const title = user?.title || 'VP of Global Events';
  const website = user?.website || 'https://acme.io';

  const vCardString = useMemo(() => {
    return [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${name}`,
      `ORG:${company}`,
      `TITLE:${title}`,
      `TEL;TYPE=CELL:${phone}`,
      `EMAIL:${email}`,
      `URL:${website}`,
      `NOTE:Trade Show Contact - ${eventName} (${boothLocation})`,
      'END:VCARD',
    ].join('\n');
  }, [name, company, title, phone, email, website, eventName, boothLocation]);

  const matrix = useMemo(() => generateQrMatrix(vCardString), [vCardString]);
  const matrixSize = matrix.length;
  const pixelSize = 7;
  const qrSvgSize = matrixSize * pixelSize;

  const handleCopyVCard = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    Alert.alert('vCard Copied', 'Contact info ready to paste or import into address book.');
  };

  const handleShare = () => {
    Alert.alert('Share Business Card', `Sharing digital badge for ${name} (${company}).`);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
            Shadows.modal,
          ]}>
          <View style={styles.headerRow}>
            <View style={{ gap: 2 }}>
              <CardTitle level={2}>Attendee Pass & QR</CardTitle>
              <AppText variant="caption" color="secondary">
                Scan to instantly save contact into smartphone address book
              </AppText>
            </View>
            <IconButton
              icon="X"
              size="sm"
              variant="ghost"
              accessibilityLabel="Close QR profile modal"
              onPress={onClose}
            />
          </View>

          {/* QR Code Container */}
          <View style={styles.qrContainer}>
            <View style={styles.qrWhiteBox}>
              <Svg width={qrSvgSize} height={qrSvgSize} viewBox={`0 0 ${qrSvgSize} ${qrSvgSize}`}>
                <Rect x="0" y="0" width={qrSvgSize} height={qrSvgSize} fill="#FFFFFF" />
                {matrix.map((row, r) =>
                  row.map((filled, c) =>
                    filled ? (
                      <Rect
                        key={`${r}-${c}`}
                        x={c * pixelSize}
                        y={r * pixelSize}
                        width={pixelSize}
                        height={pixelSize}
                        fill="#0F172A"
                      />
                    ) : null
                  )
                )}
              </Svg>
            </View>
            <Badge label="NFC & vCard 3.0" variant="primary" size="sm" showDot />
          </View>

          {/* Attendee Summary */}
          <View style={[styles.attendeeBox, { backgroundColor: theme.surfaceSubtle }]}>
            <View style={styles.nameRow}>
              <AppText weight="bold" variant="body">
                {name}
              </AppText>
              <Badge label="VERIFIED" variant="success" size="sm" />
            </View>
            <AppText variant="caption" color="secondary">
              {title} • {company}
            </AppText>
            <AppText variant="caption" color="muted" style={{ fontSize: 11 }}>
              {email} • {phone}
            </AppText>
            <AppText variant="caption" color="primary" weight="medium" style={{ fontSize: 11 }}>
              📍 {eventName} • {boothLocation}
            </AppText>
          </View>

          <Divider />

          {/* Actions */}
          <View style={styles.actionsRow}>
            <Button
              label={copied ? 'vCard Copied!' : 'Copy vCard'}
              variant="outline"
              size="md"
              leftIcon="Copy"
              onPress={handleCopyVCard}
            />
            <Button
              label="Share Card"
              variant="primary"
              size="md"
              leftIcon="Share2"
              onPress={handleShare}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    padding: Spacing.lg,
    borderRadius: Radius.large,
    borderWidth: 1,
    gap: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  qrWhiteBox: {
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.medium,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  attendeeBox: {
    padding: Spacing.sm,
    borderRadius: Radius.medium,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.xs,
  },
});
