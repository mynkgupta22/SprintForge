import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import apiHandler from "../functions/apiHandler";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import {
  MessageSquare,
  Edit,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

function ActivityTab() {
  const { projectId } = useParams();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [projectId]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await apiHandler({
        url: `api/activities/project/${projectId}`,
      });
      if (res.success) {
        setActivities(res.data || []);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
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
      content: "Added validation to the login form",
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
      fromStatus: "TO_DO",
      toStatus: "IN_PROGRESS",
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
      fromStatus: "IN_PROGRESS",
      toStatus: "DONE",
    },
    {
      id: "5",
      type: "COMMENT",
      taskId: "TASK-202",
      taskTitle: "Implement email notifications",
      userId: "user2",
      userName: "Jane Smith",
      userAvatar: "",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      content: "We should use a queue system for sending emails",
    },
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case "COMMENT":
        return <MessageSquare size={16} className="text-blue-500" />;
      case "STATUS_CHANGE":
        return <ArrowRight size={16} className="text-purple-500" />;
      case "TASK_CREATED":
        return <Plus size={16} className="text-green-500" />;
      case "TASK_UPDATED":
        return <Edit size={16} className="text-orange-500" />;
      case "TASK_COMPLETED":
        return <CheckCircle2 size={16} className="text-green-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now - activityTime;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 0) {
      return diffDay === 1 ? "1 day ago" : `${diffDay} days ago`;
    } else if (diffHour > 0) {
      return diffHour === 1 ? "1 hour ago" : `${diffHour} hours ago`;
    } else if (diffMin > 0) {
      return diffMin === 1 ? "1 minute ago" : `${diffMin} minutes ago`;
    } else {
      return "just now";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "TO_DO":
        return "To Do";
      case "IN_PROGRESS":
        return "In Progress";
      case "DONE":
        return "Done";
      case "BACKLOG":
        return "Backlog";
      default:
        return status;
    }
  };

  const getActivityDescription = (activity) => {
    switch (activity.type) {
      case "COMMENT":
        return (
          <>
            <span className="font-medium">{activity.userName}</span> commented
            on <span className="font-medium">{activity.taskTitle}</span>
            <p className="mt-1 text-sm bg-muted/30 p-2 rounded-md">
              {activity.content}
            </p>
          </>
        );
      case "STATUS_CHANGE":
        return (
          <>
            <span className="font-medium">{activity.userName}</span> moved{" "}
            <span className="font-medium">{activity.taskTitle}</span> from{" "}
            <span className="italic">
              {getStatusLabel(activity.fromStatus)}
            </span>{" "}
            to{" "}
            <span className="italic">{getStatusLabel(activity.toStatus)}</span>
          </>
        );
      case "TASK_CREATED":
        return (
          <>
            <span className="font-medium">{activity.userName}</span> created
            task <span className="font-medium">{activity.taskTitle}</span>
          </>
        );
      case "TASK_UPDATED":
        return (
          <>
            <span className="font-medium">{activity.userName}</span> updated{" "}
            <span className="font-medium">{activity.taskTitle}</span>
          </>
        );
      case "TASK_COMPLETED":
        return (
          <>
            <span className="font-medium">{activity.userName}</span> completed{" "}
            <span className="font-medium">{activity.taskTitle}</span>
          </>
        );
      default:
        return (
          <>
            <span className="font-medium">{activity.userName}</span> performed
            an action on{" "}
            <span className="font-medium">{activity.taskTitle}</span>
          </>
        );
    }
  };

  // Use mock data for demonstration
  const displayActivities = activities.length > 0 ? activities : mockActivities;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Activity Log</h2>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex">
                  <Skeleton className="h-10 w-10 rounded-full mr-4" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : displayActivities.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">No activity recorded yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayActivities.map((activity) => (
            <Card
              key={activity.id}
              className="hover:bg-muted/20 transition-colors"
            >
              <CardContent className="p-4">
                <div className="flex">
                  <Avatar className="h-10 w-10 mr-4">
                    <AvatarImage
                      src={activity.userAvatar}
                      alt={activity.userName}
                    />
                    <AvatarFallback>
                      {activity.userName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        {getActivityIcon(activity.type)}
                        <span className="ml-2 text-sm text-muted-foreground">
                          {activity.taskId}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                    <div className="mt-1 text-sm">{activity.description}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default ActivityTab;
