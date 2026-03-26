import React from 'react'
import type { Task } from '../../taskdata'

interface TimelineViewProps {
  tasks: Task[]
}

const PRIORITY_HEX = {
  critical: '#ef4444', // bg-red-500
  high: '#f97316',     // bg-orange-500
  medium: '#3b82f6',   // bg-blue-500
  low: '#64748b',      // bg-slate-500
}

/**
 * TimelineView Component
 * 
 * A Gantt-style chart that plots tasks on a horizontal time axis.
 * Features:
 * 1. Automatic month-spanning axis.
 * 2. Priority-based color coding.
 * 3. Today's date marker with a vertical line.
 * 4. Alternating row colors for readability.
 * 5. Hover effects showing the assignee.
 */

const TimelineView = ({ tasks }: TimelineViewProps) => {
  // Current date context
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  // Month metadata
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const monthStartDate = new Date(currentYear, currentMonth, 1)

  /**
   * Translates a Date object into a grid column index (0-indexed).
   * Returns -1 if the date falls outside the current month.
   */
  const getDayPosition = (date: Date) => {
    const dateMonth = date.getMonth();
    const dateYear = date.getFullYear();
    if (dateMonth !== currentMonth || dateYear !== currentYear) return -1;
    return date.getDate() - 1;
  };

  /**
   * Logic to calculate the CSS Grid positioning for a task bar.
   * Handles tasks with no start date by rendering them as single-day markers.
   */
  const getTaskStyle = (task: Task) => {
    const hasStartDate = task.startDate && task.startDate.length > 0;
    const hasDueDate = task.dueDate && task.dueDate.length > 0;

    // We need at least a due date to show anything
    if (!hasDueDate) return { display: 'none' };

    const startDate = hasStartDate ? new Date(task.startDate!) : new Date(task.dueDate!);
    const dueDate = new Date(task.dueDate!);

    const startPos = getDayPosition(startDate);
    const endPos = getDayPosition(dueDate);

    // Filter out tasks outside the current month view
    if (startPos === -1 && endPos === -1) return { display: 'none' };

    // Calculate grid spans (1-indexed for CSS Grid)
    const gridColumnStart = startPos === -1 ? 1 : startPos + 1;
    let gridColumnEnd = endPos === -1 ? daysInMonth + 1 : endPos + 2;

    // Single-day fallback if no start date provided
    if (!hasStartDate) {
      gridColumnEnd = gridColumnStart + 1;
    }

    return {
      gridColumn: `${gridColumnStart} / ${gridColumnEnd}`,
      backgroundColor: PRIORITY_HEX[task.priority],
    };
  };

  return (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Project Timeline</h1>
        <p className="text-slate-500 mt-1">
          {monthStartDate.toLocaleString('default', { month: 'long' })} {currentYear}
        </p>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto min-w-full">
        <div className="grid gap-y-2 p-4 min-w-[1200px]" style={{ gridTemplateColumns: `250px repeat(${daysInMonth}, 1fr)` }}>
          {/* Header */}
          <div className="sticky left-0 bg-slate-50 z-10 pr-4 font-bold text-slate-700 text-sm border-r border-slate-300 flex items-center">Task</div>
          {[...Array(daysInMonth)].map((_, i) => {
            const day = i + 1;
            const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
            return (
              <div key={i} className={`text-center text-xs text-slate-500 border-l border-slate-200 py-2 relative font-medium ${isToday ? 'bg-blue-100 text-blue-700 font-bold' : 'bg-slate-50'}`}>
                {isToday && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] bg-blue-500 h-[1000px] z-[5] pointer-events-none opacity-50"></div>}
                {day}
              </div>
            );
          })}

          {/* Divider */}
          <div className="col-span-full border-b border-slate-300 -mx-4"></div>

          {/* Task Rows */}
          {tasks.map((task, index) => (
            <React.Fragment key={task.id}>
              <div className={`sticky left-0 z-10 pr-4 border-r border-slate-300 flex items-center min-h-[48px] ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                <p className="text-sm font-medium text-slate-800 truncate pl-2" title={task.title}>{task.title}</p>
              </div>
              <div className={`col-start-2 -col-end-1 grid items-center relative ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`} style={{ gridTemplateColumns: `repeat(${daysInMonth}, 1fr)` }}>
                {/* Background Grid for visual clarity */}
                <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${daysInMonth}, 1fr)` }}>
                  {[...Array(daysInMonth)].map((_, i) => (
                    <div key={i} className="border-l border-slate-200 h-full"></div>
                  ))}
                </div>
                
                <div 
                  className="h-7 rounded-md text-white text-[10px] font-bold flex items-center px-2 overflow-hidden relative group shadow-sm z-[1] hover:z-[2] transition-transform hover:scale-[1.02]"
                  style={getTaskStyle(task)}
                >
                  <span className="truncate group-hover:hidden">{task.title}</span>
                  <span className="hidden group-hover:block absolute inset-0 bg-black/20 text-center flex items-center justify-center backdrop-blur-[1px]">{task.assignee.name}</span>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TimelineView
