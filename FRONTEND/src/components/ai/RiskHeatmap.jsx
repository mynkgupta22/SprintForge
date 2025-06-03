import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { BarChart, Loader2, AlertTriangle, Users } from "lucide-react";
import apiHandler from "../../functions/apiHandler";

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
        url: "ai/risk-heatmap",
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
                <Badge 
                  variant={getRiskBadgeVariant(riskData.overallRisk)}
                >
                  {riskData.overallRisk} Overall Risk
                </Badge>
              </div>

              <div className="mb-6">
                <p className="text-sm mb-4">{riskData.summary}</p>
              </div>

              <div className="mb-6">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Team Member Workload
                </h4>
                <div className="space-y-4">
                  {riskData.memberRisks.map((member, index) => (
                    <div key={index} className="border rounded-md p-3">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{member.name}</span>
                        </div>
                        <Badge variant={getRiskBadgeVariant(member.riskLevel)}>
                          {member.riskLevel} Risk
                        </Badge>
                      </div>
                      <div className="text-sm space-y-1">
                        <p>Assigned Tasks: {member.assignedTasks}</p>
                        <p>Story Points: {member.storyPoints}</p>
                        <p>Estimated Hours: {member.estimatedHours}</p>
                      </div>
                      <div className="mt-2 text-sm">
                        <p className="font-medium">Risk Factors:</p>
                        <ul className="list-disc list-inside">
                          {member.riskFactors.map((factor, i) => (
                            <li key={i}>{factor}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-medium mb-3">High-Risk Tasks</h4>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {riskData.riskTasks.map((task, index) => (
                    <div 
                      key={index} 
                      className={`border rounded p-3 text-sm ${getRiskCardClass(task.riskLevel)}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-xs mt-1">Assigned to: {task.assignee}</p>
                        </div>
                        <Badge variant={getRiskBadgeVariant(task.riskLevel)}>
                          {task.riskLevel}
                        </Badge>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs font-medium">Risk Factors:</p>
                        <ul className="list-disc list-inside text-xs">
                          {task.riskFactors.map((factor, i) => (
                            <li key={i}>{factor}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                  {riskData.riskTasks.length === 0 && (
                    <p className="text-sm text-muted-foreground">No high-risk tasks identified</p>
                  )}
                </div>
              </div>

              <div className="bg-muted p-3 rounded-md">
                <h4 className="font-medium mb-2">Recommendations</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {riskData.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
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
