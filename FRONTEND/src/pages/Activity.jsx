import React, { useEffect, useState } from "react";
import apiHandler from "../functions/apiHandler";
import { Card, CardHeader, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

function Activity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchProjects();
    fetchActivities();
    // eslint-disable-next-line
  }, []);

  const fetchProjects = async () => {
    const res = await apiHandler({ url: "/api/projects" });
    if (res.success) setProjects(res.data.content || res.data);
  };

  const fetchActivities = async (pid) => {
    setLoading(true);
    let url = "/api/activities";
    if (pid) url = `/api/activities/project/${pid}`;
    const res = await apiHandler({ url });
    if (res.success) setActivities(res.data.content || res.data);
    setLoading(false);
  };

  const handleProjectChange = (e) => {
    setProjectId(e.target.value);
    fetchActivities(e.target.value);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Activity Feed</h1>
      <div className="mb-4">
        <Label htmlFor="project">Filter by Project</Label>
        <select
          id="project"
          className="w-full border rounded p-2 mt-1"
          value={projectId}
          onChange={handleProjectChange}
        >
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : activities.length === 0 ? (
        <div className="text-muted-foreground">No activity found.</div>
      ) : (
        <div className="space-y-4">
          {activities.map((a) => (
            <Card key={a.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <span className="font-semibold">{a.actor}</span>
                <span className="text-xs text-muted-foreground">{a.createdAt?.split("T")[0]}</span>
              </CardHeader>
              <CardContent>
                <div className="mb-1">{a.description}</div>
                <div className="text-xs text-muted-foreground">
                  {a.type} {a.taskTitle ? `on ${a.taskTitle}` : ""}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default Activity; 