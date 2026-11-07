import React from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Database,
  ExternalLink,
  Percent,
} from 'lucide-react';
import { Brand, ApprovedFact, ContentSubmission, AnalysisReport } from '../types/brandloom';

interface DashboardViewProps {
  currentBrand: Brand;
  facts: ApprovedFact[];
  submissions: ContentSubmission[];
  reports: Record<string, AnalysisReport>;
  onInspectSubmission: (submission: ContentSubmission) => void;
  onNavigateTab: (tab: 'checker' | 'brain' | 'reports' | 'audit') => void;
  onRenewFact: (factId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentBrand,
  facts,
  submissions,
  reports,
  onInspectSubmission,
  onNavigateTab,
  onRenewFact,
}) => {
  const brandSubmissions = submissions.filter((s) => s.brandId === currentBrand.id);
  const brandFacts = facts.filter((f) => f.brandId === currentBrand.id);
  const expiredFacts = brandFacts.filter(
    (f) => f.status === 'expired' || (f.expiryDate && f.expiryDate < '2026-11-07')
  );
  const activeFacts = brandFacts.filter((f) => !expiredFacts.some((ef) => ef.id === f.id));

  const holds = brandSubmissions.filter((s) => s.status === 'publishing_hold');
  const approved = brandSubmissions.filter((s) => s.status === 'approved');
  const underReview = brandSubmissions.filter((s) => s.status === 'under_review');

  // Compute average score
  const scoredReports = Object.values(reports).filter((r) => r.brandId === currentBrand.id);
  const avgScore =
    scoredReports.length > 0
      ? Math.round(scoredReports.reduce((acc, r) => acc + r.overallScore, 0) / scoredReports.length)
      : 84;

  return (
    <div className="space-y-8 pb-12">
      {/* Brand Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 text-white shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                {currentBrand.industry}
              </span>
              <span className="text-slate-500">·</span>
              <a
                href={currentBrand.website}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1 transition-colors"
              >
                {currentBrand.website.replace('https://', '')}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {currentBrand.name} Brand Health & Verification Console
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {currentBrand.tagline} — Automated checkpoint ensuring zero unverified claims, outdated facts, or off-brand terminology reach production.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateTab('checker')}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Verify New Draft
            </button>
            <button
              onClick={() => onNavigateTab('brain')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-2 transition-all"
            >
              <Database className="w-4 h-4" />
              Manage Brain ({brandFacts.length} Facts)
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Brand Compliance Score */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Compliance Index
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{avgScore}</span>
            <span className="text-xs text-slate-500">/ 100 benchmark</span>
          </div>
          <div className="mt-3 text-xs text-slate-500 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Target threshold: $\ge 70$ for automated pass</span>
          </div>
        </div>

        {/* Card 2: Publishing Holds */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Publishing Holds
            </span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                holds.length > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className={`text-3xl font-bold ${
                holds.length > 0 ? 'text-red-600' : 'text-slate-900'
              }`}
            >
              {holds.length}
            </span>
            <span className="text-xs text-slate-500">blocked drafts</span>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {holds.length > 0
              ? 'Contradicted claims require remediation'
              : 'Zero active critical contradictions'}
          </p>
        </div>

        {/* Card 3: Freshness Guard */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Approved Brand Facts
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{activeFacts.length}</span>
            <span className="text-xs text-slate-500">active</span>
            {expiredFacts.length > 0 && (
              <span className="text-xs font-semibold text-amber-600 ml-1">
                ({expiredFacts.length} expired)
              </span>
            )}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Citations indexed across product, security, & pricing
          </p>
        </div>

        {/* Card 4: Review Queue */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Review Pipeline
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{underReview.length}</span>
            <span className="text-xs text-slate-500">pending sign-off</span>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {approved.length} approved drafts in archive
          </p>
        </div>
      </div>

      {/* Middle Grid: Scoring Model Weights & Freshness Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scoring Architecture Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Scoring Engine Weights</h2>
              <p className="text-xs text-slate-500">Standard audit model distribution</p>
            </div>
            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
              100% Total
            </span>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                <span>Claim Accuracy</span>
                <span className="font-semibold text-indigo-600">35% Weight</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '35%' }}></div>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Contradicted claims trigger immediate 0% claim score and publishing hold.
              </p>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                <span>Visual Compliance</span>
                <span className="font-semibold text-violet-600">25% Weight</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-violet-600 h-2 rounded-full" style={{ width: '25%' }}></div>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Evaluates approved color palette, contrast ratios, and logo clearspace.
              </p>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                <span>Information Freshness</span>
                <span className="font-semibold text-amber-600">20% Weight</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '20%' }}></div>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Automatic validation against fact expiry timestamps.
              </p>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                <span>Brand Voice & Terminology</span>
                <span className="font-semibold text-emerald-600">20% Weight</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '20%' }}></div>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Banned buzzwords, legal liability phrases, and exact orthography.
              </p>
            </div>
          </div>
        </div>

        {/* Freshness Watchlist */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Freshness Guard Watchlist</h2>
                <p className="text-xs text-slate-500">
                  Facts flagged as expired or nearing contractual expiration
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('brain')}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-1"
              >
                View all facts
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {expiredFacts.length > 0 ? (
                expiredFacts.map((fact) => (
                  <div
                    key={fact.id}
                    className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold text-amber-900">
                          {fact.id}
                        </span>
                        <span className="text-xs text-amber-700">·</span>
                        <span className="text-xs font-medium text-amber-800 uppercase">
                          {fact.category}
                        </span>
                        <span className="text-xs text-amber-700">·</span>
                        <span className="text-xs font-semibold text-red-600">
                          Expired: {fact.expiryDate}
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 font-medium">{fact.statement}</p>
                      <p className="text-[11px] text-slate-500">Source: {fact.supportingSource}</p>
                    </div>

                    <button
                      onClick={() => onRenewFact(fact.id)}
                      className="shrink-0 px-3 py-1.5 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 border border-slate-300 rounded-md shadow-2xs transition-colors self-start sm:self-center"
                    >
                      Renew Fact (Q1 2027)
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-slate-500">
                  All active brand facts are currently fresh and within valid operational windows.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Reference Date: November 7, 2026</span>
            <span className="text-indigo-600 font-medium">Automatic daily chron check active</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Content Pipeline */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Content Submissions & Audit Status</h2>
            <p className="text-xs text-slate-500">
              Drafts verified through the BrandLoom compliance checkpoint
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('checker')}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 self-start sm:self-auto"
          >
            Submit new content draft
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-medium border-b border-slate-200">
              <tr>
                <th className="py-3 px-6">Title & Channel</th>
                <th className="py-3 px-6">Author</th>
                <th className="py-3 px-6">Score</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Submitted</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {brandSubmissions.map((sub) => {
                const report = sub.reportId ? reports[sub.reportId] : null;
                const score = report?.overallScore ?? '--';

                return (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-900 text-sm">{sub.title}</div>
                      <div className="text-slate-500 text-[11px] capitalize">
                        {sub.channel.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-slate-900 font-medium">{sub.authorName}</div>
                      <div className="text-slate-400 text-[11px]">{sub.authorRole}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`font-semibold text-sm ${
                          typeof score === 'number'
                            ? score >= 85
                              ? 'text-emerald-600'
                              : score >= 70
                              ? 'text-indigo-600'
                              : 'text-red-600'
                            : 'text-slate-400'
                        }`}
                      >
                        {score}
                        {typeof score === 'number' && '%'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {sub.status === 'publishing_hold' && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                          <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                          Publishing Hold
                        </span>
                      )}
                      {sub.status === 'approved' && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Approved
                        </span>
                      )}
                      {sub.status === 'under_review' && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          Under Review
                        </span>
                      )}
                      {sub.status === 'draft' && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                          Draft
                        </span>
                      )}
                      {sub.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                          Rejected
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {new Date(sub.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => onInspectSubmission(sub)}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1 transition-colors"
                      >
                        Inspect Claims
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
