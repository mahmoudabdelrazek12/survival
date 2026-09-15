import React, { useState, useEffect } from 'react';
import { X, User, Cloud, Trophy, ShieldAlert, CheckCircle, RefreshCw, LogIn, LogOut, Skull, Gauge } from 'lucide-react';
import { SaveData, LeaderboardEntry, OnlineUser } from '../types/game';
import { OnlineServices } from '../game/network/OnlineServices';
import { SaveSystem } from '../game/storage/SaveSystem';

interface ProfileModalProps {
  saveData: SaveData;
  onClose: () => void;
  onSaveUpdated: (data: SaveData) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ saveData, onClose, onSaveUpdated }) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'cloud' | 'leaderboard'>('stats');
  const [currentUser, setCurrentUser] = useState<OnlineUser | null>(OnlineServices.getCurrentUser());
  const [usernameInput, setUsernameInput] = useState('');
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      loadLeaderboard();
    }
  }, [activeTab]);

  const loadLeaderboard = async () => {
    setLoadingLeaderboard(true);
    const data = await OnlineServices.fetchLeaderboard();
    setLeaderboard(data);
    setLoadingLeaderboard(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;

    setSyncStatus('Connecting to Wasteland Network...');
    const res = await OnlineServices.login(usernameInput.trim());

    if (res.success && res.user) {
      setCurrentUser(res.user);
      setSyncStatus('Online Profile Connected.');
      saveData.playerName = res.user.username;
      saveData.playerId = res.user.playerId;
      SaveSystem.save(saveData);
      onSaveUpdated({ ...saveData });
    } else {
      setSyncStatus(res.error || 'Authentication failed.');
    }
  };

  const handleLogout = () => {
    OnlineServices.logout();
    setCurrentUser(null);
    setSyncStatus('Switched to Offline Mode.');
  };

  const handleCloudSync = async () => {
    setIsSyncing(true);
    setSyncStatus('Synchronizing save state to cloud...');
    const res = await OnlineServices.cloudSync(saveData);
    setIsSyncing(false);

    if (res.success) {
      setSyncStatus(`Cloud Sync Complete at ${new Date().toLocaleTimeString()}`);
    } else {
      setSyncStatus(`Cloud Sync Failed: ${res.error}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md font-gaming">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-800 bg-neutral-950/70">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-amber-500" />
            <div>
              <h2 className="font-heading text-3xl font-bold text-neutral-100 tracking-wider">
                {currentUser ? currentUser.username : saveData.playerName}
              </h2>
              <span className="text-xs text-neutral-400 font-mono">ID: {saveData.playerId}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentUser && !currentUser.isBanned ? (
              <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2.5 py-1 rounded-full flex items-center gap-1 font-bold">
                <CheckCircle className="w-3.5 h-3.5" /> CLOUD LINKED
              </span>
            ) : currentUser && currentUser.isBanned ? (
              <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/40 px-2.5 py-1 rounded-full flex items-center gap-1 font-bold">
                <ShieldAlert className="w-3.5 h-3.5" /> ACCOUNT BANNED
              </span>
            ) : (
              <span className="text-xs bg-neutral-800 text-neutral-400 px-2.5 py-1 rounded-full font-bold">
                OFFLINE GUEST
              </span>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/40 px-6">
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'stats'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Gauge className="w-4 h-4" /> COMBAT DOSSIER
          </button>
          <button
            onClick={() => setActiveTab('cloud')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'cloud'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Cloud className="w-4 h-4" /> CLOUD SERVICES
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'leaderboard'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Trophy className="w-4 h-4" /> GLOBAL LEADERBOARD
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'stats' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-neutral-950/80 border border-neutral-800 p-4 rounded-xl">
                <span className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider block mb-1">
                  TOTAL EXPEDITIONS
                </span>
                <span className="font-heading text-4xl text-neutral-100 font-bold">
                  {saveData.stats.totalRunsCount}
                </span>
              </div>

              <div className="bg-neutral-950/80 border border-neutral-800 p-4 rounded-xl">
                <span className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider block mb-1">
                  LONGEST SURVIVAL
                </span>
                <span className="font-heading text-4xl text-amber-400 font-bold">
                  {Math.floor(saveData.stats.longestSurvivalSeconds / 60)}m {saveData.stats.longestSurvivalSeconds % 60}s
                </span>
              </div>

              <div className="bg-neutral-950/80 border border-neutral-800 p-4 rounded-xl">
                <span className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider block mb-1">
                  RAIDERS ANNIHILATED
                </span>
                <span className="font-heading text-4xl text-rose-400 font-bold">
                  {saveData.stats.totalEnemiesDestroyed}
                </span>
              </div>

              <div className="bg-neutral-950/80 border border-neutral-800 p-4 rounded-xl">
                <span className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider block mb-1">
                  WAR RIG BOSSES KILLED
                </span>
                <span className="font-heading text-4xl text-orange-400 font-bold">
                  {saveData.stats.totalBossesDefeated}
                </span>
              </div>

              <div className="bg-neutral-950/80 border border-neutral-800 p-4 rounded-xl">
                <span className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider block mb-1">
                  DISTANCE EXPLORED
                </span>
                <span className="font-heading text-4xl text-sky-400 font-bold">
                  {(saveData.stats.totalDistanceTraveled / 1000).toFixed(1)} KM
                </span>
              </div>

              <div className="bg-neutral-950/80 border border-neutral-800 p-4 rounded-xl">
                <span className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider block mb-1">
                  TOTAL SALVAGE GATHERED
                </span>
                <span className="font-heading text-4xl text-emerald-400 font-bold">
                  {saveData.stats.totalCoinsCollected.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {activeTab === 'cloud' && (
            <div className="flex flex-col gap-5 max-w-xl mx-auto">
              {!currentUser ? (
                <form onSubmit={handleLogin} className="bg-neutral-950/80 border border-neutral-800 p-5 rounded-xl flex flex-col gap-4">
                  <div>
                    <h3 className="font-bold text-neutral-100 text-lg mb-1">CONNECT ONLINE PILOT PROFILE</h3>
                    <p className="text-xs text-neutral-400">
                      Synchronize your coins, upgrades, and vehicles to the cloud so you never lose progress.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-300 block mb-1.5">PILOT CALLSIGN</label>
                    <input
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="e.g. MadRider77"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-neutral-100 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    <LogIn className="w-4 h-4" /> LOGIN / REGISTER PILOT
                  </button>
                </form>
              ) : (
                <div className="bg-neutral-950/80 border border-neutral-800 p-5 rounded-xl flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-neutral-100 text-lg">ONLINE PILOT ACTIVE</h3>
                      <p className="text-xs text-neutral-400">Authenticated via Secure Cloud Token</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" /> LOGOUT
                    </button>
                  </div>

                  <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800 text-xs text-neutral-300 flex flex-col gap-1 font-mono">
                    <div>User: <span className="text-amber-400">{currentUser.username}</span></div>
                    <div>Player ID: <span className="text-neutral-400">{currentUser.playerId}</span></div>
                    <div>Cloud Sync: <span className="text-emerald-400">{new Date(currentUser.lastCloudSync).toLocaleTimeString()}</span></div>
                  </div>

                  <button
                    onClick={handleCloudSync}
                    disabled={isSyncing}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'SYNCING TO CLOUD...' : 'MANUAL CLOUD SYNC'}
                  </button>
                </div>
              )}

              {syncStatus && (
                <div className="text-center text-xs text-amber-400 font-mono bg-amber-500/10 border border-amber-500/20 py-2 rounded-lg">
                  {syncStatus}
                </div>
              )}
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div>
              {loadingLeaderboard ? (
                <div className="py-12 text-center text-neutral-400 text-sm animate-pulse">
                  Querying Satellite Network...
                </div>
              ) : (
                <div className="border border-neutral-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-950 text-neutral-400 font-bold uppercase tracking-wider border-b border-neutral-800">
                      <tr>
                        <th className="p-3">#</th>
                        <th className="p-3">SURVIVOR</th>
                        <th className="p-3">VEHICLE</th>
                        <th className="p-3">TIME</th>
                        <th className="p-3">BOSSES</th>
                        <th className="p-3 text-right">SCORE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/60 bg-neutral-950/60">
                      {leaderboard.map((entry) => (
                        <tr key={entry.playerId} className="hover:bg-neutral-900/40">
                          <td className="p-3 font-bold text-amber-400">{entry.rank}</td>
                          <td className="p-3 font-bold text-neutral-200">
                            {entry.playerName}
                            {entry.playerId === saveData.playerId && (
                              <span className="ml-2 text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">
                                YOU
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-neutral-400">{entry.vehicleUsed}</td>
                          <td className="p-3 text-neutral-400">{Math.floor(entry.survivalTime / 60)}m {entry.survivalTime % 60}s</td>
                          <td className="p-3 text-rose-400 font-bold">{entry.bossesKilled}</td>
                          <td className="p-3 font-heading text-lg font-bold text-neutral-100 text-right">
                            {entry.score.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
