export type UrgencyLevel = 'RED' | 'YELLOW' | 'GREEN';

export interface UrgencyInfo {
  level: UrgencyLevel;
  label: 'Action Required Now' | 'Action Needed Soon' | 'Informational Only';
  reason: string;
}

export interface DeadlineItem {
  id: string;
  title: string;
  date: string;
  daysRemainingNote?: string;
  urgency: 'red' | 'yellow' | 'green' | 'none';
}

export interface GlossaryItem {
  term: string;
  explanation: string;
}

export interface ActionItem {
  id: string;
  text: string;
}

export type SupportedLanguage = 'en' | 'hi' | 'kn';

export interface TranslatedContent {
  summary: string;
  whatThisMeansForYou: string;
  urgencyReason: string;
  actionItems: string[];
  glossary?: GlossaryItem[];
}

export interface UnreadableResult {
  isLegible: false;
  unreadableReason: string;
  qualityGuidance?: string[];
  detectedIssues?: string[];
  filePreviewUrl?: string;
  fileName?: string;
}

export interface SimplifiedResult {
  id: string;
  title: string;
  timestamp: number;
  originalText?: string;
  detectedSourceLanguage?: string;
  fileInfo?: {
    name: string;
    type: string;
    sizeFormatted: string;
    previewUrl?: string;
  };
  urgency: UrgencyInfo;
  summary: string;
  whatThisMeansForYou: string;
  actionItems: ActionItem[];
  deadlines: DeadlineItem[];
  glossary: GlossaryItem[];
  hasNoDeadlines: boolean;
  hasNoActions: boolean;
  translations?: Partial<Record<SupportedLanguage, TranslatedContent>>;
}

export interface SampleDocument {
  id: string;
  title: string;
  category: string;
  urgencyHint: 'RED' | 'YELLOW' | 'GREEN' | 'UNREADABLE';
  badgeNote: string;
  type: 'text' | 'image';
  text?: string;
  imageDataUrl?: string;
  imageFileName?: string;
  description: string;
}
