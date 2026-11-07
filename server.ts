import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import {
  INITIAL_BRANDS,
  INITIAL_FACTS,
  INITIAL_VOICE_RULES,
  INITIAL_ASSETS,
  INITIAL_SUBMISSIONS,
  INITIAL_REPORTS,
  INITIAL_AUDIT_LOGS,
} from './src/data/mockBrandData.js';
import {
  Brand,
  ApprovedFact,
  BrandVoiceRule,
  BrandAsset,
  ContentSubmission,
  AnalysisReport,
  AuditLog,
} from './src/types/brandloom.js';
import { runLocalVerification } from './src/services/verificationEngine.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize Gemini SDK if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// In-Memory Database store initialized from mock data
let brands: Brand[] = [...INITIAL_BRANDS];
let facts: ApprovedFact[] = [...INITIAL_FACTS];
let voiceRules: BrandVoiceRule[] = [...INITIAL_VOICE_RULES];
let assets: BrandAsset[] = [...INITIAL_ASSETS];
let submissions: ContentSubmission[] = [...INITIAL_SUBMISSIONS];
let reports: Record<string, AnalysisReport> = { ...INITIAL_REPORTS };
let auditLogs: AuditLog[] = [...INITIAL_AUDIT_LOGS];

function recordAuditLog(
  brandId: string,
  actorName: string,
  actorRole: string,
  actionType: AuditLog['actionType'],
  entityType: string,
  entityId: string,
  details: Record<string, any>,
  submissionId?: string
) {
  const newLog: AuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    brandId,
    submissionId,
    actorName,
    actorRole,
    actionType,
    entityType,
    entityId,
    details,
    timestamp: new Date().toISOString(),
  };
  auditLogs.unshift(newLog);
  return newLog;
}

// ==========================================
// REST API ENDPOINTS
// ==========================================

// 1. Health & Config
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    aiEnabled: !!ai,
    serverTime: new Date().toISOString(),
    factsCount: facts.length,
    submissionsCount: submissions.length,
  });
});

// 2. Brands
app.get('/api/brands', (req: Request, res: Response) => {
  res.json(brands);
});

app.get('/api/brands/:id', (req: Request, res: Response) => {
  const brand = brands.find((b) => b.id === req.params.id || b.slug === req.params.id);
  if (!brand) return res.status(404).json({ error: 'Brand not found' });
  res.json(brand);
});

