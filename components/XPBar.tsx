
import React from 'react';

interface XPBarProps {
  level: number;
  xp: number;
  nextLevelXp: number;
}

export const XPBar: React.FC<XPBarProps> = ({ level, xp, nextLevelXp }) => {
  const percentage = Math.min(100, Math.max(0, (xp / nextLevelXp) * 100));

  return (
    <div className="w-full">
      <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
        <div 
          className="h-full bg-white transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
