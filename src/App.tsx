import { useState, useEffect } from 'react'
import './App.css'
import Kanban from './components/Kanban'
import ListView from './components/ListView'
import TimelineView from './components/TimelineView'
import { allTasks as initialTasks } from '../taskdata'

export interface Collaborator {
  id: string;
  name: string;
  color: string;
  currentTaskId: string | null;
}

const MOCK_COLLABORATORS: Collaborator[] = [
  { id: 'c1', name: 'Alice Chen', color: 'bg-pink-500', currentTaskId: null },
  { id: 'c2', name: 'Bob Wilson', color: 'bg-purple-500', currentTaskId: null },
  { id: 'c3', name: 'Charlie Day', color: 'bg-yellow-500', currentTaskId: null },
];

function App() {
  const [tasks, setTasks] = useState(initialTasks)
  const [view, setView] = useState<'kanban' | 'list' | 'timeline'>('kanban')
  const [collaborators, setCollaborators] = useState<Collaborator[]>(MOCK_COLLABORATORS)

  // Simulation logic for real-time collaboration
  useEffect(() => {
    const interval = setInterval(() => {
      setCollaborators(prev => prev.map(collab => {
        // 70% chance to move to a random task, 30% chance to stay
        if (Math.random() > 0.3) {
          const coreTasks = initialTasks.filter(t => !t.id.startsWith('gt'));
          const randomTask = coreTasks[Math.floor(Math.random() * coreTasks.length)];
          return { ...collab, currentTaskId: randomTask.id };
        }
        return collab;
      }));
    }, 4000); // Move every 4 seconds

    return () => clearInterval(interval);
  }, []);

  // Filter tasks for Kanban and Timeline to only show original tasks
  const coreTasks = tasks.filter(t => !t.id.startsWith('gt'))

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">Velozity</h1>
            <span className="text-slate-400 font-normal text-[10px] mt-1">{tasks.length} total tasks</span>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setView('kanban')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'kanban' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Kanban
            </button>
            <button 
              onClick={() => setView('list')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              List View
            </button>
            <button 
              onClick={() => setView('timeline')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'timeline' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Timeline
            </button>
          </div>
        </div>

        {/* Collaborators Bar */}
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {collaborators.map(collab => (
              <div 
                key={collab.id}
                title={`${collab.name} is viewing`}
                className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold ${collab.color} shadow-sm transition-transform hover:scale-110`}
              >
                {collab.name.split(' ').map(n => n[0]).join('')}
              </div>
            ))}
          </div>
          <span className="text-sm text-slate-500 font-medium">
            {collaborators.length} people viewing this board
          </span>
        </div>
      </nav>

      <main>
        {view === 'kanban' && <Kanban tasks={coreTasks} setTasks={setTasks} collaborators={collaborators} />}
        {view === 'list' && <ListView tasks={tasks} setTasks={setTasks} collaborators={collaborators} />}
        {view === 'timeline' && <TimelineView tasks={coreTasks} />}
      </main>
    </div>
  )
}

export default App
