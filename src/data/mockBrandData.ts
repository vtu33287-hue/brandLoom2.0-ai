import { Brand, ApprovedFact, BrandVoiceRule, BrandAsset, ContentSubmission, AnalysisReport, AuditLog } from '../types/brandloom';

export const INITIAL_BRANDS: Brand[] = [
  {
    id: 'brand-neosframe',
    name: 'Neosframe',
    slug: 'neosframe',
    tagline: "Creative Automation Platform for Retail Marketing",
    description: "Enterprise content scaling and dynamic creative optimization engine.",
    industry: 'Marketing Technology / SaaS',
    website: 'https://neosframe.ai',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
    primaryFont: 'Inter, system-ui, sans-serif',
    headingFont: 'Plus Jakarta Sans, sans-serif',
    colors: [
      { hex: '#0B132B', name: 'Midnight Navy', role: 'primary', tolerance: 15 },
      { hex: '#4F46E5', name: 'Electric Indigo', role: 'accent', tolerance: 18 },
      { hex: '#7C3AED', name: 'Vibrant Violet', role: 'secondary', tolerance: 18 },
      { hex: '#059669', name: 'Verified Emerald', role: 'accent', tolerance: 20 },
      { hex: '#F8FAFC', name: 'Alabaster Canvas', role: 'background', tolerance: 10 },
      { hex: '#1E293B', name: 'Slate Core', role: 'surface', tolerance: 15 },
    ],
    toneGuidelines: 'Clear, authoritative, product-grounded, and legally conservative. Eliminate hyperbole, absolute zero-defect claims, and ungrounded comparative superlatives.'
  },
  {
    id: 'brand-novapay',
    name: 'NovaPay Global',
    slug: 'novapay',
    tagline: 'Next-Generation Cross-Border Treasury Infrastructure',
    description: 'Real-time multi-currency corporate settlement network.',
    industry: 'FinTech / Payments',
    website: 'https://novapay.global',
    logoUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&auto=format&fit=crop&q=80',
    primaryFont: 'Inter, sans-serif',
    headingFont: 'Space Grotesk, sans-serif',
    colors: [
      { hex: '#091E3A', name: 'Deep Harbor', role: 'primary', tolerance: 15 },
      { hex: '#0284C7', name: 'Ocean Cyan', role: 'accent', tolerance: 15 },
      { hex: '#10B981', name: 'Mint Mint', role: 'secondary', tolerance: 18 },
      { hex: '#0F172A', name: 'Obsidian Text', role: 'surface', tolerance: 12 },
    ],
    toneGuidelines: 'Institutional, risk-aware, mathematically sound, compliance-first. Strictly avoid speculative crypto terminology.'
  }
];

