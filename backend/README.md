# ForgeFlow Backend

## Getting Started

### Prerequisites
- Python 3.9+
- pip (Python package manager)
- (Optional) Virtual environment tool (e.g., `venv` or `virtualenv`)

### Installation
1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd backend
   ```
2. **Create and activate a virtual environment (recommended):**
   ```bash
   python -m venv .venv
   # On Windows:
   .venv\Scripts\activate
   # On macOS/Linux:
   source .venv/bin/activate
   ```
3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

### Running the Project
1. **Start the backend server:**
   ```bash
   uvicorn main:app --reload
   ```
   The server will start at `http://127.0.0.1:8000/` by default.

2. **Environment Variables:**
   - Configure any required environment variables in a `.env` file or directly in `core/config.py`.

## Environment Variables Example
Create a `.env` file in the `backend` directory with the following example values:

```env
# Database URL
DATABASE_URL=sqlite:///./flow_forge.db

# Secret key for JWT or session
SECRET_KEY=your_secret_key_here

# Debug mode
DEBUG=True

# (Add other environment variables as needed)
```

## Planned Features
- **Project and Board Management:**
  - Create, update, and delete projects and boards.
- **Modular Workflow Engine:**
  - Define, execute, and monitor modular workflows ("forges").
- **Action and Blueprint System:**
  - Support for reusable actions and blueprints for rapid workflow creation.
- **User Authentication & Authorization:**
  - Secure endpoints and role-based access control.
- **API Documentation:**
  - Interactive API docs via Swagger/OpenAPI.

## Future Scope
- **Integrations:**
  - Connect with third-party services (e.g., Slack, GitHub, email, etc.).
- **Advanced Analytics:**
  - Workflow performance metrics, usage statistics, and reporting.
- **Real-time Collaboration:**
  - Multi-user editing and live workflow updates.
- **Plugin System:**
  - Allow external developers to add custom modules/actions.
- **Deployment & Scaling:**
  - Docker support, cloud deployment guides, and horizontal scaling.
- **UI Enhancements:**
  - Improved admin dashboard and monitoring tools.

## Contributing
Contributions are welcome! Please open issues or submit pull requests for new features, bug fixes, or suggestions.

---

*ForgeFlow Backend aims to be a flexible, extensible platform for building and automating modular workflows.* 