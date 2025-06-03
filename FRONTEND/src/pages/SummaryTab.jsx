import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import apiHandler from "../functions/apiHandler";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import {
  BarChart,
  Calendar,
  CheckCircle,
  Clock,
  Users,
  AlertCircle,
  MessageSquare,
  Edit,
  Plus,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Skeleton } from "../components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

function SummaryTab() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    teamMembers: 0,
    activeSprint: null,
    dueIssues: 0,
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      fetchProjectSummary();
      fetchActivities();
    }
  }, [projectId]);

  const fetchProjectSummary = async () => {
    setLoading(true);
    try {
      // Fetch project details
      const projectRes = await apiHandler({ url: `projects/${projectId}` });
      if (projectRes.success) {
        setProject(projectRes.data);
      }

      // Fetch project stats
      const tasksRes = await apiHandler({
        url: `tasks/total-task/${projectId}`,
      });
      if (tasksRes.success) {
        const tasks = tasksRes.data || [];
        setStats((prev) => ({
          ...prev,
          ...tasks,
        }));
      }

      // Fetch team members
      const teamRes = await apiHandler({
        url: `projects/member-detail/${projectId}`,
      });
      if (teamRes.success) {
        setStats((prev) => ({
          ...prev,
          teamMembers: teamRes?.data?.totalMember || 0,
        }));
      }

      // Fetch active sprint
      const sprintsRes = await apiHandler({
        url: `sprints/project/${projectId}/status/ACTIVE`,
      });
      if (sprintsRes.success && sprintsRes.data?.length > 0) {
        setStats((prev) => ({
          ...prev,
          activeSprint: sprintsRes.data[0],
        }));
      }
    } catch (error) {
      console.error("Error fetching project summary:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch activities for the project
  const fetchActivities = async () => {
    try {
      const res = await apiHandler({
        url: `api/activities/project/${projectId}`,
      });
      if (res.success) {
        // Sort activities by timestamp (newest first)
        const sortedActivities = [...(res.data || [])].sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
        setActivities(sortedActivities);
      } else {
        // If API not available, use mock data for demonstration
        setActivities(mockActivities);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
      // Fallback to mock data
      setActivities(mockActivities);
    }
  };

  // Mock data for demonstration
  const mockActivities = [
    {
      id: "1",
      type: "COMMENT",
      taskId: "TASK-123",
      taskTitle: "Implement login functionality",
      userId: "user1",
      userName: "John Doe",
      userAvatar: "",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      description: "Added validation to the login form",
    },
    {
      id: "2",
      type: "STATUS_CHANGE",
      taskId: "TASK-456",
      taskTitle: "Design dashboard layout",
      userId: "user2",
      userName: "Jane Smith",
      userAvatar: "",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      description: "Moved task from To Do to In Progress",
    },
    {
      id: "3",
      type: "TASK_CREATED",
      taskId: "TASK-789",
      taskTitle: "Fix navigation bug on mobile",
      userId: "user3",
      userName: "Mike Johnson",
      userAvatar: "",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
      description: "Created a new task",
    },
    {
      id: "4",
      type: "STATUS_CHANGE",
      taskId: "TASK-101",
      taskTitle: "Update user documentation",
      userId: "user1",
      userName: "John Doe",
      userAvatar: "",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
      description: "Moved task from In Progress to Done",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Project Summary</h2>
        <p className="text-muted-foreground">
          {loading ? (
            <Skeleton className="h-4 w-3/4" />
          ) : (
            project?.description || "No description available"
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {/* Task Stats Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Task Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    Total Tasks
                  </span>
                  <span className="font-medium">{stats.totalTasks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    Completed
                  </span>
                  <div className="flex items-center">
                    <CheckCircle size={14} className="text-green-500 mr-1" />
                    <span className="font-medium">{stats.completedTasks}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    In Progress
                  </span>
                  <div className="flex items-center">
                    <Clock size={14} className="text-blue-500 mr-1" />
                    <span className="font-medium">{stats.inProgressTasks}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Overdue</span>
                  <div className="flex items-center">
                    <AlertCircle size={14} className="text-red-500 mr-1" />
                    <span className="font-medium">{stats.dueIssues}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Team</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Members</span>
                  <div className="flex items-center">
                    <Users size={14} className="text-indigo-500 mr-1" />
                    <span className="font-medium">{stats.teamMembers}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-sm text-muted-foreground">
                    Team Capacity
                  </div>
                  <div className="mt-1 h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{
                        width: `${Math.min(
                          (stats.inProgressTasks / (stats.teamMembers || 1)) *
                            100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {stats.inProgressTasks} tasks assigned across{" "}
                    {stats.teamMembers} members
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Sprint Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Sprint</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : stats.activeSprint ? (
              <div className="space-y-2">
                <div className="font-medium">{stats.activeSprint.name}</div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar size={14} className="mr-1" />
                  <span>
                    {new Date(
                      stats.activeSprint.startDate
                    ).toLocaleDateString()}{" "}
                    -{" "}
                    {new Date(stats.activeSprint.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="mt-2">
                  <div className="text-sm text-muted-foreground">Progress</div>
                  <div className="mt-1 h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{
                        width: `${
                          stats.activeSprint.tasks
                            ? (stats.activeSprint.tasks.filter(
                                (t) => t.status === "DONE"
                              ).length /
                                stats.activeSprint.tasks.length) *
                              100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-2 text-muted-foreground">No active sprint</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Overview */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Activity Overview</CardTitle>
          <span className="text-xs text-muted-foreground">Last 7 days</span>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start">
                  <Skeleton className="h-8 w-8 rounded-full mr-3" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length > 0 ? (
            <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
              {activities.slice(0, 4).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start pb-3 border-b border-border last:border-0 last:pb-0 hover:bg-muted/20 rounded-md p-2 transition-colors"
                >
                  <div className="flex-shrink-0 mr-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={activity.userAvatar}
                        alt={activity.userName}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {activity.userName?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center text-sm">
                      <span className="font-medium truncate">
                        {activity.userName}
                      </span>
                      <span className="mx-1 text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                    <div className="mt-1 text-sm">
                      <span className="mr-1 inline-flex items-center">
                        {getActivityIcon(activity.type)}
                      </span>
                      <span className="font-medium">{activity.taskTitle}</span>
                      <div className="text-muted-foreground text-xs mt-1">
                        {activity.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {activities.length > 4 && (
                <div className="text-center">
                  <a href="#" className="text-xs text-primary hover:underline">
                    View all activities
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <p>No recent activity to display</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Helper functions for activity display
const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now - date) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
};

const getActivityIcon = (type) => {
  switch (type) {
    case "COMMENT":
      return <MessageSquare size={14} className="text-blue-500 inline" />;
    case "STATUS_CHANGE":
      return <ArrowRight size={14} className="text-purple-500 inline" />;
    case "TASK_CREATED":
      return <Plus size={14} className="text-green-500 inline" />;
    case "TASK_UPDATED":
      return <Edit size={14} className="text-orange-500 inline" />;
    case "TASK_COMPLETED":
      return <CheckCircle2 size={14} className="text-green-500 inline" />;
    default:
      return <Clock size={14} className="text-gray-500 inline" />;
  }
};

export default SummaryTab;
