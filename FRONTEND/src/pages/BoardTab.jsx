import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../redux/features/user/userSlice";
import apiHandler from "../functions/apiHandler";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Skeleton } from "../components/ui/skeleton";
import { Textarea } from "../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { ArrowDown, ArrowUp, MoreHorizontal } from "lucide-react";

const COLUMNS = [
  { key: "BACKLOG", label: "Backlog" },
  { key: "TODO", label: "To Do" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "IN_REVIEW", label: "In Review" },
  { key: "DONE", label: "Done" },
];

const PRIORITIES = ["HIGHEST", "HIGH", "MEDIUM", "LOW", "LOWEST"];
const STATUSES = COLUMNS.map((c) => c.key);

function BoardTab() {
  const { projectId } = useParams();
  const currentUser = useSelector(selectUser);
  const [backlogTasks, setBacklogTasks] = useState([]);
  const [sprintTasks, setSprintTasks] = useState([]);
  const [activeSprint, setActiveSprint] = useState(null);
  const [loading, setLoading] = useState({
    backlog: false,
    sprint: false,
    activeSprint: false,
  });
  const [draggedTask, setDraggedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    assignee: "",
    priority: "MEDIUM",
    status: "BACKLOG",
    dueDate: "",
    estimate: "",
  });
  const [showDetail, setShowDetail] = useState(false);
  const [detailTask, setDetailTask] = useState(null);
  const [saving, setSaving] = useState(false);
  const [comments, setComments] = useState([]);
  const [activity, setActivity] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [commenting, setCommenting] = useState(false);
  const [projectMembers, setProjectMembers] = useState([]);

  useEffect(() => {
    if (projectId) {
      fetchActiveSprint();
      fetchBacklogTasks();
      fetchProjectMembers();
    }
    // eslint-disable-next-line
  }, [projectId]);

  // Fetch project members
  const fetchProjectMembers = async () => {
    try {
      const res = await apiHandler({
        url: `projects/member-detail/${projectId}`,
      });
      if (res.success && res.data) {
        console.log("Project members data:", res.data);
        const members = res.data.memberDtos || [];
        console.log("Member array:", members);
        setProjectMembers(members);
      }
    } catch (error) {
      console.error("Error fetching project members:", error);
    }
  };

  // Fetch active sprint for the project
  const fetchActiveSprint = async () => {
    setLoading((prev) => ({ ...prev, activeSprint: true }));
    try {
      const res = await apiHandler({
        url: `sprints/project/${projectId}/status/ACTIVE`,
      });
      if (res.success && res.data) {
        setActiveSprint(res.data);
        // If we have an active sprint, fetch its tasks
        fetchSprintTasks(res.data.id);
      }
    } catch (error) {
      console.error("Error fetching active sprint:", error);
    } finally {
      setLoading((prev) => ({ ...prev, activeSprint: false }));
    }
  };

  // Fetch backlog tasks for the project
  const fetchBacklogTasks = async () => {
    setLoading((prev) => ({ ...prev, backlog: true }));
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
      setLoading((prev) => ({ ...prev, backlog: false }));
    }
  };

  // Fetch tasks for a specific sprint
  const fetchSprintTasks = async (sprintId) => {
    // if (!sprintId) return;

    setLoading((prev) => ({ ...prev, sprint: true }));
    try {
      const res = await apiHandler({ url: `projects/${projectId}` });
      if (res.success) {
        setSprintTasks(res.data?.activeSprint?.tasks || []);
      }
    } catch (error) {
      console.error("Error fetching sprint tasks:", error);
    } finally {
      setLoading((prev) => ({ ...prev, sprint: false }));
    }
  };

  useEffect(() => {
    fetchActiveSprint();

    return () => {};
  }, []);

  const fetchComments = async (taskId) => {
    const res = await apiHandler({ url: `comments/task/${taskId}` });
    if (res.success) setComments(res.data || []);
  };

  const fetchActivity = async (taskId) => {
    const res = await apiHandler({ url: `api/activities/task/${taskId}` });
    if (res.success) setActivity(res.data || []);
  };

  const onDragStart = (task) => {
    setDraggedTask(task);
  };

  const onDrop = async (status) => {
    if (!draggedTask || draggedTask.status === status) return;

    // Update UI optimistically
    if (draggedTask.status === "BACKLOG") {
      // Moving from backlog
      setBacklogTasks((prev) => prev.filter((t) => t.id !== draggedTask.id));
      if (status !== "BACKLOG") {
        setSprintTasks((prev) => [...prev, { ...draggedTask, status }]);
      }
    } else {
      // Moving between sprint columns or back to backlog
      if (status === "BACKLOG") {
        setSprintTasks((prev) => prev.filter((t) => t.id !== draggedTask.id));
        setBacklogTasks((prev) => [...prev, { ...draggedTask, status }]);
      } else {
        setSprintTasks((prev) =>
          prev.map((t) => (t.id === draggedTask.id ? { ...t, status } : t))
        );
      }
    }

    // Send update to API
    await apiHandler({
      url: `tasks/${draggedTask.id}/status/${status}?sprintId=${
        findActiveSprit?.id || null
      }`,
      method: "PUT",
      // data: { status },
    });

    setDraggedTask(null);
  };

  const handleInput = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await apiHandler({
        url: "tasks",
        method: "POST",
        data: {
          ...form,
          estimate: Number(form?.estimate || 0),
          projectId: Number(projectId),
        },
      });
      
      if (res.success) {
        setShowModal(false);
        setForm({
          title: "",
          description: "",
          assignee: "",
          priority: "MEDIUM",
          status: "BACKLOG",
          dueDate: "",
        });

        // Always refresh both lists to ensure consistency
        await fetchBacklogTasks();
        if (activeSprint) {
          await fetchSprintTasks(activeSprint.id);
        }
        return res;
      }
    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
      setCreating(false);
    }
  };

  const openDetail = (task) => {
    setDetailTask(task);
    setShowDetail(true);
    fetchComments(task.id);
    fetchActivity(task.id);
  };

  const handleDetailInput = (e) => {
    setDetailTask((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDetailSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await apiHandler({
      url: `tasks/${detailTask.id}`,
      method: "PUT",
      data: {
        title: detailTask.title,
        description: detailTask.description,
        assignee: Number(detailTask.assigneeId),
        priority: detailTask.priority,
        dueDate: detailTask.dueDate,
        status: detailTask.status,
      },
    });
    setSaving(false);
    if (res.success) {
      setShowDetail(false);
      setDetailTask(null);

      // Refresh the appropriate task lists
      fetchBacklogTasks();
      if (activeSprint) {
        fetchSprintTasks(activeSprint.id);
      }
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setCommenting(true);
    const res = await apiHandler({
      url: "comments",
      method: "POST",
      data: {
        taskId: detailTask.id,
        content: commentInput,
        author: currentUser?.id, // Include the current user's ID as author
      },
    });
    setCommenting(false);
    if (res.success) {
      setCommentInput("");
      fetchComments(detailTask.id);
    }
  };
  const findActiveSprit = activeSprint?.find((v) => v.status == "ACTIVE");
  return (
    <div>
      {/* Sprint Information Banner */}
      {findActiveSprit && (
        <div className="mb-6 bg-card border rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h2 className="text-xl font-semibold">{findActiveSprit.name}</h2>
              <p className="text-sm text-muted-foreground">
                {findActiveSprit.goal}
              </p>
            </div>
            <div className="px-3 py-1 bg-primary/20 text-primary text-sm font-medium rounded-full">
              Active Sprint
            </div>
          </div>
          <div className="flex items-center justify-between mb-2 text-sm">
            <div>
              <span className="text-muted-foreground">Date Range: </span>
              <span>
                {findActiveSprit.startDate} - {findActiveSprit.endDate}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Capacity: </span>
              <span>{findActiveSprit.capacity}</span>
            </div>
          </div>
          {/* Sprint Progress Bar */}
          {findActiveSprit && (
            <div>
              {(() => {
                const startDate = new Date(findActiveSprit.startDate);
                const endDate = new Date(findActiveSprit.endDate);
                const today = new Date();
                const totalDays = Math.ceil(
                  (endDate - startDate) / (1000 * 60 * 60 * 24)
                );
                const daysElapsed = Math.ceil(
                  (today - startDate) / (1000 * 60 * 60 * 24)
                );
                const daysRemaining = Math.max(
                  0,
                  Math.ceil((endDate - today) / (1000 * 60 * 60 * 24))
                );
                const progress = Math.min(
                  100,
                  Math.max(0, (daysElapsed / totalDays) * 100)
                );

                return (
                  <>
                    <div className="flex justify-between text-xs mb-1">
                      <span>{daysElapsed} days elapsed</span>
                      <span>{daysRemaining} days remaining</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div
                        className="bg-primary h-2.5 rounded-full"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Board</h2>
        <Button onClick={() => setShowModal(true)}>+ Add Task</Button>
      </div>
      <div className="mb-4">
        {findActiveSprit && (
          <div className="bg-primary/10 p-2 rounded-md mb-4">
            <p className="text-sm font-medium">
              Active Sprint: {findActiveSprit.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(findActiveSprit.startDate).toLocaleDateString()} -{" "}
              {new Date(findActiveSprit.endDate).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      {loading.backlog && loading.sprint ? (
        <div className="space-y-4">
          {COLUMNS.map((col) => (
            <div
              key={col.key}
              className="bg-muted rounded-lg p-2 min-h-[100px]"
            >
              <div className="font-semibold mb-2 text-center">{col.label}</div>
              <Skeleton className="h-20 w-full mb-2" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {COLUMNS.map((col) => {
            // Determine which tasks to show in this column
            const tasksToShow =
              col.key === "BACKLOG"
                ? backlogTasks
                : sprintTasks.filter((t) => t.status === col.key);
            console.log(sprintTasks, "qqqqqqq");

            return (
              <div
                key={col.key}
                className="bg-muted rounded-lg p-2 min-h-[300px] flex flex-col"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(col.key)}
              >
                <div className="font-semibold mb-2 text-center">
                  {col.label}
                </div>
                {tasksToShow.map((task) => (
                  <Card
                    key={task.id}
                    className="mb-2 cursor-move"
                    draggable
                    onDragStart={() => onDragStart(task)}
                    onClick={() => openDetail(task)}
                  >
                    <CardHeader className="py-3 px-4">
                      <CardTitle className="text-sm">{task.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 px-4">
                      <div className="text-xs text-muted-foreground mb-1">
                        {task.assigneeName
                          ? `Assignee: ${task.assigneeName}`
                          : "Unassigned"}
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">
                        Priority: {task.priority}
                      </div>
                      {task.dueDate && (
                        <div className="text-xs text-muted-foreground">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {tasksToShow.length === 0 && (
                  <div className="text-center text-muted-foreground text-sm py-4">
                    No tasks
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreate} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={form.title}
                onChange={handleInput}
                required
                minLength={3}
                maxLength={100}
                placeholder="Enter task title"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleInput}
                placeholder="Enter task description (optional)"
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        <div className="flex items-center">
                          {p === "HIGHEST" && (
                            <ArrowUp size={14} className="text-red-600 mr-2" />
                          )}
                          {p === "HIGH" && (
                            <ArrowUp
                              size={14}
                              className="text-orange-500 mr-2"
                            />
                          )}
                          {p === "MEDIUM" && (
                            <MoreHorizontal
                              size={14}
                              className="text-yellow-500 mr-2"
                            />
                          )}
                          {p === "LOW" && (
                            <ArrowDown
                              size={14}
                              className="text-blue-500 mr-2"
                            />
                          )}
                          {p === "LOWEST" && (
                            <ArrowDown
                              size={14}
                              className="text-green-500 mr-2"
                            />
                          )}
                          <span>{p.charAt(0) + p.slice(1).toLowerCase()}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="assignee">Assignee</Label>
                <Select
                  value={form.assigneeId || ""}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, assigneeId: value }))
                  }
                >
                  <SelectTrigger id="assignee">
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {projectMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id.toString()}>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                            {member.fullName?.charAt(0) ||
                              member.email?.charAt(0) ||
                              "?"}
                          </div>
                          <span>
                            {member.fullName ||
                              member.email ||
                              "Unknown Member"}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={form.dueDate}
                  onChange={handleInput}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="estimate">Estimate</Label>
                <div className="relative">
                  <Input
                    id="estimate"
                    name="estimate"
                    type="number"
                    min="0"
                    step="0.5"
                    value={form.estimate}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow numbers and one decimal point
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        setForm(prev => ({ ...prev, estimate: value }));
                      }
                    }}
                    placeholder="0.0"
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    h
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? "Creating..." : "Create Task"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Modal for task detail/editing */}
      <Dialog open={showDetail && detailTask} onOpenChange={setShowDetail}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleDetailSave} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="detail-title">Title</Label>
              <Input
                id="detail-title"
                name="title"
                value={detailTask?.title || ""}
                onChange={handleDetailInput}
                required
                minLength={3}
                maxLength={100}
                placeholder="Task title"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="detail-description">Description</Label>
              <Textarea
                id="detail-description"
                name="description"
                value={detailTask?.description || ""}
                onChange={handleDetailInput}
                placeholder="Description (optional)"
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="detail-priority">Priority</Label>
                <Select
                  value={detailTask?.priority || "MEDIUM"}
                  onValueChange={(value) =>
                    setDetailTask((prev) => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger id="detail-priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        <div className="flex items-center">
                          {p === "HIGHEST" && (
                            <ArrowUp size={14} className="text-red-600 mr-2" />
                          )}
                          {p === "HIGH" && (
                            <ArrowUp
                              size={14}
                              className="text-orange-500 mr-2"
                            />
                          )}
                          {p === "MEDIUM" && (
                            <MoreHorizontal
                              size={14}
                              className="text-yellow-500 mr-2"
                            />
                          )}
                          {p === "LOW" && (
                            <ArrowDown
                              size={14}
                              className="text-blue-500 mr-2"
                            />
                          )}
                          {p === "LOWEST" && (
                            <ArrowDown
                              size={14}
                              className="text-green-500 mr-2"
                            />
                          )}
                          <span>{p.charAt(0) + p.slice(1).toLowerCase()}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="detail-status">Status</Label>
                <Select
                  value={detailTask?.status || "BACKLOG"}
                  onValueChange={(value) =>
                    setDetailTask((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger id="detail-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="detail-assignee">Assignee</Label>
                <Select
                  value={detailTask?.assigneeId?.toString() || ""}
                  onValueChange={(value) =>
                    setDetailTask((prev) => ({ ...prev, assigneeId: value }))
                  }
                >
                  <SelectTrigger id="detail-assignee">
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {projectMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id.toString()}>
                        <div className="flex items-center gap-2">
                          <span>
                            {member.firstName ||
                              member.email ||
                              "Unknown Member"}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="detail-dueDate">Due Date</Label>
                <Input
                  id="detail-dueDate"
                  name="dueDate"
                  type="date"
                  value={detailTask?.dueDate || ""}
                  onChange={handleDetailInput}
                />
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDetail(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>

          {/* Comments Section */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Comments</h3>
            <form onSubmit={handleAddComment} className="flex gap-2 mb-2">
              <Input
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Add a comment..."
                disabled={commenting}
              />
              <Button
                type="submit"
                disabled={commenting || !commentInput.trim()}
              >
                {commenting ? "Adding..." : "Add"}
              </Button>
            </form>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {comments.length === 0 ? (
                <div className="text-muted-foreground text-sm">
                  No comments yet.
                </div>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="bg-muted rounded p-2 text-sm">
                    <div className="font-semibold">
                      {c.author || c.createdBy}
                    </div>
                    <div>{c.content}</div>
                    <div className="text-xs text-muted-foreground">
                      {c.createdAt?.split("T")[0]}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Activity Section */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Activity</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {activity.length === 0 ? (
                <div className="text-muted-foreground text-sm">
                  No activity yet.
                </div>
              ) : (
                activity.map((a) => (
                  <div key={a.id} className="bg-muted rounded p-2 text-sm">
                    <div className="font-semibold">{a.actor}</div>
                    <div>{a.description}</div>
                    <div className="text-xs text-muted-foreground">
                      {a.createdAt?.split("T")[0]}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default BoardTab;