export const INITIAL_FACTS: ApprovedFact[] = [
  {
    id: 'FACT-101',
    brandId: 'brand-neosframe',
    category: 'integrations',
    statement: 'Neosframe supports 48 native marketing integrations across DAM, CMS, and Ad Networks as of Q3 2026.',
    supportingSource: 'Product Architecture Specification v2026.3, Section 4.2',
    sourceCitation: 'Neosframe Engineering Knowledge Base & Production Matrix (Verified Sept 2026)',
    approvalDate: '2026-09-01',
    expiryDate: '2027-03-31',
    status: 'active',
    notes: 'Includes Figma, Adobe CC, Shopify Plus, Meta Ads, TikTok Business, and Salesforce Marketing Cloud.'
  },
  {
    id: 'FACT-102',
    brandId: 'brand-neosframe',
    category: 'security',
    statement: 'Enterprise plan guarantees a 99.95% uptime SLA with active multi-region AWS failover.',
    supportingSource: 'Master Services Agreement & SLA Addendum 2026',
    sourceCitation: 'Legal Document #MSA-2026-E04, Clause 8.1',
    approvalDate: '2026-01-15',
    expiryDate: '2027-01-15',
    status: 'active',
    notes: 'Excludes planned maintenance announced 72 hours in advance.'
  },
  {
    id: 'FACT-103',
    brandId: 'brand-neosframe',
    category: 'compliance',
    statement: 'Fully certified for SOC-2 Type II and ISO/IEC 27001:2022 standards.',
    supportingSource: 'Schellman & Co. Independent Auditor Report',
    sourceCitation: 'Trust Report Ref #AUD-2026-SOC2-NEOS',
    approvalDate: '2026-02-10',
    expiryDate: '2027-02-10',
    status: 'active',
    notes: 'Continuous monitoring via Vanta compliance automation.'
  },
  {
    id: 'FACT-104',
    brandId: 'brand-neosframe',
    category: 'pricing',
    statement: 'Starter tier is priced at $49/seat/month, billed annually, and includes 10 brand workspaces.',
    supportingSource: 'Commercial Pricing Schedule Q3 2026',
    sourceCitation: 'Finance Memo #CP-2026-Q3',
    approvalDate: '2026-07-01',
    expiryDate: '2026-12-31',
    status: 'active',
    notes: 'Overage seats are $59/seat on month-to-month contracts.'
  },
  {
    id: 'FACT-105',
    brandId: 'brand-neosframe',
    category: 'product',
    statement: 'Neosframe rendering pipeline generates up to 10,000 localized retail creative variants per hour.',
    supportingSource: 'Internal Performance Benchmark Paper #BM-2026-08',
    sourceCitation: 'Neosframe Core Graphics Team Benchmarks on GPU clusters',
    approvalDate: '2026-08-12',
    expiryDate: '2027-08-12',
    status: 'active'
  },
  {
    id: 'FACT-106',
    brandId: 'brand-neosframe',
    category: 'pricing',
    statement: 'Summer Early-Adopter promotion offers a 35% discount for enterprise annual contracts.',
    supportingSource: 'Marketing Campaign Brief: Summer Retail Accelerate 2026',
    sourceCitation: 'CMO Directive #MKT-2026-SMR-35',
    approvalDate: '2026-06-01',
    expiryDate: '2026-09-30', // EXPIRED!
    status: 'expired',
    notes: 'Promotion officially concluded on September 30, 2026. Do NOT permit in new Q4 content.'
  },
  {
    id: 'FACT-107',
    brandId: 'brand-neosframe',
    category: 'security',
    statement: 'All creative assets and metadata are encrypted with AES-256 at rest and TLS 1.3 in transit.',
    supportingSource: 'Neosframe Information Security Charter, Revision 7',
    sourceCitation: 'Sec Charter Section 3.4 Data In Transit & At Rest',
    approvalDate: '2026-03-01',
    expiryDate: '2027-03-01',
    status: 'active'
  },
  {
    id: 'FACT-201',
    brandId: 'brand-novapay',
    category: 'compliance',
    statement: 'Licensed as an authorized Major Payment Institution under the MAS and FCA regimes.',
    supportingSource: 'Regulatory Filing Register #REG-2025-NP',
    sourceCitation: 'Central Bank Regulatory Registry',
    approvalDate: '2025-11-15',
    expiryDate: '2026-11-15',
    status: 'active'
  }
];

export const INITIAL_VOICE_RULES: BrandVoiceRule[] = [
  {
    id: 'VOICE-01',
    brandId: 'brand-neosframe',
    ruleType: 'banned_word',
    originalPhrase: 'cheap',
    preferredAlternative: 'cost-effective / high ROI',
    reason: "Devalues the premium enterprise positioning of the software platform.",
    severity: 'warning',
    isActive: true
  },
  {
    id: 'VOICE-02',
    brandId: 'brand-neosframe',
    ruleType: 'banned_word',
    originalPhrase: '100% bug-free',
    preferredAlternative: 'enterprise-grade reliability',
    reason: "Absolute software infallibility claims expose the company to false-advertising legal liability.",
    severity: 'critical',
    isActive: true
  },
  {
    id: 'VOICE-03',
    brandId: 'brand-neosframe',
    ruleType: 'preferred_term',
    originalPhrase: 'NeosFrame',
    preferredAlternative: 'Neosframe',
    reason: "Brand orthography is single-capitalized Neosframe, not CamelCase or spaced.",
    severity: 'warning',
    isActive: true
  },
  {
    id: 'VOICE-04',
    brandId: 'brand-neosframe',
    ruleType: 'banned_word',
    originalPhrase: 'synergy',
    preferredAlternative: 'cross-functional coordination / workflow integration',
    reason: "Exhausted corporate jargon that impairs readability and credibility.",
    severity: 'suggestion',
    isActive: true
  },
  {
    id: 'VOICE-05',
    brandId: 'brand-neosframe',
    ruleType: 'banned_word',
    originalPhrase: 'cheapest',
    preferredAlternative: 'most competitive total cost of ownership',
    reason: "Price race-to-the-bottom rhetoric conflicts with enterprise Tier-1 positioning.",
    severity: 'critical',
    isActive: true
  },
  {
    id: 'VOICE-06',
    brandId: 'brand-neosframe',
    ruleType: 'required_disclaimer',
    originalPhrase: 'uptime SLA',
    preferredAlternative: '*99.95% uptime SLA applies to Enterprise tier agreements and excludes scheduled maintenance.',
    reason: "Legal compliance requirement whenever SLA metrics are highlighted.",
    severity: 'warning',
    isActive: true
  }
];

