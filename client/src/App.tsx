import React, { useState, useEffect } from 'react';
import { socket, saveParticipantSession, getSavedParticipantId } from './socket.js';
import { RoomSnapshot, Participant, ScoringResult } from './types.js';
import { Navbar } from './components/Navbar.js';
import { Lobby } from './components/Lobby.js';
import { TypingArea } from './components/TypingArea.js';
import { LiveLeaderboard } from './components/LiveLeaderboard.js';
import { ProjectorView } from './components/ProjectorView.js';
import { ResultModal } from './components/ResultModal.js';
import { CodeMeetLogo } from './components/CodeMeetLogo.js';
import { AdminLogin } from './components/admin/AdminLogin.js';
import { AdminDashboard } from './components/admin/AdminDashboard.js';
import { ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

export function App() {
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [view, setView] = useState<'home' | 'arena' | 'projector' | 'admin'>('home');

  // Admin Session State
  const [adminToken, setAdminToken] = useState<string | null>(
    sessionStorage.getItem('admin_token')
  );

  // Participant Form & Session State
  const [roomCode, setRoomCode] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>(
    localStorage.getItem('codemeet_participant_name') || ''
  );
  const [playerUsn, setPlayerUsn] = useState<string>(
    localStorage.getItem('codemeet_participant_usn') || ''
  );
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);
  const [snapshot, setSnapshot] = useState<RoomSnapshot | null>(null);

  // Modals & Results
  const [myResult, setMyResult] = useState<ScoringResult | null>(null);
  const [showResultModal, setShowResultModal] = useState<boolean>(false);
  const [joinError, setJoinError] = useState<string>('');
  const [isJoining, setIsJoining] = useState<boolean>(false);

  // 1. Initial Routing Inspection
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/gogo')) {
      setView('admin');
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room') || params.get('code');
    const projectorParam = params.get('projector');

    if (roomParam) {
      setRoomCode(roomParam.toUpperCase().trim());
    }

    if (projectorParam) {
      const code = projectorParam.toUpperCase().trim();
      setRoomCode(code);
      socket.emit('join_projector', { roomId: code }, (res: any) => {
        if (res?.success && res.snapshot) {
          setSnapshot(res.snapshot);
          setView('projector');
        }
      });
    }
  }, []);

  // 2. Socket Event Listeners
  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    const onRoomUpdate = (updatedSnapshot: RoomSnapshot) => {
      setSnapshot(updatedSnapshot);

      const me = updatedSnapshot.participants.find(
        (p) =>
          p.id === currentParticipant?.id ||
          p.id === getSavedParticipantId()
      );
      if (me) {
        setCurrentParticipant(me);
      }
    };

    const onTestStarted = (data: {
      countdownEndsAt: number;
      testEndsAt: number;
      targetTextId: string;
      targetText?: string;
    }) => {
      setSnapshot((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          state: 'countdown',
          countdownEndsAt: data.countdownEndsAt,
          testEndsAt: data.testEndsAt,
          targetTextId: data.targetTextId,
          targetText: data.targetText,
        };
      });
    };

    const onParticipantKicked = (data: { participantId: string; message: string }) => {
      if (currentParticipant?.id === data.participantId) {
        alert(`You have been removed: ${data.message}`);
        setView('home');
        setCurrentParticipant(null);
        setSnapshot(null);
      }
    };

    const onParticipantAttemptReset = (data: { participantId: string }) => {
      if (currentParticipant?.id === data.participantId) {
        setShowResultModal(false);
        setMyResult(null);
      }
    };

    const onTestAborted = () => {
      setShowResultModal(false);
      setMyResult(null);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('room_update', onRoomUpdate);
    socket.on('test_started', onTestStarted);
    socket.on('participant_kicked', onParticipantKicked);
    socket.on('participant_attempt_reset', onParticipantAttemptReset);
    socket.on('test_aborted', onTestAborted);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('room_update', onRoomUpdate);
      socket.off('test_started', onTestStarted);
      socket.off('participant_kicked', onParticipantKicked);
      socket.off('participant_attempt_reset', onParticipantAttemptReset);
      socket.off('test_aborted', onTestAborted);
    };
  }, [currentParticipant?.id]);

  // Attempt auto-reconnection to cached room session
  useEffect(() => {
    if (view !== 'home' || !roomCode) return;
    const savedId = getSavedParticipantId();
    if (savedId && playerName && playerUsn) {
      socket.emit(
        'join_room',
        {
          roomId: roomCode,
          name: playerName,
          usn: playerUsn,
          participantId: savedId,
        },
        (res: any) => {
          if (res?.success && res.snapshot) {
            setCurrentParticipant(res.participant);
            setSnapshot(res.snapshot);
            setView('arena');
          }
        }
      );
    }
  }, []);

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError('');

    const trimmedName = playerName.trim();
    const trimmedUsn = playerUsn.trim().toUpperCase();
    const cleanCode = roomCode.trim().toUpperCase();

    if (!trimmedName) {
      setJoinError('Please enter your full name.');
      return;
    }
    if (!trimmedUsn) {
      setJoinError('Please enter your University USN number.');
      return;
    }
    if (!cleanCode) {
      setJoinError('Please enter the room code or 6-digit room number.');
      return;
    }

    setIsJoining(true);
    localStorage.setItem('codemeet_participant_name', trimmedName);
    localStorage.setItem('codemeet_participant_usn', trimmedUsn);

    socket.emit(
      'join_room',
      {
        roomId: cleanCode,
        name: trimmedName,
        usn: trimmedUsn,
        participantId: currentParticipant?.id,
      },
      (response: {
        success?: boolean;
        snapshot?: RoomSnapshot;
        participant?: Participant;
        error?: string;
      }) => {
        setIsJoining(false);
        if (response?.success && response.snapshot && response.participant) {
          saveParticipantSession(response.participant.id, response.participant.name);
          setCurrentParticipant(response.participant);
          setSnapshot(response.snapshot);
          setView('arena');
        } else {
          setJoinError(response?.error || 'Unable to join this room. Check the code.');
        }
      }
    );
  };

  const handleTestFinish = (result: ScoringResult) => {
    setMyResult(result);
    setShowResultModal(true);
  };

  // ADMIN ROUTE VIEW
  if (view === 'admin') {
    if (!adminToken) {
      return <AdminLogin onSuccess={(token) => setAdminToken(token)} />;
    }
    return (
      <AdminDashboard
        adminToken={adminToken}
        onLogout={() => {
          sessionStorage.removeItem('admin_token');
          setAdminToken(null);
        }}
        onOpenProjector={(rId) => {
          window.open(`/?projector=${rId}`, '_blank');
        }}
      />
    );
  }

  // PROJECTOR ROUTE VIEW
  if (view === 'projector') {
    if (!snapshot) {
      return (
        <div className="min-h-screen bg-[#0A0D0B] text-white flex flex-col items-center justify-center p-6 font-mono text-xs">
          <CodeMeetLogo size="lg" className="mb-6" />
          <p className="text-zinc-400">Loading projector scoreboard for {roomCode}...</p>
        </div>
      );
    }
    return (
      <ProjectorView
        snapshot={snapshot}
        onExit={() => {
          setView('home');
          window.history.pushState({}, '', '/');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0D0B] text-[#F4F5F4] flex flex-col font-display selection:bg-emerald-500 selection:text-black">
      {/* GLOBAL NAVBAR */}
      <Navbar
        roomCode={snapshot?.config.roomId || roomCode}
        isConnected={isConnected}
        onOpenProjector={
          snapshot
            ? () => {
                setView('projector');
              }
            : undefined
        }
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      />

      {/* POST-TEST MODAL */}
      {showResultModal && myResult && (
        <ResultModal
          result={myResult}
          onClose={() => setShowResultModal(false)}
          isReady={currentParticipant?.status === 'ready'}
          onToggleReady={() => {
            if (snapshot && currentParticipant) {
              const nextReady = currentParticipant.status !== 'ready';
              socket.emit('toggle_ready', {
                roomId: snapshot.config.roomId,
                participantId: currentParticipant.id,
                isReady: nextReady,
              });
              setShowResultModal(false);
            }
          }}
        />
      )}

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        {view === 'home' && (
          <div className="my-auto py-8 sm:py-12 flex flex-col items-center">
            {/* Tagline */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111613] border border-[#232F26] text-xs font-mono text-zinc-300 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>SUIET Mukka &bull; Code Meet 2026</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-center max-w-xl font-display leading-tight text-white">
              Speed Typing <span className="text-emerald-400">Championship</span>
            </h1>
            <p className="mt-3 text-xs sm:text-sm text-zinc-400 text-center max-w-md font-mono">
              Enter your student details and the room code announced on the auditorium screen to join.
            </p>

            {/* Error Message */}
            {joinError && (
              <div className="mt-6 w-full max-w-md bg-red-950/40 border border-red-800/60 text-red-300 text-xs font-mono px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle size={15} className="text-red-400 shrink-0" />
                <span>{joinError}</span>
              </div>
            )}

            {/* PARTICIPANT ENTRY FORM */}
            <div className="mt-6 w-full max-w-md bg-[#111613] border border-[#232F26] rounded-xl p-6 sm:p-7 shadow-xl flex flex-col gap-5">
              <form onSubmit={handleJoinRoom} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="text-zinc-300 uppercase block mb-1.5 font-medium">
                    FULL NAME
                  </label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="e.g. Rahul Rao"
                    maxLength={24}
                    required
                    className="w-full bg-[#161D18] border border-[#232F26] rounded-lg px-3.5 py-2.5 text-white font-sans text-sm outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 uppercase block mb-1.5 font-medium">
                    UNIVERSITY USN NUMBER
                  </label>
                  <input
                    type="text"
                    value={playerUsn}
                    onChange={(e) => setPlayerUsn(e.target.value.toUpperCase())}
                    placeholder="e.g. 4SU22CS089"
                    maxLength={15}
                    required
                    className="w-full bg-[#161D18] border border-[#232F26] rounded-lg px-3.5 py-2.5 text-white font-mono text-sm uppercase tracking-wider outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 uppercase block mb-1.5 font-medium">
                    ROOM CODE OR 6-DIGIT NUMBER
                  </label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="e.g. K9X2M4R7 or 482910"
                    maxLength={8}
                    required
                    className="w-full bg-[#161D18] border border-[#232F26] rounded-lg px-3.5 py-2.5 text-white font-mono text-sm tracking-widest uppercase outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isJoining}
                  className="w-full py-3.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-bold font-mono text-xs tracking-wider transition transform active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow"
                >
                  {isJoining ? 'JOINING ROOM...' : 'ENTER COMPETITION'}
                  <ArrowRight size={14} />
                </button>
              </form>

              {/* Rules preview footer */}
              <div className="pt-3 border-t border-[#232F26] flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span>Minimum 90% accuracy</span>
                <span>Ranked by Net WPM</span>
              </div>
            </div>

            {/* Institution credit */}
            <div className="mt-8 text-center text-xs font-mono text-zinc-500">
              <p>Srinivas University Institute of Engineering & Technology &bull; Mukka</p>
            </div>
          </div>
        )}

        {view === 'arena' && snapshot && currentParticipant && (
          <div className="flex flex-col gap-8">
            {/* LOBBY OR TYPING CANVAS */}
            {snapshot.state === 'lobby' ? (
              <Lobby
                snapshot={snapshot}
                currentParticipant={currentParticipant}
              />
            ) : snapshot.state === 'countdown' || snapshot.state === 'in_progress' ? (
              snapshot.targetText ? (
                <TypingArea
                  roomId={snapshot.config.roomId}
                  participantId={currentParticipant.id}
                  targetText={snapshot.targetText}
                  targetTextId={snapshot.targetTextId || 'current'}
                  timerSeconds={snapshot.config.timerSeconds}
                  countdownEndsAt={snapshot.countdownEndsAt}
                  testEndsAt={snapshot.testEndsAt}
                  onFinish={handleTestFinish}
                  backspaceMode={snapshot.config.backspaceMode}
                />
              ) : (
                <div className="text-center py-16 text-zinc-400 font-mono text-xs">
                  Synchronizing target text with server...
                </div>
              )
            ) : null}

            {/* LIVE SCOREBOARD */}
            <LiveLeaderboard
              leaderboard={snapshot.leaderboard}
              currentParticipantId={currentParticipant.id}
              minAccuracy={snapshot.config.minAccuracy}
            />
          </div>
        )}
      </main>
    </div>
  );
}
