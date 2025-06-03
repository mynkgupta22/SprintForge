import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Clock, Loader2, CheckCircle, XCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import apiHandler from "../../functions/apiHandler";

export function RetrospectiveGenerator({ selectedProject }) {
  const [sprints, setSprints] = useState([]);
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [retrospective, setRetrospective] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

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
        // Filter to only show completed sprints
        const completedSprints = response.data?.filter(sprint => sprint.status === "COMPLETED") || [];
        setSprints(completedSprints);
        
        if (completedSprints.length > 0) {
          // Auto-select the most recently completed sprint
          const sortedSprints = [...completedSprints].sort((a, b) => 
            new Date(b.endDate) - new Date(a.endDate)
          );
          setSelectedSprint(sortedSprints[0]);
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

  const generateRetrospective = async () => {
    if (!selectedSprint || !selectedProject) return;
    
    setIsLoading(true);
    setRetrospective(null);
    setError(null);
    setSaved(false);
    
    try {
      const response = await apiHandler({
        url: "ai/retrospective",
        method: "POST",
        data: {
          projectId: selectedProject.id,
          sprintId: selectedSprint.id,
        },
      });
      
      if (response.success) {
        setRetrospective(response.data);
      } else {
        setError(response.error || "Failed to generate retrospective");
      }
    } catch (error) {
      console.error("Error generating retrospective:", error);
      setError("An unexpected error occurred while generating the retrospective");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSprintChange = (e) => {
    const sprintId = e.target.value;
    const sprint = sprints.find(s => s.id === sprintId);
    setSelectedSprint(sprint);
    setRetrospective(null);
    setSaved(false);
  };

  const handleSave = async () => {
    if (!retrospective || !selectedSprint) return;
    
    setIsLoading(true);
    
    try {
      // Here you would implement the logic to save the retrospective
      const response = await apiHandler({
        url: `sprints/${selectedSprint.id}/retrospective`,
        method: "POST",
        data: {
          content: retrospective.content,
          whatWentWell: retrospective.whatWentWell,
          whatWentWrong: retrospective.whatWentWrong,
          actionItems: retrospective.actionItems,
        },
      });
      
      if (response.success) {
        setSaved(true);
      } else {
        setError(response.error || "Failed to save retrospective");
      }
    } catch (error) {
      console.error("Error saving retrospective:", error);
      setError("An unexpected error occurred while saving the retrospective");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateSection = async (section) => {
    if (!selectedSprint || !selectedProject) return;
    
    setIsLoading(true);
    
    try {
      const response = await apiHandler({
        url: "ai/retrospective/regenerate-section",
        method: "POST",
        data: {
          projectId: selectedProject.id,
          sprintId: selectedSprint.id,
          section: section,
        },
      });
      
      if (response.success) {
        setRetrospective(prev => ({
          ...prev,
          [section]: response.data[section]
        }));
      } else {
        setError(response.error || `Failed to regenerate ${section} section`);
      }
    } catch (error) {
      console.error(`Error regenerating ${section} section:`, error);
      setError(`An unexpected error occurred while regenerating the ${section} section`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Retrospective Generator
        </CardTitle>
        <CardDescription>
          Generate AI-written sprint retrospectives based on task completion, delays, and logs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label htmlFor="sprint-select" className="block text-sm font-medium mb-1">
              Select Completed Sprint
            </label>
            <select
              id="sprint-select"
              className="w-full p-2 border rounded-md bg-background"
              onChange={handleSprintChange}
              value={selectedSprint?.id || ""}
              disabled={isLoading || sprints.length === 0}
            >
              {sprints.length === 0 ? (
                <option value="">No completed sprints available</option>
              ) : (
                sprints.map((sprint) => (
                  <option key={sprint.id} value={sprint.id}>
                    {sprint.name} ({new Date(sprint.endDate).toLocaleDateString()})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={generateRetrospective} 
              disabled={isLoading || !selectedSprint}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Retrospective"
              )}
            </Button>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {retrospective && !isLoading && (
            <div className="border rounded-md p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Sprint Retrospective</h3>
                <Badge variant="outline">
                  {selectedSprint?.name}
                </Badge>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Summary</h4>
                </div>
                <div className="bg-muted p-3 rounded-md text-sm">
                  {retrospective.summary}
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4 text-green-600" />
                    What Went Well
                  </h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRegenerateSection('whatWentWell')}
                    disabled={isLoading}
                  >
                    Regenerate
                  </Button>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md text-sm">
                  <ul className="list-disc list-inside space-y-1">
                    {retrospective.whatWentWell.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <ThumbsDown className="h-4 w-4 text-red-600" />
                    What Went Wrong
                  </h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRegenerateSection('whatWentWrong')}
                    disabled={isLoading}
                  >
                    Regenerate
                  </Button>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md text-sm">
                  <ul className="list-disc list-inside space-y-1">
                    {retrospective.whatWentWrong.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Action Items</h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRegenerateSection('actionItems')}
                    disabled={isLoading}
                  >
                    Regenerate
                  </Button>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm">
                  <ul className="list-disc list-inside space-y-1">
                    {retrospective.actionItems.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-medium mb-2">Statistics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="border rounded-md p-2 text-center">
                    <p className="text-xs text-muted-foreground">Completion Rate</p>
                    <p className="text-lg font-semibold">{retrospective.statistics.completionRate}%</p>
                  </div>
                  <div className="border rounded-md p-2 text-center">
                    <p className="text-xs text-muted-foreground">Tasks Completed</p>
                    <p className="text-lg font-semibold">{retrospective.statistics.tasksCompleted}/{retrospective.statistics.totalTasks}</p>
                  </div>
                  <div className="border rounded-md p-2 text-center">
                    <p className="text-xs text-muted-foreground">Story Points</p>
                    <p className="text-lg font-semibold">{retrospective.statistics.storyPointsCompleted}/{retrospective.statistics.totalStoryPoints}</p>
                  </div>
                  <div className="border rounded-md p-2 text-center">
                    <p className="text-xs text-muted-foreground">Avg. Cycle Time</p>
                    <p className="text-lg font-semibold">{retrospective.statistics.averageCycleTime} days</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={generateRetrospective}
                  disabled={isLoading}
                >
                  Regenerate All
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={isLoading || saved}
                >
                  {saved ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Saved
                    </>
                  ) : (
                    "Save Retrospective"
                  )}
                </Button>
              </div>
            </div>
          )}

          {!retrospective && !isLoading && selectedSprint && (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-2" />
              <p>Click "Generate Retrospective" to create a retrospective for this sprint</p>
            </div>
          )}

          {!selectedSprint && !isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-2" />
              <p>No completed sprints available for retrospective</p>
              <p className="text-sm mt-2">Complete a sprint first to generate a retrospective</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        The AI analyzes sprint data to generate insights about what went well, what could be improved, and actionable next steps.
      </CardFooter>
    </Card>
  );
}
