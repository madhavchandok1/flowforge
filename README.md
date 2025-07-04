# Flow Forge Backend (FastAPI)

**Flow Forge** is a lightweight project management backend inspired by tools like Azure Boards. It allows managing projects (called Forges), epics (Blueprints), stories (Modules), tasks/bugs (Actions), and iteration-based dashboards with drag-and-drop support for task statuses.

---

## 🚀 Tech Stack

- **Backend Framework**: FastAPI
- **ORM**: SQLAlchemy
- **Migrations**: Alembic
- **Database**: PostgreSQL
- **Testing**: Pytest / FastAPI TestClient

---

## 📁 Folder Structure

```bash
app/
├── main.py
├── db/
│   └── base.py
├── models/
├── schemas/
├── routers/
├── core/
└── utils/
```

---

## ✅ Implementation Checklist

### 🏗️ Initial Setup

  <li>Set up project folder structure (`app/`, `models/`, `schemas/`, `routers/`, `db/`, etc.)
  <li>Create and activate virtual environment
  <li>Install dependencies: `fastapi`, `uvicorn[standard]`, `sqlalchemy`, `alembic`, `pydantic`, `psycopg2-binary`, `python-dotenv`
  <li>Initialize Git and `.gitignore`
  <li>Create `main.py` and include API routers
  <li>Set up `.env` file for DB config
  <li>Add CORS middleware
  <li>Configure PostgreSQL and Alembic
  <li>Create SQLAlchemy base model in `db/base.py`

### 🧱 Forge (Project)

  <li>Create `Forge` model
  <li>Create schemas: `ForgeCreate`, `ForgeUpdate`, `ForgeOut`
  <li>Implement endpoints:
  <li>GET /forges
  <li>POST /forges
  <li>GET /forges/{forge_id}
  <li>PUT /forges/{forge_id}
  <li>DELETE /forges/{forge_id}
  <li>Add `routers/forges.py`
  <li>Write tests

### 📘 Blueprint (Epic)

  <li>Create `Blueprint` model (FK to Forge)
  <li>Create schemas: `BlueprintCreate`, `BlueprintUpdate`, `BlueprintOut`
  <li>Implement endpoints:
  <li>GET /forges/{forge_id}/blueprints
  <li>POST /forges/{forge_id}/blueprints
  <li>PUT /blueprints/{blueprint_id}
  <li>DELETE /blueprints/{blueprint_id}

### 📦 Module (Story)

  <li>Create `Module` model (FK to Blueprint)
  <li>Create schemas: `ModuleCreate`, `ModuleUpdate`, `ModuleOut`
  <li>Implement endpoints:
  <li>GET /blueprints/{blueprint_id}/modules
  <li>POST /blueprints/{blueprint_id}/modules
  <li>PUT /modules/{module_id}
  <li>DELETE /modules/{module_id}

### ⚙️ Action (Task / Glitch)

  <li>Create `Action` model (FK to Module)
  <li>Add enum: `ActionType` (`task`, `glitch`)
  <li>Add enum: `ActionStatus` (`queued`, `forging`, `jammed`, `crafted`)
  <li>Create schemas: `ActionCreate`, `ActionUpdate`, `ActionOut`
  <li>Implement endpoints:
  <li>GET /modules/{module_id}/actions
  <li>POST /modules/{module_id}/actions
  <li>PUT /actions/{action_id}
  <li>DELETE /actions/{action_id}
  <li>PATCH /actions/{action_id}/status

### ⏳ Iteration

  <li>Create `Iteration` model (FK to Forge)
  <li>Add `iteration_id` field to `Action`
  <li>Create schemas: `IterationCreate`, `IterationUpdate`, `IterationOut`
  <li>Implement endpoints:
  <li>GET /forges/{forge_id}/iterations
  <li>POST /forges/{forge_id}/iterations
  <li>PUT /iterations/{iteration_id}
  <li>DELETE /iterations/{iteration_id}
  <li>GET /iterations/{iteration_id}/actions

### 📥 Drag & Drop Logic (Kanban)

  <li>Implement `PATCH /actions/{action_id}/status`
  <li>(Optional) Validate transitions (`queued → forging → crafted`)
  <li>(Optional) Add audit log for status changes
  <li>Implement dashboard query for iteration with grouped statuses

### 🧪 Testing & QA

  <li>Use `pytest` or FastAPI `TestClient`
  <li>Test all endpoints with valid and invalid inputs
  <li>Seed sample data for dashboards
  <li>Use Swagger UI to test all routes

### 🧭 Final Touches

  <li>Create `.env.example`
  <li>Write `README.md` with setup guide and API overview
  <li>(Optional) Add code formatter/linter (black, isort, flake8)
  <li>(Optional) Add pre-commit hooks

---

## 🛠️ Future Add-ons

  <li>User registration/login (JWT)
  <li>Notifications system
  <li>Role-based access (admin, contributor)
  <li>Export/Import Forge data

---

## 📚 Terminology Map

| Concept     | Name in Flow Forge           |
| ----------- | ---------------------------- |
| Project     | Forge                        |
| Epic        | Blueprint                    |
| Story       | Module                       |
| Task / Bug  | Action (type: task / glitch) |
| To Do       | Queued                       |
| In Progress | Forging                      |
| Blocked     | Jammed                       |
| Completed   | Crafted                      |

---

## 📞 Contact

Want to collaborate or need help setting this up? Reach out to the maintainer.

---

Happy Forging! 🔨
