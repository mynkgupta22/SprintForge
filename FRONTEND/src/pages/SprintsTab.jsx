import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiHandler from "../functions/apiHandler";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

function SprintsTab() {
  const { projectId } = useParams();
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", goal: "", startDate: "", endDate: "", capacity: 0 });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (projectId) fetchSprints();
    // eslint-disable-next-line
  }, [projectId]);

  const fetchSprints = async () => {
    setLoading(true);
    const res = await apiHandler({ url: `/api/sprints?projectId=${projectId}` });
    if (res.success) setSprints(res.data);
    setLoading(false);
  };

  const handleInput = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    const res = await apiHandler({
      url: "/api/sprints",
      method: "POST",
      data: {
        name: form.name,
        goal: form.goal,
        startDate: form.startDate,
        endDate: form.endDate,
        capacity: Number(form.capacity),
        projectId,
      },
    });
    setCreating(false);
    if (res.success) {
      setShowModal(false);
      setForm({ name: "", goal: "", startDate: "", endDate: "", capacity: 0 });
      fetchSprints();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Sprints</h2>
        <Button onClick={() => setShowModal(true)}>+ New Sprint</Button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : sprints.length === 0 ? (
        <div className="text-muted-foreground">No sprints found for this project.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sprints.map((sprint) => (
            <Card key={sprint.id}>
              <CardHeader>
                <CardTitle>{sprint.name}</CardTitle>
                <CardDescription>{sprint.goal}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground mb-2">
                  {sprint.startDate} to {sprint.endDate}
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  Capacity: {sprint.capacity}
                </div>
                <div className="text-xs text-muted-foreground">
                  Status: {sprint.status}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {/* Modal for creating sprint */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create Sprint</h2>
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
                  placeholder="Sprint name"
                />
              </div>
              <div>
                <Label htmlFor="goal">Goal</Label>
                <Input
                  id="goal"
                  name="goal"
                  value={form.goal}
                  onChange={handleInput}
                  placeholder="Sprint goal (optional)"
                />
              </div>
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={handleInput}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={handleInput}
                  required
                />
              </div>
              <div>
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  min={0}
                  value={form.capacity}
                  onChange={handleInput}
                  required
                  placeholder="Story points or hours"
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

export default SprintsTab; 