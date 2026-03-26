import React, { useRef } from 'react';
import type { Task } from '../../taskdata';
import type { Collaborator } from '../App';

const PRIORITY_COLORS = {
  low: 'bg-slate-100 text-slate-700 border-slate-200',
  medium: 'bg-blue-50 text-blue-700 border-blue-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  critical: 'bg-red-50 text-red-700 border-red-200',
};

interface TaskCardProps {
  task: Task;
  onPointerDown?: (e: React.PointerEvent, task: Task, rect: DOMRect) => void;
  isOverlay?: boolean;
  isDragging?: boolean;
  collaborators?: Collaborator[];
}

const TaskCard = ({ task, onPointerDown, isOverlay, isDragging, collaborators = [] }: TaskCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  const handlePointerDown = (e: React.PointerEvent) => {
    if (onPointerDown && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      onPointerDown(e, task, rect);
    }
  };

  if (isDragging) {
    return (
      <div
        ref={cardRef}
        onPointerDown={handlePointerDown}
        style={{ height: 'auto', touchAction: 'none' }}
        className="bg-slate-200/50 rounded-xl border-2 border-dashed border-slate-300 pointer-events-none"
      >
        <div style={{ visibility: 'hidden' }}>
          {/* This ensures the placeholder has the same height as the original card */}
          <div className="p-4 border rounded-xl">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border">low</span>
              <span className="text-slate-400 text-xs font-mono">#000</span>
            </div>
            <h3 className="font-semibold mb-3 leading-snug">{task.title}</h3>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
              <div className="w-6 h-6 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      onPointerDown={handlePointerDown}
      style={{ touchAction: 'none' }}
      className={`p-4 bg-white shadow-sm border rounded-xl transition-all duration-300 cursor-grab active:cursor-grabbing group relative ${isOverlay ? 'border-blue-500 ring-2 ring-blue-200 shadow-2xl' : 'border-slate-200 hover:shadow-md'
        }`}
    >
      {/* Collaborators Indicators */}
      {collaborators.length > 0 && (
        <div className="absolute -top-2 -right-2 flex -space-x-2 z-20">
          {collaborators.slice(0, 2).map((collab) => (
            <div
              key={collab.id}
              title={`${collab.name} is viewing`}
              className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-bold ${collab.color} shadow-sm animate-in fade-in zoom-in duration-300`}
            >
              {collab.name.split(' ').map(n => n[0]).join('')}
            </div>
          ))}
          {collaborators.length > 2 && (
            <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-400 flex items-center justify-center text-[10px] text-white font-bold shadow-sm">
              +{collaborators.length - 2}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between items-start mb-2">
        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${PRIORITY_COLORS[task.priority]}`}>
          {task.priority}
        </span>
        <span className="text-slate-400 text-xs font-mono">#{task.id}</span>
      </div>

      <h3 className="text-slate-800 font-semibold mb-3 leading-snug group-hover:text-blue-600 transition-colors">
        {task.title}
      </h3>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold">
            {task.assignee.name.split(' ').map(n => n[0]).join('')}
          </div>
          <span className="text-xs text-slate-600 font-medium">{task.assignee.name}</span>
        </div>

        {task.dueDate && (
          <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px] font-medium">{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        )}
      </div>
    </div>
  );
}
  export default TaskCard;