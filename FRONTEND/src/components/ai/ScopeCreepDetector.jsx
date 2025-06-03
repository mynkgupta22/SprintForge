import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { AlertTriangle, Loader2, TrendingUp, Calendar } from "lucide-react";
import apiHandler from "../../functions/apiHandler";

export function ScopeCreepDetector({ selectedProject }) {
  const [sprints, setSprints] = useState([]);
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [scopeCreepData, setScopeCreepData] = useState(null);
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
        const activeSprint = response.data?.find(
          (sprint) => sprint.status === "ACTIVE"
        );
        if (activeSprint) {
          setSelectedSprint(activeSprint);
          detectScopeCreep(activeSprint.id);
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

  const detectScopeCreep = async (sprintId) => {
    if (!sprintId || !selectedProject) return;

    setIsLoading(true);
    setScopeCreepData(null);
    setError(null);

    try {
      const response = await apiHandler({
        url: "api/ai/scope-creep",
        method: "POST",
        data: {
          projectId: selectedProject.id,
          sprintId: sprintId,
        },
      });

      if (response.success) {
        setScopeCreepData(response.data);
      } else {
        setError(response.error || "Failed to detect scope creep");
      }
    } catch (error) {
      console.error("Error detecting scope creep:", error);
      setError("An unexpected error occurred while analyzing scope creep");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSprintChange = (e) => {
    const sprintId = e.target.value;
    const sprint = sprints.find((s) => s.id === sprintId);
    setSelectedSprint(sprint);
    detectScopeCreep(sprintId);
  };

  const getSeverityColor = (severity) => {
    if (!severity) return "text-gray-500";
    
    switch (severity.toLowerCase()) {
      case "high":
        return "text-destructive";
      case "medium":
        return "text-amber-500";
      case "low":
        return "text-green-500";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-primary" />
          Scope Creep Detector
        </CardTitle>
        <CardDescription>
          Detect when sprint scope is silently growing beyond initial
          commitments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="sprint-select"
              className="block text-sm font-medium mb-1"
            >
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

          {scopeCreepData && !isLoading && (
            <div className="border rounded-md p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Scope Creep Analysis</h3>
                <Badge
                  variant={
                    scopeCreepData.severity === "HIGH"
                      ? "destructive"
                      : scopeCreepData.severity === "MEDIUM"
                      ? "default"
                      : "outline"
                  }
                >
                  {scopeCreepData.severity} Risk
                </Badge>
              </div>

              <div className="mb-6">
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Scope Growth</span>
                  <span
                    className={`text-sm font-medium ${getSeverityColor(
                      scopeCreepData.severity
                    )}`}
                  >
                    {scopeCreepData.scopeGrowthPercentage}%
                  </span>
                </div>
                <Progress
                  value={scopeCreepData.scopeGrowthPercentage}
                  className="h-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="border rounded-md p-3">
                  <h4 className="text-sm font-medium flex items-center gap-1 mb-2">
                    <Calendar className="h-4 w-4" />
                    Initial Commitment
                  </h4>
                  <div className="text-sm">
                    <p>Tasks: {scopeCreepData.initialTaskCount}</p>
                    <p>Story Points: {scopeCreepData.initialStoryPoints}</p>
                    <p>Estimated Hours: {scopeCreepData.initialHours}</p>
                  </div>
                </div>
                <div className="border rounded-md p-3">
                  <h4 className="text-sm font-medium flex items-center gap-1 mb-2">
                    <TrendingUp className="h-4 w-4" />
                    Current State
                  </h4>
                  <div className="text-sm">
                    <p>Tasks: {scopeCreepData.currentTaskCount}</p>
                    <p>Story Points: {scopeCreepData.currentStoryPoints}</p>
                    <p>Estimated Hours: {scopeCreepData.currentHours}</p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium mb-2">Added Tasks</h4>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {scopeCreepData.addedTasks.map((task, index) => (
                    <div key={index} className="border rounded p-2 text-sm">
                      <div className="flex justify-between">
                        <p className="font-medium">{task.title}</p>
                        <Badge variant="outline" className="text-xs">
                          {task.addedDate
                            ? new Date(task.addedDate).toLocaleDateString()
                            : "Unknown date"}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {task.points} points • {task.hours} hours
                      </div>
                    </div>
                  ))}
                  {scopeCreepData.addedTasks.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No tasks added after sprint start
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-muted p-3 rounded-md">
                <h4 className="font-medium mb-2">AI Analysis</h4>
                <p className="text-sm">{scopeCreepData.analysis}</p>
              </div>

              {scopeCreepData.recommendations && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Recommendations</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {scopeCreepData.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {!scopeCreepData && !isLoading && selectedSprint && (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
              <p>Select a sprint to analyze scope creep</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        The AI analyzes changes to sprint scope over time to identify potential
        risks to delivery.
      </CardFooter>
    </Card>
  );
}
