
import React from 'react';
import { Gift, Trophy, Sparkles, Target, Zap, Calendar, Edit2, Trash2 } from 'lucide-react';
import { Reward, Task, TaskActivity, Language } from '../types';
import { calculateRewardProgress } from '../utils/helpers';

interface RewardCardProps {
  reward: Reward;
  tasks?: Task[];
  activities?: TaskActivity[];
  totalPoints?: number;
  currentStreak?: number; // legacy prop
  language?: Language;
  onClaim?: (id: string) => void;
  onEdit?: (reward: Reward) => void;
  onDelete?: (id: string) => void;
}

export const RewardCard: React.FC<RewardCardProps> = ({ 
  reward, 
  tasks = [], 
  activities = [], 
  totalPoints = 0,
  language = 'NL',
  onClaim,
  onEdit,
  onDelete
}) => {
  const { 
    targetXp, 
    currentXp, 
    remainingXp, 
    progress, 
    isReady, 
    weeklyXp, 
    durationWeeks,
    startDateKey 
  } = calculateRewardProgress(reward, tasks, activities, totalPoints);

  const formattedStartDate = startDateKey ? new Date(`${startDateKey}T00:00:00`).toLocaleDateString(language === 'NL' ? 'nl-NL' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) : null;

  const t = language === 'NL' ? {
    questComplete: "Schat Ontgrendeld",
    questBadge: `${durationWeeks} Wkn Quest`,
    claimPrize: "Claim Je Schat",
    remaining: `Nog ${remainingXp.toLocaleString()} XP te gaan`,
    goalLabel: `${durationWeeks} wkn doel`,
    weeklyRate: `${weeklyXp} XP/wk`,
    started: "Gestart:",
    edit: "Bewerken",
    delete: "Verwijderen",
    noDesc: "Geen beschrijving opgegeven."
  } : {
    questComplete: "Quest Complete",
    questBadge: `${durationWeeks}-Wk Quest`,
    claimPrize: "Claim Your Prize",
    remaining: `${remainingXp.toLocaleString()} XP remaining`,
    goalLabel: `${durationWeeks}-wk goal`,
    weeklyRate: `${weeklyXp} XP/wk`,
    started: "Started:",
    edit: "Edit",
    delete: "Delete",
    noDesc: "No description provided."
  };

  return (
    <div className={`
      bg-white rounded-2xl border p-5 shadow-sm overflow-hidden relative transition-all duration-300
      ${isReady ? 'border-amber-300 ring-2 ring-amber-100 shadow-amber-100 shadow-lg scale-[1.02]' : 'border-gray-100 hover:border-indigo-100'}
    `}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${isReady ? 'bg-amber-100' : 'bg-indigo-50'}`}>
          <Gift className={`w-6 h-6 ${isReady ? 'text-amber-600 animate-bounce' : 'text-indigo-600'}`} />
        </div>

        <div className="flex items-center gap-1.5">
          {isReady ? (
            <div className="bg-amber-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider animate-pulse shadow-sm shadow-amber-200">
              <Sparkles className="w-3 h-3" /> {t.questComplete}
            </div>
          ) : (
            <div className="bg-indigo-50 text-indigo-600 border border-indigo-100/80 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider">
              <Zap className="w-3 h-3 text-amber-500 fill-amber-500" /> {t.questBadge}
            </div>
          )}

          {onEdit && (
            <button
              onClick={() => onEdit(reward)}
              title={t.edit}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(reward.id)}
              title={t.delete}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      
      <h3 className="text-lg font-bold text-gray-800 mb-1">{reward.name}</h3>
      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{reward.description || t.noDesc}</p>

      {formattedStartDate && (
        <div className="mb-3 flex items-center gap-1 text-[11px] font-semibold text-slate-400">
          <Calendar className="w-3 h-3 text-indigo-400" />
          <span>{t.started} <span className="text-slate-600 font-bold">{formattedStartDate}</span></span>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex justify-between items-end text-sm">
          <span className="text-gray-500 font-medium flex items-center gap-1 text-xs">
            <Target className="w-3.5 h-3.5 text-indigo-500" /> 
            <span className="font-bold text-gray-800">{currentXp.toLocaleString()}</span> / {targetXp.toLocaleString()} XP
          </span>
          <span className={`font-black text-sm ${isReady ? 'text-amber-600' : 'text-indigo-600'}`}>
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden p-0.5">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out ${
              isReady 
                ? 'bg-gradient-to-r from-amber-400 to-orange-500' 
                : 'bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-400'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {isReady ? (
          <button 
            onClick={() => onClaim?.(reward.id)}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-black text-sm hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-200"
          >
            <Trophy className="w-4 h-4" /> {t.claimPrize}
          </button>
        ) : (
          <div className="flex items-center justify-between text-xs text-gray-400 font-medium pt-1">
            <span>{t.remaining}</span>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
              {t.weeklyRate}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
