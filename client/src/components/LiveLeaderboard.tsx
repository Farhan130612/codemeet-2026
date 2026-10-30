import React from 'react';
import { ScoringResult } from '../types.js';
import { Trophy, Medal, AlertOctagon, CheckCircle2, ShieldAlert } from 'lucide-react';

interface LiveLeaderboardProps {
  leaderboard: ScoringResult[];
  currentParticipantId?: string;
  minAccuracy?: number;
}

export const LiveLeaderboard: React.FC<LiveLeaderboardProps> = ({
  leaderboard,
  currentParticipantId,
  minAccuracy = 90,
}) => {
  const qualified = leaderboard.filter((r) => !r.isDisqualified);
  const disqualified = leaderboard.filter((r) => r.isDisqualified);

  const top1 = qualified[0];
  const top2 = qualified[1];
  const top3 = qualified[2];

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8">
      {/* SECTION HEADER */}
      <div className="flex items-center justify-between border-b border-[#232F26] pb-4">
        <div>
          <h2 className="text-xl font-bold font-display tracking-tight text-white flex items-center gap-2.5">
            <Trophy className="text-emerald-400" size={22} />
            LEADERBOARD
          </h2>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            Ranked by Net WPM &bull; Minimum {minAccuracy}% accuracy required to qualify
          </p>
        </div>
        <div className="text-xs font-mono bg-[#111613] border border-[#232F26] px-3 py-1.5 rounded-lg text-zinc-400">
          SUBMISSIONS: <span className="text-white font-bold tabular-nums">{leaderboard.length}</span>
        </div>
      </div>

      {/* TOP 3 PODIUM */}
      {qualified.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Rank 2 */}
          {top2 ? (
            <div className="order-2 md:order-1 bg-[#111613] border border-[#232F26] p-6 rounded-xl flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="font-mono text-xs text-zinc-400 uppercase font-semibold">2ND PLACE</span>
                <Medal size={22} className="text-slate-300" />
              </div>
              <div className="my-4">
                <h3 className="text-lg font-bold font-display text-white truncate">
                  {top2.participantName}
                </h3>
                {top2.usn && <p className="text-[11px] font-mono text-zinc-500">{top2.usn}</p>}
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl font-extrabold font-mono text-white tabular-nums">
                    {top2.netWpm.toFixed(1)}
                  </span>
                  <span className="text-xs font-mono text-zinc-400">NET WPM</span>
                </div>
              </div>
              <div className="flex justify-between text-xs font-mono text-zinc-400 pt-3 border-t border-[#232F26]">
                <span>Acc: <strong className="text-white tabular-nums">{top2.accuracy}%</strong></span>
                <span>Raw: <strong className="tabular-nums">{top2.rawWpm}</strong></span>
                <span>Errors: <strong className="text-red-400 tabular-nums">{top2.uncorrectedErrors}</strong></span>
              </div>
            </div>
          ) : (
            <div className="order-2 md:order-1 border border-dashed border-[#232F26] rounded-xl p-6 flex items-center justify-center text-xs font-mono text-zinc-600">
              Awaiting 2nd Place
            </div>
          )}

          {/* Rank 1 (Champion) */}
          {top1 && (
            <div className="order-1 md:order-2 bg-gradient-to-b from-[#18241D] to-[#111613] border-2 border-emerald-500 p-6 rounded-xl flex flex-col justify-between shadow-[0_0_24px_rgba(16,185,129,0.12)]">
              <div className="flex justify-between items-start">
                <span className="font-mono text-xs text-emerald-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <Trophy size={14} className="text-emerald-400" /> 1ST PLACE
                </span>
                <span className="w-7 h-7 rounded-full bg-emerald-500 text-black font-extrabold flex items-center justify-center text-sm font-mono shadow">
                  1
                </span>
              </div>
              <div className="my-4">
                <h3 className="text-2xl font-bold font-display text-white truncate">
                  {top1.participantName}
                </h3>
                {top1.usn && <p className="text-xs font-mono text-zinc-400">{top1.usn}</p>}
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-5xl font-extrabold font-mono text-white tabular-nums">
                    {top1.netWpm.toFixed(1)}
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-semibold">NET WPM</span>
                </div>
              </div>
              <div className="flex justify-between text-xs font-mono text-zinc-300 pt-3 border-t border-[#232F26]">
                <span>Acc: <strong className="text-white tabular-nums">{top1.accuracy}%</strong></span>
                <span>Raw: <strong className="tabular-nums">{top1.rawWpm}</strong></span>
                <span>Consistency: <strong className="tabular-nums">{top1.consistency}%</strong></span>
              </div>
            </div>
          )}

          {/* Rank 3 */}
          {top3 ? (
            <div className="order-3 bg-[#111613] border border-[#232F26] p-6 rounded-xl flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="font-mono text-xs text-zinc-400 uppercase font-semibold">3RD PLACE</span>
                <Medal size={22} className="text-amber-600" />
              </div>
              <div className="my-4">
                <h3 className="text-lg font-bold font-display text-white truncate">
                  {top3.participantName}
                </h3>
                {top3.usn && <p className="text-[11px] font-mono text-zinc-500">{top3.usn}</p>}
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl font-extrabold font-mono text-white tabular-nums">
                    {top3.netWpm.toFixed(1)}
                  </span>
                  <span className="text-xs font-mono text-zinc-400">NET WPM</span>
                </div>
              </div>
              <div className="flex justify-between text-xs font-mono text-zinc-400 pt-3 border-t border-[#232D26]">
                <span>Acc: <strong className="text-white tabular-nums">{top3.accuracy}%</strong></span>
                <span>Raw: <strong className="tabular-nums">{top3.rawWpm}</strong></span>
                <span>Errors: <strong className="text-red-400 tabular-nums">{top3.uncorrectedErrors}</strong></span>
              </div>
            </div>
          ) : (
            <div className="order-3 border border-dashed border-[#232F26] rounded-xl p-6 flex items-center justify-center text-xs font-mono text-zinc-600">
              Awaiting 3rd Place
            </div>
          )}
        </div>
      )}

      {/* FULL LEADERBOARD TABLE */}
      <div className="bg-[#111613] border border-[#232F26] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#161D18] text-zinc-400 uppercase border-b border-[#232F26] sticky top-0 z-10">
              <tr>
                <th className="py-3 px-4 w-16">RANK</th>
                <th className="py-3 px-4">TYPIST</th>
                <th className="py-3 px-4">USN NUMBER</th>
                <th className="py-3 px-4 text-right">NET WPM</th>
                <th className="py-3 px-4 text-right">RAW WPM</th>
                <th className="py-3 px-4 text-right">ACCURACY</th>
                <th className="py-3 px-4 text-right hidden sm:table-cell">ERRORS</th>
                <th className="py-3 px-4 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232F26]">
              {qualified.length === 0 && disqualified.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500">
                    No results submitted yet. Standings will populate as typists finish.
                  </td>
                </tr>
              ) : (
                qualified.map((r) => {
                  const isCurrent = r.participantId === currentParticipantId;
                  return (
                    <tr
                      key={r.participantId}
                      className={`hover:bg-[#161D18]/70 transition ${
                        isCurrent ? 'bg-[#18241D] border-l-4 border-l-emerald-500' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-bold tabular-nums">
                        {r.rank === 1 ? (
                          <span className="text-emerald-400">#1</span>
                        ) : r.rank === 2 ? (
                          <span className="text-slate-300">#2</span>
                        ) : r.rank === 3 ? (
                          <span className="text-amber-500">#3</span>
                        ) : (
                          <span className="text-zinc-500">#{r.rank}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-sans font-medium text-white flex items-center gap-2">
                        <span>{r.participantName}</span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500 text-black font-extrabold font-mono">
                            YOU
                          </span>
                        )}
                        {r.flaggedForReview && (
                          <span title="Flagged for Host Review" className="text-amber-400">
                            <ShieldAlert size={14} />
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-zinc-400 tracking-wider">
                        {r.usn || '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-white text-sm tabular-nums">
                        {r.netWpm.toFixed(1)}
                      </td>
                      <td className="py-3 px-4 text-right text-zinc-400 tabular-nums">{r.rawWpm.toFixed(1)}</td>
                      <td className="py-3 px-4 text-right text-white font-semibold tabular-nums">
                        {r.accuracy.toFixed(1)}%
                      </td>
                      <td className="py-3 px-4 text-right hidden sm:table-cell text-zinc-400 tabular-nums">
                        <span className="text-red-400">{r.uncorrectedErrors}</span> /{' '}
                        <span>{r.correctedErrors}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                          <CheckCircle2 size={13} /> Qualified
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}

              {/* DISQUALIFIED PARTICIPANTS SECTION */}
              {disqualified.length > 0 && (
                <>
                  <tr className="bg-red-950/20 text-red-400 font-bold text-[11px] uppercase tracking-wider">
                    <td colSpan={8} className="py-2.5 px-4">
                      DISQUALIFIED / BELOW {minAccuracy}% ACCURACY THRESHOLD ({disqualified.length})
                    </td>
                  </tr>
                  {disqualified.map((r) => (
                    <tr
                      key={r.participantId}
                      className="bg-red-950/10 hover:bg-red-950/20 text-zinc-400 opacity-80 transition"
                    >
                      <td className="py-3 px-4 text-red-500 font-semibold">DQ</td>
                      <td className="py-3 px-4 text-white">
                        <span>{r.participantName}</span>
                        {r.disqualificationReason && (
                          <span className="block text-[10px] text-red-400 font-normal">
                            {r.disqualificationReason}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-zinc-400">{r.usn || '-'}</td>
                      <td className="py-3 px-4 text-right text-red-400 font-medium tabular-nums">
                        {r.netWpm.toFixed(1)}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums">{r.rawWpm.toFixed(1)}</td>
                      <td className="py-3 px-4 text-right text-red-400 font-bold tabular-nums">
                        {r.accuracy.toFixed(1)}%
                      </td>
                      <td className="py-3 px-4 text-right hidden sm:table-cell tabular-nums">
                        {r.uncorrectedErrors} / {r.correctedErrors}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] text-red-400 font-semibold">
                          <AlertOctagon size={13} /> Disqualified
                        </span>
                      </td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
