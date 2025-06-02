import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../redux/features/user/userSlice";
import apiHandler from "../functions/apiHandler";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import InviteUserModal from "../components/InviteUserModal";

function Workspaces() {
  const user = useSelector(selectUser);
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [creating, setCreating] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  useEffect(() => {
    if (user?.id) fetchWorkspaces();
    // eslint-disable-next-line
  }, [user]);

  const fetchWorkspaces = async () => {
    setLoading(true);
    const res = await apiHandler({ url: `api/workspaces/user/${user.id}` });
    if (res.success) setWorkspaces(res.data);
    setLoading(false);
  };

  const handleInput = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    const res = await apiHandler({
      url: "api/workspaces",
      method: "POST",
      data: {
        name: form.name,
        description: form.description,
        owner: user.username,
        members: [user.username],
      },
    });
    setCreating(false);
    if (res.success) {
      setShowModal(false);
      setForm({ name: "", description: "" });
      fetchWorkspaces();
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Workspaces</h1>
        <Button onClick={() => setShowModal(true)}>+ New Workspace</Button>
      </div>
      <Button onClick={() => setInviteModalOpen(true)} className="mb-4">Invite User</Button>
      {loading ? (
        <div>Loading...</div>
      ) : workspaces.length === 0 ? (
        <div className="text-muted-foreground">No workspaces found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((ws) => (
            <Card key={ws.id}>
              <CardHeader>
                <CardTitle>{ws.name}</CardTitle>
                <CardDescription>{ws.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground mb-2">
                  Owner: {ws.owner}
                </div>
                <div className="text-xs text-muted-foreground">
                  Members: {ws.members?.join(", ")}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {/* Modal for creating workspace */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create Workspace</h2>
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
                  placeholder="Workspace name"
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
      <InviteUserModal open={inviteModalOpen} onClose={() => setInviteModalOpen(false)} />
    </div>
  );
}

export default Workspaces; 