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
      console.log("Selected Project:", selectedProject);
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

  const getSeverityColor = () => {
    // Since the new API doesn't provide severity, we'll use a default color
    return "text-amber-500";
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
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Sprint: {scopeCreepData?.sprintName || 'Current Sprint'}</h3>
                  <p className="text-sm text-muted-foreground">Scope Creep Analysis</p>
                </div>
                <Badge variant="default" className="bg-amber-500/20 text-amber-700 border-amber-300">
                  Potential Scope Creep Detected
                </Badge>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-1">Potential Scope Creep Detected</h4>
                    <p className="text-amber-700 dark:text-amber-300 text-sm">
                      {scopeCreepData?.reasonForScopeCreepDetection}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Recommended Actions</h4>
                <ul className="list-disc list-inside text-sm space-y-1.5 text-blue-700 dark:text-blue-300">
                  <li>Review the task (DD-2) in the backlog</li>
                  <li>Determine if it should be included in the current sprint</li>
                  <li>If included, assign it to a team member</li>
                  <li>If not needed, update its due date or move it to a future sprint</li>
                </ul>
              </div>
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
