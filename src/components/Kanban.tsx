import { useState, useRef, useEffect } from "react";
import { type Task } from "../../taskdata"
import TaskCard from "./TaskCard";
import type { Collaborator } from "../App";

const COLUMNS: { id: Task['status']; label: string; color: string }[] = [
  { id: 'todo', label: 'To Do', color: 'bg-slate-200' },
  { id: 'inprogress', label: 'In Progress', color: 'bg-blue-100' },
  { id: 'review', label: 'Review', color: 'bg-amber-100' },
  { id: 'done', label: 'Done', color: 'bg-emerald-100' },
]

interface KanbanProps {
  tasks: Task[]
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
  collaborators: Collaborator[]
}

interface DragState {
  taskId: string;
  initialX: number;
  initialY: number;
  currentX: number;
  currentY: number;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  originalStatus: Task['status'];
}

function Kanban({ tasks, setTasks, collaborators }: KanbanProps) {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [activeColumn, setActiveColumn] = useState<Task['status'] | null>(null);
  const [isSnapping, setIsSnapping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef<Record<string, HTMLDivElement | null>>({});

  const handlePointerDown = (e: React.PointerEvent, task: Task, rect: DOMRect) => {
    // Only left click or touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    setDragState({
      taskId: task.id,
      initialX: rect.left,
      initialY: rect.top,
      currentX: rect.left,
      currentY: rect.top,
      width: rect.width,
      height: rect.height,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      originalStatus: task.status,
    });
    
    // Capture pointer on the element that was clicked
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!dragState || isSnapping) return;

      const newX = e.clientX - dragState.offsetX;
      const newY = e.clientY - dragState.offsetY;

      setDragState(prev => prev ? { ...prev, currentX: newX, currentY: newY } : null);

      // Detect which column we are over
      let foundColumn: Task['status'] | null = null;
      for (const [status, el] of Object.entries(columnsRef.current)) {
        if (el) {
          const rect = el.getBoundingClientRect();
          if (
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom
          ) {
            foundColumn = status as Task['status'];
            break;
          }
        }
      }
      setActiveColumn(foundColumn);
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!dragState || isSnapping) return;

      if (activeColumn && activeColumn !== dragState.originalStatus) {
        setTasks(prev => prev.map(t => t.id === dragState.taskId ? { ...t, status: activeColumn } : t));
        setDragState(null);
        setActiveColumn(null);
      } else {
        // Snap back animation
        setIsSnapping(true);
        // We keep the dragState but set current to initial for the transition
        setDragState(prev => prev ? { ...prev, currentX: prev.initialX, currentY: prev.initialY } : null);
        
        setTimeout(() => {
          setDragState(null);
          setActiveColumn(null);
          setIsSnapping(false);
        }, 300); // match transition duration
      }
    };

    if (dragState) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragState, activeColumn, isSnapping, setTasks]);

  const groupedTasks = tasks.reduce((acc, task) => {
    acc[task.status] = [...(acc[task.status] || []), task];
    return acc; 
  }, {} as Record<string, Task[]>);

  const draggingTask = dragState ? tasks.find(t => t.id === dragState.taskId) : null;

  return (
    <div className="h-[calc(100vh-80px)] bg-slate-50 p-6 flex flex-col select-none" ref={containerRef}>
      <header className="mb-6 shrink-0">
        <h1 className="text-3xl font-bold text-slate-800">Velozity Project Board</h1>
        <p className="text-slate-500 mt-1">Track and manage your team's tasks</p>
      </header>

      <div className="flex gap-6 overflow-x-auto pb-4 flex-1">
        {COLUMNS.map((column) => {
          const columnTasks = groupedTasks[column.id] || []
          return (
            <div 
              key={column.id} 
              ref={(el) => { 
                columnsRef.current[column.id] = el;
                columnsRef;
              }}
              className="flex-1 min-w-[300px] flex flex-col h-full bg-slate-100/50 rounded-2xl p-2 transition-colors duration-200"
            >
              <div className="flex items-center justify-between px-3 py-2 shrink-0">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${column.color.replace('bg-', 'bg-').replace('-100', '-400').replace('-200', '-400')}`}></span>
                  <h2 className="text-lg font-bold text-slate-700">{column.label}</h2>
                  <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs font-medium">
                    {columnTasks.length}
                  </span>
                </div>
              </div>

              <div 
                className={`flex-1 overflow-y-auto rounded-xl p-3 flex flex-col gap-3 border transition-all duration-200 ${
                  activeColumn === column.id 
                    ? 'bg-blue-50/80 border-blue-400 ring-4 ring-blue-100/50 shadow-lg' 
                    : `${column.color} border-slate-200`
                } scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300`}
              >
                {columnTasks.map((task) => {
                  const taskCollaborators = collaborators.filter(c => c.currentTaskId === task.id);
                  return (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onPointerDown={handlePointerDown}
                      isDragging={dragState?.taskId === task.id}
                      collaborators={taskCollaborators}
                    />
                  );
                })}
                
                {columnTasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-32 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl shrink-0">
                    <p className="text-sm">No tasks here</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Drag Overlay */}
      {dragState && draggingTask && (
        <div 
          className={`fixed pointer-events-none z-[1000] ${isSnapping ? 'transition-all duration-300 ease-out' : ''}`}
          style={{
            left: dragState.currentX,
            top: dragState.currentY,
            width: dragState.width,
            height: dragState.height,
          }}
        >
          <div className="opacity-80 shadow-2xl scale-105 transition-transform duration-200">
            <TaskCard 
              task={draggingTask} 
              isOverlay 
              collaborators={collaborators.filter(c => c.currentTaskId === draggingTask.id)} 
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default Kanban