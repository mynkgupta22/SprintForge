import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import apiHandler from "../functions/apiHandler";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import {
  Plus,
  Search,
  Filter,
  ChevronDown,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Clock,
  Tag,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

function BacklogTab() {
  const { projectId } = useParams();
  const [backlogTasks, setBacklogTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [activeSprint, setActiveSprint] = useState(null);
  const [draggingTask, setDraggingTask] = useState(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
  });

  useEffect(() => {
    if (projectId) {
      fetchBacklogTasks();
      fetchActiveSprint();
    }
  }, [projectId]);

  // Fetch active sprint for the project
  const fetchActiveSprint = async () => {
    try {
      const res = await apiHandler({
        url: `sprints/project/${projectId}/status/ACTIVE`,
      });
      if (res.success && res.data) {
        setActiveSprint(res.data);
      }
    } catch (error) {
      console.error("Error fetching active sprint:", error);
    }
  };

  const fetchBacklogTasks = async () => {
    setLoading(true);
    try {
      const res = await apiHandler({
        url: `tasks/project/${projectId}/status/BACKLOG`,
      });
      if (res.success) {
        setBacklogTasks(res.data || []);
      }
    } catch (error) {
      console.error("Error fetching backlog tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;

    try {
      // Create payload according to TaskCreateRequest DTO
      const payload = {
        title: newTask.title,
        description: newTask.description || "",
        priority: newTask.priority,
        status: "BACKLOG",
        projectId: Number(projectId), // Convert to number as required by DTO
      };

      console.log("Sending task payload:", payload);

      const res = await apiHandler({
        url: `tasks`,
        method: "POST",
        data: payload,
      });

      if (res.success) {
        setBacklogTasks([...backlogTasks, res.data]);
        setNewTask({ title: "", description: "", priority: "MEDIUM" });
        setShowCreateTask(false);
      }
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  // Add task to active sprint
  const addToSprint = async (taskId) => {
    if (!activeSprint) return;

    try {
      const res = await apiHandler({
        url: `tasks/${taskId}/sprint/${activeSprint.id}`,
        method: "POST",
      });

      if (res.success) {
        // Remove task from backlog
        setBacklogTasks(backlogTasks.filter((task) => task.id !== taskId));
      }
    } catch (error) {
      console.error("Error adding task to sprint:", error);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (task) => {
    setDraggingTask(task);
  };

  const handleDragEnd = () => {
    setDraggingTask(null);
    setIsDraggingOver(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (draggingTask && activeSprint) {
      addToSprint(draggingTask.id);
    }
    setIsDraggingOver(false);
    setDraggingTask(null);
  };

  const filteredTasks = backlogTasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description &&
        task.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "HIGH":
        return "text-red-500";
      case "MEDIUM":
        return "text-yellow-500";
      case "LOW":
        return "text-green-500";
      default:
        return "text-blue-500";
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "HIGH":
        return <ArrowUp size={14} className="text-red-500" />;
      case "MEDIUM":
        return <MoreHorizontal size={14} className="text-yellow-500" />;
      case "LOW":
        return <ArrowDown size={14} className="text-green-500" />;
      default:
        return <MoreHorizontal size={14} className="text-blue-500" />;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Backlog</h2>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search backlog"
              className="pl-8 h-9 w-[200px] md:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setShowCreateTask(true)}>
            <Plus size={16} className="mr-1" /> Add Task
          </Button>
        </div>
      </div>

      {showCreateTask && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Task title"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  className="mb-2"
                />
                <textarea
                  placeholder="Description (optional)"
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  className="w-full min-h-[100px] p-2 border rounded-md"
                />
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <label className="text-sm text-muted-foreground mb-1 block">
                    Priority
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) =>
                      setNewTask({ ...newTask, priority: e.target.value })
                    }
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>
              <div className="flex-1">
                <label className="text-sm text-muted-foreground mb-1 block">
                  Assignee
                </label>
                <select
                  className="w-full p-2 border rounded-md"
                  onChange={(e) =>
                    setNewTask({ ...newTask, assigneeId: e.target.value })
                  }
                >
                  <option value="">Unassigned</option>
                  {/* Fetch and map team members here */}
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateTask(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateTask}>Create Task</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start">
                  <Skeleton className="h-4 w-4 mr-2 mt-1" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 border rounded-lg bg-muted/20">
                <p className="text-muted-foreground mb-2">
                  No tasks in backlog
                </p>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateTask(true)}
                >
                  <Plus size={16} className="mr-1" /> Add your first task
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTasks.map((task) => (
                  <Card
                    key={task.id}
                    className="hover:bg-muted/20 transition-colors"
                    draggable={!!activeSprint}
                    onDragStart={() => handleDragStart(task)}
                    onDragEnd={handleDragEnd}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start">
                        <div className="mr-3 mt-1">
                          {getPriorityIcon(task.priority)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center mt-2 text-xs text-muted-foreground">
                            {task.assignee ? (
                              <div className="flex items-center mr-3">
                                <Avatar className="h-5 w-5 mr-1">
                                  <AvatarFallback>
                                    {task.assignee.name?.charAt(0) || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{task.assignee.name}</span>
                              </div>
                            ) : (
                              <div className="flex items-center mr-3">
                                <Avatar className="h-5 w-5 mr-1">
                                  <AvatarFallback>?</AvatarFallback>
                                </Avatar>
                                <span>Unassigned</span>
                              </div>
                            )}
                            {task.dueDate && (
                              <div className="flex items-center mr-3">
                                <Clock size={12} className="mr-1" />
                                <span>{task.dueDate}</span>
                              </div>
                            )}
                            {task.tags && task.tags.length > 0 && (
                              <div className="flex items-center overflow-hidden">
                                <Tag size={12} className="mr-1 flex-shrink-0" />
                                <span className="truncate">
                                  {task.tags.join(", ")}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {activeSprint && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => addToSprint(task.id)}
                            >
                              Add to Sprint
                            </Button>
                          )}
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal size={16} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Current Sprint Drop Area */}
          {activeSprint && (
            <div
              className={`w-full md:w-64 p-4 border rounded-lg ${
                isDraggingOver ? "bg-primary/10 border-primary" : "bg-muted/20"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="text-center">
                <h3 className="font-medium mb-2">Current Sprint</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {activeSprint.name}
                </p>
                {isDraggingOver ? (
                  <p className="text-sm text-primary">Drop to add to sprint</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Drag tasks here to add to the current sprint
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BacklogTab;
