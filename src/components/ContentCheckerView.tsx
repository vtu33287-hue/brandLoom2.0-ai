import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Upload,
  ArrowRight,
  FileText,
  RotateCcw,
  Check,
  Eye,
  Info,
  Lock,
} from 'lucide-react';
import {
  Brand,
  ApprovedFact,
  BrandVoiceRule,
  ContentSubmission,
  AnalysisReport,
  PaletteExtraction,
} from '../types/brandloom';
import { colorDistance, hexToRgb } from '../services/verificationEngine';

interface ContentCheckerViewProps {
  currentBrand: Brand;
  facts: ApprovedFact[];
  voiceRules: BrandVoiceRule[];
  initialSubmission?: ContentSubmission | null;
  onSaveSubmission: (submission: Partial<ContentSubmission>) => Promise<ContentSubmission>;
  onRunAnalysis: (payload: {
    submissionId?: string;
    brandId: string;
    title: string;
    channel: string;
    content: string;
    extractedPalette?: PaletteExtraction[];
  }) => Promise<AnalysisReport>;
  onOpenReportModal: (report: AnalysisReport) => void;
  onOpenApprovalModal: (submissionId: string, isOverride?: boolean) => void;
}

export const ContentCheckerView: React.FC<ContentCheckerViewProps> = ({
  currentBrand,
  facts,
  voiceRules,
  initialSubmission,
  onSaveSubmission,
  onRunAnalysis,
  onOpenReportModal,
  onOpenApprovalModal,
}) => {
  const [title, setTitle] = useState(
    initialSubmission?.title || 'Q4 Product Launch Press Release'
  );
  const [channel, setChannel] = useState<ContentSubmission['channel']>(
    initialSubmission?.channel || 'press_release'
  );
  const [content, setContent] = useState(
    initialSubmission?.rawContent ||
      `San Francisco, CA — NeosFrame is proud to announce the monumental launch of our next-gen retail automation suite.

Designed to deliver unprecedented synergy across marketing departments, Neosframe now supports over 100 native integrations directly out of the box with zero setup required. We are guaranteeing our clients 100% bug-free rendering for every marketing campaign.

Best of all, our pricing is the cheapest in the SaaS industry, starting with a special 35% early-adopter summer discount for all enterprise signups. All customer data is secured with AES-256 encryption at rest and in transit. Experience our guaranteed 99.95% uptime SLA and eliminate manual retail creative production today.`
  );
  const [imageUrl, setImageUrl] = useState<string>(
    initialSubmission?.imageUrl ||
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80'
  );
  const [extractedPalette, setExtractedPalette] = useState<PaletteExtraction[]>([]);
  const [currentSubmissionId, setCurrentSubmissionId] = useState<string>(
    initialSubmission?.id || 'sub-001'
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [claimFilter, setClaimFilter] = useState<'all' | 'supported' | 'contradicted' | 'unverified'>('all');
  const [activeTab, setActiveTab] = useState<'claims' | 'voice' | 'freshness' | 'visual'>('claims');
  const [fixAppliedMessage, setFixAppliedMessage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Analyze image colors using canvas when imageUrl changes
  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      try {
        const canvas = canvasRef.current || document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = 100;
        canvas.height = 100;
        ctx.drawImage(img, 0, 0, 100, 100);
        const data = ctx.getImageData(0, 0, 100, 100).data;

        // Sample dominant colors
        const colorBuckets: Record<string, number> = {};
        for (let i = 0; i < data.length; i += 40) {
          const r = Math.round(data[i] / 32) * 32;
          const g = Math.round(data[i + 1] / 32) * 32;
          const b = Math.round(data[i + 2] / 32) * 32;
          const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
          colorBuckets[hex] = (colorBuckets[hex] || 0) + 1;
        }

        const sorted = Object.entries(colorBuckets)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4);

        const total = sorted.reduce((sum, [, count]) => sum + count, 0);
        const extracted: PaletteExtraction[] = sorted.map(([hex, count]) => {
          // Check against brand colors
          let closestApproved = currentBrand.colors[0]?.hex;
          let minDistance = 999;
          for (const bc of currentBrand.colors) {
            const dist = colorDistance(hex, bc.hex);
            if (dist < minDistance) {
              minDistance = dist;
              closestApproved = bc.hex;
            }
          }
          const isApproved = minDistance < 55;
          return {
            hex,
            percent: Math.round((count / total) * 100),
            isApproved,
            closestApproved,
            name: isApproved
              ? currentBrand.colors.find((c) => c.hex === closestApproved)?.name
              : 'Unapproved Tone',
          };
        });

        setExtractedPalette(extracted);
      } catch (err) {
        console.warn('Canvas color extraction error (cross-origin limitation), setting sample palette');
        setExtractedPalette([
          { hex: '#0B132B', percent: 50, isApproved: true, name: 'Midnight Navy' },
          { hex: '#4F46E5', percent: 30, isApproved: true, name: 'Electric Indigo' },
          { hex: '#F43F5E', percent: 20, isApproved: false, closestApproved: '#4F46E5', name: 'Off-brand Rose' },
        ]);
      }
    };
  }, [imageUrl, currentBrand]);

  // Load preset templates
  const loadTemplate = (type: 'contradicted' | 'compliant' | 'unverified' | 'blank') => {
    if (type === 'contradicted') {
      setTitle('Q4 Product Launch Press Release');
      setChannel('press_release');
      setContent(
        `San Francisco, CA — NeosFrame is proud to announce the monumental launch of our next-gen retail automation suite.\n\nDesigned to deliver unprecedented synergy across marketing departments, Neosframe now supports over 100 native integrations directly out of the box with zero setup required. We are guaranteeing our clients 100% bug-free rendering for every marketing campaign.\n\nBest of all, our pricing is the cheapest in the SaaS industry, starting with a special 35% early-adopter summer discount for all enterprise signups. All customer data is secured with AES-256 encryption at rest and in transit. Experience our guaranteed 99.95% uptime SLA and eliminate manual retail creative production today.`
      );
      setImageUrl('https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80');
      setCurrentSubmissionId('sub-001');
      setReport(null);
    } else if (type === 'compliant') {
      setTitle('Enterprise Trust & Cloud Security Briefing');
      setChannel('sales_deck');
      setContent(
        `Security and reliability are foundational to Neosframe. Our enterprise infrastructure guarantees a 99.95% uptime SLA, supported by multi-region failover architecture.\n\nNeosframe is independently audited and fully certified for SOC-2 Type II and ISO/IEC 27001:2022 standards. Every creative file and associated metadata is encrypted using AES-256 at rest and transmitted strictly via TLS 1.3 channels. Our high-throughput rendering pipeline handles up to 10,000 localized variants per hour with total data isolation.`
      );
      setImageUrl('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80');
      setCurrentSubmissionId('sub-002');
      setReport(null);
    } else if (type === 'unverified') {
      setTitle('Holiday Omnichannel Campaign Social Card');
      setChannel('social_ad');
      setContent(
        `Scale your seasonal retail ad creative in seconds with Neosframe. Rated the #1 Creative Automation tool by Gartner in 2026! Starter plans start at $49/seat/month with 10 brand workspaces. Create unlimited variants without breaking the bank.`
      );
      setImageUrl('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80');
      setCurrentSubmissionId('sub-003');
      setReport(null);
    } else {
      setTitle('New Marketing Draft');
      setChannel('blog_post');
      setContent('');
      setImageUrl('');
      setCurrentSubmissionId(`sub-${Date.now()}`);
      setReport(null);
    }
  };

  // Run the full verification workflow
  const handleVerify = async () => {
    if (!content.trim()) return;
    setIsAnalyzing(true);
    setAnalysisStep('Extracting factual claims...');

    try {
      await new Promise((r) => setTimeout(r, 350));
      setAnalysisStep('Retrieving approved evidence from Brand Brain...');
      await new Promise((r) => setTimeout(r, 400));
      setAnalysisStep('Evaluating fact freshness & expiry dates...');
      await new Promise((r) => setTimeout(r, 350));
      setAnalysisStep('Inspecting brand voice & banned terminology...');

      const result = await onRunAnalysis({
        submissionId: currentSubmissionId,
        brandId: currentBrand.id,
        title,
        channel,
        content,
        extractedPalette,
      });

      setReport(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  // 1-Click in-place replacement of banned words in the editor
  const handleReplacePhrase = (original: string, replacement?: string) => {
    if (!replacement) return;
    const regex = new RegExp(`\\b${original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const updated = content.replace(regex, replacement);
    setContent(updated);
    setFixAppliedMessage(`Replaced "${original}" with "${replacement}"`);
    setTimeout(() => setFixAppliedMessage(null), 3000);
  };

  const filteredClaims =
    report?.claims.filter((c) => {
      if (claimFilter === 'all') return true;
      return c.verificationStatus === claimFilter;
    }) || [];

  return (
    <div className="space-y-6 pb-16">
      <canvas ref={canvasRef} className="hidden" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Content Checker & Claim Verification Engine
          </h1>
          <p className="text-xs text-slate-500">
            Verify draft claims against Brand Brain evidence, validate freshness, check voice rules, and detect off-brand visuals.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Test Scenarios:</span>
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs">
            <button
              onClick={() => loadTemplate('contradicted')}
              className="px-2.5 py-1 font-medium rounded text-slate-700 hover:text-slate-900 hover:bg-white transition-colors"
            >
              Contradicted Claim
            </button>
            <button
              onClick={() => loadTemplate('compliant')}
              className="px-2.5 py-1 font-medium rounded text-slate-700 hover:text-slate-900 hover:bg-white transition-colors"
            >
              100% Compliant
            </button>
            <button
              onClick={() => loadTemplate('unverified')}
              className="px-2.5 py-1 font-medium rounded text-slate-700 hover:text-slate-900 hover:bg-white transition-colors"
            >
              Unverified Fact
            </button>
            <button
              onClick={() => loadTemplate('blank')}
              className="px-2.5 py-1 font-medium rounded text-slate-500 hover:text-slate-900 hover:bg-white transition-colors"
            >
              Blank
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Editor & Draft Controls (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Draft Details
              </span>
              <span className="text-[11px] text-slate-400">
                Brand: <strong className="text-slate-700">{currentBrand.name}</strong>
              </span>
            </div>

            {/* Title & Channel */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Draft Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Q4 Launch Announcement"
                  className="w-full text-xs rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Marketing Channel
                  </label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as any)}
                    className="w-full text-xs rounded-md border border-slate-300 px-2.5 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="press_release">Press Release</option>
                    <option value="landing_page">Landing Page</option>
                    <option value="social_ad">Social Ad / Card</option>
                    <option value="email_campaign">Email Campaign</option>
                    <option value="sales_deck">Sales Deck</option>
                    <option value="blog_post">Blog Post</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Auditor Workflow
                  </label>
                  <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-md px-3 py-2 flex items-center justify-between">
                    <span>Pre-Publish Check</span>
                    <span className="text-[10px] text-indigo-600 font-semibold uppercase">Strict</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-700">
                  Draft Copy / Text Content
                </label>
                <span className="text-[11px] text-slate-400">
                  {content.length} characters · ~{content.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <textarea
                rows={9}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste or write your marketing draft here..."
                className="w-full text-xs leading-relaxed font-normal rounded-md border border-slate-300 p-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y"
              />
            </div>

            {/* In-place Fix Toast */}
            {fixAppliedMessage && (
              <div className="p-2.5 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 transition-all">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{fixAppliedMessage}</span>
              </div>
            )}

            {/* Image Attachment & Color Analysis */}
            <div className="border-t border-slate-100 pt-3">
              <label className="block text-xs font-medium text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Associated Visual Asset</span>
                <span className="text-[11px] text-slate-400">OCR & Palette Extraction</span>
              </label>

              <div className="flex items-center gap-3">
                {imageUrl ? (
                  <div className="relative w-16 h-16 rounded-md overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                    <img src={imageUrl} alt="Asset preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-md border border-dashed border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
                    <Upload className="w-5 h-5" />
                  </div>
                )}

                <div className="flex-1 space-y-1.5">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://... image URL for visual compliance"
                    className="w-full text-[11px] rounded border border-slate-300 px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  {extractedPalette.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400">Extracted:</span>
                      {extractedPalette.map((p, i) => (
                        <div
                          key={i}
                          title={`${p.hex} (${p.percent}%) - ${p.isApproved ? 'Approved Brand Color' : 'Off-brand'}`}
                          className={`w-3.5 h-3.5 rounded-full border ${
                            p.isApproved ? 'border-slate-300' : 'border-red-500 ring-1 ring-red-400'
                          }`}
                          style={{ backgroundColor: p.hex }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              <button
                onClick={handleVerify}
                disabled={isAnalyzing || !content.trim()}
                className={`w-full py-2.5 px-4 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-all ${
                  isAnalyzing
                    ? 'bg-indigo-400 text-white cursor-wait'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                {isAnalyzing ? analysisStep || 'Analyzing with AI...' : 'Run AI Verification Check'}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Verification Results (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {!report && !isAnalyzing && (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-base font-semibold text-slate-900">Verification Engine Ready</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                Click &ldquo;Run AI Verification Check&rdquo; to test this draft against {facts.filter((f) => f.brandId === currentBrand.id).length} approved facts, {voiceRules.filter((r) => r.brandId === currentBrand.id).length} voice rules, and visual color constraints.
              </p>
              <div className="inline-flex items-center gap-4 text-xs text-slate-400 border-t border-slate-100 pt-4">
                <span>· Rule 1: No evidence = Unverified</span>
                <span>· Rule 2: Expirations flagged</span>
                <span>· Rule 3: Contradictions block publishing</span>
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center shadow-xs space-y-4">
              <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Analyzing Content Draft</h2>
                <p className="text-xs text-indigo-600 font-medium mt-1 animate-pulse">
                  {analysisStep}
                </p>
              </div>
            </div>
          )}

          {report && !isAnalyzing && (
            <div className="space-y-4">
              {/* Publishing Hold Banner (CRITICAL) */}
              {report.publishingHold ? (
                <div className="bg-red-50 border-2 border-red-500 rounded-xl p-4 sm:p-5 shadow-xs">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-red-600 text-white rounded-lg shrink-0 mt-0.5">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold text-red-900 tracking-tight">
                          PUBLISHING HOLD ENFORCED
                        </h2>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-100 px-2 py-0.5 rounded">
                          Blocking Distribution
                        </span>
                      </div>
                      <p className="text-xs text-red-800 leading-relaxed font-medium">
                        {report.holdReason ||
                          '1 or more claims directly contradict approved brand facts. Content cannot be distributed until factual inaccuracies are resolved.'}
                      </p>
                      <div className="pt-2 text-[11px] text-red-700 flex flex-wrap items-center gap-4">
                        <span>
                          Contradicted Claims:{' '}
                          <strong>
                            {report.claims.filter((c) => c.verificationStatus === 'contradicted').length}
                          </strong>
                        </span>
                        <span>
                          Expired Facts: <strong>{report.freshnessIssues.length}</strong>
                        </span>
                        <span>
                          Tone Violations: <strong>{report.voiceIssues.length}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 sm:p-5 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-600 text-white rounded-lg">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-emerald-900">
                        Brand Compliance Verified
                      </h2>
                      <p className="text-xs text-emerald-700">
                        Zero contradicted claims detected. Draft is cleared for approval workflow.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded">
                    Score: {report.overallScore}%
                  </span>
                </div>
              )}

              {/* Score Breakdown Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                  <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    Scoring Breakdown & Weights
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Overall:</span>
                    <span
                      className={`text-base font-bold ${
                        report.overallScore >= 70 ? 'text-indigo-600' : 'text-red-600'
                      }`}
                    >
                      {report.overallScore}/100
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="text-[10px] text-slate-500 font-medium">Claims (35%)</div>
                    <div className="text-base font-bold text-slate-900 mt-0.5">
                      {report.claimAccuracyScore}%
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="text-[10px] text-slate-500 font-medium">Freshness (20%)</div>
                    <div className="text-base font-bold text-slate-900 mt-0.5">
                      {report.freshnessScore}%
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="text-[10px] text-slate-500 font-medium">Voice (20%)</div>
                    <div className="text-base font-bold text-slate-900 mt-0.5">
                      {report.brandVoiceScore}%
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="text-[10px] text-slate-500 font-medium">Visual (25%)</div>
                    <div className="text-base font-bold text-slate-900 mt-0.5">
                      {report.visualScore}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs for Category Drilldowns */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="flex items-center border-b border-slate-200 bg-slate-50/50 p-1">
                  <button
                    onClick={() => setActiveTab('claims')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors ${
                      activeTab === 'claims'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Claims ({report.claims.length})
                  </button>

                  <button
                    onClick={() => setActiveTab('voice')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors ${
                      activeTab === 'voice'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Voice & Tone ({report.voiceIssues.length})
                  </button>

                  <button
                    onClick={() => setActiveTab('freshness')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors ${
                      activeTab === 'freshness'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Freshness ({report.freshnessIssues.length})
                  </button>

                  <button
                    onClick={() => setActiveTab('visual')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors ${
                      activeTab === 'visual'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Visual Check
                  </button>
                </div>

                {/* TAB 1: CLAIMS INSPECTOR */}
                {activeTab === 'claims' && (
                  <div className="p-4 space-y-4">
                    {/* Segmented Filter */}
                    <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setClaimFilter('all')}
                          className={`px-2.5 py-1 rounded text-xs font-medium ${
                            claimFilter === 'all'
                              ? 'bg-slate-800 text-white'
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          All ({report.claims.length})
                        </button>
                        <button
                          onClick={() => setClaimFilter('supported')}
                          className={`px-2.5 py-1 rounded text-xs font-medium ${
                            claimFilter === 'supported'
                              ? 'bg-emerald-600 text-white'
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          Supported ({report.claims.filter((c) => c.verificationStatus === 'supported').length})
                        </button>
                        <button
                          onClick={() => setClaimFilter('contradicted')}
                          className={`px-2.5 py-1 rounded text-xs font-medium ${
                            claimFilter === 'contradicted'
                              ? 'bg-red-600 text-white'
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          Contradicted ({report.claims.filter((c) => c.verificationStatus === 'contradicted').length})
                        </button>
                        <button
                          onClick={() => setClaimFilter('unverified')}
                          className={`px-2.5 py-1 rounded text-xs font-medium ${
                            claimFilter === 'unverified'
                              ? 'bg-amber-600 text-white'
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          Unverified ({report.claims.filter((c) => c.verificationStatus === 'unverified').length})
                        </button>
                      </div>
                    </div>

                    {/* Claims List */}
                    <div className="space-y-3">
                      {filteredClaims.map((claim) => (
                        <div
                          key={claim.id}
                          className={`p-4 rounded-lg border text-xs space-y-2.5 ${
                            claim.verificationStatus === 'contradicted'
                              ? 'border-red-300 bg-red-50/40'
                              : claim.verificationStatus === 'supported'
                              ? 'border-emerald-200 bg-emerald-50/30'
                              : 'border-amber-200 bg-amber-50/30'
                          }`}
                        >
                          {/* Claim Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {claim.verificationStatus === 'supported' && (
                                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 uppercase tracking-wide text-[11px]">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  Supported
                                </span>
                              )}
                              {claim.verificationStatus === 'contradicted' && (
                                <span className="inline-flex items-center gap-1 font-bold text-red-700 uppercase tracking-wide text-[11px]">
                                  <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                                  Contradicted (Hold)
                                </span>
                              )}
                              {claim.verificationStatus === 'unverified' && (
                                <span className="inline-flex items-center gap-1 font-bold text-amber-700 uppercase tracking-wide text-[11px]">
                                  <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                                  Unverified
                                </span>
                              )}

                              {claim.factId && (
                                <>
                                  <span className="text-slate-300">·</span>
                                  <span className="font-mono text-slate-700 font-semibold">
                                    {claim.factId}
                                  </span>
                                </>
                              )}
                            </div>

                            <span className="text-[11px] text-slate-500">
                              Confidence: {claim.confidenceScore}%
                            </span>
                          </div>

                          {/* Verbatim Claim */}
                          <blockquote className="border-l-2 border-slate-300 pl-3 py-0.5 text-slate-900 font-medium italic">
                            &ldquo;{claim.claimText}&rdquo;
                          </blockquote>

                          {/* Explanation */}
                          <p className="text-slate-700 leading-relaxed">{claim.explanation}</p>

                          {/* Supporting Evidence Reference */}
                          {claim.evidenceSnippet && (
                            <div className="p-2.5 bg-white/80 rounded border border-slate-200 text-[11px] space-y-1">
                              <div className="flex items-center justify-between text-slate-500 font-semibold uppercase text-[10px]">
                                <span>Brand Brain Evidence Citation:</span>
                                <span>{claim.factId}</span>
                              </div>
                              <p className="text-slate-800 font-medium">
                                Source: {claim.evidenceSnippet}
                              </p>
                              {claim.sourceReference && (
                                <p className="text-slate-500">{claim.sourceReference}</p>
                              )}
                            </div>
                          )}

                          {claim.verificationStatus === 'unverified' && (
                            <div className="p-2 bg-amber-100/60 rounded text-[11px] text-amber-900">
                              <strong>Recommendation:</strong> Brand Brain does not contain verified documentation for this assertion. Either upload proof to Brand Brain or remove claim before publishing.
                            </div>
                          )}
                        </div>
                      ))}

                      {filteredClaims.length === 0 && (
                        <div className="text-center py-6 text-slate-400 text-xs">
                          No claims match the selected filter.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 2: VOICE & TONE */}
                {activeTab === 'voice' && (
                  <div className="p-4 space-y-3">
                    {report.voiceIssues.map((v) => (
                      <div
                        key={v.id}
                        className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded text-[10px] uppercase">
                              {v.ruleType.replace('_', ' ')}
                            </span>
                            <span className="font-bold text-slate-900 line-through">
                              &ldquo;{v.matchedText}&rdquo;
                            </span>
                            {v.preferredAlternative && (
                              <>
                                <ArrowRight className="w-3 h-3 text-slate-400" />
                                <span className="font-semibold text-emerald-700">
                                  &ldquo;{v.preferredAlternative}&rdquo;
                                </span>
                              </>
                            )}
                          </div>
                          <p className="text-slate-600">{v.explanation}</p>
                        </div>

                        {v.preferredAlternative && (
                          <button
                            onClick={() => handleReplacePhrase(v.matchedText, v.preferredAlternative)}
                            className="shrink-0 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold shadow-2xs transition-colors self-start sm:self-center"
                          >
                            Replace in Text
                          </button>
                        )}
                      </div>
                    ))}

                    {report.voiceIssues.length === 0 && (
                      <div className="text-center py-8 text-xs text-slate-500">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                        No brand voice or banned terminology violations detected.
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: FRESHNESS */}
                {activeTab === 'freshness' && (
                  <div className="p-4 space-y-3 text-xs">
                    {report.freshnessIssues.map((f) => (
                      <div
                        key={f.id}
                        className="p-3.5 rounded-lg border border-amber-300 bg-amber-50/60 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-amber-900">{f.factId}</span>
                          <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                            Expired {f.daysExpired} days ago ({f.expiryDate})
                          </span>
                        </div>
                        <blockquote className="border-l-2 border-amber-400 pl-2 italic text-slate-800">
                          &ldquo;{f.claimText}&rdquo;
                        </blockquote>
                        <p className="text-slate-700">{f.explanation}</p>
                      </div>
                    ))}

                    {report.freshnessIssues.length === 0 && (
                      <div className="text-center py-8 text-slate-500">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                        All cited promotional windows, SLA metrics, and product facts are fresh and active.
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 4: VISUAL */}
                {activeTab === 'visual' && (
                  <div className="p-4 space-y-4 text-xs">
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">
                        Asset Color Distribution vs Brand Palette
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {extractedPalette.map((p, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg border ${
                              p.isApproved ? 'border-slate-200 bg-white' : 'border-red-300 bg-red-50/40'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div
                                className="w-6 h-6 rounded-md border border-slate-300 shrink-0"
                                style={{ backgroundColor: p.hex }}
                              />
                              <div>
                                <div className="font-mono font-semibold text-slate-900">{p.hex}</div>
                                <div className="text-[10px] text-slate-500">{p.percent}% coverage</div>
                              </div>
                            </div>
                            <div className="text-[11px]">
                              {p.isApproved ? (
                                <span className="text-emerald-700 font-medium">✓ {p.name}</span>
                              ) : (
                                <span className="text-red-700 font-medium">
                                  ⚠ Deviates from brand
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                      <div className="font-medium text-slate-800">Logo & Clearspace Rule:</div>
                      <p className="text-slate-600 text-[11px]">
                        Primary vector mark minimum height is 32px with 1x icon clearspace padding. WCAG AA requires $\ge 4.5:1$ text-to-background contrast.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="bg-slate-900 rounded-xl p-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                <div>
                  <div className="text-xs font-semibold text-slate-200">
                    Decision & Sign-off Action
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {report.publishingHold
                      ? 'Publishing hold blocks standard approval. Executive override required.'
                      : 'All automated criteria satisfied. Ready for sign-off.'}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => onOpenReportModal(report)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Full Report
                  </button>

                  {report.publishingHold ? (
                    <button
                      onClick={() => onOpenApprovalModal(currentSubmissionId, true)}
                      className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Executive Override
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenApprovalModal(currentSubmissionId, false)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve Draft
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
