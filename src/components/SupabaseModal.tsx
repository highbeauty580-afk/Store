import React, { useState, useEffect } from 'react';
import { X, Check, Copy, RefreshCw, Database, ExternalLink, AlertTriangle, ShieldCheck, Key } from 'lucide-react';
import { getStoredSupabaseConfig, saveStoredSupabaseConfig, testSupabaseConnection } from '../lib/supabase';
import { SUPABASE_SQL_SCHEMA } from '../lib/supabaseSchema';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose, onConfigUpdated }) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; tablesFound?: boolean } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const config = getStoredSupabaseConfig();
      setUrl(config.url);
      setKey(config.key);
      handleTestConnection();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!url || !key) return;
    saveStoredSupabaseConfig(url, key);
    onConfigUpdated();
    await handleTestConnection();
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await testSupabaseConnection();
    setTestResult(result);
    setTesting(false);
  };

  const copySqlSchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/50 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">إعدادات قاعدة بيانات Supabase Cloud</h3>
              <p className="text-xs text-slate-400">مزامنة سحابية لحظية ومباشرة من أي جهاز</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Alert Banner */}
          {testResult && (
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 ${
                testResult.success
                  ? testResult.tablesFound
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {testResult.success ? (
                <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
              )}
              <div className="text-sm">
                <p className="font-semibold">{testResult.message}</p>
                {testResult.success && !testResult.tablesFound && (
                  <p className="text-xs mt-1 text-slate-300">
                    انسخ كود SQL بالأسفل وقم بتشغيله في لوحة Supabase (SQL Editor) لإنشاء الجداول والبيانات فوراً.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Connection Inputs */}
          <div className="space-y-4 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
            <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400" />
              بيانات الاتصال بالمشروع (Project API Credentials)
            </h4>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                رابط Supabase URL (VITE_SUPABASE_URL)
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 font-mono dir-ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                مفتاح Anon Key (VITE_SUPABASE_ANON_KEY)
              </label>
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 font-mono dir-ltr"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                حفظ وإعادة الاتصال
              </button>

              <button
                onClick={handleTestConnection}
                disabled={testing}
                className="px-4 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                اختبار الاتصال الحقيقي
              </button>
            </div>
          </div>

          {/* SQL Setup Instructions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-200">
                  كود تهيئة الجداول تلقائياً (SQL Schema Script)
                </h4>
                <p className="text-xs text-slate-400">
                  انسخ هذا الكود وقم بتشغيله في مشروعك في Supabase Dashboard &gt; SQL Editor
                </p>
              </div>

              <button
                onClick={copySqlSchema}
                className="px-3 py-1.5 text-xs font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    تم النسخ!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    نسخ السكريبت
                  </>
                )}
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
              <pre className="p-4 text-xs font-mono text-emerald-300 max-h-52 overflow-y-auto leading-relaxed dir-ltr">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>يمكنك فتح لوحة تحكم Supabase وإنشاء مشروع مجاني في دقائق من خلال</span>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 underline hover:text-emerald-300"
              >
                supabase.com/dashboard
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
