import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import {
  Sparkles,
  MessageSquare,
  Calendar,
  AlertTriangle,
  BarChart,
  Clock,
} from "lucide-react";
import apiHandler from "../functions/apiHandler";
import { SprintNegotiator } from "../components/ai/SprintNegotiator";
import { ScopeCreepDetector } from "../components/ai/ScopeCreepDetector";
import { RiskHeatmap } from "../components/ai/RiskHeatmap";
import { RetrospectiveGenerator } from "../components/ai/RetrospectiveGenerator";
import { AIChat } from "../components/ai/AIChat";

function AIFeatures() {
  const [activeTab, setActiveTab] = useState("chat");
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      // When a project is selected, load its data into the vector DB
      loadProjectData(selectedProject.id);
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const res = await apiHandler({ url: "projects" });
      if (res.success && res.data) {
        setProjects(res.data);
        // Auto-select the first project if available
        if (res.data.length > 0) {
          setSelectedProject(res.data[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProjectData = async (projectId) => {
    if (!projectId) return;
    
    try {
      // This API call will load project data into the vector DB for AI features
      const response = await apiHandler({
        url: `chat/get-data/${projectId}`,
        method: "POST",
      });
      
      if (!response.success) {
        console.error("Failed to load project data for AI:", response.error);
      }
    } catch (error) {
      console.error("Error loading project data for AI:", error);
    }
  };

  const handleProjectChange = (e) => {
    const projectId = e.target.value;
    const project = projects.find((p) => p.id === projectId);
    setSelectedProject(project);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            AI Features
          </h1>
          <p className="text-muted-foreground mt-1">
            Leverage AI to enhance your sprint planning and management
          </p>
        </div>

        <div className="mt-4 md:mt-0">
          <Label htmlFor="project-select">Select Project</Label>
          <select
            id="project-select"
            className="ml-2 p-2 border rounded-md bg-background"
            onChange={handleProjectChange}
            value={selectedProject?.id || ""}
            disabled={isLoading || projects.length === 0}
          >
            {projects.length === 0 ? (
              <option value="">No projects available</option>
            ) : (
              projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-8">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">AI Assistant</span>
          </TabsTrigger>
          <TabsTrigger
            value="sprint-negotiator"
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Sprint Negotiator</span>
          </TabsTrigger>
          <TabsTrigger value="scope-creep" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Scope Creep</span>
          </TabsTrigger>
          <TabsTrigger value="risk-heatmap" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span className="hidden sm:inline">Risk Heatmap</span>
          </TabsTrigger>
          <TabsTrigger
            value="retrospective"
            className="flex items-center gap-2"
          >
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Retrospective</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-0">
          <AIChat selectedProject={selectedProject} />
        </TabsContent>

        <TabsContent value="sprint-negotiator" className="mt-0">
          <SprintNegotiator selectedProject={selectedProject} />
        </TabsContent>

        <TabsContent value="scope-creep" className="mt-0">
          <ScopeCreepDetector selectedProject={selectedProject} />
        </TabsContent>

        <TabsContent value="risk-heatmap" className="mt-0">
          <RiskHeatmap selectedProject={selectedProject} />
        </TabsContent>

        <TabsContent value="retrospective" className="mt-0">
          <RetrospectiveGenerator selectedProject={selectedProject} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AIFeatures;
