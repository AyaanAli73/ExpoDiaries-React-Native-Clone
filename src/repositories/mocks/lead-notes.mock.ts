import { LeadNote } from '@/types/lead-note';

export const mockLeadNotes: LeadNote[] = [
  {
    id: 'note-1',
    leadId: 'lead-101',
    authorId: 'usr-alex-1',
    authorName: 'Alex Mercer',
    content: 'Marcus indicated they have budget approved for $120k ARR. Key competitor is LegacyTelemetry Corp.',
    isPrivate: false,
    createdAt: '2026-10-16T10:30:00.000Z',
    updatedAt: '2026-10-16T10:30:00.000Z',
  },
  {
    id: 'note-2',
    leadId: 'lead-101',
    authorId: 'usr-david-3',
    authorName: 'David Chen',
    content: 'Sent calendar invite for technical discovery session on Tuesday October 21st.',
    isPrivate: false,
    createdAt: '2026-10-16T14:15:00.000Z',
    updatedAt: '2026-10-16T14:15:00.000Z',
  },
  {
    id: 'note-3',
    leadId: 'lead-102',
    authorId: 'usr-elena-2',
    authorName: 'Elena Rostova',
    content: 'Samantha is evaluating 3 vendors. Wants our SOC2 Type II certification and HIPAA BAA.',
    isPrivate: false,
    createdAt: '2026-10-16T12:00:00.000Z',
    updatedAt: '2026-10-16T12:00:00.000Z',
  },
];
