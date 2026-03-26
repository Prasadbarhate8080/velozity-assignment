# Velozity Project Management Tool

**[Live Demo](https://velozity-assignment.vercel.app/)**

A high-performance, interactive project management dashboard featuring Kanban, List, and Timeline views with real-time collaboration simulations. Built entirely with **native Web APIs** to demonstrate deep understanding of the browser's capabilities.

## 🚀 Key Features

### 1. Custom Kanban Board (No Libraries)
- **Pointer Events Drag-and-Drop**: A sophisticated DND engine written from scratch. It handles mouse and touch events uniformly, ensuring a seamless experience across devices.
- **Smart DOM Management**: Uses persistent placeholders to prevent "loss of pointer capture" common in naive React DND implementations.
- **Visual Feedback**:
  - Drag overlays with drop shadows and opacity.
  - Active drop-zone highlighting (subtle color shifts).
  - Smooth snap-back animations when dropping in invalid areas.
- **Independent Column Scrolling**: Each status column (To Do, In Progress, Review, Done) manages its own scroll state, essential for large project boards.

### 2. High-Performance List View
- **Custom Virtual Scrolling**: A hand-written implementation that manages 500+ tasks by rendering only what's visible (plus a 5-row buffer). This maintains 60FPS even with massive datasets.
- **Multi-Field Sorting**: Robust sorting logic for Titles, Priority levels (Critical → Low), and Due Dates.
- **Inline Editing**: Immediate status updates via a contextual dropdown in each row.
- **Dynamic Indicators**: Red overdue flags and real-time collaborator presence.

### 3. Timeline / Gantt Chart
- **Monthly Time Axis**: Automatically calculates and renders the current month's grid.
- **CSS Grid Layout**: Uses modern grid spans to precisely position task bars across time.
- **Priority Visuals**: Bars are color-coded by priority for instant assessment of critical paths.
- **Contextual Data**: Hover over any bar to see the assignee without leaving the view.

### 4. Real-Time Collaboration Simulation
- **Mock Presence Engine**: A background interval-based system that simulates multiple users viewing and editing tasks.
- **Avatar Stacking**: When multiple collaborators focus on the same task, avatars stack with a "+1" style overflow indicator.
- **Global Awareness**: A persistent presence bar in the header shows the total number of active project viewers.

## 🛠 Tech Stack
- **React 18**: Modern functional components and hooks (`useMemo`, `useRef`, `useEffect`).
- **TypeScript**: Full type safety for tasks, collaborators, and component props.
- **Tailwind CSS**: Utility-first styling for a clean, professional UI.
- **Pointer Events API**: Used for the cross-platform Drag-and-Drop system.

## 📦 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Performance Testing**:
   Switch to the **List View** to see the virtual scrolling engine handle 500 tasks simultaneously.
