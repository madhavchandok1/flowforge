import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGears, faQuestionCircle, faCog } from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({ hideThemeToggle }) => {
  const [open, setOpen] = useState(false);
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="flowforge-logo">FlowForge</span>
      </div>
      <div className="sidebar-mobile-user">
        <img className="main-user-img" src="https://ui-avatars.com/api/?name=Jane+Doe&background=6366f1&color=fff" alt="User" />
        <button className="hamburger" onClick={() => setOpen(o => !o)} aria-label="Menu">
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
      </div>
      <nav className={`nav-links${open ? ' open' : ''}`}>
        <NavLink to="/dashboard" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} onClick={() => setOpen(false)}>Dashboard</NavLink>
        <NavLink to="/projects" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} onClick={() => setOpen(false)}>Projects</NavLink>
        <NavLink to="/boards" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} onClick={() => setOpen(false)}>Boards</NavLink>
        <div className="settings mobile-only">
          {!hideThemeToggle && <ThemeToggle />}
          <div className="sidebar-icons">
            <button className="icon-btn" title="Settings" aria-label="Settings">
              <FontAwesomeIcon icon={faGears} size="lg" />
            </button>
            <button className="icon-btn" title="Help" aria-label="Help">
              <FontAwesomeIcon icon={faQuestionCircle} size="lg" />
            </button>
          </div>
        </div>
      </nav>
      <div className="settings desktop-only">
        {!hideThemeToggle && <ThemeToggle />}
        <div className="sidebar-icons">
          <button className="icon-btn" title="Settings" aria-label="Settings">
            <FontAwesomeIcon icon={faCog} size="lg" />
          </button>
          <button className="icon-btn" title="Help" aria-label="Help">
            <FontAwesomeIcon icon={faQuestionCircle} size="lg" />
          </button>
        </div>
      </div>
      <footer className="sidebar-footer">
        <a href="#" className="sidebar-footer-link">Terms & Conditions</a>
        <div className="sidebar-footer-copyright">&copy;{new Date().getFullYear()} FlowForge</div>
      </footer>
    </aside>
  );
};

export default Sidebar; 