export const INITIAL_ASSETS: BrandAsset[] = [
  {
    id: 'ASSET-01',
    brandId: 'brand-neosframe',
    assetType: 'primary_logo',
    name: 'Neosframe Horizon Mark (Vector)',
    value: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
    roleDescription: 'Primary dark background variant',
    minSizePx: 32,
    minContrastRatio: 4.5
  },
  {
    id: 'ASSET-02',
    brandId: 'brand-neosframe',
    assetType: 'palette_color',
    name: 'Midnight Navy',
    value: '#0B132B',
    roleDescription: 'Primary Brand Surface'
  },
  {
    id: 'ASSET-03',
    brandId: 'brand-neosframe',
    assetType: 'palette_color',
    name: 'Electric Indigo',
    value: '#4F46E5',
    roleDescription: 'Primary Accent & Interactive'
  },
  {
    id: 'ASSET-04',
    brandId: 'brand-neosframe',
    assetType: 'palette_color',
    name: 'Vibrant Violet',
    value: '#7C3AED',
    roleDescription: 'Secondary Accent'
  }
];

export const INITIAL_SUBMISSIONS: ContentSubmission[] = [
  {
    id: 'sub-001',
    brandId: 'brand-neosframe',
    title: 'Q4 Product Launch Press Release',
    channel: 'press_release',
    rawContent: `San Francisco, CA — NeosFrame is proud to announce the monumental launch of our next-gen retail automation suite. 

Designed to deliver unprecedented synergy across marketing departments, Neosframe now supports over 100 native integrations directly out of the box with zero setup required. We are guaranteeing our clients 100% bug-free rendering for every marketing campaign.

Best of all, our pricing is the cheapest in the SaaS industry, starting with a special 35% early-adopter summer discount for all enterprise signups. All customer data is secured with AES-256 encryption at rest and in transit. Experience our guaranteed 99.95% uptime SLA and eliminate manual retail creative production today.`,
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
    authorName: 'Marcus Vance',
    authorRole: 'Product Marketing Manager',
    status: 'publishing_hold',
    reportId: 'rep-001',
    createdAt: '2026-11-06T14:20:00Z',
    updatedAt: '2026-11-06T14:25:00Z'
  },
  {
    id: 'sub-002',
    brandId: 'brand-neosframe',
    title: 'Enterprise Trust & Cloud Security Briefing',
    channel: 'sales_deck',
    rawContent: `Security and reliability are foundational to Neosframe. Our enterprise infrastructure guarantees a 99.95% uptime SLA, supported by multi-region failover architecture.

Neosframe is independently audited and fully certified for SOC-2 Type II and ISO/IEC 27001:2022 standards. Every creative file and associated metadata is encrypted using AES-256 at rest and transmitted strictly via TLS 1.3 channels. Our high-throughput rendering pipeline handles up to 10,000 localized variants per hour with total data isolation.`,
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    authorName: 'Elena Rostova',
    authorRole: 'Chief Information Security Officer',
    status: 'approved',
    reportId: 'rep-002',
    createdAt: '2026-11-05T09:15:00Z',
    updatedAt: '2026-11-05T11:45:00Z'
  },
  {
    id: 'sub-003',
    brandId: 'brand-neosframe',
    title: 'Holiday Omnichannel Campaign Social Card',
    channel: 'social_ad',
    rawContent: `Scale your seasonal retail ad creative in seconds with Neosframe. Rated the #1 Creative Automation tool by Gartner in 2026! Starter plans start at $49/seat/month with 10 brand workspaces. Create unlimited variants without breaking the bank.`,
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
    authorName: 'Chloe Bennett',
    authorRole: 'Growth Marketing Lead',
    status: 'under_review',
    reportId: 'rep-003',
    createdAt: '2026-11-07T08:30:00Z',
    updatedAt: '2026-11-07T08:30:00Z'
  }
];

