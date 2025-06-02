import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select } from "./ui/select";
import { useSelector } from "react-redux";
import apiHandler from "../functions/apiHandler";
import { showToast } from "../utils/toast";
// import { selectUser } from "@/redux/features/user/userSlice";

const ROLES = ["PM", "DEVELOPER"];

function InviteUserModal({ open, onClose }) {
  const user = useSelector((state) => state.user.user);
  const [role, setRole] = useState("DEVELOPER");
  const [email, setEmail] = useState("");
  const [projects, setProjects] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [workspaceId, setWorkspaceId] = useState(user?.workspaceId || null);

  // Fetch projects for the workspace
  useEffect(() => {
    if (open && workspaceId && role === "DEVELOPER") {
      apiHandler({ url: `api/projects?workspaceId=${workspaceId}` }).then((res) => {
        if (res.success) setProjects(res.data.content || res.data);
      });
    }
  }, [open, workspaceId, role]);

  useEffect(() => {
    if (!open) {
      setRole("DEVELOPER");
      setEmail("");
      setSelectedProjects([]);
    }
  }, [open]);

  if (!open) return null;

  const isAdmin = user?.role === "ADMIN";
  const isPM = user?.role === "PM";

  const handleInvite = async () => {
    setLoading(true);
    const payload = {
      email,
      role,
      workspaceId,
      invitedById: user?.id,
      projectIds: role === "DEVELOPER" ? selectedProjects : undefined,
    };
    const res = await apiHandler({ url: "api/invites", method: "POST", data: payload });
    setLoading(false);
    if (res.success) {
      showToast.success("Invite sent!");
      onClose();
    } else {
      showToast.error(res.data || "Failed to send invite");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">Invite User</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleInvite();
          }}
        >
          <div className="mb-4">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="invite-role">Role</Label>
            <select
              id="invite-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={isPM}
              className="w-full border rounded p-2 mt-1"
            >
              {ROLES.filter((r) => isAdmin || r === "DEVELOPER").map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          {role === "DEVELOPER" && (
            <div className="mb-4">
              <Label>Projects</Label>
              <select
                multiple
                value={selectedProjects}
                onChange={(e) =>
                  setSelectedProjects(
                    Array.from(e.target.selectedOptions, (opt) => opt.value)
                  )
                }
                className="w-full border rounded p-2 mt-1"
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>{loading ? "Sending..." : "Send Invite"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InviteUserModal; 