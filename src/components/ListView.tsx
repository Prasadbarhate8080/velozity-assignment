import React, { useState, useMemo, useRef, useEffect } from 'react'
import type { Task } from '../../taskdata'
import type { Collaborator } from '../App'

interface ListViewProps {
  tasks: Task[]
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
  collaborators: Collaborator[]
}

type SortField = 'title' | 'priority' | 'dueDate'
type SortOrder = 'asc' | 'desc'

const PRIORITY_ORDER = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1
}

const STATUS_OPTIONS: Task['status'][] = ['todo', 'inprogress', 'review', 'done']
const ROW_HEIGHT = 72; // height of each row in pixels
const BUFFER_COUNT = 5; // number of rows to render above and below visible area

/**
 * ListView Component
 * 
 * A high-performance table view for managing large datasets of tasks.
 * Key features:
 * 1. Custom Virtual Scrolling: Renders 500+ tasks efficiently by only showing visible rows.
 * 2. Dynamic Sorting: Sort by title, priority, or due date.
 * 3. Inline Editing: Quick status changes via dropdown.
 * 4. Collaboration Indicators: Shows who is currently viewing each task.
 */

const ListView = ({ tasks, setTasks, collaborators }: ListViewProps) => {
  // --- State Management ---
  const [sortField, setSortField] = useState<SortField>('title')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  
  // Virtual scrolling state: track scroll position and viewport size
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewportHeight, setViewportHeight] = useState(600);

  /**
   * Toggles sort direction if same field, otherwise sets new sort field.
   */
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  /**
   * Memoized sorted tasks to avoid expensive re-sorting on every render.
   * Uses a fresh array spread to avoid mutating original state.
   */
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortField === 'priority') {
        comparison = PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
      } else if (sortField === 'dueDate') {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : -Infinity;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : -Infinity;
        comparison = dateA - dateB;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [tasks, sortField, sortOrder]);

  // --- Virtual Scrolling Logic ---
  // We calculate which slice of the array to show based on scroll offset.
  const totalHeight = sortedTasks.length * ROW_HEIGHT;
  
  // Calculate start/end indices with a buffer to prevent "white gaps" during fast scrolls.
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_COUNT);
  const endIndex = Math.min(
    sortedTasks.length - 1,
    Math.floor((scrollTop + viewportHeight) / ROW_HEIGHT) + BUFFER_COUNT
  );

  const visibleTasks = sortedTasks.slice(startIndex, endIndex + 1);
  
  // offsetY pushes the visible rows down to their correct position in the scrollable area.
  const offsetY = startIndex * ROW_HEIGHT;

  /**
   * Effect to handle responsive viewport height changes.
   */
  useEffect(() => {
    if (containerRef.current) {
      setViewportHeight(containerRef.current.clientHeight);
      
      const handleResize = () => {
        if (containerRef.current) {
          setViewportHeight(containerRef.current.clientHeight);
        }
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  /**
   * Scroll handler to update the virtual viewport.
   */
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  /**
   * Updates task status directly in the parent state.
   */
  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null
    return sortOrder === 'asc' ? ' ↑' : ' ↓'
  }

  return (
    <div className="p-6 h-[calc(100vh-80px)] flex flex-col">
      <header className="mb-8 shrink-0">
        <h1 className="text-3xl font-bold text-slate-800">All Tasks</h1>
        <p className="text-slate-500 mt-1">Manage and sort your tasks in list view ({tasks.length} tasks)</p>
      </header>

      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-y-auto flex-1"
      >
        <table className="w-full text-left border-collapse relative">
          <thead className="sticky top-0 z-10 bg-white">
            <tr className="bg-slate-50 border-b border-slate-200">
              <th 
                className="px-6 py-4 text-sm font-semibold text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors w-1/3"
                onClick={() => handleSort('title')}
              >
                Task Title{getSortIcon('title')}
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 w-1/6">Status</th>
              <th 
                className="px-6 py-4 text-sm font-semibold text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors w-1/6"
                onClick={() => handleSort('priority')}
              >
                Priority{getSortIcon('priority')}
              </th>
              <th 
                className="px-6 py-4 text-sm font-semibold text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors w-1/6"
                onClick={() => handleSort('dueDate')}
              >
                Due Date{getSortIcon('dueDate')}
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 w-1/6">Assignee</th>
            </tr>
          </thead>
          <tbody>
            {/* Top Spacer */}
            <tr style={{ height: offsetY }}>
              <td colSpan={5}></td>
            </tr>
            
            {visibleTasks.map((task) => {
              const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'
              const taskCollaborators = collaborators.filter(c => c.currentTaskId === task.id);
              
              return (
                <tr key={task.id} style={{ height: ROW_HEIGHT }} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100">
                  <td className="px-6 py-4 w-1/3">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col flex-1">
                        <span className="text-slate-900 font-medium truncate max-w-[250px]" title={task.title}>{task.title}</span>
                        <span className="text-slate-400 text-xs font-mono mt-0.5">#{task.id}</span>
                      </div>
                      
                      {/* List View Collaborators */}
                      {taskCollaborators.length > 0 && (
                        <div className="flex -space-x-1.5 shrink-0">
                          {taskCollaborators.map(c => (
                            <div 
                              key={c.id}
                              title={`${c.name} is viewing`}
                              className={`w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-bold ${c.color} shadow-sm animate-in fade-in zoom-in duration-300`}
                            >
                              {c.name.split(' ').map(n => n[0]).join('')}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 w-1/6">
                    <select 
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value as Task['status'])}
                      className="text-xs font-medium bg-slate-100 border-none rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 cursor-pointer capitalize"
                    >
                      {STATUS_OPTIONS.map(status => (
                        <option key={status} value={status}>{status === 'inprogress' ? 'In Progress' : status}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 w-1/6">
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded border inline-block
                      ${task.priority === 'critical' ? 'bg-red-50 text-red-700 border-red-200' :
                        task.priority === 'high' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                        task.priority === 'medium' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-slate-50 text-slate-700 border-slate-200'}`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 w-1/6">
                    <span className={`text-sm font-medium ${isOverdue ? 'text-red-500' : 'text-slate-600'}`}>
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 w-1/6">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold shrink-0">
                        {task.assignee.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm text-slate-700 font-medium truncate">{task.assignee.name}</span>
                    </div>
                  </td>
                </tr>
              )
            })}

            {/* Bottom Spacer */}
            <tr style={{ height: Math.max(0, totalHeight - offsetY - (visibleTasks.length * ROW_HEIGHT)) }}>
              <td colSpan={5}></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ListView