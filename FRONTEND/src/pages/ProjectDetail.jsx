import React, { useState, useEffect } from "react";
import { useParams, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Layers,
  BarChart2,
  Settings,
  Calendar,
  List,
  Users,
  Activity,
  ChevronDown,
  Star,
  Clock,
  AlertCircle,
  Search,
  Home,
  Sparkles,
} from "lucide-react";
import apiHandler from "../functions/apiHandler";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Skeleton } from "../components/ui/skeleton";

const tabs = [
  { name: "Project", path: "/projects", icon: Home },
  { name: "Summary", path: "summary", icon: BarChart2 },
  { name: "Board", path: "board", icon: Layers },
  { name: "Sprints", path: "sprints", icon: Calendar },
  { name: "Backlog", path: "backlog", icon: List },
  { name: "Team", path: "team", icon: Users },
  { name: "Activity", path: "activity", icon: Activity },
  { name: "AI Features", path: "ai-features", icon: Sparkles },
];

function ProjectDetail() {
  const { projectId } = useParams();
  const location = useLocation();
  const basePath = `projects/${projectId}`;
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isStarred, setIsStarred] = useState(false);

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      const res = await apiHandler({ url: `projects/${projectId}` });
      if (res.success) {
        setProject(res.data);
        // Use team members from project data
        if (res.data && res.data.members) {
          setTeamMembers(res.data.members || []);
        }
      }
    } catch (error) {
      console.error("Error fetching project details:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStar = () => {
    setIsStarred(!isStarred);
    // You can implement API call to save star status
  };

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Project sidebar */}
      <div className="w-64 border-r bg-muted/20 flex-shrink-0 hidden md:block">
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-6">
            {loading ? (
              <Skeleton className="h-10 w-10 rounded" />
            ) : (
              <div className="h-10 w-10 rounded bg-primary/20 flex items-center justify-center text-primary font-bold">
                {project?.key?.substring(0, 2) || "PJ"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              {loading ? (
                <Skeleton className="h-5 w-full" />
              ) : (
                <h3 className="font-medium truncate">
                  {project?.name || "Project"}
                </h3>
              )}
              <p className="text-xs text-muted-foreground">
                {project?.key || ""}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <NavLink
                  key={tab.path}
                  to={
                    tab.path === "/projects"
                      ? tab.path
                      : `/projects/${projectId}/${tab.path}`
                  }
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3 py-2 rounded-md text-sm ${
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted"
                    }`
                  }
                >
                  <Icon size={16} />
                  <span>{tab.name}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Project header */}
        <header className="border-b bg-background sticky top-0 z-10">
          <div className="flex items-center px-6 h-14">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-1"
                onClick={toggleStar}
              >
                <Star
                  size={16}
                  className={
                    isStarred
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }
                />
              </Button>

              {loading ? (
                <Skeleton className="h-6 w-40" />
              ) : (
                <h1 className="text-lg font-semibold">
                  {project?.name || "Project Details"}
                </h1>
              )}
            </div>

            <div className="ml-auto flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search issues"
                  className="pl-8 h-9 w-[200px] md:w-[300px] rounded-md"
                />
              </div>

              <div className="flex -space-x-2">
                {teamMembers.slice(0, 3).map((member, i) => (
                  <Avatar
                    key={i}
                    className="h-8 w-8 border-2 border-background"
                  >
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>
                      {member.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {teamMembers.length > 3 && (
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                    +{teamMembers.length - 3}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tab navigation for mobile */}
          <div className="md:hidden border-t px-2 overflow-x-auto scrollbar-hide">
            <nav className="flex">
              {tabs.map((tab) => {
                if (tab.path === "/projects") return null;
                const Icon = tab.icon;
                return (
                  <NavLink
                    key={tab.path}
                    to={`/${basePath}/${tab.path}`}
                    className={({ isActive }) =>
                      `flex flex-col items-center px-3 py-2 min-w-[80px] text-xs ${
                        isActive ||
                        location.pathname.includes(`${basePath}/${tab.path}`)
                          ? "text-primary font-medium"
                          : "text-muted-foreground"
                      }`
                    }
                  >
                    <Icon size={16} />
                    <span className="mt-1">{tab.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Desktop tab navigation */}
          <div className="hidden md:block px-6">
            <nav className="flex -mb-px">
              {tabs.map((tab) => {
                if (tab.path === "/projects") return null;

                return (
                  <NavLink
                    key={tab.path}
                    to={`/${basePath}/${tab.path}`}
                    className={({ isActive }) =>
                      `flex items-center space-x-1 px-4 py-2 border-b-2 font-medium text-sm ${
                        isActive ||
                        location.pathname.includes(`${basePath}/${tab.path}`)
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                      }`
                    }
                  >
                    <span>{tab.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default ProjectDetail;
