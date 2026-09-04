import React, { useState, useMemo } from 'react';
import { Gift, Plus, Trophy, Zap, Sparkles, Target, Calendar, Edit2, Info } from 'lucide-react';
import { useStore } from '../store/useStore';
import { RewardCard } from '../components/RewardCard';
import { Reward } from '../types';
import { calculateWeeklyTasksXp, calculateEarnedXpSince, getDateKey } from '../utils/helpers';
import { startOfWeek, startOfMonth } from 'date-fns';

const translations = {
  EN: {
    treasureVault: "The Treasure Vault",
    rewardsEarned: "Epic rewards unlocked through your 13-week XP journey.",
    forgeNewReward: "Forge New Reward",
    editRewardTitle: "Edit Reward Quest",
    emptyVault: "Empty Vault",
    heroGoal: "A true hero always has a goal. Set a 13-week reward to keep your XP fire burning!",
    setFirstReward: "Set First Reward",
    hallOfLegends: "Hall of Legends",
    claimed: "Claimed",
    defineReward: "Forge Thy Reward",
    rewardName: "Reward Name",
    rewardDesc: "Description / Motivation (Optional)",
    startDateLabel: "Quest Start Date",
    startDateHelp: "XP from all completed missions on or after this date will count towards this quest.",
    earnedXpFromDate: "Earned XP since start date:",
    todayPreset: "Today",
    thisWeekPreset: "This Week",
    startOfMonthPreset: "1st of Month",
    allTimePreset: "From First Task (All-Time)",
    questDuration: "Quest Duration",
    weeklyCapacityTitle: "Weekly Task XP Capacity",
    weeklyCapacityDesc: "Total XP all active missions provide per week",
    targetCalculation: "Target XP Formula",
    totalGoal: "Target Quest XP",
    targetExpl: "Total required XP for this quest",
    weeks: "weeks",
    cancel: "Cancel",
    forged: "Forge Quest",
    saveChanges: "Save Changes",
    claimConfirm: "Claim this reward and add it to your Hall of Legends?",
    deleteConfirm: "Are you sure you want to delete this reward quest?",
    customXpLabel: "Adjust Target XP"
  },
  NL: {
    treasureVault: "De Schatkist",
    rewardsEarned: "Epische beloningen vrijgespeeld via je 13-weken XP reis.",
    forgeNewReward: "Smeed Nieuwe Beloning",
    editRewardTitle: "Beloning Quest Bewerken",
    emptyVault: "Lege Kluis",
    heroGoal: "Een echte held heeft altijd een doel. Stel een 13-weken beloning in om het XP-vuur brandend te houden!",
    setFirstReward: "Stel Eerste Beloning In",
    hallOfLegends: "Eregalerij van Legendes",
    claimed: "Geclaimd",
    defineReward: "Smeed Je Beloning",
    rewardName: "Naam Beloning",
    rewardDesc: "Beschrijving / Motivatie (Optioneel)",
    startDateLabel: "Startdatum van de Quest",
    startDateHelp: "Alle voltooide taken op of na deze datum tellen mee voor deze quest.",
    earnedXpFromDate: "Reeds behaalde XP vanaf deze startdatum:",
    todayPreset: "Vandaag",
    thisWeekPreset: "Begin deze week",
    startOfMonthPreset: "1e van de maand",
    allTimePreset: "Vanaf eerste taak (Alles)",
    questDuration: "Duur van de Quest",
    weeklyCapacityTitle: "Wekelijkse Taak XP Capaciteit",
    weeklyCapacityDesc: "Totale XP die alle actieve missies per week opleveren",
    targetCalculation: "Doel XP Berekening",
    totalGoal: "Totaal Doel XP",
    targetExpl: "Totaal benodigde XP voor deze quest",
    weeks: "weken",
    cancel: "Annuleren",
    forged: "Smeed Quest",
    saveChanges: "Wijzigingen Opslaan",
    claimConfirm: "Deze beloning claimen en toevoegen aan je Eregalerij?",
    deleteConfirm: "Weet je zeker dat je deze beloning wilt verwijderen?",
    customXpLabel: "Doel XP Aanpassen"
  }
};

