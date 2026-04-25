
import React, { useState, useMemo } from 'react';
import { Plus, Search, FolderPlus, Pencil, Trash2, Check, X, Loader2, Info } from 'lucide-react';
import { useStore } from '../store/useStore';
import { TaskType, Task } from '../types';
import { getDayName } from '../utils/helpers';
import { format } from 'date-fns';

const translations = {
  EN: {
    tasks: "Tasks",
    planRoutine: "Plan your routine and build habits.",
    categories: "Categories",
    createTask: "Create Task",
    searchTasks: "Search tasks...",
    taskName: "Task Name",
    type: "Type",
    schedule: "Schedule",
    points: "Points",
    actions: "Actions",
    noMissions: "No missions found. Create your first task to start!",
    manageCategories: "Manage Categories",
    newCategory: "New Category...",
    editMission: "Edit Mission",
    newMission: "New Mission",
    description: "Description / Info",
    extraInfo: "Extra information about this task...",
    required: "Required (Streak)",
    optional: "Optional",
    bonus: "Bonus",
    selectCategory: "Select Category",
    firstScheduledDay: "First scheduled day",
    frequency: "Frequency (Interval in days)",
    frequencyInfo: "Leave 0 to use fixed weekdays below. Use 2 for 'every other day', etc.",
    activeDays: "Active Days",
    cancel: "Cancel",
    updateMission: "Update Mission",
    missionInfo: "Mission Info",
    noInfo: "No additional information provided for this mission.",
    close: "Close",
    every: "Every",
    days: "days",
    deleteMissionConfirm: "Are you sure you want to delete this mission?",
    deleteCategoryConfirm: "Delete category? Tasks in this category will become uncategorized.",
    deleteError: "Could not delete task. Please check your connection.",
    deleteCatError: "Could not delete category."
  },
  NL: {
    tasks: "Taken",
    planRoutine: "Plan je routine en bouw gewoontes op.",
    categories: "Categorieën",
    createTask: "Taak Aanmaken",
    searchTasks: "Zoek taken...",
    taskName: "Taak Naam",
    type: "Type",
    schedule: "Schema",
    points: "Punten",
    actions: "Acties",
    noMissions: "Geen missies gevonden. Maak je eerste taak om te beginnen!",
    manageCategories: "Categorieën Beheren",
    newCategory: "Nieuwe Categorie...",
    editMission: "Missie Bewerken",
    newMission: "Nieuwe Missie",
    description: "Beschrijving / Info",
    extraInfo: "Extra informatie over deze taak...",
    required: "Verplicht (Streak)",
    optional: "Optioneel",
    bonus: "Bonus",
    selectCategory: "Selecteer Categorie",
    firstScheduledDay: "Eerste ingeplande dag",
    frequency: "Frequentie (Interval in dagen)",
    frequencyInfo: "Laat op 0 om vaste weekdagen hieronder te gebruiken. Gebruik 2 voor 'om de dag', etc.",
    activeDays: "Actieve Dagen",
    cancel: "Annuleren",
    updateMission: "Missie Bijwerken",
    missionInfo: "Missie Info",
    noInfo: "Geen extra informatie beschikbaar voor deze missie.",
    close: "Sluiten",
    every: "Elke",
    days: "dagen",
    deleteMissionConfirm: "Weet je zeker dat je deze missie wilt verwijderen?",
    deleteCategoryConfirm: "Categorie verwijderen? Taken in deze categorie worden ongecategoriseerd.",
    deleteError: "Kon taak niet verwijderen. Controleer je verbinding.",
    deleteCatError: "Kon categorie niet verwijderen."
  }
};

