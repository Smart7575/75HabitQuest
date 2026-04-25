
import React from 'react';
import { Gift, Calendar, Trophy, Sparkles } from 'lucide-react';
import { Reward } from '../types';

interface RewardCardProps {
  reward: Reward;
  currentStreak: number;
  onClaim?: (id: string) => void;
}

export const RewardCard: React.FC<RewardCardProps> = ({ reward, currentStreak, onClaim }) => {
  const progress = Math.min((currentStreak / reward.durationDays) * 100, 100);
  const remainingDays = Math.max(reward.durationDays - currentStreak, 0);
  const isReady = progress >= 100;

  return (
    <div className={`
      bg-white rounded-2xl border p-5 shadow-sm overflow-hidden relative transition-all duration-300
      ${isReady ? 'border-amber-300 ring-2 ring-amber-100 shadow-amber-100 shadow-lg scale-[1.02]' : 'border-gray-100'}
    `}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${isReady ? 'bg-amber-100' : 'bg-indigo-50'}`}>
          <Gift className={`w-6 h-6 ${isReady ? 'text-amber-600 animate-bounce' : 'text-indigo-600'}`} />
        </div>
        {isReady && (
          <div className="bg-amber-500 text-white text-[10px] font-black px-2 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider animate-pulse">
            <Sparkles className="w-3 h-3" /> Quest Complete
          </div>
        )}
      </div>
      
      <h3 className="text-lg font-bold text-gray-800 mb-1">{reward.name}</h3>
      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{reward.description || 'No description provided.'}</p>

      <div className="space-y-3">
        <div className="flex justify-between items-end text-sm">
          <span className="text-gray-400 font-medium flex items-center gap-1">
            <Calendar className="w-4 h-4" /> {reward.durationDays} day goal
          </span>
          <span className={`font-black ${isReady ? 'text-amber-600' : 'text-indigo-600'}`}>{Math.round(progress)}%</span>
        </div>
        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ease-out ${isReady ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-indigo-500'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {isReady ? (
          <button 
            onClick={() => onClaim?.(reward.id)}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-black text-sm hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shine-effect"
          >
            <Trophy className="w-4 h-4" /> Claim Your Prize
          </button>
        ) : (
          <p className="text-xs text-center text-gray-400 font-medium">
            Maintain your streak for <span className="font-bold text-gray-700">{remainingDays} more days</span>
          </p>
        )}
      </div>
    </div>
  );
};
