import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiHandler from "../functions/apiHandler";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

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
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    assignee: "",
    priority: "MEDIUM",
    dueDate: "",
  });
  const [showDetail, setShowDetail] = useState(false);
  const [detailTask, setDetailTask] = useState(null);
  const [saving, setSaving] = useState(false);
  const [comments, setComments] = useState([]);
  const [activity, setActivity] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [commenting, setCommenting] = useState(false);

  useEffect(() => {
    if (projectId) fetchTasks();
    // eslint-disable-next-line
  }, [projectId]);

  const fetchTasks = async () => {
    setLoading(true);
    const res = await apiHandler({ url: `/api/tasks?projectId=${projectId}` });
    if (res.success) setTasks(res.data);
    setLoading(false);
  };

  const fetchComments = async (taskId) => {
    const res = await apiHandler({ url: `/api/comments?taskId=${taskId}` });
    if (res.success) setComments(res.data);
  };

  const fetchActivity = async (taskId) => {
    const res = await apiHandler({ url: `/api/activities/task/${taskId}` });
    if (res.success) setActivity(res.data);
  };

  const onDragStart = (task) => {
    setDraggedTask(task);
  };

  const onDrop = async (status) => {
    if (!draggedTask || draggedTask.status === status) return;
    setTasks((prev) =>
      prev.map((t) => (t.id === draggedTask.id ? { ...t, status } : t))
    );
    await apiHandler({
      url: `/api/tasks/${draggedTask.id}`,
      method: "PATCH",
      data: { status },
    });
    setDraggedTask(null);
  };

  const handleInput = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    const res = await apiHandler({
      url: "/api/tasks",
      method: "POST",
      data: {
        ...form,
        projectId,
        status: "BACKLOG",
      },
    });
    setCreating(false);
    if (res.success) {
      setShowModal(false);
      setForm({ title: "", description: "", assignee: "", priority: "MEDIUM", dueDate: "" });
      fetchTasks();
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
      url: `/api/tasks/${detailTask.id}`,
      method: "PATCH",
      data: {
        title: detailTask.title,
        description: detailTask.description,
        assignee: detailTask.assignee,
        priority: detailTask.priority,
        dueDate: detailTask.dueDate,
        status: detailTask.status,
      },
    });
    setSaving(false);
    if (res.success) {
      setShowDetail(false);
      setDetailTask(null);
      fetchTasks();
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setCommenting(true);
    const res = await apiHandler({
      url: "/api/comments",
      method: "POST",
      data: {
        taskId: detailTask.id,
        content: commentInput,
      },
    });
    setCommenting(false);
    if (res.success) {
      setCommentInput("");
      fetchComments(detailTask.id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Kanban Board</h2>
        <Button onClick={() => setShowModal(true)}>+ New Task</Button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {COLUMNS.map((col) => (
            <div
              key={col.key}
              className="bg-muted rounded-lg p-2 min-h-[300px] flex flex-col"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(col.key)}
            >
              <div className="font-semibold mb-2 text-center">{col.label}</div>
              {tasks
                .filter((t) => t.status === col.key)
                .map((task) => (
                  <Card
                    key={task.id}
                    className="mb-2 cursor-move"
                    draggable
                    onDragStart={() => onDragStart(task)}
                    onClick={() => openDetail(task)}
                  >
                    <CardHeader>
                      <CardTitle className="text-base">{task.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xs text-muted-foreground mb-1">
                        Assignee: {task.assignee}
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">
                        Priority: {task.priority}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Due: {task.dueDate?.split("T")[0]}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ))}
        </div>
      )}
      {/* Modal for creating task */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create Task</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleInput}
                  required
                  minLength={3}
                  maxLength={100}
                  placeholder="Task title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleInput}
                  placeholder="Description (optional)"
                />
              </div>
              <div>
                <Label htmlFor="assignee">Assignee</Label>
                <Input
                  id="assignee"
                  name="assignee"
                  value={form.assignee}
                  onChange={handleInput}
                  placeholder="Assignee username"
                  required
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  name="priority"
                  className="w-full border rounded p-2 mt-1"
                  value={form.priority}
                  onChange={handleInput}
                  required
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={form.dueDate}
                  onChange={handleInput}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal for task detail/editing */}
      {showDetail && detailTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-y-auto">
          <div className="bg-card rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Task Details</h2>
            <form onSubmit={handleDetailSave} className="space-y-4">
              <div>
                <Label htmlFor="detail-title">Title</Label>
                <Input
                  id="detail-title"
                  name="title"
                  value={detailTask.title}
                  onChange={handleDetailInput}
                  required
                  minLength={3}
                  maxLength={100}
                  placeholder="Task title"
                />
              </div>
              <div>
                <Label htmlFor="detail-description">Description</Label>
                <Input
                  id="detail-description"
                  name="description"
                  value={detailTask.description}
                  onChange={handleDetailInput}
                  placeholder="Description (optional)"
                />
              </div>
              <div>
                <Label htmlFor="detail-assignee">Assignee</Label>
                <Input
                  id="detail-assignee"
                  name="assignee"
                  value={detailTask.assignee}
                  onChange={handleDetailInput}
                  placeholder="Assignee username"
                  required
                />
              </div>
              <div>
                <Label htmlFor="detail-priority">Priority</Label>
                <select
                  id="detail-priority"
                  name="priority"
                  className="w-full border rounded p-2 mt-1"
                  value={detailTask.priority}
                  onChange={handleDetailInput}
                  required
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="detail-status">Status</Label>
                <select
                  id="detail-status"
                  name="status"
                  className="w-full border rounded p-2 mt-1"
                  value={detailTask.status}
                  onChange={handleDetailInput}
                  required
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="detail-dueDate">Due Date</Label>
                <Input
                  id="detail-dueDate"
                  name="dueDate"
                  type="date"
                  value={detailTask.dueDate?.split("T")[0] || ""}
                  onChange={handleDetailInput}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setShowDetail(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
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
                <Button type="submit" disabled={commenting || !commentInput.trim()}>
                  {commenting ? "Adding..." : "Add"}
                </Button>
              </form>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {comments.length === 0 ? (
                  <div className="text-muted-foreground text-sm">No comments yet.</div>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="bg-muted rounded p-2 text-sm">
                      <div className="font-semibold">{c.author || c.createdBy}</div>
                      <div>{c.content}</div>
                      <div className="text-xs text-muted-foreground">{c.createdAt?.split("T")[0]}</div>
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
                  <div className="text-muted-foreground text-sm">No activity yet.</div>
                ) : (
                  activity.map((a) => (
                    <div key={a.id} className="bg-muted rounded p-2 text-sm">
                      <div className="font-semibold">{a.actor}</div>
                      <div>{a.description}</div>
                      <div className="text-xs text-muted-foreground">{a.createdAt?.split("T")[0]}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BoardTab; 