export const TasksPage: React.FC = () => {
  const { tasks, categories, addTask, updateTask, deleteTask, addCategory, updateCategory, deleteCategory, language } = useStore();
  const t = translations[language];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [infoTask, setInfoTask] = useState<Task | null>(null);
  const [taskForm, setTaskForm] = useState({
    name: '',
    description: '',
    type: TaskType.REQUIRED,
    categoryId: '',
    frequency: 0,
    startDate: format(new Date(), 'yyyy-MM-dd'),
    days: [1, 2, 3, 4, 5] as number[]
  });

  const groupedTasks = useMemo(() => {
    const activeTasks = tasks.filter(t => !t.archived);
    const groups: Record<string, Task[]> = {};
    activeTasks.forEach(task => {
      const cat = task.categoryName || 'Uncategorized';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(task);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [tasks]);

  const resetTaskForm = () => {
    setTaskForm({ 
      name: '', 
      description: '',
      type: TaskType.REQUIRED, 
      categoryId: '', 
      frequency: 0, 
      startDate: format(new Date(), 'yyyy-MM-dd'),
      days: [1, 2, 3, 4, 5] 
    });
    setEditingTaskId(null);
  };

  const handleOpenEditTask = (e: React.MouseEvent, task: Task) => {
    e.preventDefault();
    e.stopPropagation();
    setTaskForm({ 
      name: task.name, 
      description: task.description || '',
      type: task.type, 
      categoryId: task.categoryId, 
      frequency: task.frequency || 0,
      startDate: task.startDate ? format(new Date(task.startDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      days: task.days || [] 
    });
    setEditingTaskId(task.id);
    setIsModalOpen(true);
  };

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.name || !taskForm.categoryId) return;
    const cat = categories.find(c => c.id === taskForm.categoryId);
    
    const taskData = { 
      ...taskForm, 
      categoryName: cat?.name || 'Uncategorized',
      startDate: new Date(taskForm.startDate).getTime()
    };
    
    if (editingTaskId) await updateTask(editingTaskId, taskData);
    else await addTask(taskData);
    
    resetTaskForm();
    setIsModalOpen(false);
  };

  const handleDeleteTask = async (e: React.MouseEvent, taskId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(t.deleteMissionConfirm)) {
      try {
        setIsDeleting(taskId);
        await deleteTask(taskId);
      } catch (err) {
        alert(t.deleteError);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    await addCategory(newCatName);
    setNewCatName('');
  };

  const handleStartEditCategory = (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault(); e.stopPropagation();
    setEditingCategoryId(id);
    setEditCatName(name);
  };

  const handleSaveCategory = async (e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation();
    if (!editCatName.trim()) return;
    await updateCategory(id, editCatName);
    setEditingCategoryId(null);
  };

  const handleDeleteCategory = async (e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation();
    if (window.confirm(t.deleteCategoryConfirm)) {
      try {
        setIsDeleting(id);
        await deleteCategory(id);
      } catch (err) {
        alert(t.deleteCatError);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const toggleDay = (day: number) => {
    setTaskForm(prev => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter(d => d !== day) : [...prev.days, day]
    }));
  };

  return (
    <div className="pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-800">{t.tasks}</h1>
          <p className="text-gray-500">{t.planRoutine}</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button type="button" onClick={() => setIsCategoryModalOpen(true)} className="flex-1 md:flex-none bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
            <FolderPlus className="w-5 h-5" /> {t.categories}
          </button>
          <button type="button" onClick={() => { resetTaskForm(); setIsModalOpen(true); }} className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition-all">
            <Plus className="w-5 h-5" /> {t.createTask}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder={t.searchTasks} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 text-left text-xs uppercase text-gray-400 font-bold tracking-wider">
              <tr>
                <th className="px-4 py-2">{t.taskName}</th>
                <th className="px-4 py-2">{t.type}</th>
                <th className="px-4 py-2">{t.schedule}</th>
                <th className="px-4 py-2">{t.points}</th>
                <th className="px-4 py-2 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {groupedTasks.map(([category, catTasks]) => (
                <React.Fragment key={category}>
                  <tr className="bg-slate-50/80">
                    <td colSpan={5} className="px-4 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {category}
                    </td>
                  </tr>
                  {catTasks.sort((a, b) => a.name.localeCompare(b.name)).map(task => (
                    <tr key={task.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-gray-800 text-sm">{task.name}</div>
                          {task.description && (
                            <button 
                              onClick={() => setInfoTask(task)}
                              className="p-1 hover:bg-blue-50 rounded-full transition-colors"
                            >
                              <Info className="w-3.5 h-3.5 text-blue-500" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase
                          ${task.type === TaskType.REQUIRED ? 'bg-rose-100 text-rose-600' : 
                            task.type === TaskType.OPTIONAL ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                          {task.type === TaskType.REQUIRED ? t.required : (task.type === TaskType.OPTIONAL ? t.optional : t.bonus)}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {task.frequency && task.frequency > 0 ? (
                          <span className="text-[10px] font-bold text-indigo-600">{t.every} {task.frequency} {t.days}</span>
                        ) : (
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5,6,0].map(d => (
                              <span key={d} className={`w-5 h-5 flex items-center justify-center rounded text-[9px] font-bold ${task.days?.includes(d) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                {getDayName(d, language).charAt(0)}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2 font-bold text-gray-700 text-xs">{task.points} XP</td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {isDeleting === task.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />
                          ) : (
                            <>
                              <button type="button" onClick={(e) => handleOpenEditTask(e, task)} className="p-1 hover:bg-blue-50 text-blue-600 rounded transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                              <button type="button" onClick={(e) => handleDeleteTask(e, task.id)} className="p-1 hover:bg-rose-50 text-rose-600 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
              {tasks.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium italic">{t.noMissions}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">{t.manageCategories}</h3>
              <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="max-h-60 overflow-y-auto space-y-2 mb-4 custom-scrollbar">
                {categories.map(cat => (
                  <div key={cat.id} className="flex justify-between items-center px-4 py-2 bg-slate-50 rounded-xl group">
                    {editingCategoryId === cat.id ? (
                      <div className="flex-1 flex gap-2">
                        <input autoFocus type="text" value={editCatName} onChange={e => setEditCatName(e.target.value)} className="flex-1 bg-white border border-gray-300 text-slate-900 rounded-lg px-2 py-1 text-sm outline-none" />
                        <button type="button" onClick={(e) => handleSaveCategory(e, cat.id)} className="text-emerald-500 hover:text-emerald-700"><Check className="w-4 h-4" /></button>
                        <button type="button" onClick={() => setEditingCategoryId(null)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <>
                        <span className="font-semibold text-slate-700">{cat.name}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {isDeleting === cat.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />
                          ) : (
                            <>
                              <button type="button" onClick={(e) => handleStartEditCategory(e, cat.id, cat.name)} className="p-1 text-blue-500 hover:bg-blue-100 rounded"><Pencil className="w-3.5 h-3.5" /></button>
                              <button type="button" onClick={(e) => handleDeleteCategory(e, cat.id)} className="p-1 text-rose-500 hover:bg-rose-100 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddCategory} className="flex gap-2">
                <input type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)} className="flex-1 px-4 py-2 rounded-xl border border-gray-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-gray-400" placeholder={t.newCategory} />
                <button type="submit" className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"><Plus className="w-6 h-6" /></button>
              </form>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">{editingTaskId ? t.editMission : t.newMission}</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleSubmitTask} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t.taskName}</label>
                <input autoFocus type="text" value={taskForm.name} onChange={e => setTaskForm({...taskForm, name: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500/20 focus:outline-none placeholder:text-gray-400" placeholder="e.g. Read for 20 mins" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t.description}</label>
                <textarea 
                  value={taskForm.description} 
                  onChange={e => setTaskForm({...taskForm, description: e.target.value})} 
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500/20 focus:outline-none placeholder:text-gray-400 min-h-[80px] resize-none" 
                  placeholder={t.extraInfo}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{t.type}</label>
                  <select value={taskForm.type} onChange={e => setTaskForm({...taskForm, type: e.target.value as TaskType})} className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white text-slate-900 font-semibold focus:outline-none">
                    <option value={TaskType.REQUIRED}>{t.required}</option>
                    <option value={TaskType.OPTIONAL}>{t.optional}</option>
                    <option value={TaskType.BONUS}>{t.bonus}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{t.categories}</label>
                  <select required value={taskForm.categoryId} onChange={e => setTaskForm({...taskForm, categoryId: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white text-slate-900 font-semibold focus:outline-none">
                    <option value="" disabled>{t.selectCategory}</option>
                    {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t.firstScheduledDay}</label>
                <input 
                  type="date" 
                  value={taskForm.startDate} 
                  onChange={e => setTaskForm({...taskForm, startDate: e.target.value})} 
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white text-slate-900 font-semibold focus:outline-none" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t.frequency}</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="number" 
                    min="0"
                    value={taskForm.frequency} 
                    onChange={e => setTaskForm({...taskForm, frequency: parseInt(e.target.value) || 0})} 
                    className="w-24 px-4 py-2 rounded-xl border border-gray-300 bg-white text-slate-900 font-semibold focus:outline-none" 
                  />
                  <p className="text-[10px] text-gray-400 leading-tight">{t.frequencyInfo}</p>
                </div>
              </div>

              {taskForm.frequency === 0 && (
                <div className="animate-in fade-in duration-300">
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t.activeDays}</label>
                  <div className="flex justify-between gap-1">
                    {[1,2,3,4,5,6,0].map(d => (
                      <button key={d} type="button" onClick={() => toggleDay(d)} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${taskForm.days.includes(d) ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                        {getDayName(d, language).charAt(0)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 px-4 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all">{t.cancel}</button>
                <button type="submit" className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">{editingTaskId ? t.updateMission : t.createTask}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {infoTask && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-50/50">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-800">{t.missionInfo}</h3>
              </div>
              <button type="button" onClick={() => setInfoTask(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <div className="p-6">
              <h4 className="font-black text-slate-800 mb-2">{infoTask.name}</h4>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {infoTask.description || t.noInfo}
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setInfoTask(null)}
                className="w-full mt-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
