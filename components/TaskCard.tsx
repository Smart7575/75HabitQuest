
import React from 'react';
import { CheckCircle2, Circle, Star, AlertCircle, Info, Trash2 } from 'lucide-react';
import { Task, TaskType } from '../types';

interface TaskCardProps {
  task: Task;
  completed: boolean;
  onToggle: () => void;
  onDelete?: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, completed, onToggle, onDelete }) => {
  const getIcon = () => {
    switch (task.type) {
      case TaskType.REQUIRED: return <AlertCircle className="w-4 h-4 text-rose-500" />;
      case TaskType.OPTIONAL: return <Info className="w-4 h-4 text-blue-500" />;
      case TaskType.BONUS: return <Star className="w-4 h-4 text-amber-500" />;
    }
  };

  const onClickDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      const confirmed = window.confirm(`Weet je zeker dat je de taak "${task.name}" wilt verwijderen?`);
      if (confirmed) {
        onDelete();
      }
    }
  };

  return (
    <div 
      onClick={onToggle}
      className={`group flex items-center p-2 px-4 mb-1.5 rounded-xl border transition-all cursor-pointer select-none relative
        ${completed 
          ? 'bg-emerald-50 border-emerald-200 opacity-75' 
          : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
        }`}
    >
      <div className="mr-3">
        {completed ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        ) : (
          <Circle className="w-5 h-5 text-gray-300 group-hover:text-blue-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className={`font-semibold text-sm truncate ${completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
            {task.name}
          </h3>
          {getIcon()}
        </div>
        <p className="text-[10px] text-gray-500 mt-0">{task.points} XP</p>
      </div>
      
      <div className="flex items-center gap-2 ml-2">
        <div className="text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-lg bg-gray-100 text-gray-400 hidden sm:block">
          {task.type.slice(0, 3)}
        </div>
        
        {onDelete && (
          <button
            type="button"
            onClick={onClickDelete}
            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all flex-shrink-0 z-10"
            aria-label="Verwijder taak"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
