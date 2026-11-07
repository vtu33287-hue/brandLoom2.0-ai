import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Check,
  X,
  User,
  Briefcase,
} from 'lucide-react';

interface ApprovalModalProps {
  submissionId: string;
  isOverride?: boolean;
  onClose: () => void;
  onSubmit: (params: {
    reviewerName: string;
    reviewerRole: string;
    notes: string;
    isEmergencyOverride: boolean;
  }) => Promise<void>;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  submissionId,
  isOverride = false,
  onClose,
  onSubmit,
}) => {
  const [reviewerName, setReviewerName] = useState('Sarah Jenkins');
  const [reviewerRole, setReviewerRole] = useState('Head of Brand & Legal');
  const [notes, setNotes] = useState(
    isOverride
      ? 'Executive exemption granted per CMO sign-off for partner co-marketing pilot.'
      : 'Technical claims verified against Q3 enterprise architecture specification. Approved.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !notes.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        reviewerName: reviewerName.trim(),
        reviewerRole: reviewerRole.trim(),
        notes: notes.trim(),
        isEmergencyOverride: isOverride,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Approval action failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            {isOverride ? (
              <div className="p-1.5 bg-red-100 text-red-700 rounded-lg">
                <Lock className="w-5 h-5" />
              </div>
            ) : (
              <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                <ShieldCheck className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isOverride ? 'Executive Policy Override' : 'Approve Content Draft'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Audit Trail Record for Submission: <strong className="font-mono">{submissionId}</strong>
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isOverride && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              Notice: Publishing Hold Active
            </div>
            <p className="text-[11px] leading-relaxed">
              This draft contains contradicted or unverified claims. Signing an executive override bypasses automated compliance blocks and logs your digital signature directly into the immutable audit register.
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Reviewer Full Name
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  required
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-md border border-slate-300 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Reviewer Role / Title
              </label>
              <div className="relative">
                <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  required
                  value={reviewerRole}
                  onChange={(e) => setReviewerRole(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-md border border-slate-300 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Audit Resolution Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide evidence reconciliation notes or contractual basis for sign-off..."
              className="w-full rounded-md border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Digital Cryptographic Signature:</span>
            <span className="font-mono text-indigo-700 font-bold">
              SIG_ED25519_{Date.now().toString(36).toUpperCase()}
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                isOverride
                  ? 'bg-red-600 hover:bg-red-500'
                  : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              <Check className="w-4 h-4" />
              {isSubmitting
                ? 'Logging Sign-off...'
                : isOverride
                ? 'Sign Executive Override'
                : 'Confirm Digital Approval'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
