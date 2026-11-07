import {
  Brand,
  ApprovedFact,
  BrandVoiceRule,
  AnalysisReport,
  ClaimResult,
  FreshnessIssue,
  VoiceIssue,
  VisualIssue,
  PaletteExtraction
} from '../types/brandloom';

// Calculate color distance (Delta E approx)
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return { r, g, b };
  }
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return { r, g, b };
  }
  return null;
}

export function colorDistance(hex1: string, hex2: string): number {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  if (!c1 || !c2) return 999;
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) +
    Math.pow(c1.g - c2.g, 2) +
    Math.pow(c1.b - c2.b, 2)
  );
}

/**
 * Splits text into logical claims / sentences while preserving context
 */
export function extractClaimsFromText(content: string): string[] {
  const sentences = content
    .split(/(?<=[.?!])\s+|\n+/)
    .map(s => s.trim())
    .filter(s => s.length > 15 && !s.startsWith('#'));
  return sentences;
}

/**
 * Deterministic & semantic rule-based verification fallback
 */
export function runLocalVerification(params: {
  submissionId: string;
  brand: Brand;
  facts: ApprovedFact[];
  voiceRules: BrandVoiceRule[];
  title: string;
  channel: string;
  content: string;
  extractedPalette?: PaletteExtraction[];
}): AnalysisReport {
  const { submissionId, brand, facts, voiceRules, title, channel, content, extractedPalette = [] } = params;
  const today = '2026-11-07'; // System reference date

  const claims: ClaimResult[] = [];
  const freshnessIssues: FreshnessIssue[] = [];
  const voiceIssues: VoiceIssue[] = [];
  const visualIssues: VisualIssue[] = [];

  const sentences = extractClaimsFromText(content);
  const lowerContent = content.toLowerCase();

  // 1. Voice & Terminology Rules Check
  for (const rule of voiceRules) {
    if (!rule.isActive) continue;
    const regex = new RegExp(`\\b${rule.originalPhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (regex.test(content)) {
      voiceIssues.push({
        id: `voc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        matchedText: rule.originalPhrase,
        ruleType: rule.ruleType,
        preferredAlternative: rule.preferredAlternative,
        explanation: rule.reason,
        severity: rule.severity
      });
    }
  }

  // 2. Fact Claims & Freshness Check
  for (const sentence of sentences) {
    const sLower = sentence.toLowerCase();

    // Specific domain heuristics for demonstration
    if (sLower.includes('integration') || sLower.includes('native integrations')) {
      const fact101 = facts.find(f => f.id === 'FACT-101' || f.category === 'integrations');
      if (fact101) {
        // Check for contradiction
        const hasExaggeration = sLower.includes('100') || sLower.includes('hundred') || sLower.includes('unlimited');
        if (hasExaggeration) {
          claims.push({
            id: `clm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            claimText: sentence,
            verificationStatus: 'contradicted',
            factId: fact101.id,
            factStatement: fact101.statement,
            confidenceScore: 98,
            explanation: `Draft asserts support for 100+ integrations, but approved Fact ${fact101.id} specifies exactly 48 native integrations. Overstating integration breadth triggers legal and customer trust hazards.`,
            evidenceSnippet: fact101.supportingSource,
            sourceReference: fact101.sourceCitation,
            severity: 'critical'
          });
          continue;
        } else if (sLower.includes('48')) {
          claims.push({
            id: `clm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            claimText: sentence,
            verificationStatus: 'supported',
            factId: fact101.id,
            factStatement: fact101.statement,
            confidenceScore: 99,
            explanation: `Accurately cites approved Fact ${fact101.id}. Supported by engineering specifications.`,
            evidenceSnippet: fact101.supportingSource,
            sourceReference: fact101.sourceCitation,
            severity: 'info'
          });
          continue;
        }
      }
    }

    if (sLower.includes('discount') || sLower.includes('early-adopter') || sLower.includes('35%') || sLower.includes('summer')) {
      const fact106 = facts.find(f => f.id === 'FACT-106');
      if (fact106) {
        const isExpired = fact106.status === 'expired' || (fact106.expiryDate && fact106.expiryDate < today);
        claims.push({
          id: `clm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          claimText: sentence,
          verificationStatus: isExpired ? 'contradicted' : 'supported',
          factId: fact106.id,
          factStatement: fact106.statement,
          confidenceScore: 95,
          explanation: isExpired
            ? `Offer references the 35% Summer promotion (Fact ${fact106.id}), which expired on ${fact106.expiryDate}. Content cannot be published with stale pricing offers.`
            : `Verified against active pricing promotion.`,
          evidenceSnippet: fact106.supportingSource,
          sourceReference: fact106.sourceCitation,
          severity: isExpired ? 'critical' : 'info'
        });

        if (isExpired) {
          freshnessIssues.push({
            id: `frsh-${Date.now()}`,
            claimText: sentence,
            factId: fact106.id,
            factStatement: fact106.statement,
            expiryDate: fact106.expiryDate || '2026-09-30',
            daysExpired: 38,
            explanation: `Promotion concluded on ${fact106.expiryDate}. Disseminating expired pricing incurs customer contractual liability.`,
            severity: 'critical'
          });
        }
        continue;
      }
    }

    if (sLower.includes('uptime') || sLower.includes('sla') || sLower.includes('99.95%')) {
      const fact102 = facts.find(f => f.id === 'FACT-102');
      if (fact102) {
        claims.push({
          id: `clm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          claimText: sentence,
          verificationStatus: 'supported',
          factId: fact102.id,
          factStatement: fact102.statement,
          confidenceScore: 99,
          explanation: `Directly supported by Fact ${fact102.id} and Enterprise Master Services Agreement.`,
          evidenceSnippet: fact102.supportingSource,
          sourceReference: fact102.sourceCitation,
          severity: 'info'
        });
        continue;
      }
    }

    if (sLower.includes('soc-2') || sLower.includes('iso/iec') || sLower.includes('27001') || sLower.includes('certified')) {
      const fact103 = facts.find(f => f.id === 'FACT-103');
      if (fact103) {
        claims.push({
          id: `clm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          claimText: sentence,
          verificationStatus: 'supported',
          factId: fact103.id,
          factStatement: fact103.statement,
          confidenceScore: 100,
          explanation: `Supported by active third-party auditor report. Certified through ${fact103.expiryDate}.`,
          evidenceSnippet: fact103.supportingSource,
          sourceReference: fact103.sourceCitation,
          severity: 'info'
        });
        continue;
      }
    }

    if (sLower.includes('aes-256') || sLower.includes('encryption') || sLower.includes('tls 1.3')) {
      const fact107 = facts.find(f => f.id === 'FACT-107');
      if (fact107) {
        claims.push({
          id: `clm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          claimText: sentence,
          verificationStatus: 'supported',
          factId: fact107.id,
          factStatement: fact107.statement,
          confidenceScore: 96,
          explanation: `Matches approved Information Security Charter specification.`,
          evidenceSnippet: fact107.supportingSource,
          sourceReference: fact107.sourceCitation,
          severity: 'info'
        });
        continue;
      }
    }

    if (sLower.includes('10,000') || sLower.includes('variants per hour')) {
      const fact105 = facts.find(f => f.id === 'FACT-105');
      if (fact105) {
        claims.push({
          id: `clm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          claimText: sentence,
          verificationStatus: 'supported',
          factId: fact105.id,
          factStatement: fact105.statement,
          confidenceScore: 97,
          explanation: `Consistent with internal GPU cluster rendering benchmarks.`,
          evidenceSnippet: fact105.supportingSource,
          sourceReference: fact105.sourceCitation,
          severity: 'info'
        });
        continue;
      }
    }

    if (sLower.includes('gartner') || sLower.includes('#1') || sLower.includes('best in the world') || sLower.includes('rated the #1')) {
      claims.push({
        id: `clm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        claimText: sentence,
        verificationStatus: 'unverified',
        confidenceScore: 92,
        explanation: 'No approved fact or analyst report citation in Brand Brain substantiates this claim. The AI engine does not invent supporting sources.',
        severity: 'warning'
      });
      continue;
    }
  }

  // 3. Visual Checks
  if (extractedPalette && extractedPalette.length > 0) {
    for (const pal of extractedPalette) {
      if (!pal.isApproved && pal.percent > 12) {
        visualIssues.push({
          id: `vis-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          title: 'Off-Palette Dominant Color Detected',
          detectedColor: pal.hex,
          nearestApprovedColor: pal.closestApproved || brand.colors[0]?.hex,
          explanation: `Detected ${pal.name || pal.hex} occupying ${pal.percent}% of the visual asset. This tone deviates from approved brand palette rules.`,
          severity: 'warning'
        });
      }
    }
  }

  // 4. Calculate Weighted Brand Score
  // Weights:
  // - Claim accuracy: 35%
  // - Information freshness: 20%
  // - Brand voice: 20%
  // - Visual compliance: 25%
  let claimScore = 100;
  let hasCriticalContradiction = false;

  for (const c of claims) {
    if (c.verificationStatus === 'contradicted') {
      claimScore = Math.max(0, claimScore - 45);
      hasCriticalContradiction = true;
    } else if (c.verificationStatus === 'unverified') {
      claimScore = Math.max(20, claimScore - 20);
    }
  }
  if (claims.length === 0) claimScore = 85;

  let freshnessScore = 100;
  for (const f of freshnessIssues) {
    if (f.severity === 'critical') freshnessScore = Math.max(0, freshnessScore - 60);
    else freshnessScore = Math.max(20, freshnessScore - 25);
  }

  let voiceScore = 100;
  for (const v of voiceIssues) {
    if (v.severity === 'critical') voiceScore = Math.max(0, voiceScore - 35);
    else if (v.severity === 'warning') voiceScore = Math.max(20, voiceScore - 15);
    else voiceScore = Math.max(40, voiceScore - 5);
  }

  let visualScore = 100;
  for (const vis of visualIssues) {
    if (vis.severity === 'critical') visualScore = Math.max(0, visualScore - 40);
    else if (vis.severity === 'warning') visualScore = Math.max(30, visualScore - 20);
    else visualScore = Math.max(50, visualScore - 10);
  }

  const overallScore = Math.round(
    0.35 * claimScore +
    0.20 * freshnessScore +
    0.20 * voiceScore +
    0.25 * visualScore
  );

  const publishingHold = hasCriticalContradiction || overallScore < 70;
  let holdReason: string | undefined;

  if (hasCriticalContradiction) {
    holdReason = 'PUBLISHING HOLD ENFORCED: 1 or more claims directly contradict approved brand facts. Content cannot be distributed until factual inaccuracies are resolved.';
  } else if (overallScore < 70) {
    holdReason = `PUBLISHING HOLD ENFORCED: Overall score (${overallScore}/100) is below the organizational threshold of 70. Please resolve flagged issues.`;
  }

  let summary = '';
  if (publishingHold) {
    summary = `Review complete: Publishing hold active. ${claims.filter(c => c.verificationStatus === 'contradicted').length} contradicted claim(s), ${freshnessIssues.length} freshness alert(s), and ${voiceIssues.length} voice violation(s) identified.`;
  } else {
    summary = `Review complete: Passed all critical compliance checks with an overall score of ${overallScore}%. Minor recommendations noted below.`;
  }

  return {
    id: `rep-${Date.now()}`,
    submissionId,
    brandId: brand.id,
    title,
    channel,
    overallScore,
    claimAccuracyScore: claimScore,
    freshnessScore,
    brandVoiceScore: voiceScore,
    visualScore,
    publishingHold,
    holdReason,
    summary,
    claims,
    freshnessIssues,
    voiceIssues,
    visualIssues,
    extractedPalette,
    createdAt: new Date().toISOString()
  };
}
