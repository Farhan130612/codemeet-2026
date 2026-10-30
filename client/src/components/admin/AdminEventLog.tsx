import React, { useState, useEffect } from 'react';
import { EventLogEntry } from '../../types.js';
import { Activity, RefreshCw, AlertTriangle, Info, AlertOctagon } from 'lucide-react';

interface AdminEventLogProps {
  adminToken: string;
  activeRoomId?: string;
}

export const AdminEventLog: React.FC<AdminEventLogProps> = ({
  adminToken,
}) => {
  const [logs, setLogs] = useState<EventLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchLogs = async () => {
    try {
      let url = '/api/admin/events?limit=250';
      if (severityFilter !== 'all') {
        url += `&severity=${severityFilter}`;
      }
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    if (!autoRefresh) return;
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, [severityFilter, autoRefresh]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#232F26]">
        <div>
          <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
            <Activity size={20} className="text-emerald-400" />
            EVENT LOG
          </h2>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            Real-time audit log of competition events and actions.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer text-zinc-400">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="accent-emerald-500 cursor-pointer"
            />
            <span>Auto-refresh</span>
          </label>
          <button
            onClick={fetchLogs}
            className="p-2 rounded bg-[#111613] border border-[#232F26] hover:border-zinc-500 text-zinc-400 hover:text-white cursor-pointer"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Severity Filter Tabs */}
      <div className="flex gap-2 font-mono text-xs">
        {['all', 'info', 'warn', 'error'].map((sev) => (
          <button
            key={sev}
            onClick={() => setSeverityFilter(sev)}
            className={`px-3 py-1.5 rounded uppercase text-[11px] transition cursor-pointer ${
              severityFilter === sev
                ? 'bg-[#18241D] text-emerald-400 border border-emerald-500/30 font-semibold'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {sev}
          </button>
        ))}
      </div>

      {/* Log Feed */}
      <div className="bg-[#111613] border border-[#232F26] rounded-xl overflow-hidden shadow">
        <div className="overflow-x-auto max-h-[600px] divide-y divide-[#232F26] font-mono text-xs">
          {logs.length === 0 ? (
            <div className="p-12 text-center text-zinc-500">
              {isLoading ? 'Loading logs...' : 'No logged events recorded.'}
            </div>
          ) : (
            logs.map((log) => {
              const dateStr = new Date(log.timestamp).toLocaleTimeString();
              const isWarn = log.severity === 'warn';
              const isError = log.severity === 'error';
              return (
                <div
                  key={log.id}
                  className={`p-3.5 flex items-start justify-between gap-4 hover:bg-[#161D18]/50 transition ${
                    isError
                      ? 'bg-red-950/20'
                      : isWarn
                      ? 'bg-amber-950/15'
                      : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="shrink-0 mt-0.5">
                      {isError ? (
                        <AlertOctagon size={15} className="text-red-400" />
                      ) : isWarn ? (
                        <AlertTriangle size={15} className="text-amber-400" />
                      ) : (
                        <Info size={15} className="text-zinc-400" />
                      )}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-white uppercase text-[11px]">
                          {log.type.replace(/_/g, ' ')}
                        </span>
                        {log.roomId && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#161D18] text-zinc-400 border border-[#232F26]">
                            {log.roomId}
                          </span>
                        )}
                        <span className="text-zinc-500 text-[10px]">by {log.actor}</span>
                      </div>
                      <p className="text-zinc-300 font-sans text-xs">{log.message}</p>
                    </div>
                  </div>

                  <span className="shrink-0 text-zinc-500 tabular-nums text-[11px]">
                    {dateStr}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
