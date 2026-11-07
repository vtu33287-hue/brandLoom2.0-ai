import React, { useState } from 'react';
import {
  History,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  Lock,
  ArrowRight,
  User,
  Calendar,
  FileCheck,
} from 'lucide-react';
import {
  Brand,
  ContentSubmission,
  AuditLog,
  AnalysisReport,
} from '../types/brandloom';

interface ApprovalAuditViewProps {
  currentBrand: Brand;
  submissions: ContentSubmission[];
  reports: Record<string, AnalysisReport>;
  auditLogs: AuditLog[];
  onOpenApprovalModal: (submissionId: string, isOverride?: boolean) => void;
  onRejectSubmission: (submissionId: string) => void;
  onInspectSubmission: (submission: ContentSubmission) => void;
}

export const ApprovalAuditView: React.FC<ApprovalAuditViewProps> = ({
  currentBrand,
  submissions,
  reports,
  auditLogs,
  onOpenApprovalModal,
  onRejectSubmission,
  onInspectSubmission,
}) => {
  const [tab, setTab] = useState<'queue' | 'audit'>('queue');
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const brandSubmissions = submissions.filter((s) => s.brandId === currentBrand.id);
  const brandLogs = auditLogs.filter((l) => l.brandId === currentBrand.id);

  const pendingSubmissions = brandSubmissions.filter(
    (s) => s.status === 'under_review' || s.status === 'publishing_hold'
  );

  const filteredLogs = brandLogs.filter((log) => {
    const matchesSearch =
      log.actorName.toLowerCase().includes(search.toLowerCase()) ||
      log.actionType.toLowerCase().includes(search.toLowerCase()) ||
      log.entityId.toLowerCase().includes(search.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.actionType === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Approval Workflow & Immutable Audit Trail
          </h1>
          <p className="text-xs text-slate-500">
            Governance register tracking every verified claim, reviewer sign-off, rule modification, and executive override.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
          <button
            onClick={() => setTab('queue')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              tab === 'queue'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Review Queue ({pendingSubmissions.length})
          </button>
          <button
            onClick={() => setTab('audit')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              tab === 'audit'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Audit Log History ({brandLogs.length})
          </button>
        </div>
      </div>

      {/* VIEW 1: REVIEW QUEUE */}
      {tab === 'queue' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {pendingSubmissions.map((sub) => {
              const rep = sub.reportId ? reports[sub.reportId] : null;
              const hasHold = sub.status === 'publishing_hold' || rep?.publishingHold;

              return (
                <div
                  key={sub.id}
                  className={`bg-white border rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 ${
                    hasHold ? 'border-red-300 bg-red-50/20' : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono text-slate-400 font-bold">{sub.id}</span>
                      <span className="text-slate-300">·</span>
                      <span className="capitalize font-medium text-slate-700">
                        {sub.channel.replace('_', ' ')}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-500">Author: {sub.authorName}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{sub.title}</h3>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {sub.rawContent}
                    </p>

                    {rep && (
                      <div className="flex items-center gap-4 text-xs pt-1">
                        <span className="font-bold text-slate-700">
                          Compliance Score: {rep.overallScore}%
                        </span>
                        <span>·</span>
                        <span>
                          Claims: <strong>{rep.claims.length}</strong>
                        </span>
                        {rep.claims.filter((c) => c.verificationStatus === 'contradicted').length > 0 && (
                          <span className="text-red-600 font-semibold">
                            ⚠ {rep.claims.filter((c) => c.verificationStatus === 'contradicted').length} contradicted
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions & Status */}
                  <div className="flex flex-col sm:flex-row md:flex-col items-end gap-2.5 shrink-0">
                    {hasHold ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-100/80 px-2.5 py-1 rounded">
                        <ShieldAlert className="w-4 h-4 text-red-600" />
                        Publishing Hold
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100/80 px-2.5 py-1 rounded">
                        <Clock className="w-4 h-4 text-amber-600" />
                        Ready for Review
                      </span>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onInspectSubmission(sub)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium transition-colors"
                      >
                        Inspect
                      </button>

                      <button
                        onClick={() => onRejectSubmission(sub.id)}
                        className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded text-xs font-medium transition-colors"
                      >
                        Reject
                      </button>

                      {hasHold ? (
                        <button
                          onClick={() => onOpenApprovalModal(sub.id, true)}
                          className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          Override & Approve
                        </button>
                      ) : (
                        <button
                          onClick={() => onOpenApprovalModal(sub.id, false)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approve Draft
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {pendingSubmissions.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-xs text-slate-500 shadow-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="font-semibold text-slate-800">All submissions have been reviewed.</p>
                <p className="text-slate-400 mt-1">
                  Use the Content Checker to test a new draft.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: AUDIT LOG HISTORY */}
      {tab === 'audit' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search audit trail by actor, action, or target entity ID..."
                className="w-full pl-9 pr-3 py-1.5 rounded-md border border-slate-300 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <select
              aria-label="Filter by action type"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-md border border-slate-300 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Actions</option>
              <option value="DRAFT_APPROVED">Draft Approved</option>
              <option value="DRAFT_REJECTED">Draft Rejected</option>
              <option value="OVERRIDE_GRANTED">Override Granted</option>
              <option value="CLAIM_VERIFIED">Claim Verified</option>
              <option value="FACT_ADDED">Fact Added</option>
              <option value="FACT_UPDATED">Fact Updated</option>
              <option value="RULE_ADDED">Rule Added</option>
            </select>
          </div>

          {/* Audit Log Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-medium border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-5">Timestamp</th>
                    <th className="py-3 px-5">Actor & Role</th>
                    <th className="py-3 px-5">Action Type</th>
                    <th className="py-3 px-5">Target Entity</th>
                    <th className="py-3 px-5">Event Details & Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-5 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-slate-900">{log.actorName}</div>
                        <div className="text-[10px] text-slate-400">{log.actorRole}</div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                            log.actionType === 'DRAFT_APPROVED'
                              ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                              : log.actionType === 'OVERRIDE_GRANTED'
                              ? 'text-red-700 bg-red-50 border border-red-200'
                              : log.actionType === 'DRAFT_REJECTED'
                              ? 'text-rose-700 bg-rose-50 border border-rose-200'
                              : 'text-indigo-700 bg-indigo-50 border border-indigo-200'
                          }`}
                        >
                          {log.actionType}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-mono text-slate-700 text-[11px]">
                        {log.entityId}
                      </td>
                      <td className="py-3.5 px-5 max-w-sm">
                        {log.details.notes && (
                          <p className="text-slate-800 font-medium italic">
                            &ldquo;{log.details.notes}&rdquo;
                          </p>
                        )}
                        <pre className="text-[10px] text-slate-500 font-mono overflow-hidden text-ellipsis whitespace-nowrap max-w-xs mt-0.5">
                          {JSON.stringify(log.details)}
                        </pre>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
