export type VerificationStatus = 'supported' | 'contradicted' | 'unverified';
export type SubmissionStatus = 'draft' | 'under_review' | 'approved' | 'rejected' | 'publishing_hold';
export type FactStatus = 'active' | 'expired' | 'deprecated' | 'pending_review';
export type RuleSeverity = 'critical' | 'warning' | 'suggestion' | 'info';

export interface BrandColor {
  hex: string;
  name: string;
  role: 'primary' | 'secondary' | 'accent' | 'background' | 'surface' | 'neutral';
  tolerance?: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  industry: string;
  website: string;
  logoUrl: string;
  primaryFont: string;
  headingFont: string;
  colors: BrandColor[];
  toneGuidelines: string;
}

export interface ApprovedFact {
  id: string; // e.g. "FACT-101"
  brandId: string;
  category: 'product' | 'pricing' | 'security' | 'compliance' | 'company_metrics' | 'integrations' | 'support';
  statement: string;
  supportingSource: string;
  sourceCitation?: string;
  approvalDate: string; // YYYY-MM-DD
  expiryDate?: string; // YYYY-MM-DD
  status: FactStatus;
  notes?: string;
}

export interface BrandVoiceRule {
  id: string;
  brandId: string;
  ruleType: 'banned_word' | 'preferred_term' | 'tone_rule' | 'required_disclaimer';
  originalPhrase: string;
  preferredAlternative: string;
  reason: string;
  severity: RuleSeverity;
  isActive: boolean;
}

export interface BrandAsset {
  id: string;
  brandId: string;
  assetType: 'primary_logo' | 'secondary_logo' | 'monochrome_logo' | 'palette_color' | 'typography';
  name: string;
  value: string;
  roleDescription?: string;
  minContrastRatio?: number;
  minSizePx?: number;
}

export interface ClaimResult {
  id: string;
  claimText: string;
  verificationStatus: VerificationStatus;
  factId?: string;
  factStatement?: string;
  confidenceScore: number;
  explanation: string;
  evidenceSnippet?: string;
  sourceReference?: string;
  severity: RuleSeverity;
}

export interface FreshnessIssue {
  id: string;
  claimText: string;
  factId: string;
  factStatement: string;
  expiryDate: string;
  daysExpired: number;
  explanation: string;
  severity: 'critical' | 'warning';
}

export interface VoiceIssue {
  id: string;
  matchedText: string;
  ruleType: string;
  preferredAlternative?: string;
  explanation: string;
  reason?: string;
  severity: RuleSeverity;
}

export interface VisualIssue {
  id: string;
  title: string;
  detectedColor?: string;
  nearestApprovedColor?: string;
  contrastRatio?: number;
  explanation: string;
  severity: RuleSeverity;
}

export interface PaletteExtraction {
  hex: string;
  percent: number;
  isApproved: boolean;
  closestApproved?: string;
  name?: string;
}

export interface AnalysisReport {
  id: string;
  submissionId: string;
  brandId: string;
  title: string;
  channel: string;
  overallScore: number; // 0 - 100
  claimAccuracyScore: number; // Weight: 35%
  freshnessScore: number; // Weight: 20%
  brandVoiceScore: number; // Weight: 20%
  visualScore: number; // Weight: 25%
  publishingHold: boolean;
  holdReason?: string;
  summary: string;
  claims: ClaimResult[];
  freshnessIssues: FreshnessIssue[];
  voiceIssues: VoiceIssue[];
  visualIssues: VisualIssue[];
  extractedPalette?: PaletteExtraction[];
  createdAt: string;
}

export interface ContentSubmission {
  id: string;
  brandId: string;
  title: string;
  channel: 'press_release' | 'landing_page' | 'social_ad' | 'email_campaign' | 'sales_deck' | 'blog_post';
  rawContent: string;
  imageUrl?: string;
  authorName: string;
  authorRole: string;
  status: SubmissionStatus;
  reportId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalDecision {
  id: string;
  submissionId: string;
  reviewerName: string;
  reviewerRole: string;
  decision: 'approved' | 'rejected' | 'changes_requested' | 'emergency_override';
  notes: string;
  digitalSignature: string;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  brandId: string;
  submissionId?: string;
  actorName: string;
  actorRole: string;
  actionType:
    | 'CLAIM_VERIFIED'
    | 'DRAFT_SUBMITTED'
    | 'DRAFT_APPROVED'
    | 'DRAFT_REJECTED'
    | 'FACT_ADDED'
    | 'FACT_UPDATED'
    | 'FACT_DELETED'
    | 'RULE_ADDED'
    | 'RULE_UPDATED'
    | 'OVERRIDE_GRANTED'
    | 'GUIDELINE_UPLOADED'
    | 'BRAND_UPDATED';
  entityType: string;
  entityId: string;
  details: Record<string, any>;
  timestamp: string;
}
