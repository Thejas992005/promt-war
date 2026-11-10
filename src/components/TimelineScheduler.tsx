import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle2, Circle, AlertCircle, Plus, Edit2, Trash2, Check, X, Filter, Sparkles, UserCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { TimelineTask, ScheduleItem, Priority, EventPlan } from '../types/event';
import { formatDate, calculateDaysUntil } from '../utils/formatters';

interface TimelineSchedulerProps {
  plan: EventPlan;
  onUpdatePlan: (updated: EventPlan) => void;
}

export const TimelineScheduler: React.FC<TimelineSchedulerProps> = ({ plan, onUpdatePlan }) => {
  const [activeTab, setActiveTab] = useState<'milestones' | 'dayOf'>('milestones');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all');
  const [hideCompleted, setHideCompleted] = useState(false);

  // Task adding/editing
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState('Planning');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState<Priority>('medium');
  const [taskNotes, setTaskNotes] = useState('');

  // Day of item adding
  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('10:00 AM');
  const [scheduleActivity, setScheduleActivity] = useState('');
  const [schedulePerson, setSchedulePerson] = useState('Event Lead');
  const [scheduleNotes, setScheduleNotes] = useState('');

  // Toggle task completion
  const handleToggleTask = (taskId: string) => {
    const updated = plan.timeline.map(t => {
      if (t.id === taskId) {
        const nextState = !t.completed;
        if (nextState) {
          // Trigger celebratory confetti effect
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 }
          });
        }
        return { ...t, completed: nextState };
      }
      return t;
    });

    onUpdatePlan({
      ...plan,
      timeline: updated,
      updatedAt: new Date().toISOString()
    });
  };

  const handleDeleteTask = (taskId: string) => {
    onUpdatePlan({
      ...plan,
      timeline: plan.timeline.filter(t => t.id !== taskId),
      updatedAt: new Date().toISOString()
    });
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const newTask: TimelineTask = {
      id: 't-user-' + Date.now(),
      title: taskTitle.trim(),
      category: taskCategory.trim() || 'General',
      dueDate: taskDueDate || plan.date,
      daysBeforeEvent: 7,
      priority: taskPriority,
      completed: false,
      notes: taskNotes.trim()
    };

    onUpdatePlan({
      ...plan,
      timeline: [...plan.timeline, newTask],
      updatedAt: new Date().toISOString()
    });

    setShowAddTaskModal(false);
    setTaskTitle('');
    setTaskNotes('');
  };

  const handleAddScheduleItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleActivity.trim()) return;

    const newSchedule: ScheduleItem = {
      id: 's-user-' + Date.now(),
      time: scheduleTime,
      activity: scheduleActivity.trim(),
      responsiblePerson: schedulePerson.trim(),
      notes: scheduleNotes.trim()
    };

    onUpdatePlan({
      ...plan,
      dayOfSchedule: [...plan.dayOfSchedule, newSchedule],
      updatedAt: new Date().toISOString()
    });

    setShowAddScheduleModal(false);
    setScheduleActivity('');
    setScheduleNotes('');
  };

  const handleDeleteScheduleItem = (id: string) => {
    onUpdatePlan({
      ...plan,
      dayOfSchedule: plan.dayOfSchedule.filter(s => s.id !== id),
      updatedAt: new Date().toISOString()
    });
  };

  // Filter tasks
  const filteredTasks = plan.timeline.filter(task => {
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    if (hideCompleted && task.completed) return false;
    return true;
  });

  const completedCount = plan.timeline.filter(t => t.completed).length;
  const progressPercent = plan.timeline.length > 0 ? Math.round((completedCount / plan.timeline.length) * 100) : 0;

  const priorityBadgeClasses: Record<Priority, string> = {
    high: 'bg-rose-50 text-rose-700 border-rose-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    low: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher & Progress Overview */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl self-start">
          <button
            onClick={() => setActiveTab('milestones')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'milestones'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-brand-600" />
            <span>Preparation Milestones ({completedCount}/{plan.timeline.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('dayOf')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'dayOf'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Day-of-Event Run of Show ({plan.dayOfSchedule.length} Acts)</span>
          </button>
        </div>

        {/* Milestone Progress bar */}
        {activeTab === 'milestones' && (
          <div className="flex items-center gap-3 w-full md:w-64">
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500 font-medium">Readiness</span>
                <span className="font-bold text-brand-600">{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-brand-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* VIEW 1: PREPARATION MILESTONES */}
      {activeTab === 'milestones' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                Priority:
              </span>
              {(['all', 'high', 'medium', 'low'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPriorityFilter(p)}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium capitalize transition-colors ${
                    priorityFilter === p
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}

              <label className="flex items-center gap-1.5 text-xs text-slate-600 ml-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hideCompleted}
                  onChange={(e) => setHideCompleted(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                <span>Hide Completed</span>
              </label>
            </div>

            <button
              onClick={() => setShowAddTaskModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Milestone Task
            </button>
          </div>

          {/* Timeline List */}
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-slate-800">All filtered tasks completed!</h4>
                <p className="text-xs text-slate-500 mt-1">Adjust filters or add new tasks to track further steps.</p>
              </div>
            ) : (
              filteredTasks.map((task) => {
                const daysInfo = calculateDaysUntil(task.dueDate);
                return (
                  <div
                    key={task.id}
                    className={`bg-white rounded-xl border p-4 transition-all flex items-start gap-3.5 hover:shadow-xs ${
                      task.completed
                        ? 'border-slate-200/60 bg-slate-50/50 opacity-75'
                        : 'border-slate-200 shadow-xs'
                    }`}
                  >
                    {/* Completion Checkbox */}
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className="mt-0.5 text-slate-400 hover:text-brand-600 transition-colors shrink-0"
                      title={task.completed ? 'Mark pending' : 'Mark completed'}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 hover:text-brand-500" />
                      )}
                    </button>

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${priorityBadgeClasses[task.priority]}`}>
                          {task.priority} Priority
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {task.category}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Due: {formatDate(task.dueDate)}
                        </span>
                      </div>

                      <div className={`text-sm font-semibold ${task.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                        {task.title}
                      </div>

                      {task.notes && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {task.notes}
                        </p>
                      )}
                    </div>

                    {/* Due Countdown Tag */}
                    <div className="shrink-0 text-right">
                      <span className={`inline-block text-[11px] font-semibold px-2 py-1 rounded-md ${
                        task.completed
                          ? 'bg-emerald-50 text-emerald-700'
                          : daysInfo.isPast
                          ? 'bg-rose-50 text-rose-700 font-bold'
                          : 'bg-brand-50 text-brand-700'
                      }`}>
                        {task.completed ? 'Done ✓' : daysInfo.label}
                      </span>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="block mt-2 ml-auto text-slate-400 hover:text-rose-600 p-1 rounded"
                        title="Delete Task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: DAY-OF-EVENT RUN OF SHOW */}
      {activeTab === 'dayOf' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                Day-of-Event Master Run of Show Schedule
              </h3>
              <p className="text-xs text-slate-500">
                Minute-by-minute execution timeline from setup to wrap-up
              </p>
            </div>
            <button
              onClick={() => setShowAddScheduleModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Activity Item
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            <div className="relative border-l-2 border-emerald-200 ml-4 sm:ml-6 space-y-6">
              {plan.dayOfSchedule.map((item, idx) => (
                <div key={item.id} className="relative pl-6 sm:pl-8 group">
                  {/* Timeline circle node */}
                  <span className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-emerald-500 group-hover:scale-125 transition-transform" />

                  <div className="bg-slate-50 hover:bg-slate-100/80 rounded-xl p-3.5 border border-slate-200/80 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {item.time}
                        </span>
                        <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-slate-400" />
                          {item.responsiblePerson || 'Team Lead'}
                        </span>
                      </div>

                      <div className="text-sm font-bold text-slate-900 mt-1.5">
                        {item.activity}
                      </div>

                      {item.notes && (
                        <p className="text-xs text-slate-500 mt-1">
                          {item.notes}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteScheduleItem(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 self-start opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete activity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Task */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1">Add Milestone Task</h3>
            <p className="text-xs text-slate-500 mb-4">Create a preparation checklist item</p>

            <form onSubmit={handleAddTask} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule final soundcheck and lighting rehearsal"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Catering, Venue"
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as Priority)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-slate-50"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Confirm mic frequencies with audio vendor"
                  value={taskNotes}
                  onChange={(e) => setTaskNotes(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-lg"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Day-of Schedule */}
      {showAddScheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1">Add Day-of Run of Show Item</h3>
            <p className="text-xs text-slate-500 mb-4">Add a timed activity to the event day timeline</p>

            <form onSubmit={handleAddScheduleItem} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Time</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 04:30 PM"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Responsible Lead</label>
                  <input
                    type="text"
                    placeholder="e.g. MUA Team, Emcee"
                    value={schedulePerson}
                    onChange={(e) => setSchedulePerson(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Activity Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Golden hour portrait photography"
                  value={scheduleActivity}
                  onChange={(e) => setScheduleActivity(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Specific Instructions / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Ensure natural sunlight angle on west lawn"
                  value={scheduleNotes}
                  onChange={(e) => setScheduleNotes(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddScheduleModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                >
                  Add to Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
