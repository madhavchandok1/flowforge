import React, { useState } from 'react';
import './Projects.css';

const staticProjects = [
  { id: 1, title: 'Website Redesign', description: 'Revamp the company website for modern UX.' },
  { id: 2, title: 'Mobile App', description: 'Build a cross-platform mobile app.' },
  { id: 3, title: 'API Platform', description: 'Develop a robust API platform.' },
  { id: 4, title: 'Internal Tools', description: 'Create tools to boost team productivity.' },
];

const ProjectDetails = ({ project, onBack }) => (
  <div className="project-details">
    <button className="back-btn" onClick={onBack}>&larr; Back</button>
    <h2>{project.title}</h2>
    <div className="project-overview">
      <div className="overview-title">Overview</div>
      <div className="overview-content">
        <div>Completion: 68%</div>
        <div>[Donut Chart]</div>
      </div>
    </div>
    <div className="project-work">
      <div className="work-title">Work</div>
      <div className="work-hierarchy">Epics &gt; Stories &gt; Tasks (hierarchy placeholder)</div>
    </div>
  </div>
);

const Projects = () => {
  const [selected, setSelected] = useState(null);
  if (selected) {
    const project = staticProjects.find(p => p.id === selected);
    return <ProjectDetails project={project} onBack={() => setSelected(null)} />;
  }
  return (
    <div className="projects-root">
      <h1>Projects</h1>
      <div className="projects-grid">
        {staticProjects.map(p => (
          <div key={p.id} className="project-card" onClick={() => setSelected(p.id)}>
            <div className="project-title">{p.title}</div>
            <div className="project-desc">{p.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects; 