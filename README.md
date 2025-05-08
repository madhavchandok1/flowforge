# FlowForge
*A Behavioral Project Flow Manager Inspired by Azure Boards*

---

## 🌟 Overview

**FlowForge** is a project management Web API and UI platform inspired by Azure Boards, but with a fresh twist. It emphasizes the **mental and emotional state of engineering work**, not just task status. This system helps teams track tasks, manage sprints, and gain deeper insights into developer flow, blockers, and productivity—based on *how* work feels, not just *when* it's done.

---

## 🚀 Core Concepts

### Emotional Flow States (vs. Traditional Task Status)
- **Inspired** – You’re excited to start this task.
- **In Flow** – You’re focused and making progress.
- **Blocked** – You’re stuck due to an external or technical reason.
- **Frustrated** – You’re facing repeated issues or scope creep.
- **Complete** – The task is done and verified.

These states allow for a more **empathetic and intelligent workflow** system.

---

## 📦 Key Features

### ✅ Projects
- Create and manage projects
- Add members, tags, and goals
- Choose default workflow type (classic/emotional)

### 📌 Backlog
- Central list of pending work items
- Sort/filter by priority, type, labels
- Drag items into upcoming sprints

### 🧩 Flow Items (Tasks)
- Title, description, type (Bug, Feature, Task, Research)
- Emotional State (customizable)
- Priority and effort level (1–10 scale)
- Tags and labels
- Linked Microjournals (small status entries / reflections)

### 🌀 Sprint Management
- Create sprints with a name and duration
- Assign flow items to sprint
- View progress via:
  - Emotional state trends
  - Task completion counts
  - Blockers over time

### 🗂 Boards
- Kanban-style board view
- Toggle between:
  - Emotional state swimlanes
  - Traditional status swimlanes
  - Task type swimlanes
- Drag-and-drop interface
- Quick add/edit items

---

## 🧠 Advanced Features

### Personas (optional)
- User-defined work personas like:
  - The Strategist
  - The Finisher
  - The Dreamer
- Used to match tasks with users better

### Microjournaling
- Lightweight, inline journal entries on tasks
- Used to track mental state and note blockers
- Helps understand patterns in team energy and focus

### Analytics & Visualizations
- Weekly **Flow Score**
- **Emotional Burndown** chart
- **Blocker Frequency** tracker
- **Task Momentum** chart

---

## 🔧 Tech Stack (Proposed)

- **.NET 8 Web API**
- **Entity Framework Core** (SQLite or PostgreSQL)
- **React / Blazor / Vue** frontend
- **Swagger / OpenAPI** docs
- Optional:
  - SignalR for real-time updates
  - D3.js or Chart.js for visual analytics

---

## 💡 Why It’s Unique

- Emotional intelligence meets productivity tooling
- Not just about what’s done—but **how it’s experienced**
- Focused on **developer well-being**, not just output

---

## 🖼 UI Summary

- **Dashboard**: Projects overview, flow score widget
- **Backlog View**: List of upcoming tasks by priority
- **Sprint View**: Task management within active sprint
- **Board View**: Tasks shown by emotional state (or traditional status)
- **Flow Item Detail**: Full task info + microjournaling log

---

## 🔜 Roadmap (Phases)

| Phase | Features                                                      |
|-------|---------------------------------------------------------------|
| MVP   | Projects, Flow Items, Emotional Board View, Backlog, Sprints |
| v1.1  | Microjournals, Personas, Analytics Dashboard                  |
| v1.2  | GitHub Integration, Real-Time Updates, Custom State Mapping   |
| v2.0  | AI Insights, Natural Language Task Parsing, Mobile View       |

---

## 📄 License

MIT License (Proposed) – Free to use and extend.

---

## 👤 Author & Credits

FlowForge is conceptualized and engineered by Madhav Chandok, with inspiration from Azure Boards and modern behavioral design principles in productivity.

