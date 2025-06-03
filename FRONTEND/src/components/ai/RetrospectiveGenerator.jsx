import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Clock, Loader2, RefreshCw, CheckCircle } from "lucide-react";
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
    
    try {
      const response = await apiHandler({
        url: `api/ai/retrospective`,
        method: "POST",
        data: {
          projectId: selectedProject.id,
          sprintId: selectedSprint.id,
        },
      });
      
      if (response.success && response.data && response.data.length > 0) {
        // Take the first item from the array as our retrospective
        setRetrospective(response.data[0]);
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
  };

  const handleRegenerateSection = async (section) => {
    if (!selectedSprint || !selectedProject) return;
    
    setIsLoading(true);
    
    try {
      const response = await apiHandler({
        url: "api/ai/retrospective/regenerate-section",
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

              <div className="space-y-6">
                {/* What Went Well */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-green-600">
                      What Went Well
                    </h3>
                    <Button
                      variant="outline"
                      size="sm" 
                      onClick={() => handleRegenerateSection('whatWentWell')}
                      disabled={isLoading}
                      className="gap-1"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Regenerate</span>
                    </Button>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md text-sm">
                    <p className="whitespace-pre-line">{retrospective.whatWentWell}</p>
                  </div>
                </div>

                {/* What Didn't Go Well */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-red-600">
                      What Didn't Go Well
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRegenerateSection('whatDidNotGoWell')}
                      disabled={isLoading}
                      className="gap-1"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Regenerate</span>
                    </Button>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md text-sm">
                    <p className="whitespace-pre-line">{retrospective.whatDidNotGoWell}</p>
                  </div>
                </div>

                {/* Suggestions */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-blue-600">
                      Suggestions for Improvement
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRegenerateSection('suggestions')}
                      disabled={isLoading}
                      className="gap-1"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Regenerate</span>
                    </Button>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md text-sm">
                    <p className="whitespace-pre-line">{retrospective.suggestions}</p>
                  </div>
                </div>
              </div>

              {retrospective.sprintName && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Sprint Summary</h4>
                  <p className="whitespace-pre-line text-sm">{retrospective.sprintName}</p>
                </div>
              )}

              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={generateRetrospective}
                  disabled={isLoading}
                  className="gap-1"
                >
                  <RefreshCw className="h-4 w-4" />
                  Regenerate All
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
