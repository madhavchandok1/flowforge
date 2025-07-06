import React, { useState, useContext, useRef } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './layouts/Sidebar';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Boards from './pages/Boards';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { ThemeContext } from './layouts/ThemeProvider';
import './App.css';
import './pages/Login.css';
import './pages/Dashboard.css';
import './pages/Projects.css';
import './pages/Settings.css';
import ThemeToggle from './components/ThemeToggle';
import { CSSTransition, SwitchTransition } from 'react-transition-group';

function App() {
  // Mock login state
  const [loggedIn, setLoggedIn] = useState(false);
  const username = 'Jane Doe';
  const { theme } = useContext(ThemeContext);
  const location = useLocation();
  const nodeRef = useRef(null);

  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />;
  }

  return (
    <div className="app-root" data-theme={theme}>
      <Sidebar />
      <div className="main-panel">
        <div className="main-header">
          <h1>{location.pathname.startsWith('/projects') ? 'Projects' : location.pathname.startsWith('/settings') ? 'Settings' : 'Dashboard'}</h1>
          <div className="main-user">
            <ThemeToggle />
            <img className="main-user-img" src="https://ui-avatars.com/api/?name=Jane+Doe&background=6366f1&color=fff" alt="User" />
            <span className="main-user-name">{username}</span>
          </div>
        </div>
        <SwitchTransition mode="out-in">
          <CSSTransition
            key={location.pathname}
            classNames="fade-page"
            timeout={350}
            unmountOnExit
            nodeRef={nodeRef}
          >
            <div className="page-content" ref={nodeRef}>
              <Routes location={location}>
                <Route path="/dashboard" element={<Dashboard username={username} />} />
                <Route path="/projects/*" element={<Projects />} />
                <Route path="/boards" element={<Boards />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </div>
          </CSSTransition>
        </SwitchTransition>
      </div>
    </div>
  );
}

export default App;
