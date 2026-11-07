import React, { useState } from 'react';
import {
  FileText,
  ShieldAlert,
  CheckCircle2,
  Search,
  ArrowRight,
  Eye,
  Percent,
} from 'lucide-react';
import { Brand, AnalysisReport, ContentSubmission } from '../types/brandloom';

interface ReviewReportsViewProps {
  currentBrand: Brand;
  reports: Record<string, AnalysisReport>;
  submissions: ContentSubmission[];
  onOpenReportModal: (report: AnalysisReport) => void;
}

export const ReviewReportsView: React.FC<ReviewReportsViewProps> = ({
  currentBrand,
  reports,
  submissions,
  onOpenReportModal,
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'holds' | 'approved'>('all');

  const reportList = Object.values(reports).filter((r) => r.brandId === currentBrand.id);

  const filteredReports = reportList.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.summary.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase());
    if (filter === 'holds') return matchesSearch && r.publishingHold;
    if (filter === 'approved') return matchesSearch && !r.publishingHold;
    return matchesSearch;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Brand Compliance Review Reports
          </h1>
          <p className="text-xs text-slate-500">
            Historical audit reports with claim accuracy, freshness validation, and brand voice analysis.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 text-xs">
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 font-medium rounded transition-colors ${
                filter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Reports ({reportList.length})
            </button>
            <button
              onClick={() => setFilter('holds')}
              className={`px-3 py-1 font-medium rounded transition-colors ${
                filter === 'holds'
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Publishing Holds ({reportList.filter((r) => r.publishingHold).length})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-3 py-1 font-medium rounded transition-colors ${
                filter === 'approved'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Passed ({reportList.filter((r) => !r.publishingHold).length})
            </button>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredReports.map((rep) => {
          const contradictedCount = rep.claims.filter(
            (c) => c.verificationStatus === 'contradicted'
          ).length;
          const unverifiedCount = rep.claims.filter(
            (c) => c.verificationStatus === 'unverified'
          ).length;

          return (
            <div
              key={rep.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-slate-400 font-semibold">
                    {rep.id}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(rep.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{rep.title}</h3>
                  <p className="text-[11px] text-slate-500 capitalize">
                    Channel: {rep.channel.replace('_', ' ')}
                  </p>
                </div>

                {/* Score & Verdict Pill */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-2xl font-black ${
                        rep.overallScore >= 70 ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {rep.overallScore}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">/100</span>
                  </div>

                  {rep.publishingHold ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                      <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                      Publishing Hold
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Passed
                    </span>
                  )}
                </div>

                {/* Summary snippet */}
                <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
                  {rep.summary}
                </p>

                {/* Claim counts */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Claims Checked: <strong>{rep.claims.length}</strong></span>
                  {contradictedCount > 0 && (
                    <span className="text-red-600 font-semibold">
                      {contradictedCount} contradicted
                    </span>
                  )}
                  {unverifiedCount > 0 && (
                    <span className="text-amber-600 font-medium">
                      {unverifiedCount} unverified
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 p-3 px-5 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => onOpenReportModal(rep)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Full Audit Report
                </button>
              </div>
            </div>
          );
        })}

        {filteredReports.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-400 text-xs">
            No reports match the selected criteria.
          </div>
        )}
      </div>
    </div>
  );
};
