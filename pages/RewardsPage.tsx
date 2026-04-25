
import React, { useState } from 'react';
import { Gift, Plus, Trophy } from 'lucide-react';
import { useStore } from '../store/useStore';
import { RewardCard } from '../components/RewardCard';

const translations = {
  EN: {
    treasureVault: "The Treasure Vault",
    rewardsEarned: "Rewards earned through discipline and might.",
    forgeNewReward: "Forge New Reward",
    emptyVault: "Empty Vault",
    heroGoal: "A true hero always has a goal. Set a reward for yourself to keep the fire burning!",
    setFirstReward: "Set First Reward",
    hallOfLegends: "Hall of Legends",
    claimed: "Claimed",
    defineReward: "Define Thy Reward",
    rewardName: "Reward Name",
    streakRequirement: "Streak Requirement",
    cancel: "Cancel",
    forged: "Forged",
    claimConfirm: "Claim this reward and add it to your Hall of Fame?"
  },
  NL: {
    treasureVault: "De Schatkist",
    rewardsEarned: "Beloningen verdiend door discipline en kracht.",
    forgeNewReward: "Smeed Nieuwe Beloning",
    emptyVault: "Lege Kluis",
    heroGoal: "Een echte held heeft altijd een doel. Stel een beloning in voor jezelf om het vuur brandend te houden!",
    setFirstReward: "Stel Eerste Beloning In",
    hallOfLegends: "Eregalerij van Legendes",
    claimed: "Geclaimd",
    defineReward: "Bepaal Uw Beloning",
    rewardName: "Naam Beloning",
    streakRequirement: "Streak Vereiste",
    cancel: "Annuleren",
    forged: "Gesmeed",
    claimConfirm: "Deze beloning claimen en toevoegen aan je Eregalerij?"
  }
};

export const RewardsPage: React.FC = () => {
  const { rewards, stats, addReward, claimReward, language } = useStore();
  const t = translations[language];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReward, setNewReward] = useState({
    name: '',
    description: '',
    durationDays: 7,
    startDate: Date.now()
  });

  const activeRewards = rewards.filter(r => !r.achievedAt);
  const achievedRewards = rewards.filter(r => r.achievedAt);

  const handleAddReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReward.name) return;
    addReward(newReward);
    setIsModalOpen(false);
    setNewReward({ name: '', description: '', durationDays: 7, startDate: Date.now() });
  };

  const handleClaim = async (id: string) => {
    if (window.confirm(t.claimConfirm)) {
      await claimReward(id);
    }
  };

  return (
    <div className="pb-24 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-800 rpg-font tracking-tight">{t.treasureVault}</h1>
          <p className="text-gray-500">{t.rewardsEarned}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> {t.forgeNewReward}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {activeRewards.length > 0 ? (
          activeRewards.map(reward => (
            <RewardCard 
              key={reward.id} 
              reward={reward} 
              currentStreak={stats.streak} 
              onClaim={handleClaim}
            />
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white border-2 border-dashed border-indigo-100 rounded-[2.5rem]">
            <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Gift className="w-10 h-10 text-indigo-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2 rpg-font">{t.emptyVault}</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium">{t.heroGoal}</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-2xl shadow-indigo-100 hover:scale-105 transition-all"
            >
              {t.setFirstReward}
            </button>
          </div>
        )}
      </div>

      {achievedRewards.length > 0 && (
        <div className="animate-in slide-in-from-bottom-10 duration-700">
          <h2 className="text-2xl font-black text-gray-800 mb-8 flex items-center gap-3 rpg-font">
            <Trophy className="w-8 h-8 text-amber-500" />
            {t.hallOfLegends}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievedRewards.map(reward => (
              <div key={reward.id} className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-4 hover:border-emerald-300 transition-colors">
                <div className="bg-emerald-50 p-3 rounded-xl">
                  <Trophy className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-gray-800 truncate">{reward.name}</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    {t.claimed} {new Date(reward.achievedAt!).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal remains the same but with enhanced styling */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-indigo-50 animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-indigo-50/50">
              <h3 className="text-2xl font-black text-indigo-950 rpg-font">{t.defineReward}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-indigo-300 hover:text-indigo-600 text-3xl font-light">&times;</button>
            </div>
            <form onSubmit={handleAddReward} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">{t.rewardName}</label>
                <input 
                  autoFocus
                  type="text" 
                  value={newReward.name}
                  onChange={e => setNewReward({...newReward, name: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-300 bg-white focus:ring-4 focus:ring-indigo-500/10 focus:outline-none font-bold text-slate-900 transition-all placeholder:text-slate-400"
                  placeholder="e.g. Legendary Coffee"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">{t.streakRequirement}</label>
                <div className="grid grid-cols-4 gap-2">
                  {[3, 7, 14, 30].map(days => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setNewReward({...newReward, durationDays: days})}
                      className={`py-3 rounded-xl text-xs font-black transition-all ${newReward.durationDays === days ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                    >
                      {days}D
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 px-4 bg-slate-100 text-slate-500 rounded-2xl font-black hover:bg-slate-200 transition-all active:scale-95"
                >
                  {t.cancel}
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 px-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
                >
                  {t.forged}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
