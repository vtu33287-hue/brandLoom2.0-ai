import {
  Brand,
  ApprovedFact,
  BrandVoiceRule,
  BrandAsset,
  ContentSubmission,
  AnalysisReport,
  AuditLog,
} from '../types/brandloom';
import {
  INITIAL_BRANDS,
  INITIAL_FACTS,
  INITIAL_VOICE_RULES,
  INITIAL_ASSETS,
  INITIAL_SUBMISSIONS,
  INITIAL_REPORTS,
  INITIAL_AUDIT_LOGS,
} from '../data/mockBrandData';
import { runLocalVerification } from './verificationEngine';

// Local cache to ensure seamless UI responsiveness
let localBrands = [...INITIAL_BRANDS];
let localFacts = [...INITIAL_FACTS];
let localVoiceRules = [...INITIAL_VOICE_RULES];
let localAssets = [...INITIAL_ASSETS];
let localSubmissions = [...INITIAL_SUBMISSIONS];
let localReports: Record<string, AnalysisReport> = { ...INITIAL_REPORTS };
let localAuditLogs = [...INITIAL_AUDIT_LOGS];

export const BrandLoomAPI = {
  async getBrands(): Promise<Brand[]> {
    try {
      const res = await fetch('/api/brands');
      if (res.ok) {
        const data = await res.json();
        localBrands = data;
        return data;
      }
    } catch (e) {
      console.warn('Using local brands store');
    }
    return localBrands;
  },

  async getFacts(brandId?: string): Promise<ApprovedFact[]> {
    try {
      const url = brandId ? `/api/facts?brandId=${brandId}` : '/api/facts';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        localFacts = data;
        return data;
      }
    } catch (e) {
      console.warn('Using local facts store');
    }
    return brandId ? localFacts.filter((f) => f.brandId === brandId) : localFacts;
  },

  async addFact(fact: Partial<ApprovedFact>): Promise<ApprovedFact> {
    try {
      const res = await fetch('/api/facts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fact),
      });
      if (res.ok) {
        const created = await res.json();
        localFacts.push(created);
        return created;
      }
    } catch (e) {
      console.warn('Fallback adding fact locally');
    }

    const created: ApprovedFact = {
      id: fact.id || `FACT-${100 + localFacts.length + 1}`,
      brandId: fact.brandId || 'brand-neosframe',
      category: fact.category || 'product',
      statement: fact.statement || '',
      supportingSource: fact.supportingSource || 'Internal Brand Doc',
      sourceCitation: fact.sourceCitation || '',
      approvalDate: fact.approvalDate || new Date().toISOString().split('T')[0],
      expiryDate: fact.expiryDate,
      status: fact.status || 'active',
      notes: fact.notes,
    };
    localFacts.push(created);
    return created;
  },

  async updateFact(id: string, updates: Partial<ApprovedFact>): Promise<ApprovedFact> {
    try {
      const res = await fetch(`/api/facts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        const idx = localFacts.findIndex((f) => f.id === id);
        if (idx !== -1) localFacts[idx] = updated;
        return updated;
      }
    } catch (e) {
      console.warn('Fallback updating fact locally');
    }

    const idx = localFacts.findIndex((f) => f.id === id);
    if (idx !== -1) {
      localFacts[idx] = { ...localFacts[idx], ...updates };
      return localFacts[idx];
    }
    throw new Error('Fact not found');
  },

  async deleteFact(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/facts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        localFacts = localFacts.filter((f) => f.id !== id);
        return true;
      }
    } catch (e) {
      console.warn('Fallback deleting fact locally');
    }
    localFacts = localFacts.filter((f) => f.id !== id);
    return true;
  },

  async getVoiceRules(brandId?: string): Promise<BrandVoiceRule[]> {
    try {
      const url = brandId ? `/api/rules?brandId=${brandId}` : '/api/rules';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        localVoiceRules = data;
        return data;
      }
    } catch (e) {
      console.warn('Using local voice rules store');
    }
    return brandId ? localVoiceRules.filter((r) => r.brandId === brandId) : localVoiceRules;
  },

  async addVoiceRule(rule: Partial<BrandVoiceRule>): Promise<BrandVoiceRule> {
    try {
      const res = await fetch('/api/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rule),
      });
      if (res.ok) {
        const created = await res.json();
        localVoiceRules.push(created);
        return created;
      }
    } catch (e) {
      console.warn('Fallback adding voice rule locally');
    }

    const created: BrandVoiceRule = {
      id: `VOICE-${localVoiceRules.length + 1}`,
      brandId: rule.brandId || 'brand-neosframe',
      ruleType: rule.ruleType || 'banned_word',
      originalPhrase: rule.originalPhrase || '',
      preferredAlternative: rule.preferredAlternative || '',
      reason: rule.reason || 'Brand standard',
      severity: rule.severity || 'warning',
      isActive: true,
    };
    localVoiceRules.push(created);
    return created;
  },

  async getSubmissions(brandId?: string): Promise<ContentSubmission[]> {
    try {
      const url = brandId ? `/api/submissions?brandId=${brandId}` : '/api/submissions';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        localSubmissions = data;
        return data;
      }
    } catch (e) {
      console.warn('Using local submissions store');
    }
    return brandId ? localSubmissions.filter((s) => s.brandId === brandId) : localSubmissions;
  },

  async createSubmission(sub: Partial<ContentSubmission>): Promise<ContentSubmission> {
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      });
      if (res.ok) {
        const created = await res.json();
        localSubmissions.unshift(created);
        return created;
      }
    } catch (e) {
      console.warn('Fallback creating submission locally');
    }

    const created: ContentSubmission = {
      id: `sub-${Date.now()}`,
      brandId: sub.brandId || 'brand-neosframe',
      title: sub.title || 'Untitled Draft',
      channel: sub.channel || 'press_release',
      rawContent: sub.rawContent || '',
      imageUrl: sub.imageUrl,
      authorName: sub.authorName || 'Marketing Editor',
      authorRole: sub.authorRole || 'Content Creator',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localSubmissions.unshift(created);
    return created;
  },

  async analyzeDraft(payload: {
    submissionId?: string;
    brandId: string;
    title: string;
    channel: string;
    content: string;
    extractedPalette?: any[];
    actorName?: string;
  }): Promise<AnalysisReport> {
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const report = await res.json();
        localReports[report.id] = report;
        return report;
      }
    } catch (e) {
      console.warn('Server analyze endpoint unreachable, executing local verification engine');
    }

    // Fallback to client-side verification engine
    const brand = localBrands.find((b) => b.id === payload.brandId) || localBrands[0];
    const facts = localFacts.filter((f) => f.brandId === brand.id);
    const rules = localVoiceRules.filter((r) => r.brandId === brand.id);

    const report = runLocalVerification({
      submissionId: payload.submissionId || `sub-${Date.now()}`,
      brand,
      facts,
      voiceRules: rules,
      title: payload.title,
      channel: payload.channel,
      content: payload.content,
      extractedPalette: payload.extractedPalette,
    });

    localReports[report.id] = report;
    return report;
  },

  async getReport(reportId: string): Promise<AnalysisReport | null> {
    try {
      const res = await fetch(`/api/reports/${reportId}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Using local report store');
    }
    return localReports[reportId] || null;
  },

  async approveSubmission(
    id: string,
    params: {
      reviewerName: string;
      reviewerRole: string;
      notes: string;
      isEmergencyOverride?: boolean;
    }
  ): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`/api/approve/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to approve');
      }
      return data;
    } catch (e: any) {
      if (e.message?.includes('CRITICAL PUBLISHING HOLD')) {
        throw e;
      }
      // Local fallback
      const sub = localSubmissions.find((s) => s.id === id);
      if (sub) {
        sub.status = 'approved';
        sub.updatedAt = new Date().toISOString();
      }
      return { success: true, message: 'Submission approved.' };
    }
  },

  async rejectSubmission(
    id: string,
    params: {
      reviewerName: string;
      reviewerRole: string;
      notes: string;
    }
  ): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`/api/reject/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      return data;
    } catch (e) {
      const sub = localSubmissions.find((s) => s.id === id);
      if (sub) {
        sub.status = 'rejected';
        sub.updatedAt = new Date().toISOString();
      }
      return { success: true, message: 'Submission rejected.' };
    }
  },

  async getAuditLogs(brandId?: string): Promise<AuditLog[]> {
    try {
      const url = brandId ? `/api/audit?brandId=${brandId}` : '/api/audit';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        localAuditLogs = data;
        return data;
      }
    } catch (e) {
      console.warn('Using local audit store');
    }
    return brandId ? localAuditLogs.filter((l) => l.brandId === brandId) : localAuditLogs;
  },

  async uploadGuideline(brandId: string, fileName: string, textContent: string) {
    try {
      const res = await fetch('/api/brand/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId, fileName, textContent }),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fallback guideline upload');
    }

    const newFact: ApprovedFact = {
      id: `FACT-${100 + localFacts.length + 1}`,
      brandId,
      category: 'compliance',
      statement: `Extracted Rule: ${textContent.slice(0, 120)}...`,
      supportingSource: fileName,
      sourceCitation: 'Uploaded Brand Guideline Manual',
      approvalDate: new Date().toISOString().split('T')[0],
      expiryDate: '2027-12-31',
      status: 'active',
    };
    localFacts.push(newFact);
    return { success: true, createdFact: newFact };
  },

  async resetData(): Promise<void> {
    try {
      await fetch('/api/reset', { method: 'POST' });
    } catch (e) {
      console.warn('Reset failed');
    }
    localBrands = [...INITIAL_BRANDS];
    localFacts = [...INITIAL_FACTS];
    localVoiceRules = [...INITIAL_VOICE_RULES];
    localAssets = [...INITIAL_ASSETS];
    localSubmissions = [...INITIAL_SUBMISSIONS];
    localReports = { ...INITIAL_REPORTS };
    localAuditLogs = [...INITIAL_AUDIT_LOGS];
  },
};
