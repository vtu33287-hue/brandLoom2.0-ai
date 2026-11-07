import React, { useState } from 'react';
import {
  Database,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  FileText,
  Upload,
  Trash2,
  Edit2,
  ExternalLink,
  Shield,
  Volume2,
  Palette,
  Sparkles,
  FileCheck,
} from 'lucide-react';
import {
  Brand,
  ApprovedFact,
  BrandVoiceRule,
  BrandAsset,
  BrandColor,
} from '../types/brandloom';

interface BrandBrainViewProps {
  currentBrand: Brand;
  facts: ApprovedFact[];
  voiceRules: BrandVoiceRule[];
  assets: BrandAsset[];
  onAddFact: (fact: Partial<ApprovedFact>) => Promise<ApprovedFact>;
  onUpdateFact: (id: string, updates: Partial<ApprovedFact>) => Promise<ApprovedFact>;
  onDeleteFact: (id: string) => Promise<boolean>;
  onAddVoiceRule: (rule: Partial<BrandVoiceRule>) => Promise<BrandVoiceRule>;
  onUploadGuideline: (fileName: string, content: string) => Promise<any>;
}

export const BrandBrainView: React.FC<BrandBrainViewProps> = ({
  currentBrand,
  facts,
  voiceRules,
  assets,
  onAddFact,
  onUpdateFact,
  onDeleteFact,
  onAddVoiceRule,
  onUploadGuideline,
}) => {
  const [subTab, setSubTab] = useState<'facts' | 'voice' | 'visual' | 'upload'>('facts');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fact modal states
  const [isFactModalOpen, setIsFactModalOpen] = useState(false);
  const [factIdInput, setFactIdInput] = useState('');
  const [categoryInput, setCategoryInput] = useState<ApprovedFact['category']>('product');
  const [statementInput, setStatementInput] = useState('');
  const [sourceInput, setSourceInput] = useState('');
  const [citationInput, setCitationInput] = useState('');
  const [expiryInput, setExpiryInput] = useState('');

  // Voice rule modal states
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [ruleTypeInput, setRuleTypeInput] = useState<BrandVoiceRule['ruleType']>('banned_word');
  const [phraseInput, setPhraseInput] = useState('');
  const [alternativeInput, setAlternativeInput] = useState('');
  const [reasonInput, setReasonInput] = useState('');
  const [severityInput, setSeverityInput] = useState<BrandVoiceRule['severity']>('warning');

  // Document ingestion state
  const [uploadText, setUploadText] = useState('');
  const [uploadFileName, setUploadFileName] = useState('Brand_Guidelines_v4.pdf');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const brandFacts = facts.filter((f) => f.brandId === currentBrand.id);
  const brandRules = voiceRules.filter((r) => r.brandId === currentBrand.id);

  // Filter facts
  const filteredFacts = brandFacts.filter((f) => {
    const matchesSearch =
      f.statement.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.supportingSource.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || f.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreateFact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statementInput.trim() || !sourceInput.trim()) return;

    await onAddFact({
      id: factIdInput.trim() || `FACT-${100 + brandFacts.length + 1}`,
      brandId: currentBrand.id,
      category: categoryInput,
      statement: statementInput.trim(),
      supportingSource: sourceInput.trim(),
      sourceCitation: citationInput.trim(),
      approvalDate: new Date().toISOString().split('T')[0],
      expiryDate: expiryInput || undefined,
      status: 'active',
    });

    setIsFactModalOpen(false);
    setFactIdInput('');
    setStatementInput('');
    setSourceInput('');
    setCitationInput('');
    setExpiryInput('');
  };

  const handleCreateVoiceRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phraseInput.trim() || !reasonInput.trim()) return;

    await onAddVoiceRule({
      brandId: currentBrand.id,
      ruleType: ruleTypeInput,
      originalPhrase: phraseInput.trim(),
      preferredAlternative: alternativeInput.trim(),
      reason: reasonInput.trim(),
      severity: severityInput,
      isActive: true,
    });

    setIsRuleModalOpen(false);
    setPhraseInput('');
    setAlternativeInput('');
    setReasonInput('');
  };

  const handleDocumentIngest = async () => {
    if (!uploadText.trim()) return;
    setIsUploading(true);
    try {
      await onUploadGuideline(uploadFileName, uploadText);
      setUploadSuccess(`Successfully parsed and added guidelines from "${uploadFileName}" to Brand Brain.`);
      setUploadText('');
      setTimeout(() => setUploadSuccess(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Brand Brain & Knowledge Base
          </h1>
          <p className="text-xs text-slate-500">
            The single source of truth for approved facts, citations, voice constraints, and visual identity for {currentBrand.name}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {subTab === 'facts' && (
            <button
              onClick={() => setIsFactModalOpen(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Approved Fact
            </button>
          )}

          {subTab === 'voice' && (
            <button
              onClick={() => setIsRuleModalOpen(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Voice Rule
            </button>
          )}
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs">
        <button
          onClick={() => setSubTab('facts')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
            subTab === 'facts'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          Approved Facts ({brandFacts.length})
        </button>

        <button
          onClick={() => setSubTab('voice')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
            subTab === 'voice'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5" />
          Voice & Terminology ({brandRules.length})
        </button>

        <button
          onClick={() => setSubTab('visual')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
            subTab === 'visual'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          Visual & Palette ({currentBrand.colors.length})
        </button>

        <button
          onClick={() => setSubTab('upload')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
            subTab === 'upload'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          Guideline Ingestion (PDF / Doc)
        </button>
      </div>

      {/* ==================================================== */}
      {/* TAB 1: APPROVED FACTS */}
      {/* ==================================================== */}
      {subTab === 'facts' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search facts by keyword, ID, or source citation..."
                className="w-full pl-9 pr-3 py-1.5 rounded-md border border-slate-300 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                aria-label="Filter by category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-md border border-slate-300 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">All Categories</option>
                <option value="product">Product</option>
                <option value="integrations">Integrations</option>
                <option value="security">Security</option>
                <option value="compliance">Compliance</option>
                <option value="pricing">Pricing</option>
              </select>

              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-md border border-slate-300 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          {/* Facts Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-medium border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-5">Fact ID</th>
                    <th className="py-3 px-5">Statement & Evidence</th>
                    <th className="py-3 px-5">Category</th>
                    <th className="py-3 px-5">Expiry Window</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFacts.map((fact) => {
                    const isExpired =
                      fact.status === 'expired' ||
                      (fact.expiryDate && fact.expiryDate < '2026-11-07');

                    return (
                      <tr key={fact.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-5 font-mono font-bold text-slate-900">
                          {fact.id}
                        </td>
                        <td className="py-3.5 px-5 max-w-md">
                          <p className="font-semibold text-slate-900 leading-snug">
                            {fact.statement}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                            <span>Source:</span>
                            <strong className="text-slate-700">{fact.supportingSource}</strong>
                          </p>
                          {fact.sourceCitation && (
                            <p className="text-[10px] text-slate-400 italic">
                              {fact.sourceCitation}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="capitalize text-slate-700 font-medium">
                            {fact.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="text-slate-700">
                            {fact.expiryDate ? fact.expiryDate : 'Perpetual / Ongoing'}
                          </div>
                          {isExpired && (
                            <div className="text-[10px] font-semibold text-red-600 mt-0.5">
                              ⚠ Expired Fact
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-5">
                          {isExpired ? (
                            <span className="inline-flex items-center gap-1 text-red-700 font-semibold bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[11px]">
                              Expired
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="inline-flex items-center gap-2">
                            {isExpired && (
                              <button
                                onClick={() =>
                                  onUpdateFact(fact.id, {
                                    expiryDate: '2027-06-30',
                                    status: 'active',
                                  })
                                }
                                className="text-indigo-600 hover:text-indigo-800 font-medium underline"
                              >
                                Renew
                              </button>
                            )}
                            <button
                              onClick={() => onDeleteFact(fact.id)}
                              className="text-slate-400 hover:text-red-600 transition-colors p-1"
                              title="Delete fact"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: VOICE & TERMINOLOGY */}
      {/* ==================================================== */}
      {subTab === 'voice' && (
        <div className="space-y-4">
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-xs text-indigo-900 flex items-start gap-3">
            <Shield className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold">Brand Tone Directive:</strong>{' '}
              {currentBrand.toneGuidelines}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {brandRules.map((rule) => (
              <div
                key={rule.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-slate-500 font-semibold text-[10px]">
                    {rule.id}
                  </span>
                  <span
                    className={`font-semibold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded ${
                      rule.severity === 'critical'
                        ? 'text-red-700 bg-red-50 border border-red-200'
                        : 'text-amber-700 bg-amber-50 border border-amber-200'
                    }`}
                  >
                    {rule.severity}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-slate-500 uppercase tracking-wide text-[10px] font-semibold">
                    Original Phrase (Banned):
                  </div>
                  <div className="font-bold text-slate-900 text-sm line-through">
                    &ldquo;{rule.originalPhrase}&rdquo;
                  </div>
                </div>

                {rule.preferredAlternative && (
                  <div className="space-y-1">
                    <div className="text-slate-500 uppercase tracking-wide text-[10px] font-semibold">
                      Preferred Alternative:
                    </div>
                    <div className="font-bold text-emerald-700 text-sm">
                      &ldquo;{rule.preferredAlternative}&rdquo;
                    </div>
                  </div>
                )}

                <p className="text-slate-600 text-[11px] border-t border-slate-100 pt-2">
                  <strong className="text-slate-800">Rationale:</strong> {rule.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 3: VISUAL IDENTITY & PALETTE */}
      {/* ==================================================== */}
      {subTab === 'visual' && (
        <div className="space-y-6">
          {/* Color Palette Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-900">
                Official Brand Color Palette & Tolerance Rules
              </h2>
              <span className="text-xs text-slate-500">
                Extracted visual assets are tested against this spectrum
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {currentBrand.colors.map((color, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs text-xs"
                >
                  <div
                    className="h-20 w-full flex items-center justify-center text-white font-mono font-bold text-xs shadow-inner"
                    style={{ backgroundColor: color.hex }}
                  >
                    {color.hex}
                  </div>
                  <div className="p-3 space-y-1">
                    <div className="font-semibold text-slate-900">{color.name}</div>
                    <div className="text-[10px] uppercase font-semibold text-indigo-600">
                      {color.role}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Tolerance: &plusmn;{color.tolerance || 15} Euclidean
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Typography & Assets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">
                Typography Rules
              </h2>
              <div className="space-y-2">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                    Primary Body Font:
                  </span>
                  <span className="font-mono font-semibold text-slate-800">
                    {currentBrand.primaryFont}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                    Display & Header Font:
                  </span>
                  <span className="font-mono font-semibold text-slate-800">
                    {currentBrand.headingFont}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                    Minimum Contrast Standard:
                  </span>
                  <span className="font-semibold text-emerald-700">
                    WCAG 2.1 AA ($\ge 4.5:1$ text, $\ge 3:1$ large text)
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">
                Logo Clearspace & Restrictions
              </h2>
              <ul className="space-y-1.5 text-slate-600 text-[11px] list-disc list-inside">
                <li>Minimum height for digital mark is 32px; print is 0.5 inches.</li>
                <li>Clearspace requirement: minimum 1x lettermark width surrounding bounding box.</li>
                <li>Do not skew, rotate, or alter vector color fills outside approved palette.</li>
                <li>Never place primary dark mark over backgrounds with &lt;4.5:1 contrast ratio.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 4: GUIDELINE DOCUMENT INGESTION */}
      {/* ==================================================== */}
      {subTab === 'upload' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs max-w-2xl space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Upload PDF or Text Brand Guidelines
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Ingest guidelines, whitepapers, or pricing matrices to auto-extract verifiable facts into the Brand Brain.
            </p>
          </div>

          {uploadSuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{uploadSuccess}</span>
            </div>
          )}

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Document File Name / Reference
              </label>
              <input
                type="text"
                value={uploadFileName}
                onChange={(e) => setUploadFileName(e.target.value)}
                className="w-full rounded-md border border-slate-300 p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Quick Fill Sample Guidelines */}
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-slate-500">Insert Sample Document Text:</span>
              <button
                type="button"
                onClick={() => {
                  setUploadFileName('Neosframe_Enterprise_SLA_2027.pdf');
                  setUploadText(
                    `NEOSFRAME ENTERPRISE RELIABILITY SPECIFICATION 2027\n\nSection 1.1 Availability Guarantees: Neosframe guarantees 99.99% uptime for Tier-1 Enterprise customers with automated sub-second failover across AWS us-east-1 and eu-west-1.\n\nSection 1.2 Data Residency: Customer creative libraries can be geofenced strictly to Frankfurt, Germany or Oregon, USA upon contractual selection.\n\nSection 1.3 Encryption Standards: Continuous hardware security module (HSM) key rotation enforces FIPS 140-2 Level 3 compliance.`
                  );
                }}
                className="text-indigo-600 hover:underline font-medium"
              >
                Enterprise SLA Spec 2027
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Guideline Content or Extracted Document Text
              </label>
              <textarea
                rows={8}
                value={uploadText}
                onChange={(e) => setUploadText(e.target.value)}
                placeholder="Paste guideline text, SLA terms, or policy manual here..."
                className="w-full rounded-md border border-slate-300 p-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <button
              onClick={handleDocumentIngest}
              disabled={isUploading || !uploadText.trim()}
              className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {isUploading ? 'Extracting & Indexing Facts...' : 'Ingest Document into Brand Brain'}
            </button>
          </div>
        </div>
      )}

      {/* MODAL: ADD FACT */}
      {isFactModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-semibold text-slate-900">Add Approved Brand Fact</h3>
              <button
                onClick={() => setIsFactModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFact} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Fact Identifier
                  </label>
                  <input
                    type="text"
                    value={factIdInput}
                    onChange={(e) => setFactIdInput(e.target.value)}
                    placeholder={`FACT-${100 + brandFacts.length + 1}`}
                    className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value as any)}
                    className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-slate-900"
                  >
                    <option value="product">Product</option>
                    <option value="integrations">Integrations</option>
                    <option value="security">Security</option>
                    <option value="compliance">Compliance</option>
                    <option value="pricing">Pricing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Factual Statement <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={statementInput}
                  onChange={(e) => setStatementInput(e.target.value)}
                  placeholder="e.g. Enterprise plan guarantees a 99.95% uptime SLA with active multi-region failover."
                  className="w-full rounded border border-slate-300 p-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Supporting Document Source <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={sourceInput}
                  onChange={(e) => setSourceInput(e.target.value)}
                  placeholder="e.g. Master Services Agreement 2026, Section 4.2"
                  className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Verification Citation (Optional)
                  </label>
                  <input
                    type="text"
                    value={citationInput}
                    onChange={(e) => setCitationInput(e.target.value)}
                    placeholder="e.g. Legal Ref #MSA-2026"
                    className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Expiration Date (Freshness)
                  </label>
                  <input
                    type="date"
                    value={expiryInput}
                    onChange={(e) => setExpiryInput(e.target.value)}
                    className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFactModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-semibold"
                >
                  Save Fact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD VOICE RULE */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-semibold text-slate-900">Add Brand Voice Rule</h3>
              <button
                onClick={() => setIsRuleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateVoiceRule} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Rule Type
                  </label>
                  <select
                    value={ruleTypeInput}
                    onChange={(e) => setRuleTypeInput(e.target.value as any)}
                    className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-slate-900"
                  >
                    <option value="banned_word">Banned Word / Phrase</option>
                    <option value="preferred_term">Preferred Terminology</option>
                    <option value="tone_rule">Tone Constraint</option>
                    <option value="required_disclaimer">Required Disclaimer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Severity
                  </label>
                  <select
                    value={severityInput}
                    onChange={(e) => setSeverityInput(e.target.value as any)}
                    className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-slate-900"
                  >
                    <option value="critical">Critical (Blocks publishing)</option>
                    <option value="warning">Warning</option>
                    <option value="suggestion">Suggestion</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Original Phrase / Trigger Word <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={phraseInput}
                  onChange={(e) => setPhraseInput(e.target.value)}
                  placeholder="e.g. cheap"
                  className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Preferred Alternative
                </label>
                <input
                  type="text"
                  value={alternativeInput}
                  onChange={(e) => setAlternativeInput(e.target.value)}
                  placeholder="e.g. cost-effective / high-ROI"
                  className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Compliance Rationale <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  placeholder="e.g. Devalues premium enterprise positioning."
                  className="w-full rounded border border-slate-300 p-2 text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRuleModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-semibold"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