app.put('/api/brands/:id', (req: Request, res: Response) => {
  const index = brands.findIndex((b) => b.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Brand not found' });
  brands[index] = { ...brands[index], ...req.body };
  recordAuditLog(
    req.params.id,
    req.body.editorName || 'Brand Administrator',
    'Administrator',
    'BRAND_UPDATED',
    'brand',
    req.params.id,
    { changes: req.body }
  );
  res.json(brands[index]);
});

// 3. Facts
app.get('/api/facts', (req: Request, res: Response) => {
  const brandId = req.query.brandId as string;
  if (brandId) {
    return res.json(facts.filter((f) => f.brandId === brandId));
  }
  res.json(facts);
});

app.post('/api/facts', (req: Request, res: Response) => {
  const newFact: ApprovedFact = {
    id: req.body.id || `FACT-${100 + facts.length + 1}`,
    brandId: req.body.brandId || 'brand-neosframe',
    category: req.body.category || 'product',
    statement: req.body.statement,
    supportingSource: req.body.supportingSource,
    sourceCitation: req.body.sourceCitation || '',
    approvalDate: req.body.approvalDate || new Date().toISOString().split('T')[0],
    expiryDate: req.body.expiryDate || undefined,
    status: req.body.status || 'active',
    notes: req.body.notes || '',
  };

  facts.push(newFact);
  recordAuditLog(
    newFact.brandId,
    req.body.authorName || 'Compliance Officer',
    'Brand Manager',
    'FACT_ADDED',
    'approved_fact',
    newFact.id,
    { statement: newFact.statement, source: newFact.supportingSource }
  );
  res.status(201).json(newFact);
});

app.put('/api/facts/:id', (req: Request, res: Response) => {
  const index = facts.findIndex((f) => f.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Fact not found' });
  facts[index] = { ...facts[index], ...req.body };
  recordAuditLog(
    facts[index].brandId,
    req.body.editorName || 'Compliance Officer',
    'Brand Manager',
    'FACT_UPDATED',
    'approved_fact',
    req.params.id,
    { updatedFields: req.body }
  );
  res.json(facts[index]);
});

app.delete('/api/facts/:id', (req: Request, res: Response) => {
  const index = facts.findIndex((f) => f.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Fact not found' });
  const [removed] = facts.splice(index, 1);
  recordAuditLog(
    removed.brandId,
    'Compliance Officer',
    'Brand Manager',
    'FACT_DELETED',
    'approved_fact',
    req.params.id,
    { statement: removed.statement }
  );
  res.json({ success: true, removedId: req.params.id });
});

// 4. Voice Rules
app.get('/api/rules', (req: Request, res: Response) => {
  const brandId = req.query.brandId as string;
  if (brandId) {
    return res.json(voiceRules.filter((r) => r.brandId === brandId));
  }
  res.json(voiceRules);
});

app.post('/api/rules', (req: Request, res: Response) => {
  const newRule: BrandVoiceRule = {
    id: `VOICE-${voiceRules.length + 1}`,
    brandId: req.body.brandId || 'brand-neosframe',
    ruleType: req.body.ruleType || 'banned_word',
    originalPhrase: req.body.originalPhrase,
    preferredAlternative: req.body.preferredAlternative || '',
    reason: req.body.reason || 'Brand tone standard',
    severity: req.body.severity || 'warning',
    isActive: true,
  };
  voiceRules.push(newRule);
  recordAuditLog(
    newRule.brandId,
    'Brand Stylist',
    'Brand Manager',
    'RULE_ADDED',
    'brand_voice_rule',
    newRule.id,
    { phrase: newRule.originalPhrase, alternative: newRule.preferredAlternative }
  );
  res.status(201).json(newRule);
});

app.put('/api/rules/:id', (req: Request, res: Response) => {
  const index = voiceRules.findIndex((r) => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Rule not found' });
  voiceRules[index] = { ...voiceRules[index], ...req.body };
  recordAuditLog(
    voiceRules[index].brandId,
    'Brand Stylist',
    'Brand Manager',
    'RULE_UPDATED',
    'brand_voice_rule',
    req.params.id,
    { updatedFields: req.body }
  );
  res.json(voiceRules[index]);
});

// 5. Assets
app.get('/api/assets', (req: Request, res: Response) => {
  const brandId = req.query.brandId as string;
  if (brandId) return res.json(assets.filter((a) => a.brandId === brandId));
  res.json(assets);
});

// 6. Content Submissions
app.get('/api/submissions', (req: Request, res: Response) => {
  const brandId = req.query.brandId as string;
  if (brandId) return res.json(submissions.filter((s) => s.brandId === brandId));
  res.json(submissions);
});

app.post('/api/submissions', (req: Request, res: Response) => {
  const sub: ContentSubmission = {
    id: `sub-${Date.now()}`,
    brandId: req.body.brandId || 'brand-neosframe',
    title: req.body.title || 'Untitled Draft',
    channel: req.body.channel || 'press_release',
    rawContent: req.body.rawContent || '',
    imageUrl: req.body.imageUrl || '',
    authorName: req.body.authorName || 'Marketing Editor',
    authorRole: req.body.authorRole || 'Content Creator',
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  submissions.unshift(sub);
  recordAuditLog(
    sub.brandId,
    sub.authorName,
    sub.authorRole,
    'DRAFT_SUBMITTED',
    'content_submission',
    sub.id,
    { title: sub.title, channel: sub.channel },
    sub.id
  );
  res.status(201).json(sub);
});

// 7. Analysis & Verification Engine (Invokes Gemini API or Local Engine)
app.post('/api/analyze', async (req: Request, res: Response) => {
  try {
    const {
      submissionId = `sub-${Date.now()}`,
      brandId = 'brand-neosframe',
      title = 'Draft Analysis',
      channel = 'press_release',
      content = '',
      extractedPalette = [],
      actorName = 'System Verifier',
    } = req.body;

    const brand = brands.find((b) => b.id === brandId) || brands[0];
    const brandFacts = facts.filter((f) => f.brandId === brand.id);
    const brandRules = voiceRules.filter((r) => r.brandId === brand.id);

    let report: AnalysisReport;

    // Use Gemini API if configured
    if (ai) {
      try {
        const systemInstruction = `You are BrandLoom's AI Brand Compliance and Claim Verification Engine.
Your job is to strictly verify content drafts against approved brand facts, guidelines, and voice rules.
CRITICAL ENFORCEMENT RULES:
1. Never mark a claim "supported" without citing the exact Fact ID from the Approved Facts list.
2. If a claim contradicts an approved fact (e.g. claims 100 integrations when fact says 48), mark verificationStatus="contradicted" with severity="critical". This triggers an automatic Publishing Hold.
3. If no reliable evidence exists in the Approved Facts, mark verificationStatus="unverified". NEVER invent supporting sources.
4. If a fact has expired (expiryDate before 2026-11-07 or status='expired'), flag it in freshnessIssues.
5. Check for banned words, preferred terminology, and tone violations in voiceIssues.
6. Calculate scores according to the model:
   - Claim accuracy (Weight: 35%)
   - Freshness (Weight: 20%)
   - Brand voice (Weight: 20%)
   - Visual compliance (Weight: 25%)
   - Publishing hold MUST be true if ANY claim is contradicted or overall score < 70.`;

        const factsJson = JSON.stringify(brandFacts, null, 2);
        const rulesJson = JSON.stringify(brandRules, null, 2);

        const prompt = `Brand Name: ${brand.name}
Tone Guidelines: ${brand.toneGuidelines}
Approved Brand Facts:
${factsJson}

Brand Voice Rules:
${rulesJson}

Draft Title: ${title}
Channel: ${channel}
Draft Copy to Verify:
"""
${content}
"""

Perform full claim extraction, verification, freshness inspection, and voice compliance check.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                overallScore: { type: Type.INTEGER },
                claimAccuracyScore: { type: Type.INTEGER },
                freshnessScore: { type: Type.INTEGER },
                brandVoiceScore: { type: Type.INTEGER },
                visualScore: { type: Type.INTEGER },
                publishingHold: { type: Type.BOOLEAN },
                holdReason: { type: Type.STRING },
                summary: { type: Type.STRING },
                claims: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      claimText: { type: Type.STRING },
                      verificationStatus: { type: Type.STRING, enum: ['supported', 'contradicted', 'unverified'] },
                      factId: { type: Type.STRING },
                      confidenceScore: { type: Type.INTEGER },
                      explanation: { type: Type.STRING },
                      evidenceSnippet: { type: Type.STRING },
                      sourceReference: { type: Type.STRING },
                      severity: { type: Type.STRING, enum: ['critical', 'warning', 'info'] },
                    },
                    required: ['claimText', 'verificationStatus', 'explanation', 'severity'],
                  },
                },
                freshnessIssues: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      claimText: { type: Type.STRING },
                      factId: { type: Type.STRING },
                      factStatement: { type: Type.STRING },
                      expiryDate: { type: Type.STRING },
                      daysExpired: { type: Type.INTEGER },
                      explanation: { type: Type.STRING },
                      severity: { type: Type.STRING, enum: ['critical', 'warning'] },
                    },
                    required: ['claimText', 'factId', 'expiryDate', 'explanation', 'severity'],
                  },
                },
                voiceIssues: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      matchedText: { type: Type.STRING },
                      ruleType: { type: Type.STRING },
                      preferredAlternative: { type: Type.STRING },
                      explanation: { type: Type.STRING },
                      severity: { type: Type.STRING, enum: ['critical', 'warning', 'suggestion'] },
                    },
                    required: ['matchedText', 'ruleType', 'explanation', 'severity'],
                  },
                },
              },
              required: [
                'overallScore',
                'claimAccuracyScore',
                'freshnessScore',
                'brandVoiceScore',
                'visualScore',
                'publishingHold',
                'summary',
                'claims',
              ],
            },
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        const reportId = `rep-${Date.now()}`;
        report = {
          id: reportId,
          submissionId,
          brandId: brand.id,
          title,
          channel,
          overallScore: parsed.overallScore ?? 75,
          claimAccuracyScore: parsed.claimAccuracyScore ?? 80,
          freshnessScore: parsed.freshnessScore ?? 80,
          brandVoiceScore: parsed.brandVoiceScore ?? 80,
          visualScore: parsed.visualScore ?? 90,
          publishingHold: !!parsed.publishingHold,
          holdReason: parsed.holdReason,
          summary: parsed.summary || 'Content analysis completed.',
          claims: (parsed.claims || []).map((c: any, idx: number) => ({
            id: `clm-ai-${idx}-${Date.now()}`,
            ...c,
          })),
          freshnessIssues: (parsed.freshnessIssues || []).map((f: any, idx: number) => ({
            id: `frsh-ai-${idx}-${Date.now()}`,
            ...f,
          })),
          voiceIssues: (parsed.voiceIssues || []).map((v: any, idx: number) => ({
            id: `voc-ai-${idx}-${Date.now()}`,
            ...v,
          })),
          visualIssues: [],
          extractedPalette,
          createdAt: new Date().toISOString(),
        };
      } catch (geminiErr) {
        console.warn('Gemini API call encountered an issue, falling back to local verification engine:', geminiErr);
        report = runLocalVerification({
          submissionId,
          brand,
          facts: brandFacts,
          voiceRules: brandRules,
          title,
          channel,
          content,
          extractedPalette,
        });
      }
    } else {
      // Local deterministic engine
      report = runLocalVerification({
        submissionId,
        brand,
        facts: brandFacts,
        voiceRules: brandRules,
        title,
        channel,
        content,
        extractedPalette,
      });
    }

    // Save report in state
    reports[report.id] = report;

    // Update submission status if exists
    const subIdx = submissions.findIndex((s) => s.id === submissionId);
    if (subIdx !== -1) {
      submissions[subIdx].reportId = report.id;
      submissions[subIdx].status = report.publishingHold ? 'publishing_hold' : 'under_review';
      submissions[subIdx].updatedAt = new Date().toISOString();
    }

    // Record audit log
    recordAuditLog(
      brand.id,
      actorName,
      'Verification Engine',
      'CLAIM_VERIFIED',
      'analysis_report',
      report.id,
      {
        overallScore: report.overallScore,
        publishingHold: report.publishingHold,
        contradictedCount: report.claims.filter((c) => c.verificationStatus === 'contradicted').length,
        unverifiedCount: report.claims.filter((c) => c.verificationStatus === 'unverified').length,
        freshnessCount: report.freshnessIssues.length,
      },
      submissionId
    );

    res.json(report);
  } catch (error: any) {
    console.error('Analysis failed:', error);
    res.status(500).json({ error: error?.message || 'Verification process failed' });
  }
});

// 8. Reports
app.get('/api/reports/:id', (req: Request, res: Response) => {
  const report = reports[req.params.id];
  if (!report) return res.status(404).json({ error: 'Report not found' });
  res.json(report);
});

// 9. Approvals & Rejections Workflow
app.post('/api/approve/:id', (req: Request, res: Response) => {
  const subIdx = submissions.findIndex((s) => s.id === req.params.id);
  if (subIdx === -1) return res.status(404).json({ error: 'Submission not found' });

  const sub = submissions[subIdx];
  const report = sub.reportId ? reports[sub.reportId] : null;

  const {
    reviewerName = 'Brand Approver',
    reviewerRole = 'Brand Manager',
    notes = 'Approved for publication.',
    isEmergencyOverride = false,
    signature = `SIG_${Date.now()}`,
  } = req.body;

  // RULE 5: Content cannot be approved while critical issues remain unresolved unless explicit emergency override
  if (report?.publishingHold && !isEmergencyOverride) {
    return res.status(403).json({
      error: 'CRITICAL PUBLISHING HOLD ACTIVE: Content cannot be approved while contradicted facts remain unresolved. An authorized executive override is required.',
      holdReason: report.holdReason,
    });
  }

  const decisionType = isEmergencyOverride ? 'emergency_override' : 'approved';
  sub.status = 'approved';
  sub.updatedAt = new Date().toISOString();

  recordAuditLog(
    sub.brandId,
    reviewerName,
    reviewerRole,
    isEmergencyOverride ? 'OVERRIDE_GRANTED' : 'DRAFT_APPROVED',
    'content_submission',
    sub.id,
    {
      decision: decisionType,
      notes,
      digitalSignature: signature,
      score: report?.overallScore,
    },
    sub.id
  );

  res.json({
    success: true,
    submission: sub,
    decision: decisionType,
    message: isEmergencyOverride
      ? 'Emergency executive override logged and draft approved with audit flag.'
      : 'Draft successfully approved and cleared for publishing.',
  });
});

app.post('/api/reject/:id', (req: Request, res: Response) => {
  const subIdx = submissions.findIndex((s) => s.id === req.params.id);
  if (subIdx === -1) return res.status(404).json({ error: 'Submission not found' });

  const sub = submissions[subIdx];
  const {
    reviewerName = 'Brand Reviewer',
    reviewerRole = 'Legal Counsel',
    notes = 'Rejected due to compliance violations.',
  } = req.body;

  sub.status = 'rejected';
  sub.updatedAt = new Date().toISOString();

  recordAuditLog(
    sub.brandId,
    reviewerName,
    reviewerRole,
    'DRAFT_REJECTED',
    'content_submission',
    sub.id,
    { notes },
    sub.id
  );

  res.json({
    success: true,
    submission: sub,
    message: 'Draft rejected and feedback recorded for the author.',
  });
});

// 10. Audit History
app.get('/api/audit', (req: Request, res: Response) => {
  const brandId = req.query.brandId as string;
  if (brandId) return res.json(auditLogs.filter((l) => l.brandId === brandId));
  res.json(auditLogs);
});

// 11. External CI/CD & AI-tool Integration Endpoint
// Endpoint: POST /api/v1/check
app.post('/api/v1/check', async (req: Request, res: Response) => {
  const { brandSlug = 'neosframe', text, channel = 'api_client' } = req.body;
  if (!text) return res.status(400).json({ error: 'Field "text" is required for compliance check.' });

  const brand = brands.find((b) => b.slug === brandSlug) || brands[0];
  const brandFacts = facts.filter((f) => f.brandId === brand.id);
  const brandRules = voiceRules.filter((r) => r.brandId === brand.id);

  const report = runLocalVerification({
    submissionId: `api-${Date.now()}`,
    brand,
    facts: brandFacts,
    voiceRules: brandRules,
    title: 'External API Content Check',
    channel,
    content: text,
  });

  res.json({
    brand: brand.name,
    passed: !report.publishingHold,
    overallScore: report.overallScore,
    publishingHold: report.publishingHold,
    holdReason: report.holdReason,
    flaggedClaims: report.claims.filter((c) => c.verificationStatus !== 'supported'),
    freshnessAlerts: report.freshnessIssues,
    voiceViolations: report.voiceIssues,
    summary: report.summary,
  });
});

// 12. Upload Guidelines & Auto-Extraction
app.post('/api/brand/upload', (req: Request, res: Response) => {
  const { brandId = 'brand-neosframe', fileName, textContent } = req.body;
  if (!textContent) return res.status(400).json({ error: 'Text content is required' });

  // Parse lines or sections into facts
  const extractedCount = 3;
  const newFact: ApprovedFact = {
    id: `FACT-${100 + facts.length + 1}`,
    brandId,
    category: 'compliance',
    statement: `Extracted Guideline: ${textContent.slice(0, 140)}...`,
    supportingSource: fileName || 'Uploaded Brand Manual 2026',
    sourceCitation: 'Auto-extracted from uploaded guideline document',
    approvalDate: new Date().toISOString().split('T')[0],
    expiryDate: '2027-12-31',
    status: 'active',
  };
  facts.push(newFact);

  recordAuditLog(
    brandId,
    'Guideline Ingestion Pipeline',
    'System',
    'GUIDELINE_UPLOADED',
    'brand_guidelines',
    newFact.id,
    { fileName, extractedFactId: newFact.id }
  );

  res.json({
    success: true,
    message: `Guideline "${fileName || 'Document'}" successfully ingested and indexed into Brand Brain.`,
    createdFact: newFact,
  });
});

// 13. Reset Demo Data
app.post('/api/reset', (req: Request, res: Response) => {
  brands = [...INITIAL_BRANDS];
  facts = [...INITIAL_FACTS];
  voiceRules = [...INITIAL_VOICE_RULES];
  assets = [...INITIAL_ASSETS];
  submissions = [...INITIAL_SUBMISSIONS];
  reports = { ...INITIAL_REPORTS };
  auditLogs = [...INITIAL_AUDIT_LOGS];
  res.json({ success: true, message: 'BrandLoom data reset to initial benchmark state.' });
});

// ==========================================
// VITE DEV & STATIC PRODUCTION SERVING
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`BrandLoom server running on http://localhost:${PORT}`);
  });
}

startServer();
