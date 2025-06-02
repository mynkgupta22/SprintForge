import React from "react";
import { useParams, NavLink, Outlet, useLocation } from "react-router-dom";

const tabs = [
  { name: "Sprints", path: "sprints" },
  { name: "Board", path: "board" },
  { name: "Settings", path: "settings" },
];

function ProjectDetail() {
  const { projectId } = useParams();
  const location = useLocation();
  const basePath = `/projects/${projectId}`;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Project: {projectId}</h1>
      <div className="mb-6 border-b">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={`${basePath}/${tab.path}`}
              className={({ isActive }) =>
                isActive || location.pathname === `${basePath}/${tab.path}`
                  ? "border-b-2 border-primary pb-2 text-primary"
                  : "pb-2 text-muted-foreground hover:text-primary"
              }
              end
            >
              {tab.name}
            </NavLink>
          ))}
        </nav>
      </div>
      <Outlet />
    </div>
  );
}

export default ProjectDetail; 