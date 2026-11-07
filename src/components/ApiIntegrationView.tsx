import React, { useState } from 'react';
import {
  Terminal,
  Play,
  Copy,
  Check,
  Code2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Brand } from '../types/brandloom';

interface ApiIntegrationViewProps {
  currentBrand: Brand;
}

export const ApiIntegrationView: React.FC<ApiIntegrationViewProps> = ({ currentBrand }) => {
  const [testText, setTestText] = useState(
    'Neosframe supports over 100 integrations out of the box with cheap monthly pricing.'
  );
  const [testChannel, setTestChannel] = useState('headless_cms');
  const [responseJson, setResponseJson] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const handleRunApiTest = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandSlug: currentBrand.slug,
          text: testText,
          channel: testChannel,
        }),
      });
      const data = await res.json();
      setResponseJson(data);
    } catch (err: any) {
      setResponseJson({ error: err.message || 'API call failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const curlCommand = `curl -X POST https://brandloom.internal/api/v1/check \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer BL_LIVE_TOKEN_2026" \\
  -d '{
    "brandSlug": "${currentBrand.slug}",
    "channel": "${testChannel}",
    "text": "${testText.replace(/"/g, '\\"')}"
  }'`;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2500);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Developer & CMS API Integration
        </h1>
        <p className="text-xs text-slate-500">
          Enforce brand compliance programmatically in CI/CD pipelines, Figma plugins, Headless CMS (Contentful, Sanity), and AI agent workflows using the unified BrandLoom verification engine.
        </p>
      </div>

      {/* Interactive API Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Request Builder (6 Cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                POST
              </span>
              <span className="font-mono text-xs font-semibold text-slate-800">
                /api/v1/check
              </span>
            </div>
            <span className="text-[11px] text-slate-400">REST API v1</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Target Brand Slug
              </label>
              <input
                type="text"
                disabled
                value={currentBrand.slug}
                className="w-full rounded border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-slate-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Channel / Client Identifier
              </label>
              <input
                type="text"
                value={testChannel}
                onChange={(e) => setTestChannel(e.target.value)}
                placeholder="e.g. figma_export, github_action, cms_webhook"
                className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Draft Content / Copy to Validate
              </label>
              <textarea
                rows={4}
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                className="w-full rounded border border-slate-300 p-2.5 text-slate-900 leading-relaxed font-mono text-[11px]"
              />
            </div>

            <button
              onClick={handleRunApiTest}
              disabled={isLoading || !testText.trim()}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {isLoading ? 'Executing Verification...' : 'Execute Test Request'}
            </button>
          </div>

          {/* cURL snippet */}
          <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-slate-500 uppercase">
                cURL Command
              </span>
              <button
                onClick={() => copyToClipboard(curlCommand, 'curl')}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                {copiedSnippet === 'curl' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                Copy
              </button>
            </div>
            <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg text-[10px] font-mono overflow-x-auto leading-relaxed">
              {curlCommand}
            </pre>
          </div>
        </div>

        {/* Right: Response Inspector (6 Cols) */}
        <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between text-xs space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-indigo-400" />
                Live JSON Response
              </span>
              {responseJson && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    responseJson.passed
                      ? 'text-emerald-300 bg-emerald-950 border border-emerald-800'
                      : 'text-red-300 bg-red-950 border border-red-800'
                  }`}
                >
                  {responseJson.passed ? '200 OK · PASSED' : '200 OK · PUBLISHING HOLD'}
                </span>
              )}
            </div>

            <div className="mt-3">
              {responseJson ? (
                <pre className="text-emerald-400 font-mono text-[11px] p-3 bg-black/60 rounded-lg overflow-x-auto max-h-[380px] leading-relaxed">
                  {JSON.stringify(responseJson, null, 2)}
                </pre>
              ) : (
                <div className="text-center py-16 text-slate-500">
                  <Terminal className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  Click &ldquo;Execute Test Request&rdquo; to view real-time API verification response.
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-900 pt-3 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Latency: ~120ms</span>
            <span className="text-indigo-400">Strict Model Invariants Enforced</span>
          </div>
        </div>
      </div>

      {/* Complete API Reference Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">BrandLoom REST API Specification</h2>
          <p className="text-xs text-slate-500">
            Available endpoints matching the architecture specification
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-medium border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-5">Method</th>
                <th className="py-2.5 px-5">Endpoint</th>
                <th className="py-2.5 px-5">Purpose</th>
                <th className="py-2.5 px-5">Hold Behavior</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              <tr>
                <td className="py-3 px-5 text-indigo-600 font-bold">POST</td>
                <td className="py-3 px-5 text-slate-900">/api/v1/check</td>
                <td className="py-3 px-5 font-sans text-slate-700">Automated AI tool & CMS check</td>
                <td className="py-3 px-5 font-sans text-red-600 font-medium">Returns publishingHold: true</td>
              </tr>
              <tr>
                <td className="py-3 px-5 text-indigo-600 font-bold">POST</td>
                <td className="py-3 px-5 text-slate-900">/api/analyze</td>
                <td className="py-3 px-5 font-sans text-slate-700">Full claim extraction & scoring</td>
                <td className="py-3 px-5 font-sans text-red-600 font-medium">Enforces 0% score on contradiction</td>
              </tr>
              <tr>
                <td className="py-3 px-5 text-emerald-600 font-bold">GET</td>
                <td className="py-3 px-5 text-slate-900">/api/facts</td>
                <td className="py-3 px-5 font-sans text-slate-700">Retrieve approved brand facts</td>
                <td className="py-3 px-5 font-sans text-slate-500">Includes active & expired status</td>
              </tr>
              <tr>
                <td className="py-3 px-5 text-indigo-600 font-bold">POST</td>
                <td className="py-3 px-5 text-slate-900">/api/facts</td>
                <td className="py-3 px-5 font-sans text-slate-700">Add verified brand fact</td>
                <td className="py-3 px-5 font-sans text-slate-500">Requires supporting document reference</td>
              </tr>
              <tr>
                <td className="py-3 px-5 text-indigo-600 font-bold">POST</td>
                <td className="py-3 px-5 text-slate-900">/api/approve/:id</td>
                <td className="py-3 px-5 font-sans text-slate-700">Approve content submission</td>
                <td className="py-3 px-5 font-sans text-red-600 font-medium">HTTP 403 Forbidden if hold is active</td>
              </tr>
              <tr>
                <td className="py-3 px-5 text-rose-600 font-bold">POST</td>
                <td className="py-3 px-5 text-slate-900">/api/reject/:id</td>
                <td className="py-3 px-5 font-sans text-slate-700">Reject content with audit notes</td>
                <td className="py-3 px-5 font-sans text-slate-500">Records reviewer feedback</td>
              </tr>
              <tr>
                <td className="py-3 px-5 text-emerald-600 font-bold">GET</td>
                <td className="py-3 px-5 text-slate-900">/api/audit</td>
                <td className="py-3 px-5 font-sans text-slate-700">Retrieve immutable audit trail</td>
                <td className="py-3 px-5 font-sans text-slate-500">Chronological tamper-evident records</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
