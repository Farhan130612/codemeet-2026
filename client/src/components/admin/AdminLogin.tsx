import React, { useState } from 'react';
import { CodeMeetLogo } from '../CodeMeetLogo.js';
import { Lock, ArrowRight, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onSuccess: (token: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess }) => {
  const [accessCode, setAccessCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: accessCode.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Access denied.');
        setIsLoading(false);
        return;
      }

      if (data.token) {
        sessionStorage.setItem('admin_token', data.token);
        onSuccess(data.token);
      }
    } catch {
      setErrorMessage('Unable to connect to authentication server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D0B] text-[#F4F5F4] flex flex-col items-center justify-center p-4 selection:bg-emerald-500 selection:text-black">
      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Brand Logos */}
        <div className="mb-6 flex flex-col items-center text-center">
          <CodeMeetLogo size="lg" className="mb-3" />
          <h1 className="text-xl font-bold font-display tracking-tight text-white">
            Admin Panel
          </h1>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            Code Meet 2026 &bull; SUIET Mukka
          </p>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="w-full mb-4 p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-xs font-mono text-red-300 flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Access Form */}
        <div className="w-full bg-[#111613] border border-[#232F26] rounded-xl p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-1.5 font-medium">
                ADMIN ACCESS CODE
              </label>
              <div className="relative">
                <input
                  type="password"
                  autoComplete="off"
                  autoFocus
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="Enter access code"
                  className="w-full bg-[#161D18] border border-[#232F26] rounded-lg px-3.5 py-2.5 text-white font-mono text-sm tracking-wider focus:border-emerald-500 outline-none transition"
                  required
                />
                <Lock size={15} className="absolute right-3.5 top-3 text-zinc-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !accessCode.trim()}
              className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-semibold font-mono text-xs tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow"
            >
              {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
              <ArrowRight size={14} />
            </button>
          </form>
        </div>

        <p className="mt-6 text-[11px] font-mono text-zinc-500">
          Authorized event coordinators only
        </p>
      </div>
    </div>
  );
};
