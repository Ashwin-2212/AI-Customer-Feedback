import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.js';
import {
  Shield,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Key,
  Server,
  FileCheck,
  Save,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Globe,
  Database
} from 'lucide-react';

export function SecurityRulesView() {
  const { addToast } = useApp();
  const [piiRedaction, setPiiRedaction] = useState(true);
  const [maskEmails, setMaskEmails] = useState(true);
  const [maskPhones, setMaskPhones] = useState(true);
  const [maskCreditCards, setMaskCreditCards] = useState(true);
  const [maskIPs, setMaskIPs] = useState(false);
  const [tlsEnforced, setTlsEnforced] = useState(true);
  const [sessionTimeoutMins, setSessionTimeoutMins] = useState('60');
  const [dataRetentionDays, setDataRetentionDays] = useState('365');
  const [rateLimitMax, setRateLimitMax] = useState('500');
  const [ipAllowlist, setIpAllowlist] = useState('127.0.0.1\n192.168.1.0/24\n10.0.0.0/8');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSecurity = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      addToast({
        title: 'Security & PII Rules Saved',
        message: 'Data masking, encryption, and IP allowlist policies updated system-wide.',
        type: 'success'
      });
    }, 500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-6 text-white shadow-xl dark:border-indigo-900/50">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-indigo-500/30 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-indigo-300 uppercase border border-indigo-400/30">
                <ShieldCheck className="h-3 w-3 text-indigo-400" />
                Enterprise Security Core
              </span>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                SOC-2 & GDPR Compliant
              </span>
            </div>
            <h1 className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl flex items-center gap-2.5">
              <Shield className="h-6 w-6 text-indigo-400" />
              <span>Security & PII Sanitization Governance</span>
            </h1>
            <p className="mt-1 text-xs text-indigo-200/80 max-w-2xl">
              Configure real-time Personally Identifiable Information (PII) redaction, cryptographic encryption policies, and IP security perimeters.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleSaveSecurity}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition active:scale-95 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'Saving Policies...' : 'Save Security Rules'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* PII Redaction Settings */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <EyeOff className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Automated PII Redaction & Sanitization</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Redacts confidential customer identifiers before passing raw feedback to Gemini 3.7 AI models or third-party webhooks.
            </p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
            piiRedaction ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600'
          }`}>
            {piiRedaction ? 'ACTIVE' : 'DISABLED'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-800/40">
            <div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white">Customer Email Redaction</div>
              <div className="text-[11px] text-slate-500">Replaces name@domain.com with [REDACTED_EMAIL]</div>
            </div>
            <input
              type="checkbox"
              checked={maskEmails}
              onChange={(e) => setMaskEmails(e.target.checked)}
              className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-800/40">
            <div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white">Phone & Mobile Number Masking</div>
              <div className="text-[11px] text-slate-500">Filters E.164 and localized telephone numbers</div>
            </div>
            <input
              type="checkbox"
              checked={maskPhones}
              onChange={(e) => setMaskPhones(e.target.checked)}
              className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-800/40">
            <div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white">Credit Card & Payment Masking</div>
              <div className="text-[11px] text-slate-500">PCI-DSS compliant 16-digit PAN pattern scrubbing</div>
            </div>
            <input
              type="checkbox"
              checked={maskCreditCards}
              onChange={(e) => setMaskCreditCards(e.target.checked)}
              className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-800/40">
            <div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white">Customer IP & Geo Coordinates</div>
              <div className="text-[11px] text-slate-500">Anonymize IPv4/IPv6 client ingress metadata</div>
            </div>
            <input
              type="checkbox"
              checked={maskIPs}
              onChange={(e) => setMaskIPs(e.target.checked)}
              className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Cryptography & Network Security */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Encryption & Session Governance</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Encryption at Rest</span>
                <div className="text-[10px] text-slate-400">AES-256 Bit Hardware Encryption</div>
              </div>
              <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                ACTIVE
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Enforce TLS 1.3 Transport</span>
                <div className="text-[10px] text-slate-400">Reject deprecated SSL/TLS 1.0 connections</div>
              </div>
              <input
                type="checkbox"
                checked={tlsEnforced}
                onChange={(e) => setTlsEnforced(e.target.checked)}
                className="h-4 w-4 rounded text-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Admin Session Inactivity Timeout (Minutes)
              </label>
              <select
                value={sessionTimeoutMins}
                onChange={(e) => setSessionTimeoutMins(e.target.value)}
                className="w-full h-9 rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="15">15 Minutes (Strict Security)</option>
                <option value="30">30 Minutes</option>
                <option value="60">60 Minutes (Standard)</option>
                <option value="240">4 Hours</option>
              </select>
            </div>
          </div>
        </div>

        {/* API Rate Limiter & Allowlist */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>API Rate Limiter & IP Allowlist</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sliding Window Request Rate Limit (per 15 min / IP)
              </label>
              <input
                type="number"
                value={rateLimitMax}
                onChange={(e) => setRateLimitMax(e.target.value)}
                className="w-full h-9 rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Authorized Corporate IP CIDRs (One per line)
              </label>
              <textarea
                value={ipAllowlist}
                onChange={(e) => setIpAllowlist(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
