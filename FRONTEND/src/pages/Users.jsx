import React, { useEffect, useState } from "react";
import apiHandler from "../functions/apiHandler";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

const ROLES = ["ADMIN", "PM", "DEVELOPER"];

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "DEVELOPER",
  });

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await apiHandler({ url: "/api/users" });
    if (res.success) setUsers(res.data.content || res.data);
    setLoading(false);
  };

  const handleInput = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    const res = await apiHandler({
      url: "/api/users",
      method: "POST",
      data: {
        username: form.username,
        email: form.email,
        password: form.password,
        roles: [form.role],
      },
    });
    setCreating(false);
    if (res.success) {
      setShowModal(false);
      setForm({ username: "", email: "", password: "", role: "DEVELOPER" });
      fetchUsers();
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Users</h1>
        <Button onClick={() => setShowModal(true)}>+ Invite User</Button>
      </div>
      <div className="mb-4 flex gap-2">
        <Input
          placeholder="Search by username or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-muted-foreground">No users found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardHeader>
                <CardTitle>{user.username}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground mb-1">
                  Email: {user.email}
                </div>
                <div className="text-xs text-muted-foreground mb-1">
                  Roles: {user.roles?.join(", ")}
                </div>
                <div className="text-xs text-muted-foreground mb-1">
                  Status: {user.enabled ? "Enabled" : "Disabled"}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {/* Modal for inviting user */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Invite User</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={form.username}
                  onChange={handleInput}
                  required
                  minLength={3}
                  maxLength={50}
                  placeholder="Username"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleInput}
                  required
                  placeholder="Email"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleInput}
                  required
                  minLength={8}
                  placeholder="Password"
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  name="role"
                  className="w-full border rounded p-2 mt-1"
                  value={form.role}
                  onChange={handleInput}
                  required
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating ? "Inviting..." : "Invite"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users; 