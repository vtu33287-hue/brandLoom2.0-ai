import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ContentCheckerView } from './components/ContentCheckerView';
import { BrandBrainView } from './components/BrandBrainView';
import { ReviewReportsView } from './components/ReviewReportsView';
import { ApprovalAuditView } from './components/ApprovalAuditView';
import { ApiIntegrationView } from './components/ApiIntegrationView';
import { ReviewReportModal } from './components/ReviewReportModal';
import { ApprovalModal } from './components/ApprovalModal';
import { BrandLoomAPI } from './services/apiClient';
import {
  Brand,
  ApprovedFact,
  BrandVoiceRule,
  BrandAsset,
  ContentSubmission,
  AnalysisReport,
  AuditLog,
} from './types/brandloom';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'checker' | 'brain' | 'reports' | 'audit' | 'api'
  >('dashboard');

  const [brands, setBrands] = useState<Brand[]>([]);
  const [currentBrand, setCurrentBrand] = useState<Brand | null>(null);
  const [facts, setFacts] = useState<ApprovedFact[]>([]);
  const [voiceRules, setVoiceRules] = useState<BrandVoiceRule[]>([]);
  const [submissions, setSubmissions] = useState<ContentSubmission[]>([]);
  const [reports, setReports] = useState<Record<string, AnalysisReport>>({});
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const [selectedReportModal, setSelectedReportModal] = useState<AnalysisReport | null>(null);
  const [approvalModalState, setApprovalModalState] = useState<{
    isOpen: boolean;
    submissionId: string;
    isOverride?: boolean;
  }>({ isOpen: false, submissionId: '' });
  const [inspectedSubmission, setInspectedSubmission] = useState<ContentSubmission | null>(null);

  // Initial Data Fetching
  const loadData = async () => {
    try {
      const bList = await BrandLoomAPI.getBrands();
      setBrands(bList);
      if (bList.length > 0 && !currentBrand) {
        setCurrentBrand(bList[0]);
      }

      const fList = await BrandLoomAPI.getFacts();
      setFacts(fList);

      const rList = await BrandLoomAPI.getVoiceRules();
      setVoiceRules(rList);

      const sList = await BrandLoomAPI.getSubmissions();
      setSubmissions(sList);

      // Load initial reports into record
      for (const sub of sList) {
        if (sub.reportId) {
          const rep = await BrandLoomAPI.getReport(sub.reportId);
          if (rep) {
            setReports((prev) => ({ ...prev, [rep.id]: rep }));
          }
        }
      }

      const aLogs = await BrandLoomAPI.getAuditLogs();
      setAuditLogs(aLogs);
    } catch (err) {
      console.error('Failed to load initial BrandLoom state:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (!currentBrand) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Initializing BrandLoom Engine...</span>
        </div>
      </div>
    );
  }

  // Count active publishing holds for current brand
  const holdsCount = submissions.filter(
    (s) => s.brandId === currentBrand.id && s.status === 'publishing_hold'
  ).length;

  const brandFacts = facts.filter((f) => f.brandId === currentBrand.id);

  // Handlers
  const handleInspectSubmission = (sub: ContentSubmission) => {
    setInspectedSubmission(sub);
    setActiveTab('checker');
  };

  const handleRenewFact = async (factId: string) => {
    await BrandLoomAPI.updateFact(factId, {
      expiryDate: '2027-03-31',
      status: 'active',
      notes: 'Renewed for subsequent commercial cycle.',
    });
    const updatedFacts = await BrandLoomAPI.getFacts();
    setFacts(updatedFacts);
    const updatedLogs = await BrandLoomAPI.getAuditLogs();
    setAuditLogs(updatedLogs);
  };

  const handleAddFact = async (newFact: Partial<ApprovedFact>) => {
    const created = await BrandLoomAPI.addFact(newFact);
    const updatedFacts = await BrandLoomAPI.getFacts();
    setFacts(updatedFacts);
    const updatedLogs = await BrandLoomAPI.getAuditLogs();
    setAuditLogs(updatedLogs);
    return created;
  };

  const handleUpdateFact = async (id: string, updates: Partial<ApprovedFact>) => {
    const updated = await BrandLoomAPI.updateFact(id, updates);
    const updatedFacts = await BrandLoomAPI.getFacts();
    setFacts(updatedFacts);
    const updatedLogs = await BrandLoomAPI.getAuditLogs();
    setAuditLogs(updatedLogs);
    return updated;
  };

  const handleDeleteFact = async (id: string) => {
    const res = await BrandLoomAPI.deleteFact(id);
    const updatedFacts = await BrandLoomAPI.getFacts();
    setFacts(updatedFacts);
    const updatedLogs = await BrandLoomAPI.getAuditLogs();
    setAuditLogs(updatedLogs);
    return res;
  };

  const handleAddVoiceRule = async (rule: Partial<BrandVoiceRule>) => {
    const created = await BrandLoomAPI.addVoiceRule(rule);
    const updatedRules = await BrandLoomAPI.getVoiceRules();
    setVoiceRules(updatedRules);
    const updatedLogs = await BrandLoomAPI.getAuditLogs();
    setAuditLogs(updatedLogs);
    return created;
  };

  const handleUploadGuideline = async (fileName: string, textContent: string) => {
    const res = await BrandLoomAPI.uploadGuideline(currentBrand.id, fileName, textContent);
    const updatedFacts = await BrandLoomAPI.getFacts();
    setFacts(updatedFacts);
    const updatedLogs = await BrandLoomAPI.getAuditLogs();
    setAuditLogs(updatedLogs);
    return res;
  };

  const handleRunAnalysis = async (payload: {
    submissionId?: string;
    brandId: string;
    title: string;
    channel: string;
    content: string;
    extractedPalette?: any[];
  }) => {
    const rep = await BrandLoomAPI.analyzeDraft(payload);
    setReports((prev) => ({ ...prev, [rep.id]: rep }));

    // Reload submissions and audit logs
    const sList = await BrandLoomAPI.getSubmissions();
    setSubmissions(sList);
    const aLogs = await BrandLoomAPI.getAuditLogs();
    setAuditLogs(aLogs);
    return rep;
  };

  const handleOpenApprovalModal = (submissionId: string, isOverride = false) => {
    setApprovalModalState({
      isOpen: true,
      submissionId,
      isOverride,
    });
  };

  const handleConfirmApproval = async (params: {
    reviewerName: string;
    reviewerRole: string;
    notes: string;
    isEmergencyOverride: boolean;
  }) => {
    await BrandLoomAPI.approveSubmission(approvalModalState.submissionId, params);

    // Refresh state
    const sList = await BrandLoomAPI.getSubmissions();
    setSubmissions(sList);
    const aLogs = await BrandLoomAPI.getAuditLogs();
    setAuditLogs(aLogs);
    setApprovalModalState({ isOpen: false, submissionId: '' });
  };

  const handleRejectSubmission = async (submissionId: string) => {
    await BrandLoomAPI.rejectSubmission(submissionId, {
      reviewerName: 'Legal Compliance Officer',
      reviewerRole: 'Brand Reviewer',
      notes: 'Rejected due to critical contradicted factual assertions. Remediate against Brand Brain.',
    });
    const sList = await BrandLoomAPI.getSubmissions();
    setSubmissions(sList);
    const aLogs = await BrandLoomAPI.getAuditLogs();
    setAuditLogs(aLogs);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        brands={brands}
        currentBrand={currentBrand}
        onSelectBrand={(b) => setCurrentBrand(b)}
        holdsCount={holdsCount}
        factsCount={brandFacts.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            currentBrand={currentBrand}
            facts={facts}
            submissions={submissions}
            reports={reports}
            onInspectSubmission={handleInspectSubmission}
            onNavigateTab={(t) => setActiveTab(t)}
            onRenewFact={handleRenewFact}
          />
        )}

        {activeTab === 'checker' && (
          <ContentCheckerView
            currentBrand={currentBrand}
            facts={facts}
            voiceRules={voiceRules}
            initialSubmission={inspectedSubmission}
            onSaveSubmission={(s) => BrandLoomAPI.createSubmission(s)}
            onRunAnalysis={handleRunAnalysis}
            onOpenReportModal={(r) => setSelectedReportModal(r)}
            onOpenApprovalModal={handleOpenApprovalModal}
          />
        )}

        {activeTab === 'brain' && (
          <BrandBrainView
            currentBrand={currentBrand}
            facts={facts}
            voiceRules={voiceRules}
            assets={[]}
            onAddFact={handleAddFact}
            onUpdateFact={handleUpdateFact}
            onDeleteFact={handleDeleteFact}
            onAddVoiceRule={handleAddVoiceRule}
            onUploadGuideline={handleUploadGuideline}
          />
        )}

        {activeTab === 'reports' && (
          <ReviewReportsView
            currentBrand={currentBrand}
            reports={reports}
            submissions={submissions}
            onOpenReportModal={(r) => setSelectedReportModal(r)}
          />
        )}

        {activeTab === 'audit' && (
          <ApprovalAuditView
            currentBrand={currentBrand}
            submissions={submissions}
            reports={reports}
            auditLogs={auditLogs}
            onOpenApprovalModal={handleOpenApprovalModal}
            onRejectSubmission={handleRejectSubmission}
            onInspectSubmission={handleInspectSubmission}
          />
        )}

        {activeTab === 'api' && <ApiIntegrationView currentBrand={currentBrand} />}
      </main>

      {/* Review Report Detail Modal */}
      {selectedReportModal && (
        <ReviewReportModal
          report={selectedReportModal}
          onClose={() => setSelectedReportModal(null)}
          onApprove={(isOverride) => {
            const subId = selectedReportModal.submissionId;
            setSelectedReportModal(null);
            handleOpenApprovalModal(subId, isOverride);
          }}
          onReject={() => {
            const subId = selectedReportModal.submissionId;
            setSelectedReportModal(null);
            handleRejectSubmission(subId);
          }}
        />
      )}

      {/* Approval & Sign-off Modal */}
      {approvalModalState.isOpen && (
        <ApprovalModal
          submissionId={approvalModalState.submissionId}
          isOverride={approvalModalState.isOverride}
          onClose={() => setApprovalModalState({ isOpen: false, submissionId: '' })}
          onSubmit={handleConfirmApproval}
        />
      )}

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">BrandLoom Platform</span>
            <span>·</span>
            <span>Your brand&apos;s checkpoint before publishing</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>Model: Gemini 3.8 Flash Engine</span>
            <span>·</span>
            <span>Zero Unverified Claims Policy</span>
            <span>·</span>
            <button
              onClick={async () => {
                await BrandLoomAPI.resetData();
                await loadData();
              }}
              className="text-indigo-600 hover:text-indigo-800 underline"
            >
              Reset Benchmark Data
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
