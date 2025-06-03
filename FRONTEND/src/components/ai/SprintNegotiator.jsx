import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Calendar, Loader2, CheckCircle, XCircle } from "lucide-react";
import apiHandler from "../../functions/apiHandler";

export function SprintNegotiator({ selectedProject }) {
  const [tasks, setTasks] = useState("");
  const [sprintPlan, setSprintPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGeneratePlan = async () => {
    if (!tasks.trim() || !selectedProject) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiHandler({
        url: "api/ai/suggest-sprint",
        method: "POST",
        data: {
          projectId: selectedProject.id,
          tasks: tasks,
        },
      });

      if (response.success) {
        setSprintPlan(response.data);
      } else {
        setError(response.error || "Failed to generate sprint plan");
      }
    } catch (error) {
      console.error("Error generating sprint plan:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setTasks("");
    setSprintPlan(null);
    setError(null);
  };

  const handleAccept = async () => {
    if (!sprintPlan || !selectedProject) return;

    setIsLoading(true);

    try {
      // Here you would implement the logic to accept the sprint plan
      // This could involve creating sprint tasks, updating the backlog, etc.
      const response = await apiHandler({
        url: "sprints/create",
        method: "POST",
        data: {
          projectId: selectedProject.id,
          name: sprintPlan.name,
          startDate: sprintPlan.startDate,
          endDate: sprintPlan.endDate,
          tasks: sprintPlan.tasks,
        },
      });

      if (response.success) {
        // Reset the form after successful creation
        handleClear();
        // You could add a success message here
      } else {
        setError(response.error || "Failed to create sprint");
      }
    } catch (error) {
      console.error("Error creating sprint:", error);
      setError("An unexpected error occurred while creating the sprint.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Sprint Negotiator
        </CardTitle>
        <CardDescription>
          Generate a feasible sprint plan based on team capacity and priority
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label htmlFor="tasks" className="block text-sm font-medium mb-1">
              Paste your upcoming tasks
            </label>
            <Textarea
              id="tasks"
              placeholder="Paste your tasks here, one per line. Include any details like priority, estimated time, etc."
              value={tasks}
              onChange={(e) => setTasks(e.target.value)}
              disabled={isLoading}
              className="min-h-[200px]"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Format: Task title, priority (High/Medium/Low), estimated hours
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={isLoading}
            >
              Clear
            </Button>
            <Button
              onClick={handleGeneratePlan}
              disabled={isLoading || !tasks.trim() || !selectedProject}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Suggest Sprint Plan"
              )}
            </Button>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {sprintPlan && (
            <div className="border rounded-md p-4 mt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{sprintPlan.name}</h3>
                <Badge variant="outline" className="bg-primary/10">
                  {sprintPlan.duration} days
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p>{new Date(sprintPlan.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <p>{new Date(sprintPlan.endDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium mb-2">Capacity Analysis</h4>
                <div className="text-sm">
                  <p>Team capacity: {sprintPlan.capacity} hours</p>
                  <p>Planned work: {sprintPlan.plannedHours} hours</p>
                  <p className={
                    !sprintPlan.capacityStatus ? "text-gray-600" :
                    sprintPlan.capacityStatus === "UNDER" ? "text-green-600" :
                    sprintPlan.capacityStatus === "OPTIMAL" ? "text-blue-600" :
                    "text-amber-600"
                  }>
                    Status: {
                      !sprintPlan.capacityStatus ? "Unknown" :
                      sprintPlan.capacityStatus === "UNDER" ? "Under capacity" :
                      sprintPlan.capacityStatus === "OPTIMAL" ? "Optimal capacity" :
                      "Over capacity"
                    }
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">
                  Tasks ({sprintPlan.taskKeys.length})
                </h4>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {sprintPlan.taskKeys.map((taskKey, index) => (
                    <div
                      key={index}
                      className="border rounded p-2 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium">{taskKey}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge
                            variant={
                              sprintPlan?.taskPriorities?.[taskKey] === "HIGH"
                                ? "destructive"
                                : sprintPlan?.taskPriorities?.[taskKey] === "MEDIUM"
                                ? "default"
                                : "outline"
                            }
                            className="text-xs"
                          >
                            {sprintPlan?.taskPriorities?.[taskKey]}
                          </Badge>
                          <span>{sprintPlan?.taskHours?.[taskKey]} hours</span>
                        </div>
                      </div>
                      <div>
                        {sprintPlan?.taskIncluded?.[taskKey] ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium mb-2">AI Recommendations</h4>
                <div className="text-sm bg-muted p-3 rounded-md">
                  {sprintPlan.recommendations}
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={handleClear}
                  disabled={isLoading}
                >
                  Reject
                </Button>
                <Button onClick={handleAccept} disabled={isLoading}>
                  Accept Plan
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        The AI will analyze team velocity, capacity, and task priorities to
        suggest an optimal sprint plan.
      </CardFooter>
    </Card>
  );
}