export const INITIAL_REPORTS: Record<string, AnalysisReport> = {
  'rep-001': {
    id: 'rep-001',
    submissionId: 'sub-001',
    brandId: 'brand-neosframe',
    title: 'Q4 Product Launch Press Release',
    channel: 'press_release',
    overallScore: 42,
    claimAccuracyScore: 28, // Weight 35% -> severely docked for contradiction
    freshnessScore: 30,      // Weight 20% -> expired promotion fact
    brandVoiceScore: 45,     // Weight 20% -> banned words ("cheapest", "100% bug-free", "synergy")
    visualScore: 78,         // Weight 25%
    publishingHold: true,
    holdReason: 'CRITICAL CONTRADICTION: Claim "supports over 100 native integrations" directly contradicts FACT-101 (approved: 48 native integrations). Also includes expired promotion and banned liability phrasing.',
    summary: 'The submitted draft contains 1 contradicted claim, 1 expired promotion claim, 4 voice & tone violations, and 1 capitalization error. A mandatory publishing hold is in effect until critical claims are corrected.',
    claims: [
      {
        id: 'clm-01',
        claimText: 'Neosframe now supports over 100 native integrations directly out of the box with zero setup required.',
        verificationStatus: 'contradicted',
        factId: 'FACT-101',
        factStatement: 'Neosframe supports 48 native marketing integrations across DAM, CMS, and Ad Networks as of Q3 2026.',
        confidenceScore: 98,
        explanation: 'The draft exaggerates integration availability by over 2x. Approved engineering specification #2026.3 specifies exactly 48 native integrations.',
        evidenceSnippet: 'Product Architecture Specification v2026.3, Section 4.2',
        sourceReference: 'Neosframe Engineering Knowledge Base & Production Matrix (Verified Sept 2026)',
        severity: 'critical'
      },
      {
        id: 'clm-02',
        claimText: 'Special 35% early-adopter summer discount for all enterprise signups.',
        verificationStatus: 'contradicted',
        factId: 'FACT-106',
        factStatement: 'Summer Early-Adopter promotion offers a 35% discount for enterprise annual contracts.',
        confidenceScore: 95,
        explanation: 'Fact FACT-106 expired on 2026-09-30. Offering an expired discount causes pricing disputes and revenue leakage.',
        evidenceSnippet: 'Marketing Campaign Brief: Summer Retail Accelerate 2026 (Expired Sept 30, 2026)',
        sourceReference: 'CMO Directive #MKT-2026-SMR-35',
        severity: 'critical'
      },
      {
        id: 'clm-03',
        claimText: 'All customer data is secured with AES-256 encryption at rest and in transit.',
        verificationStatus: 'supported',
        factId: 'FACT-107',
        factStatement: 'All creative assets and metadata are encrypted with AES-256 at rest and TLS 1.3 in transit.',
        confidenceScore: 96,
        explanation: 'Verified against Security Charter Revision 7. Note: in-transit encryption is specifically TLS 1.3.',
        evidenceSnippet: 'Sec Charter Section 3.4 Data In Transit & At Rest',
        sourceReference: 'Neosframe Information Security Charter, Revision 7',
        severity: 'info'
      },
      {
        id: 'clm-04',
        claimText: 'Guaranteed 99.95% uptime SLA.',
        verificationStatus: 'supported',
        factId: 'FACT-102',
        factStatement: 'Enterprise plan guarantees a 99.95% uptime SLA with active multi-region AWS failover.',
        confidenceScore: 99,
        explanation: 'Exact match with approved Master Services Agreement SLA clause.',
        evidenceSnippet: 'Legal Document #MSA-2026-E04, Clause 8.1',
        sourceReference: 'Master Services Agreement & SLA Addendum 2026',
        severity: 'info'
      }
    ],
    freshnessIssues: [
      {
        id: 'frsh-01',
        claimText: 'Special 35% early-adopter summer discount for all enterprise signups.',
        factId: 'FACT-106',
        factStatement: 'Summer Early-Adopter promotion offers a 35% discount for enterprise annual contracts (Expired 2026-09-30).',
        expiryDate: '2026-09-30',
        daysExpired: 38,
        explanation: 'This commercial fact expired 38 days ago. Marketing team has concluded this promo.',
        severity: 'critical'
      }
    ],
    voiceIssues: [
      {
        id: 'voc-01',
        matchedText: 'NeosFrame',
        ruleType: 'preferred_term',
        preferredAlternative: 'Neosframe',
        explanation: 'Brand styleguide enforces single capital "Neosframe", not camel-case.',
        severity: 'warning'
      },
      {
        id: 'voc-02',
        matchedText: '100% bug-free',
        ruleType: 'banned_word',
        preferredAlternative: 'enterprise-grade reliability',
        explanation: 'Software zero-bug claims violate legal compliance guidelines and cannot be substantiated.',
        severity: 'critical'
      },
      {
        id: 'voc-03',
        matchedText: 'cheapest',
        ruleType: 'banned_word',
        preferredAlternative: 'most competitive total cost of ownership',
        reason: 'Violates enterprise value proposition.',
        explanation: 'Commoditizes brand reputation. Replace with cost-effectiveness framing.',
        severity: 'critical'
      },
      {
        id: 'voc-04',
        matchedText: 'synergy',
        ruleType: 'banned_word',
        preferredAlternative: 'cross-functional coordination',
        explanation: 'Banned corporate buzzword.',
        severity: 'suggestion'
      }
    ],
    visualIssues: [
      {
        id: 'vis-01',
        title: 'Contrast Ratio Advisory',
        detectedColor: '#94A3B8',
        nearestApprovedColor: '#0B132B',
        contrastRatio: 3.8,
        explanation: 'Secondary typography overlay has 3.8:1 contrast on gradient background. Recommend increasing to $\\ge 4.5:1$ for WCAG AA compliance.',
        severity: 'warning'
      }
    ],
    extractedPalette: [
      { hex: '#0B132B', percent: 45, isApproved: true, name: 'Midnight Navy' },
      { hex: '#4F46E5', percent: 30, isApproved: true, name: 'Electric Indigo' },
      { hex: '#E0E7FF', percent: 15, isApproved: false, closestApproved: '#4F46E5', name: 'Lavender Tint' },
      { hex: '#F43F5E', percent: 10, isApproved: false, closestApproved: '#4F46E5', name: 'Off-brand Rose' }
    ],
    createdAt: '2026-11-06T14:25:00Z'
  },
  'rep-002': {
    id: 'rep-002',
    submissionId: 'sub-002',
    brandId: 'brand-neosframe',
    title: 'Enterprise Trust & Cloud Security Briefing',
    channel: 'sales_deck',
    overallScore: 98,
    claimAccuracyScore: 99,
    freshnessScore: 100,
    brandVoiceScore: 96,
    visualScore: 97,
    publishingHold: false,
    summary: 'Exemplary brand compliance. All technical specifications match active approved facts with full evidence citations. Tone is authoritative and legal disclaimers are respected.',
    claims: [
      {
        id: 'clm-21',
        claimText: 'Enterprise infrastructure guarantees a 99.95% uptime SLA, supported by multi-region failover architecture.',
        verificationStatus: 'supported',
        factId: 'FACT-102',
        factStatement: 'Enterprise plan guarantees a 99.95% uptime SLA with active multi-region AWS failover.',
        confidenceScore: 99,
        explanation: 'Direct match with active Fact FACT-102.',
        evidenceSnippet: 'Legal Document #MSA-2026-E04, Clause 8.1',
        sourceReference: 'Master Services Agreement & SLA Addendum 2026',
        severity: 'info'
      },
      {
        id: 'clm-22',
        claimText: 'Fully certified for SOC-2 Type II and ISO/IEC 27001:2022 standards.',
        verificationStatus: 'supported',
        factId: 'FACT-103',
        factStatement: 'Fully certified for SOC-2 Type II and ISO/IEC 27001:2022 standards.',
        confidenceScore: 100,
        explanation: 'Auditor-verified compliance credentials active through Feb 2027.',
        evidenceSnippet: 'Schellman & Co. Independent Auditor Report',
        sourceReference: 'Trust Report Ref #AUD-2026-SOC2-NEOS',
        severity: 'info'
      },
      {
        id: 'clm-23',
        claimText: 'Encrypted using AES-256 at rest and transmitted strictly via TLS 1.3 channels.',
        verificationStatus: 'supported',
        factId: 'FACT-107',
        factStatement: 'All creative assets and metadata are encrypted with AES-256 at rest and TLS 1.3 in transit.',
        confidenceScore: 98,
        explanation: 'Accurate technical framing without overstatement.',
        evidenceSnippet: 'Sec Charter Section 3.4 Data In Transit & At Rest',
        sourceReference: 'Neosframe Information Security Charter, Revision 7',
        severity: 'info'
      },
      {
        id: 'clm-24',
        claimText: 'High-throughput rendering pipeline handles up to 10,000 localized variants per hour.',
        verificationStatus: 'supported',
        factId: 'FACT-105',
        factStatement: 'Neosframe rendering pipeline generates up to 10,000 localized retail creative variants per hour.',
        confidenceScore: 97,
        explanation: 'Matches GPU cluster benchmark data.',
        evidenceSnippet: 'Internal Performance Benchmark Paper #BM-2026-08',
        sourceReference: 'Neosframe Core Graphics Team Benchmarks on GPU clusters',
        severity: 'info'
      }
    ],
    freshnessIssues: [],
    voiceIssues: [],
    visualIssues: [],
    extractedPalette: [
      { hex: '#0B132B', percent: 60, isApproved: true, name: 'Midnight Navy' },
      { hex: '#4F46E5', percent: 25, isApproved: true, name: 'Electric Indigo' },
      { hex: '#059669', percent: 15, isApproved: true, name: 'Verified Emerald' }
    ],
    createdAt: '2026-11-05T09:20:00Z'
  }
};

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-001',
    brandId: 'brand-neosframe',
    submissionId: 'sub-002',
    actorName: 'Sarah Jenkins',
    actorRole: 'Head of Brand & Legal',
    actionType: 'DRAFT_APPROVED',
    entityType: 'content_submission',
    entityId: 'sub-002',
    details: {
      decision: 'approved',
      score: 98,
      notes: 'Reviewed and confirmed technical veracity against Q3 security charter. Approved for enterprise distribution.',
      digitalSignature: 'SIG_SJ_7729_LEGAL'
    },
    timestamp: '2026-11-05T11:45:00Z'
  },
  {
    id: 'log-002',
    brandId: 'brand-neosframe',
    submissionId: 'sub-001',
    actorName: 'BrandLoom Verification Engine',
    actorRole: 'Automated Compliance Auditor',
    actionType: 'CLAIM_VERIFIED',
    entityType: 'analysis_report',
    entityId: 'rep-001',
    details: {
      status: 'publishing_hold',
      flaggedClaimsCount: 2,
      criticalContradictions: ['FACT-101'],
      expiredFacts: ['FACT-106']
    },
    timestamp: '2026-11-06T14:25:00Z'
  },
  {
    id: 'log-003',
    brandId: 'brand-neosframe',
    actorName: 'David K.',
    actorRole: 'Brand Manager',
    actionType: 'RULE_ADDED',
    entityType: 'brand_voice_rule',
    entityId: 'VOICE-05',
    details: {
      originalPhrase: 'cheapest',
      preferredAlternative: 'most competitive total cost of ownership',
      severity: 'critical'
    },
    timestamp: '2026-11-04T16:10:00Z'
  },
  {
    id: 'log-004',
    brandId: 'brand-neosframe',
    actorName: 'Sarah Jenkins',
    actorRole: 'Head of Brand & Legal',
    actionType: 'FACT_UPDATED',
    entityType: 'approved_fact',
    entityId: 'FACT-106',
    details: {
      previousStatus: 'active',
      newStatus: 'expired',
      reason: 'Summer promotion window concluded September 30, 2026.'
    },
    timestamp: '2026-10-01T08:00:00Z'
  }
];
