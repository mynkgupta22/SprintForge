import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { BarChart, Loader2, AlertTriangle, Users } from "lucide-react";
import apiHandler from "../../functions/apiHandler";
import ReactMarkdown from 'react-markdown';
import { marked } from "marked";

export function RiskHeatmap({ selectedProject }) {
  const [sprints, setSprints] = useState([]);
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedProject) {
      fetchSprints();
    }
  }, [selectedProject]);

  const fetchSprints = async () => {
    if (!selectedProject) return;
    
    setIsLoading(true);
    try {
      const response = await apiHandler({
        url: `sprints/project/${selectedProject.id}`,
        method: "GET",
      });
      
      if (response.success) {
        setSprints(response.data || []);
        // Auto-select the active sprint if available
        const activeSprint = response.data?.find(sprint => sprint.status === "ACTIVE");
        if (activeSprint) {
          setSelectedSprint(activeSprint);
          generateRiskHeatmap(activeSprint.id);
        } else if (response.data?.length > 0) {
          setSelectedSprint(response.data[0]);
        }
      } else {
        setError(response.error || "Failed to fetch sprints");
      }
    } catch (error) {
      console.error("Error fetching sprints:", error);
      setError("An unexpected error occurred while fetching sprints");
    } finally {
      setIsLoading(false);
    }
  };

  const generateRiskHeatmap = async (sprintId) => {
    if (!sprintId || !selectedProject) return;
    
    setIsLoading(true);
    setRiskData(null);
    setError(null);
    
    try {
      const response = await apiHandler({
        url: "api/ai/risk-heatmap",
        method: "POST",
        data: {
          projectId: selectedProject.id,
          sprintId: sprintId,
        },
      });
      
      if (response.success) {
        setRiskData(response.data);
      } else {
        setError(response.error || "Failed to generate risk heatmap");
      }
    } catch (error) {
      console.error("Error generating risk heatmap:", error);
      setError("An unexpected error occurred while analyzing risks");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSprintChange = (e) => {
    const sprintId = e.target.value;
    const sprint = sprints.find(s => s.id === sprintId);
    setSelectedSprint(sprint);
    generateRiskHeatmap(sprintId);
  };

  const getRiskCardClass = (riskLevel) => {
    if (!riskLevel) return 'bg-slate-100 text-slate-700 border-slate-300';
    
    switch (riskLevel.toLowerCase()) {
      case 'high':
        return 'bg-red-500/20 text-red-700 border-red-300';
      case 'medium':
        return 'bg-amber-500/20 text-amber-700 border-amber-300';
      case 'low':
        return 'bg-green-500/20 text-green-700 border-green-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getRiskBadgeVariant = (riskLevel) => {
    if (!riskLevel) return 'secondary';
    
    switch (riskLevel.toLowerCase()) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  // Utility function to format object to markdown string
function objectToMarkdown(obj) {
  if (!obj || typeof obj !== 'object') return '';

  return Object.entries(obj)
    .map(([key, value]) => `### ${key}\n\n${value}`)
    .join('\n\n');
}

const markdownText = useMemo(() => objectToMarkdown(riskData?.userRiskMap), [riskData]);

const html = useMemo(() => marked(markdownText), [markdownText]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="h-5 w-5 text-primary" />
          Risk Heatmap Generator
        </CardTitle>
        <CardDescription>
          Analyze task assignments and highlight likely blockers or overloaded team members
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label htmlFor="sprint-select" className="block text-sm font-medium mb-1">
              Select Sprint
            </label>
            <select
              id="sprint-select"
              className="w-full p-2 border rounded-md bg-background"
              onChange={handleSprintChange}
              value={selectedSprint?.id || ""}
              disabled={isLoading || sprints.length === 0}
            >
              {sprints.length === 0 ? (
                <option value="">No sprints available</option>
              ) : (
                sprints.map((sprint) => (
                  <option key={sprint.id} value={sprint.id}>
                    {sprint.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {riskData && !isLoading && (
            <div className="border rounded-md p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Risk Analysis</h3>
                <Badge variant="outline" className="bg-green-500/20 text-green-700 border-green-300">
                  Analysis Complete
                </Badge>
              </div>

              <div className="mb-6">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Team Member Risk Assessment
                </h4>
                <div className="space-y-4">
                  {/* {Object.entries(riskData).map(([name, details]) => {
                    // Skip non-member entries
                    if (typeof details !== 'string' || name.startsWith('*') || name === 'Here\'s the analysis' || name === '**Output') {
                      return null;
                    }
                    
                    // Extract risk level and reason
                    const riskMatch = details.match(/\*\*(.*?)\*\*\s*(.*)/);
                    if (!riskMatch) return null;
                    
                    const riskLevel = riskMatch[1].toLowerCase();
                    const riskReason = riskMatch[2];
                    
                    return (
                      <div key={name} className="border rounded-md p-3">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{name.replace('*', '').trim()}</span>
                          </div>
                          <Badge variant={getRiskBadgeVariant(riskLevel)}>
                            {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
                          </Badge>
                        </div>
                        <div className="text-sm">
                          <p>{riskReason}</p>
                        </div>
                      </div>
                    );
                  })} */}
<div
      className="prose max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
                </div>
              </div>
            </div>
          )}

          {!riskData && !isLoading && selectedSprint && (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
              <p>Select a sprint to analyze risks</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        The AI analyzes task assignments, dependencies, and team workload to identify potential risks to sprint success.
      </CardFooter>
    </Card>
  );
}
