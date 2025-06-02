import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiHandler from "../functions/apiHandler";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";

function SettingsTab() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const [memberInput, setMemberInput] = useState("");
  const [memberLoading, setMemberLoading] = useState(false);

  useEffect(() => {
    if (projectId) fetchProject();
    // eslint-disable-next-line
  }, [projectId]);

  const fetchProject = async () => {
    setLoading(true);
    const res = await apiHandler({ url: `/api/projects/${projectId}` });
    if (res.success) {
      setProject(res.data);
      setEditForm({ name: res.data.name, description: res.data.description });
    }
    setLoading(false);
  };

  const handleEditInput = (e) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setEditing(true);
    const res = await apiHandler({
      url: `/api/projects/${projectId}`,
      method: "PATCH",
      data: {
        name: editForm.name,
        description: editForm.description,
      },
    });
    setEditing(false);
    if (res.success) {
      fetchProject();
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberInput.trim()) return;
    setMemberLoading(true);
    const res = await apiHandler({
      url: `/api/projects/${projectId}/members`,
      method: "POST",
      data: { username: memberInput },
    });
    setMemberLoading(false);
    if (res.success) {
      setMemberInput("");
      fetchProject();
    }
  };

  const handleRemoveMember = async (userId) => {
    setMemberLoading(true);
    const res = await apiHandler({
      url: `/api/projects/${projectId}/members/${userId}`,
      method: "DELETE",
    });
    setMemberLoading(false);
    if (res.success) {
      fetchProject();
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Project Settings</h2>
      {loading || !project ? (
        <div>Loading...</div>
      ) : (
        <>
          <form onSubmit={handleEditSave} className="space-y-4 mb-6">
            <div>
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                name="name"
                value={editForm.name}
                onChange={handleEditInput}
                required
                minLength={3}
                maxLength={50}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                value={editForm.description}
                onChange={handleEditInput}
                placeholder="Description (optional)"
              />
            </div>
            <Button type="submit" disabled={editing}>
              {editing ? "Saving..." : "Save Changes"}
            </Button>
          </form>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Members</h3>
            <form onSubmit={handleAddMember} className="flex gap-2 mb-2">
              <Input
                value={memberInput}
                onChange={(e) => setMemberInput(e.target.value)}
                placeholder="Add member by username"
                disabled={memberLoading}
              />
              <Button type="submit" disabled={memberLoading || !memberInput.trim()}>
                {memberLoading ? "Adding..." : "Add"}
              </Button>
            </form>
            <div className="space-y-2">
              {project.members && project.members.length === 0 ? (
                <div className="text-muted-foreground text-sm">No members yet.</div>
              ) : (
                project.members.map((m) => (
                  <div key={m.id} className="flex items-center justify-between bg-muted rounded p-2 text-sm">
                    <span>{m.username}</span>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveMember(m.id)}
                      disabled={memberLoading}
                    >
                      Remove
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default SettingsTab; 