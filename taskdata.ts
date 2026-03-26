export type Task = {
  id: string
  title: string
  status: "todo" | "inprogress" | "review" | "done"
  priority: "low" | "medium" | "high" | "critical"
  assignee: {
    id: string
    name: string
  }
  startDate?: string
  dueDate: string
}

export const users = [
  { id: "u1", name: "Prasad Barhate" },
  { id: "u2", name: "Rahul Sharma" },
  { id: "u3", name: "Sneha Patil" },
  { id: "u4", name: "Amit Joshi" },
  { id: "u5", name: "Neha Verma" },
  { id: "u6", name: "Vikram Singh" },
]

export const tasks: Task[] = [
  {
    id: "t1",
    title: "Design login page",
    status: "todo",
    priority: "high",
    assignee: users[0],
    startDate: "2026-03-20",
    dueDate: "2026-03-25",
  },
  {
    id: "t2",
    title: "Setup backend API",
    status: "inprogress",
    priority: "critical",
    assignee: users[1],
    startDate: "2026-03-18",
    dueDate: "2026-03-24",
  },
  {
    id: "t3",
    title: "Implement drag and drop",
    status: "review",
    priority: "high",
    assignee: users[2],
    startDate: "2026-03-15",
    dueDate: "2026-03-22",
  },
  {
    id: "t4",
    title: "Write unit tests",
    status: "done",
    priority: "medium",
    assignee: users[3],
    startDate: "2026-03-10",
    dueDate: "2026-03-18",
  },
  {
    id: "t5",
    title: "Optimize performance",
    status: "todo",
    priority: "critical",
    assignee: users[4],
    dueDate: "2026-03-28",
  },
  {
    id: "t6",
    title: "Deploy to staging",
    status: "done",
    priority: "medium",
    assignee: users[5],
    startDate: "2026-03-12",
    dueDate: "2026-03-20",
  },
  {
    id: "t7",
    title: "Fix login bug",
    status: "inprogress",
    priority: "high",
    assignee: users[0],
    startDate: "2026-03-21",
    dueDate: "2026-03-26",
  },
  {
    id: "t8",
    title: "Add user profile page",
    status: "todo",
    priority: "low",
    assignee: users[1],
    dueDate: "2026-03-30",
  },
  {
    id: "t9",
    title: "Refactor database schema",
    status: "review",
    priority: "high",
    assignee: users[2],
    startDate: "2026-03-18",
    dueDate: "2026-03-25",
  },
]

// Data generator for testing virtual scrolling
export const generateMoreTasks = (count: number): Task[] => {
  const statuses: Task['status'][] = ["todo", "inprogress", "review", "done"];
  const priorities: Task['priority'][] = ["low", "medium", "high", "critical"];
  const extraTasks: Task[] = [];

  for (let i = 1; i <= count; i++) {
    const user = users[i % users.length];
    const status = statuses[i % statuses.length];
    const priority = priorities[i % priorities.length];
    const id = `gt${i}`;
    
    // Generate dates within the current month (March 2026 for this project)
    const day = (i % 28) + 1;
    const startDate = `2026-03-${day.toString().padStart(2, '0')}`;
    const dueDate = `2026-03-${Math.min(day + 3, 31).toString().padStart(2, '0')}`;

    extraTasks.push({
      id,
      title: `Generated Task ${i}: ${['Improve', 'Fix', 'Refactor', 'Update'][i % 4]} ${['UI', 'Backend', 'Tests', 'Docs'][i % 4]}`,
      status,
      priority,
      assignee: user,
      startDate,
      dueDate,
    });
  }

  return extraTasks;
};

export const allTasks: Task[] = [...tasks, ...generateMoreTasks(500)];