export const RewardsPage: React.FC = () => {
  const { tasks, activities, rewards, stats, addReward, updateReward, deleteReward, claimReward, language } = useStore();
  const t = translations[language];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);

  // Calculate potential XP per week across all tasks
  const weeklyTaskXp = useMemo(() => calculateWeeklyTasksXp(tasks), [tasks]);
  const effectiveWeeklyXp = weeklyTaskXp > 0 ? weeklyTaskXp : 250;

  // Preset date helpers
  const todayKey = useMemo(() => getDateKey(new Date()), []);
  const thisMondayKey = useMemo(() => getDateKey(startOfWeek(new Date(), { weekStartsOn: 1 })), []);
  const firstOfMonthKey = useMemo(() => getDateKey(startOfMonth(new Date())), []);
  const earliestActivityDateKey = useMemo(() => {
    if (!activities || activities.length === 0) return '';
    const sorted = [...activities].map(a => a.dateKey).filter(Boolean).sort();
    return sorted.length > 0 ? sorted[0] : '';
  }, [activities]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: todayKey,
    durationWeeks: 13,
    targetXp: effectiveWeeklyXp * 13,
    weeklyXp: effectiveWeeklyXp
  });

  const activeRewards = rewards.filter(r => !r.achievedAt);
  const achievedRewards = rewards.filter(r => r.achievedAt);

  const handleOpenNewModal = () => {
    setEditingReward(null);
    const currentWeekly = calculateWeeklyTasksXp(tasks);
    const eff = currentWeekly > 0 ? currentWeekly : 250;
    // Default to start of this week or today
    const defaultStart = thisMondayKey || todayKey;
    setFormData({
      name: '',
      description: '',
      startDate: defaultStart,
      durationWeeks: 13,
      targetXp: eff * 13,
      weeklyXp: eff
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (reward: Reward) => {
    setEditingReward(reward);
    const currentWeekly = calculateWeeklyTasksXp(tasks);
    const eff = reward.weeklyXp || (currentWeekly > 0 ? currentWeekly : 250);
    const startKey = reward.startDate ? getDateKey(new Date(reward.startDate)) : todayKey;
    const dur = reward.durationWeeks || 13;
    const target = reward.targetXp && reward.targetXp > 0 ? reward.targetXp : (eff * dur);

    setFormData({
      name: reward.name,
      description: reward.description || '',
      startDate: startKey,
      durationWeeks: dur,
      targetXp: target,
      weeklyXp: eff
    });
    setIsModalOpen(true);
  };

  const handleDurationChange = (weeks: number) => {
    const eff = formData.weeklyXp || effectiveWeeklyXp;
    setFormData(prev => ({
      ...prev,
      durationWeeks: weeks,
      targetXp: eff * weeks
    }));
  };

  // Real-time calculation of XP already earned since selected start date
  const earnedSinceStart = useMemo(() => {
    if (!formData.startDate) return 0;
    const dateMillis = new Date(`${formData.startDate}T00:00:00`).getTime();
    return calculateEarnedXpSince(dateMillis, tasks, activities, stats.totalPoints);
  }, [formData.startDate, tasks, activities, stats.totalPoints]);

  const handleSaveReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const startDateMillis = formData.startDate
      ? new Date(`${formData.startDate}T00:00:00`).getTime()
      : Date.now();

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      durationWeeks: formData.durationWeeks,
      targetXp: Number(formData.targetXp) || (effectiveWeeklyXp * formData.durationWeeks),
      weeklyXp: formData.weeklyXp || effectiveWeeklyXp,
      startDate: startDateMillis,
      startPoints: 0
    };

    if (editingReward) {
      await updateReward(editingReward.id, payload);
    } else {
      await addReward(payload);
    }

    setIsModalOpen(false);
    setEditingReward(null);
  };

  const handleDeleteReward = async (id: string) => {
    if (window.confirm(t.deleteConfirm)) {
      await deleteReward(id);
    }
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
          onClick={handleOpenNewModal}
          className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 transition-all active:scale-95 cursor-pointer"
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
              tasks={tasks}
              activities={activities}
              totalPoints={stats.totalPoints}
              currentStreak={stats.streak}
              language={language}
              onClaim={handleClaim}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteReward}
            />
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white border-2 border-dashed border-indigo-100 rounded-[2.5rem]">
            <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Gift className="w-10 h-10 text-indigo-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2 rpg-font">{t.emptyVault}</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-8 font-medium">{t.heroGoal}</p>
            <button 
              onClick={handleOpenNewModal}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black shadow-2xl shadow-indigo-100 hover:scale-105 transition-all cursor-pointer"
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
                    {reward.targetXp ? ` • ${reward.targetXp.toLocaleString()} XP` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal for Creating or Editing a Reward Quest */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-indigo-50 animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-indigo-50/50">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-md shadow-indigo-200">
                  {editingReward ? <Edit2 className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-indigo-950 rpg-font">
                    {editingReward ? t.editRewardTitle : t.defineReward}
                  </h3>
                  <p className="text-xs text-indigo-700/70 font-bold">13-Week Master Quest</p>
                </div>
              </div>
              <button 
                onClick={() => { setIsModalOpen(false); setEditingReward(null); }} 
                className="text-slate-400 hover:text-slate-600 text-3xl font-light cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveReward} className="p-8 space-y-5 max-h-[82vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
                  {t.rewardName}
                </label>
                <input 
                  autoFocus
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-5 py-3.5 rounded-2xl border border-slate-300 bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none font-bold text-slate-900 transition-all placeholder:text-slate-400"
                  placeholder={language === 'NL' ? 'bijv. Weekendje naar Parijs, Spa Dag, Nieuwe Fiets' : 'e.g. Weekend getaway, Spa day, New gadgets'}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
                  {t.rewardDesc}
                </label>
                <input 
                  type="text" 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-5 py-3 rounded-2xl border border-slate-300 bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none text-sm font-medium text-slate-900 transition-all placeholder:text-slate-400"
                  placeholder={language === 'NL' ? 'Waarom verdien je deze beloning?' : 'Why do you deserve this reward?'}
                />
              </div>

              {/* Start Date Selection with Presets and Live XP Feedback */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4.5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-indigo-600" /> {t.startDateLabel}
                  </label>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-md">
                    {formData.startDate}
                  </span>
                </div>

                <input 
                  type="date"
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none font-bold text-slate-800 text-sm transition-all"
                  required
                />

                {/* Preset Quick Buttons */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, startDate: todayKey })}
                    className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      formData.startDate === todayKey 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {t.todayPreset}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, startDate: thisMondayKey })}
                    className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      formData.startDate === thisMondayKey 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {t.thisWeekPreset}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, startDate: firstOfMonthKey })}
                    className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      formData.startDate === firstOfMonthKey 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {t.startOfMonthPreset}
                  </button>
                  {earliestActivityDateKey && earliestActivityDateKey !== todayKey && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, startDate: earliestActivityDateKey })}
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        formData.startDate === earliestActivityDateKey 
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t.allTimePreset}
                    </button>
                  )}
                </div>

                {/* Real-time feedback showing earned XP from selected start date */}
                <div className="p-3 bg-white border border-amber-200 rounded-xl flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                    <span className="text-xs font-bold text-slate-700">{t.earnedXpFromDate}</span>
                  </div>
                  <span className="text-xs font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80">
                    {earnedSinceStart.toLocaleString()} XP
                    {formData.targetXp > 0 ? ` (${Math.min(100, Math.round((earnedSinceStart / formData.targetXp) * 100))}%)` : ''}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
                  <span>{t.startDateHelp}</span>
                </p>
              </div>

              {/* 13-Week XP Goal Calculation Card */}
              <div className="bg-gradient-to-br from-indigo-50/90 via-blue-50/50 to-slate-50 border border-indigo-100/80 rounded-2xl p-4.5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-indigo-600" /> {t.targetCalculation}
                  </span>
                  <span className="text-[11px] font-bold text-indigo-600 bg-indigo-100/70 px-2.5 py-0.5 rounded-full">
                    {formData.durationWeeks} {t.weeks}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-indigo-50 shadow-xs">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.weeklyCapacityTitle}</p>
                    <p className="text-lg font-black text-indigo-950 mt-0.5 flex items-center gap-1">
                      <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                      {effectiveWeeklyXp.toLocaleString()} <span className="text-xs font-bold text-slate-400">XP/wk</span>
                    </p>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-indigo-50 shadow-xs">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.totalGoal}</p>
                    <p className="text-lg font-black text-emerald-600 mt-0.5 flex items-center gap-1">
                      <Trophy className="w-4 h-4 text-emerald-500" />
                      {formData.targetXp.toLocaleString()} <span className="text-xs font-bold text-slate-400">XP</span>
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 font-medium leading-relaxed bg-white/50 p-2.5 rounded-xl border border-indigo-50/50">
                  💡 <span className="font-bold text-slate-700">{effectiveWeeklyXp} XP per week</span> × <span className="font-bold text-slate-700">{formData.durationWeeks} weken</span> = <span className="font-black text-indigo-600">{formData.targetXp.toLocaleString()} XP</span>. {language === 'NL' ? 'Je verdient dit doel door je taken af te vinken!' : 'Earn this target by completing your missions!'}
                </p>
              </div>

              {/* Duration selection (default 13 weeks) */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2.5 ml-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" /> {t.questDuration}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[4, 8, 13, 26].map(weeks => (
                    <button
                      key={weeks}
                      type="button"
                      onClick={() => handleDurationChange(weeks)}
                      className={`py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        formData.durationWeeks === weeks 
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105' 
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {weeks} {t.weeks} {weeks === 13 ? '★' : ''}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-4">
                <button 
                  type="button"
                  onClick={() => { setIsModalOpen(false); setEditingReward(null); }}
                  className="flex-1 py-4 px-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all active:scale-95 cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 px-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> {editingReward ? t.saveChanges : t.forged}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
