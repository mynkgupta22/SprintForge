import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
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

function AIFeaturesTab() {
  const { projectId } = useParams();
  const [activeTab, setActiveTab] = useState("chat");
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  useEffect(() => {
    if (project) {
      // When project data is loaded, initialize the vector DB with project data
      loadProjectData(projectId);
    }
  }, [project, projectId]);

  const fetchProjectDetails = async () => {
    setIsLoading(true);
    try {
      const res = await apiHandler({ url: `projects/${projectId}` });
      if (res.success) {
        setProject(res.data);
      } else {
        console.error("Failed to fetch project details:", res.error);
      }
    } catch (error) {
      console.error("Error fetching project details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProjectData = async (projectId) => {
    if (!projectId) return;
    
    try {
      // This API call will load project data into the vector DB for AI features
      const response = await apiHandler({ 
        url: `api/chat/get-data/${projectId}`,
        method: "POST"
      });
      
      if (!response.success) {
        console.error("Failed to load project data for AI:", response.error);
      }
    } catch (error) {
      console.error("Error loading project data for AI:", error);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          AI Features
        </h1>
        <p className="text-muted-foreground mt-1">
          Leverage AI to enhance your sprint planning and management
        </p>
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
            Loading project data...
          </div>
        )}
      </div>

      {!project && !isLoading && (
        <div className="border border-amber-200 bg-amber-50 rounded-md p-4 mb-6">
          <p className="text-amber-800">Project data could not be loaded. AI features require project data to function properly.</p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-8">
          <TabsTrigger value="chat" className="flex items-center gap-2" disabled={!project && !isLoading}>
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">AI Assistant</span>
          </TabsTrigger>
          <TabsTrigger value="sprint-negotiator" className="flex items-center gap-2" disabled={!project && !isLoading}>
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Sprint Negotiator</span>
          </TabsTrigger>
          <TabsTrigger value="scope-creep" className="flex items-center gap-2" disabled={!project && !isLoading}>
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Scope Creep</span>
          </TabsTrigger>
          <TabsTrigger value="risk-heatmap" className="flex items-center gap-2" disabled={!project && !isLoading}>
            <BarChart className="h-4 w-4" />
            <span className="hidden sm:inline">Risk Heatmap</span>
          </TabsTrigger>
          <TabsTrigger value="retrospective" className="flex items-center gap-2" disabled={!project && !isLoading}>
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Retrospective</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-0">
          <AIChat selectedProject={project} />
        </TabsContent>

        <TabsContent value="sprint-negotiator" className="mt-0">
          <SprintNegotiator selectedProject={project} />
        </TabsContent>

        <TabsContent value="scope-creep" className="mt-0">
          <ScopeCreepDetector selectedProject={project} />
        </TabsContent>

        <TabsContent value="risk-heatmap" className="mt-0">
          <RiskHeatmap selectedProject={project} />
        </TabsContent>

        <TabsContent value="retrospective" className="mt-0">
          <RetrospectiveGenerator selectedProject={project} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AIFeaturesTab;
