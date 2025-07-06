import React, { useContext } from 'react';
import { ThemeContext } from '../layouts/ThemeProvider';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <button className={`theme-toggle-icon${theme === 'dark' ? ' dark' : ''}`} onClick={toggleTheme} title="Toggle theme" aria-label="Toggle theme">
      <span className="icon-wrapper">
        <svg className="sun-moon" viewBox="0 0 24 24" width="28" height="28">
          <g className="sun" style={{ opacity: theme === 'dark' ? 0 : 1, transition: 'opacity 0.4s' }}>
            <circle cx="12" cy="12" r="5" fill="#facc15" />
            <g stroke="#facc15" strokeWidth="2">
              <line x1="12" y1="2" x2="12" y2="5" />
              <line x1="12" y1="19" x2="12" y2="22" />
              <line x1="2" y1="12" x2="5" y2="12" />
              <line x1="19" y1="12" x2="22" y2="12" />
              <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
              <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
              <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
              <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
            </g>
          </g>
          <g className="moon" style={{ opacity: theme === 'dark' ? 1 : 0, transition: 'opacity 0.4s' }}>
            <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 1 0 9.79 9.79z" fill="#f9fafb" />
          </g>
        </svg>
      </span>
    </button>
  );
};

export default ThemeToggle; 