import React from 'react';
import {
  ShieldCheck,
  Brain,
  FileCheck,
  FileText,
  History,
  Terminal,
  AlertTriangle,
  ChevronDown,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Brand } from '../types/brandloom';

interface NavbarProps {
  activeTab: 'dashboard' | 'checker' | 'brain' | 'reports' | 'audit' | 'api';
  setActiveTab: (tab: 'dashboard' | 'checker' | 'brain' | 'reports' | 'audit' | 'api') => void;
  brands: Brand[];
  currentBrand: Brand;
  onSelectBrand: (brand: Brand) => void;
  holdsCount: number;
  factsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  brands,
  currentBrand,
  onSelectBrand,
  holdsCount,
  factsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      {/* Top utility alert bar if publishing holds active */}
      {holdsCount > 0 && (
        <div className="bg-red-950/80 border-b border-red-800/80 px-4 py-1.5 text-xs text-red-200 flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="font-medium text-red-100">
              Publishing Hold Active:
            </span>
            <span>
              {holdsCount} draft{holdsCount > 1 ? 's' : ''} flagged with contradicted claims or critical brand voice violations.
            </span>
            <button
              onClick={() => setActiveTab('checker')}
              className="ml-auto underline font-medium hover:text-white transition-colors"
            >
              Inspect Claims
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-8">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setActiveTab('dashboard')}
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center shadow-inner group-hover:bg-indigo-500 transition-colors">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold tracking-tight text-white">
                    BrandLoom
                  </span>
                  <span className="text-[10px] tracking-wider uppercase font-semibold text-indigo-400 bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-800/50">
                    Audit Engine
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Your brand&apos;s checkpoint before publishing
                </p>
              </div>
            </div>

            {/* Brand Switcher */}
            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-800">
              <span className="text-xs text-slate-400">Active Brand:</span>
              <div className="relative group">
                <select
                  aria-label="Active Brand"
                  value={currentBrand.id}
                  onChange={(e) => {
                    const found = brands.find((b) => b.id === e.target.value);
                    if (found) onSelectBrand(found);
                  }}
                  className="appearance-none bg-slate-800 hover:bg-slate-700/80 text-xs font-medium text-slate-200 py-1.5 pl-3 pr-8 rounded-md border border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.industry.split('/')[0].trim()})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-4 h-4" />
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab('checker')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'checker'
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FileCheck className="w-4 h-4 text-indigo-400" />
              Content Checker
            </button>

            <button
              onClick={() => setActiveTab('brain')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'brain'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Brain className="w-4 h-4" />
              Brand Brain
              <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded-full border border-slate-700">
                {factsCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'reports'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              Review Reports
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'audit'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <History className="w-4 h-4" />
              Approval & Audit
            </button>

            <button
              onClick={() => setActiveTab('api')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'api'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Terminal className="w-4 h-4" />
              API Integration
            </button>
          </nav>

          {/* Right Action */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('checker')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-md shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Verify Draft
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-2 border-t border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1 rounded whitespace-nowrap ${
              activeTab === 'dashboard' ? 'bg-slate-800 text-white' : 'text-slate-400'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('checker')}
            className={`px-3 py-1 rounded whitespace-nowrap ${
              activeTab === 'checker' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Content Checker
          </button>
          <button
            onClick={() => setActiveTab('brain')}
            className={`px-3 py-1 rounded whitespace-nowrap ${
              activeTab === 'brain' ? 'bg-slate-800 text-white' : 'text-slate-400'
            }`}
          >
            Brand Brain ({factsCount})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1 rounded whitespace-nowrap ${
              activeTab === 'reports' ? 'bg-slate-800 text-white' : 'text-slate-400'
            }`}
          >
            Reports
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1 rounded whitespace-nowrap ${
              activeTab === 'audit' ? 'bg-slate-800 text-white' : 'text-slate-400'
            }`}
          >
            Audit History
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`px-3 py-1 rounded whitespace-nowrap ${
              activeTab === 'api' ? 'bg-slate-800 text-white' : 'text-slate-400'
            }`}
          >
            API
          </button>
        </div>
      </div>
    </header>
  );
};
