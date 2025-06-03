import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiHandler from "../functions/apiHandler";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { showToast } from "../utils/toast";

function SprintsTab() {
  const { projectId } = useParams();
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    goal: "",
    startDate: "",
    endDate: "",
    capacity: 0,
    status: "PLANNED",
    description: "",
  });
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [currentSprintId, setCurrentSprintId] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (projectId) fetchSprints();
    // eslint-disable-next-line
  }, [projectId]);

  const fetchSprints = async () => {
    setLoading(true);
    const res = await apiHandler({ url: `sprints/project/${projectId}` });
    if (res.success) setSprints(res.data);
    setLoading(false);
  };

  const handleInput = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear validation errors when user changes input
    if (validationErrors[e.target.name]) {
      setValidationErrors((prev) => ({ ...prev, [e.target.name]: null }));
    }
  };

  const handleSelectInput = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear validation errors when user changes input
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // Required fields validation
    if (!form.name.trim()) errors.name = "Name is required";
    if (!form.startDate) errors.startDate = "Start date is required";
    if (!form.endDate) errors.endDate = "End date is required";

    // End date must be after start date
    if (
      form.startDate &&
      form.endDate &&
      new Date(form.endDate) <= new Date(form.startDate)
    ) {
      errors.endDate = "End date must be after start date";
    }

    // If ACTIVE is selected, validate additional conditions
    if (form.status === "ACTIVE") {
      // Check if start date is today or in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = new Date(form.startDate);
      startDate.setHours(0, 0, 0, 0);

      if (startDate > today) {
        errors.startDate =
          "Active sprint must have start date today or in the past";
      }

      // Check if there's already an active sprint (only for creation, not edit)
      if (
        !currentSprintId &&
        sprints.some((sprint) => sprint.status === "ACTIVE")
      ) {
        errors.status = "Project already has an active sprint";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setCreating(true);
    const res = await apiHandler({
      url: "sprints",
      method: "POST",
      data: {
        name: form.name,
        goal: form.goal,
        startDate: form.startDate,
        endDate: form.endDate,
        capacity: Number(form.capacity),
        projectId,
        status: form.status,
        description: form.description,
      },
    });
    setCreating(false);
    if (res.success) {
      setShowModal(false);
      setForm({
        name: "",
        goal: "",
        startDate: "",
        endDate: "",
        capacity: 0,
        status: "PLANNED",
        description: "",
      });
      fetchSprints();
      showToast.success("Sprint created successfully");
    }
  };

  const handleEdit = (sprint) => {
    setCurrentSprintId(sprint.id);
    setForm({
      name: sprint.name,
      goal: sprint.goal || "",
      startDate: sprint.startDate,
      endDate: sprint.endDate,
      capacity: sprint.capacity,
      status: sprint.status,
      description: sprint.description || "",
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setUpdating(true);
    const res = await apiHandler({
      url: `sprints/${currentSprintId}`,
      method: "PUT",
      data: {
        name: form.name,
        goal: form.goal,
        startDate: form.startDate,
        endDate: form.endDate,
        capacity: Number(form.capacity),
        status: form.status,
        description: form.description,
        projectId: Number(projectId),
      },
    });
    setUpdating(false);
    if (res.success) {
      setShowEditModal(false);
      setCurrentSprintId(null);
      setForm({
        name: "",
        goal: "",
        startDate: "",
        endDate: "",
        capacity: 0,
        status: "PLANNED",
        description: "",
      });
      fetchSprints();
      showToast.success("Sprint updated successfully");
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
        <div className="text-muted-foreground">
          No sprints found for this project.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sprints.map((sprint) => {
            // Determine if this sprint is active
            const isActive = sprint.status === "ACTIVE";
            const isPending =
              sprint.status === "PENDING" || sprint.status === "PLANNED";
            const isCompleted = sprint.status === "COMPLETED";

            // Calculate sprint progress (days remaining)
            const startDate = new Date(sprint.startDate);
            const endDate = new Date(sprint.endDate);
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
              <Card
                key={sprint.id}
                className={`hover:shadow-md transition ${
                  isActive ? "border-2 border-primary" : ""
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{sprint.name}</CardTitle>
                      <CardDescription>{sprint.goal}</CardDescription>
                    </div>
                    {isActive && (
                      <div className="px-2 py-1 bg-primary/20 text-primary text-xs font-medium rounded-full">
                        Active
                      </div>
                    )}
                    {isPending && (
                      <div className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                        Planned
                      </div>
                    )}
                    {isCompleted && (
                      <div className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Completed
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground mb-2">
                    {sprint.startDate} to {sprint.endDate}
                  </div>
                  {isActive && (
                    <div className="mb-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>{daysElapsed} days elapsed</span>
                        <span>{daysRemaining} days remaining</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mb-2">
                    Capacity: {sprint.capacity}
                  </div>
                  <div className="flex justify-end mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(sprint);
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      {/* Modal for creating sprint */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded-lg shadow-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">Create Sprint</h2>
            <form onSubmit={handleCreate}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleInput}
                    minLength={3}
                    maxLength={50}
                    placeholder="Sprint name"
                    className={validationErrors.name ? "border-red-500" : ""}
                  />
                  {validationErrors.name && (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors.name}
                    </p>
                  )}
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
                    placeholder="Story points or hours"
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
                    className={
                      validationErrors.startDate ? "border-red-500" : ""
                    }
                  />
                  {validationErrors.startDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors.startDate}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={form.endDate}
                    onChange={handleInput}
                    className={validationErrors.endDate ? "border-red-500" : ""}
                  />
                  {validationErrors.endDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors.endDate}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(value) =>
                      handleSelectInput("status", value)
                    }
                  >
                    <SelectTrigger
                      id="status"
                      className={
                        validationErrors.status ? "border-red-500" : ""
                      }
                    >
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PLANNED">Planning</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.status && (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors.status}
                    </p>
                  )}
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
                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleInput}
                    placeholder="Sprint description (optional)"
                    className="min-h-[100px]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowModal(false)}
                >
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

      {/* Modal for editing sprint */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded-lg shadow-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">Edit Sprint</h2>
            <form onSubmit={handleUpdate}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    value={form.name}
                    onChange={handleInput}
                    minLength={3}
                    maxLength={50}
                    placeholder="Sprint name"
                    className={validationErrors.name ? "border-red-500" : ""}
                  />
                  {validationErrors.name && (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors.name}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="edit-capacity">Capacity</Label>
                  <Input
                    id="edit-capacity"
                    name="capacity"
                    type="number"
                    min={0}
                    value={form.capacity}
                    onChange={handleInput}
                    placeholder="Story points or hours"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-startDate">Start Date</Label>
                  <Input
                    id="edit-startDate"
                    name="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={handleInput}
                    className={
                      validationErrors.startDate ? "border-red-500" : ""
                    }
                  />
                  {validationErrors.startDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors.startDate}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="edit-endDate">End Date</Label>
                  <Input
                    id="edit-endDate"
                    name="endDate"
                    type="date"
                    value={form.endDate}
                    onChange={handleInput}
                    className={validationErrors.endDate ? "border-red-500" : ""}
                  />
                  {validationErrors.endDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors.endDate}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(value) =>
                      handleSelectInput("status", value)
                    }
                  >
                    <SelectTrigger
                      id="edit-status"
                      className={
                        validationErrors.status ? "border-red-500" : ""
                      }
                    >
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PLANNED">Planning</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      {/* <SelectItem value="CLOSED">Closed</SelectItem> */}
                    </SelectContent>
                  </Select>
                  {validationErrors.status && (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors.status}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="edit-goal">Goal</Label>
                  <Input
                    id="edit-goal"
                    name="goal"
                    value={form.goal}
                    onChange={handleInput}
                    placeholder="Sprint goal (optional)"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    name="description"
                    value={form.description}
                    onChange={handleInput}
                    placeholder="Sprint description (optional)"
                    className="min-h-[100px]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowEditModal(false);
                    setCurrentSprintId(null);
                    setValidationErrors({});
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updating}>
                  {updating ? "Updating..." : "Save Changes"}
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
