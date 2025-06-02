import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectUser } from "../redux/features/user/userSlice";
import apiHandler from "../functions/apiHandler";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select } from "../components/ui/select";

function Projects() {
  const user = useSelector(selectUser);
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", key: "" });
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) fetchWorkspaces();
    // eslint-disable-next-line
  }, [user]);

  useEffect(() => {
    if (selectedWorkspace) fetchProjects(selectedWorkspace);
    // eslint-disable-next-line
  }, [selectedWorkspace]);

  const fetchWorkspaces = async () => {
    setLoading(true);
    const res = await apiHandler({ url: `/api/workspaces/user/${user.id}` });
    if (res.success) {
      setWorkspaces(res.data);
      if (res.data.length > 0) setSelectedWorkspace(res.data[0].id);
    }
    setLoading(false);
  };

  const fetchProjects = async (workspaceId) => {
    setLoading(true);
    const res = await apiHandler({ url: `/api/projects?workspaceId=${workspaceId}` });
    if (res.success) setProjects(res.data);
    setLoading(false);
  };

  const handleInput = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    const res = await apiHandler({
      url: "/api/projects",
      method: "POST",
      data: {
        name: form.name,
        description: form.description,
        key: form.key,
        workspaceId: selectedWorkspace,
        memberIds: [user.id],
      },
    });
    setCreating(false);
    if (res.success) {
      setShowModal(false);
      setForm({ name: "", description: "", key: "" });
      fetchProjects(selectedWorkspace);
    }
  };

  const handleCardClick = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Button onClick={() => setShowModal(true)} disabled={!selectedWorkspace || !(user?.role === 'ADMIN' || user?.role === 'PM')}>
          + New Project
        </Button>
      </div>
      {workspaces.length > 1 && (
        <div className="mb-4">
          <Label htmlFor="workspace">Workspace</Label>
          <select
            id="workspace"
            className="w-full border rounded p-2 mt-1"
            value={selectedWorkspace || ""}
            onChange={(e) => setSelectedWorkspace(e.target.value)}
          >
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.id}>
                {ws.name}
              </option>
            ))}
          </select>
        </div>
      )}
      {loading ? (
        <div>Loading...</div>
      ) : projects.length === 0 ? (
        <div className="text-muted-foreground">No projects found for this workspace.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((prj) => (
            <Card key={prj.id} className="cursor-pointer hover:shadow-lg transition" onClick={() => handleCardClick(prj.id)}>
              <CardHeader>
                <CardTitle>{prj.name}</CardTitle>
                <CardDescription>{prj.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground mb-2">
                  Key: {prj.key}
                </div>
                <div className="text-xs text-muted-foreground">
                  Members: {prj.members?.map((m) => m.username).join(", ")}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {/* Modal for creating project */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create Project</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleInput}
                  required
                  minLength={3}
                  maxLength={50}
                  placeholder="Project name"
                />
              </div>
              <div>
                <Label htmlFor="key">Key</Label>
                <Input
                  id="key"
                  name="key"
                  value={form.key}
                  onChange={handleInput}
                  required
                  minLength={2}
                  maxLength={10}
                  pattern="^[A-Z][A-Z0-9]{1,9}$"
                  placeholder="e.g. SPRINT"
                />
                <span className="text-xs text-muted-foreground">2-10 uppercase letters/numbers, start with a letter</span>
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
    </div>
  );
}

export default Projects; 