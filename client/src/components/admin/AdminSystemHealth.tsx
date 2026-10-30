import React, { useState, useEffect } from 'react';
import { Server, Database, Cpu, Wifi, Activity, CheckCircle2 } from 'lucide-react';

interface AdminSystemHealthProps {
  adminToken: string;
}

export const AdminSystemHealth: React.FC<AdminSystemHealthProps> = ({ adminToken }) => {
  const [healthData, setHealthData] = useState<any>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  const checkHealth = async () => {
    const t0 = performance.now();
    try {
      const res = await fetch('/api/admin/health', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const t1 = performance.now();
      setLatencyMs(Math.round(t1 - t0));
      const data = await res.json();
      setHealthData(data);
    } catch {
      setLatencyMs(null);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="pb-4 border-b border-[#232F26]">
        <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
          <Server size={20} className="text-emerald-400" />
          SYSTEM STATUS
        </h2>
        <p className="text-xs font-mono text-zinc-400 mt-1">
          Server performance, database status, and active connections.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        {/* Latency */}
        <div className="bg-[#111613] border border-[#232F26] p-4 rounded-xl">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="uppercase text-[10px]">API LATENCY</span>
            <Activity size={16} className="text-emerald-400" />
          </div>
          <span className="text-2xl font-bold text-white tabular-nums">
            {latencyMs !== null ? `${latencyMs}ms` : '--'}
          </span>
        </div>

        {/* Connected Sockets */}
        <div className="bg-[#111613] border border-[#232F26] p-4 rounded-xl">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="uppercase text-[10px]">ACTIVE SOCKETS</span>
            <Wifi size={16} className="text-emerald-400" />
          </div>
          <span className="text-2xl font-bold text-white tabular-nums">
            {healthData?.connectedSockets ?? 0}
          </span>
        </div>

        {/* Database Status */}
        <div className="bg-[#111613] border border-[#232F26] p-4 rounded-xl">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="uppercase text-[10px]">DATABASE</span>
            <Database size={16} className="text-blue-400" />
          </div>
          <span className="text-2xl font-bold text-emerald-400 flex items-center gap-1.5 uppercase">
            <CheckCircle2 size={18} /> {healthData?.dbStatus || 'ONLINE'}
          </span>
        </div>

        {/* Server Uptime */}
        <div className="bg-[#111613] border border-[#232F26] p-4 rounded-xl">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="uppercase text-[10px]">UPTIME</span>
            <Cpu size={16} className="text-zinc-400" />
          </div>
          <span className="text-xl font-bold text-white tabular-nums">
            {healthData ? formatUptime(healthData.serverUptime) : '--'}
          </span>
        </div>
      </div>
    </div>
  );
};
