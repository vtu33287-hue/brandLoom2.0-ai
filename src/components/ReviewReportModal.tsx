import React from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  FileText,
  Printer,
  Copy,
  Check,
  X,
  ExternalLink,
  Shield,
  HelpCircle,
  Lock,
} from 'lucide-react';
import { AnalysisReport } from '../types/brandloom';

interface ReviewReportModalProps {
  report: AnalysisReport;
  onClose: () => void;
  onApprove: (isOverride?: boolean) => void;
  onReject: () => void;
}

export const ReviewReportModal: React.FC<ReviewReportModalProps> = ({
  report,
  onClose,
  onApprove,
  onReject,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopySummary = () => {
    const text = `BRANDLOOM VERIFICATION REPORT
Title: ${report.title}
Channel: ${report.channel}
Overall Score: ${report.overallScore}/100
Status: ${report.publishingHold ? 'PUBLISHING HOLD ENFORCED' : 'PASSED'}
Summary: ${report.summary}

Scores Breakdown:
- Claim Accuracy (35%): ${report.claimAccuracyScore}%
- Information Freshness (20%): ${report.freshnessScore}%
- Brand Voice & Terminology (20%): ${report.brandVoiceScore}%
- Visual Compliance (25%): ${report.visualScore}%

Claims Checked: ${report.claims.length}
Contradicted: ${report.claims.filter((c) => c.verificationStatus === 'contradicted').length}
Unverified: ${report.claims.filter((c) => c.verificationStatus === 'unverified').length}
Supported: ${report.claims.filter((c) => c.verificationStatus === 'supported').length}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-600">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Brand Verification Audit Report</h2>
                <span className="text-[10px] uppercase font-mono font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                  {report.id}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Generated: {new Date(report.createdAt).toLocaleString()} · Channel:{' '}
                <strong className="capitalize text-slate-200">{report.channel.replace('_', ' ')}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Copy Summary Text"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handlePrint}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Print Report"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {/* Executive Verdict Banner */}
          {report.publishingHold ? (
            <div className="p-5 rounded-xl border-2 border-red-500 bg-red-50/70 flex items-start gap-4">
              <div className="p-2 bg-red-600 text-white rounded-lg shrink-0 mt-0.5">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-red-900">
                    PUBLISHING HOLD IN EFFECT
                  </h3>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-red-800 bg-red-200/80 px-2.5 py-0.5 rounded">
                    Critical Policy Lock
                  </span>
                </div>
                <p className="text-slate-800 font-medium leading-relaxed">
                  {report.holdReason ||
                    'Content contains claims that contradict verified brand facts or reference expired promotional conditions.'}
                </p>
                <div className="text-[11px] text-red-700 pt-1">
                  Required Action: Remediate contradicted assertions in the editor or obtain authorized legal executive override.
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-xl border border-emerald-300 bg-emerald-50/70 flex items-start gap-4">
              <div className="p-2 bg-emerald-600 text-white rounded-lg shrink-0 mt-0.5">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-emerald-900">
                  Approved for Distribution
                </h3>
                <p className="text-slate-800 font-medium">
                  {report.summary}
                </p>
              </div>
            </div>
          )}

          {/* Document Metadata & Scorecards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="md:col-span-1 p-4 rounded-xl bg-slate-900 text-white text-center flex flex-col justify-center items-center shadow-xs">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                Brand Score
              </span>
              <span
                className={`text-4xl font-extrabold mt-1 ${
                  report.overallScore >= 70 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {report.overallScore}
              </span>
              <span className="text-[10px] text-slate-400 mt-1">/ 100 benchmark</span>
            </div>

            <div className="md:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
                <span className="text-slate-500 text-[10px] uppercase font-semibold">
                  Claim Accuracy
                </span>
                <div className="text-xl font-bold text-slate-900 mt-1">
                  {report.claimAccuracyScore}%
                </div>
                <div className="text-[10px] text-indigo-600 font-medium mt-0.5">Weight: 35%</div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
                <span className="text-slate-500 text-[10px] uppercase font-semibold">
                  Freshness Guard
                </span>
                <div className="text-xl font-bold text-slate-900 mt-1">
                  {report.freshnessScore}%
                </div>
                <div className="text-[10px] text-amber-600 font-medium mt-0.5">Weight: 20%</div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
                <span className="text-slate-500 text-[10px] uppercase font-semibold">
                  Brand Voice
                </span>
                <div className="text-xl font-bold text-slate-900 mt-1">
                  {report.brandVoiceScore}%
                </div>
                <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Weight: 20%</div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
                <span className="text-slate-500 text-[10px] uppercase font-semibold">
                  Visual Identity
                </span>
                <div className="text-xl font-bold text-slate-900 mt-1">
                  {report.visualScore}%
                </div>
                <div className="text-[10px] text-violet-600 font-medium mt-0.5">Weight: 25%</div>
              </div>
            </div>
          </div>

          {/* Section: Claims Evidence Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h4 className="text-sm font-bold text-slate-900">
                Factual Claims & Supporting Evidence
              </h4>
              <span className="text-slate-500">
                Rule: No verified evidence in Brand Brain = Unverified. Never hallucinate.
              </span>
            </div>

            <div className="space-y-3">
              {report.claims.map((claim, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border text-xs space-y-2 ${
                    claim.verificationStatus === 'contradicted'
                      ? 'border-red-300 bg-red-50/40'
                      : claim.verificationStatus === 'supported'
                      ? 'border-emerald-200 bg-emerald-50/30'
                      : 'border-amber-200 bg-amber-50/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {claim.verificationStatus === 'supported' && (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 uppercase tracking-wide text-[10px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Supported
                        </span>
                      )}
                      {claim.verificationStatus === 'contradicted' && (
                        <span className="inline-flex items-center gap-1 font-bold text-red-700 uppercase tracking-wide text-[10px]">
                          <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                          Contradicted
                        </span>
                      )}
                      {claim.verificationStatus === 'unverified' && (
                        <span className="inline-flex items-center gap-1 font-bold text-amber-700 uppercase tracking-wide text-[10px]">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                          Unverified
                        </span>
                      )}

                      {claim.factId && (
                        <span className="font-mono text-slate-700 font-semibold text-[11px]">
                          · {claim.factId}
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] text-slate-500">
                      Confidence: {claim.confidenceScore}%
                    </span>
                  </div>

                  <div className="font-semibold text-slate-900 italic">
                    &ldquo;{claim.claimText}&rdquo;
                  </div>

                  <p className="text-slate-700">{claim.explanation}</p>

                  {claim.evidenceSnippet && (
                    <div className="p-2.5 bg-white rounded border border-slate-200 text-[11px] space-y-0.5">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">
                        Verified Evidence Source:
                      </div>
                      <div className="font-semibold text-slate-800">{claim.evidenceSnippet}</div>
                      {claim.sourceReference && (
                        <div className="text-slate-500">{claim.sourceReference}</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section: Voice & Freshness Summary */}
          {(report.voiceIssues.length > 0 || report.freshnessIssues.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.voiceIssues.length > 0 && (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <h5 className="font-semibold text-slate-900">Brand Voice Violations</h5>
                  <div className="space-y-1.5">
                    {report.voiceIssues.map((v, i) => (
                      <div key={i} className="text-[11px] text-slate-700">
                        • <strong className="line-through">{v.matchedText}</strong> →{' '}
                        <span className="text-emerald-700 font-semibold">{v.preferredAlternative}</span>: {v.explanation}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {report.freshnessIssues.length > 0 && (
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 space-y-2">
                  <h5 className="font-semibold text-amber-900">Freshness Alerts</h5>
                  <div className="space-y-1.5">
                    {report.freshnessIssues.map((f, i) => (
                      <div key={i} className="text-[11px] text-amber-900">
                        • <strong>{f.factId}</strong> expired {f.daysExpired} days ago ({f.expiryDate}): {f.explanation}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Immutable Audit ID: <span className="font-mono text-slate-700 font-bold">{report.id}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onReject}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition-colors"
            >
              Reject Content
            </button>

            {report.publishingHold ? (
              <button
                onClick={() => onApprove(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                Sign Executive Override
              </button>
            ) : (
              <button
                onClick={() => onApprove(false)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Approve for Publishing
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
