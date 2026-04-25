
import React from 'react';

interface XPBarProps {
  level: number;
  xp: number;
  nextLevelXp: number;
}

export const XPBar: React.FC<XPBarProps> = ({ level, xp, nextLevelXp }) => {
  const percentage = (xp / nextLevelXp) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-1">
        <span className="text-sm font-bold text-blue-600">Level {level}</span>
        <span className="text-xs text-gray-500">{xp} / {nextLevelXp} XP</span>
      </div>
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-500 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
