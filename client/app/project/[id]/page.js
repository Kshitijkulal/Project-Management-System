"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";
import { get, post, patch, del } from "@/lib/api";

function getCurrentUserId() {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.userId || null;
  } catch {
    return null;
  }
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const currentUserId = getCurrentUserId();

  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState(null);

  const [statusFilter, setStatusFilter] = useState("");
  const [overdueFilter, setOverdueFilter] = useState(false);

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");

  const [showMemberForm, setShowMemberForm] = useState(false);
  const [newMemberId, setNewMemberId] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("MEMBER");

  const [selectedTasks, setSelectedTasks] = useState([]);
  const [bulkStatus, setBulkStatus] = useState("TODO");

  const [assignTaskId, setAssignTaskId] = useState(null);
  const [assignUserId, setAssignUserId] = useState("");

  const [actionLoading, setActionLoading] = useState(null);

  const isOwner = currentUserRole === "OWNER";
  const isAdmin = currentUserRole === "ADMIN";
  const canManageMembers = isOwner || isAdmin;
  const canManageTasks = isOwner || isAdmin;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ projectId: id });
      if (statusFilter) query.set("status", statusFilter);
      if (overdueFilter) query.set("overdue", "true");

      const [tasksRes, summaryRes, projectsRes] = await Promise.all([
        get(`/tasks?${query.toString()}`),
        get(`/tasks/summary?projectId=${id}`),
        get("/projects"),
      ]);

      setTasks(tasksRes.data);
      setSummary(summaryRes.data);

      const project = projectsRes.data.find((p) => p.id === id);
      if (project) {
        setMembers(project.members || []);
        const uid = getCurrentUserId();
        const me = (project.members || []).find((m) => m.userId === uid);
        setCurrentUserRole(me ? me.role : null);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, statusFilter, overdueFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleCreateTask(e) {
    e.preventDefault();
    setActionLoading("create-task");
    try {
      const body = { title: taskTitle, projectId: id, assignedTo: taskAssignee };
      if (taskDesc) body.description = taskDesc;
      if (taskDueDate) body.dueDate = new Date(taskDueDate).toISOString();
      await post("/tasks", body);
      toast.success("Task created");
      setTaskTitle("");
      setTaskDesc("");
      setTaskAssignee("");
      setTaskDueDate("");
      setShowTaskForm(false);
      await fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleAddMember(e) {
    e.preventDefault();
    setActionLoading("add-member");
    try {
      await post(`/projects/${id}/members`, { userId: newMemberId, role: newMemberRole });
      toast.success("Member added");
      setNewMemberId("");
      setNewMemberRole("MEMBER");
      setShowMemberForm(false);
      await fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRemoveMember(userId) {
    setActionLoading(`remove-${userId}`);
    try {
      await del(`/projects/${id}/members/${userId}`);
      toast.success("Member removed");
      await fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleUpdateRole(userId, newRole) {
    if (!["ADMIN", "MEMBER"].includes(newRole)) return;
    const prev = members.find((m) => m.userId === userId)?.role;
    setMembers((s) => s.map((m) => (m.userId === userId ? { ...m, role: newRole } : m)));
    setActionLoading(`role-${userId}`);
    try {
      await patch(`/projects/${id}/members/${userId}`, { role: newRole });
      toast.success("Role updated");
      await fetchData();
    } catch (err) {
      toast.error(err.message);
      setMembers((s) => s.map((m) => (m.userId === userId ? { ...m, role: prev } : m)));
    } finally {
      setActionLoading(null);
    }
  }

  async function handleTaskAction(taskId, action, label) {
    setActionLoading(`task-${taskId}`);
    try {
      await patch(`/tasks/${taskId}/${action}`);
      toast.success(label);
      await fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleAssignTask(e) {
    e.preventDefault();
    setActionLoading(`assign-${assignTaskId}`);
    try {
      await patch(`/tasks/${assignTaskId}/assign`, { userId: assignUserId });
      toast.success("Task reassigned");
      setAssignTaskId(null);
      setAssignUserId("");
      await fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDeleteTask(taskId) {
    setActionLoading(`del-${taskId}`);
    try {
      await del(`/tasks/${taskId}`);
      toast.success("Task deleted");
      await fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleBulkUpdate() {
    setActionLoading("bulk");
    try {
      await patch("/tasks/bulk/status", { taskIds: selectedTasks, status: bulkStatus });
      toast.success("Tasks updated");
      setSelectedTasks([]);
      await fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  function toggleTaskSelect(taskId) {
    setSelectedTasks((prev) =>
      prev.includes(taskId) ? prev.filter((t) => t !== taskId) : [...prev, taskId]
    );
  }

  function getMemberDisplay(member) {
    return member.user?.name || member.user?.email || member.userId;
  }

  function getAssigneeName(task) {
    return task.assignee?.name || task.assignee?.email || task.assignedTo;
  }

  function canActOnTask(task) {
    return task.assignedTo === currentUserId || isOwner || isAdmin;
  }

  const statusColors = {
    TODO: "bg-gray-700 text-gray-300",
    IN_PROGRESS: "bg-yellow-900 text-yellow-300",
    DONE: "bg-green-900 text-green-300",
  };

  const summaryCards = summary
    ? [
        { label: "Total", value: summary.total, color: "text-gray-100" },
        { label: "To Do", value: summary.todo, color: "text-gray-100" },
        { label: "In Progress", value: summary.inProgress, color: "text-yellow-400" },
        { label: "Done", value: summary.done, color: "text-green-400" },
        { label: "Overdue", value: summary.overdue, color: "text-red-400" },
      ]
    : [];

  return (
    <AuthGuard>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold mb-5">Project Detail</h1>

        {loading && <p className="text-sm text-gray-400">Loading...</p>}

        {summary && (
          <div className="grid grid-cols-5 gap-3 mb-6">
            {summaryCards.map((card) => (
              <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400">{card.label}</p>
                <p className={`text-lg font-bold mt-1 ${card.color}`}>{card.value}</p>
              </div>
            ))}
          </div>
        )}

        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Members</h2>
            {canManageMembers && (
              <button
                id="toggle-member-form"
                onClick={() => setShowMemberForm(!showMemberForm)}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-500 transition-colors"
              >
                {showMemberForm ? "Cancel" : "Add Member"}
              </button>
            )}
          </div>

          {showMemberForm && (
            <form onSubmit={handleAddMember} className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-3 flex flex-col gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">User ID</label>
                <input
                  id="member-user-id"
                  type="text"
                  value={newMemberId}
                  onChange={(e) => setNewMemberId(e.target.value)}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                <select
                  id="member-role"
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100"
                >
                  <option value="MEMBER">MEMBER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <button
                id="add-member-submit"
                type="submit"
                disabled={actionLoading === "add-member"}
                className="self-start px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-500 disabled:opacity-50 transition-colors"
              >
                {actionLoading === "add-member" ? "Adding..." : "Add"}
              </button>
            </form>
          )}

          <div className="bg-gray-900 border border-gray-800 rounded-lg divide-y divide-gray-800">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{getMemberDisplay(member)}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300">{member.role}</span>
                </div>
                {isOwner && member.role !== "OWNER" && (
                  <div className="flex items-center gap-2">
                    <select
                      value={member.role}
                      onChange={(e) => handleUpdateRole(member.userId, e.target.value)}
                      disabled={actionLoading === `role-${member.userId}`}
                      className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-100"
                    >
                      <option value="MEMBER">MEMBER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                    <button
                      onClick={() => handleRemoveMember(member.userId)}
                      disabled={actionLoading === `remove-${member.userId}`}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      {actionLoading === `remove-${member.userId}` ? "..." : "Remove"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Tasks</h2>
            {canManageTasks && (
              <button
                id="toggle-task-form"
                onClick={() => setShowTaskForm(!showTaskForm)}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-500 transition-colors"
              >
                {showTaskForm ? "Cancel" : "New Task"}
              </button>
            )}
          </div>

          {showTaskForm && (
            <form onSubmit={handleCreateTask} className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-3 flex flex-col gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                <input id="task-title" type="text" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} required className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <input id="task-description" type="text" value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Assign To</label>
                <select id="task-assignee" value={taskAssignee} onChange={(e) => setTaskAssignee(e.target.value)} required className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100">
                  <option value="">Select member</option>
                  {members.map((m) => (
                    <option key={m.userId} value={m.userId}>{getMemberDisplay(m)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Due Date</label>
                <input id="task-due-date" type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100" />
              </div>
              <button id="create-task-submit" type="submit" disabled={actionLoading === "create-task"} className="self-start px-4 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-500 disabled:opacity-50 transition-colors">
                {actionLoading === "create-task" ? "Creating..." : "Create Task"}
              </button>
            </form>
          )}

          <div className="flex items-center gap-3 mb-3">
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-100"
            >
              <option value="">All Status</option>
              <option value="TODO">TODO</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="DONE">DONE</option>
            </select>
            <label className="flex items-center gap-1.5 text-sm text-gray-300">
              <input id="overdue-filter" type="checkbox" checked={overdueFilter} onChange={(e) => setOverdueFilter(e.target.checked)} className="rounded" />
              Overdue only
            </label>
          </div>

          {canManageTasks && selectedTasks.length > 0 && (
            <div className="flex items-center gap-3 mb-3 bg-gray-900 border border-gray-800 rounded-lg px-4 py-2">
              <span className="text-sm text-gray-300">{selectedTasks.length} selected</span>
              <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-100">
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="DONE">DONE</option>
              </select>
              <button
                id="bulk-update-submit"
                onClick={handleBulkUpdate}
                disabled={actionLoading === "bulk"}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-500 disabled:opacity-50 transition-colors"
              >
                {actionLoading === "bulk" ? "Updating..." : "Update"}
              </button>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {tasks.map((task) => (
              <div key={task.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  {canManageTasks && (
                    <input
                      type="checkbox"
                      checked={selectedTasks.includes(task.id)}
                      onChange={() => toggleTaskSelect(task.id)}
                      className="mt-1 rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{task.title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded ${statusColors[task.status] || "bg-gray-700 text-gray-300"}`}>
                        {task.status}
                      </span>
                    </div>
                    {task.description && <p className="text-xs text-gray-400 mt-1">{task.description}</p>}
                    <div className="flex gap-3 mt-2 text-xs text-gray-500">
                      <span>Assigned: {getAssigneeName(task)}</span>
                      {task.dueDate && <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                    </div>

                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      {canActOnTask(task) && task.status === "TODO" && (
                        <button
                          onClick={() => handleTaskAction(task.id, "start", "Task started")}
                          disabled={actionLoading === `task-${task.id}`}
                          className="text-xs px-2 py-1 rounded bg-yellow-900 text-yellow-300 hover:bg-yellow-800 disabled:opacity-50 transition-colors"
                        >
                          Start
                        </button>
                      )}
                      {canActOnTask(task) && task.status === "IN_PROGRESS" && (
                        <button
                          onClick={() => handleTaskAction(task.id, "complete", "Task completed")}
                          disabled={actionLoading === `task-${task.id}`}
                          className="text-xs px-2 py-1 rounded bg-green-900 text-green-300 hover:bg-green-800 disabled:opacity-50 transition-colors"
                        >
                          Complete
                        </button>
                      )}
                      {canManageTasks && task.status === "DONE" && (
                        <button
                          onClick={() => handleTaskAction(task.id, "reopen", "Task reopened")}
                          disabled={actionLoading === `task-${task.id}`}
                          className="text-xs px-2 py-1 rounded bg-blue-900 text-blue-300 hover:bg-blue-800 disabled:opacity-50 transition-colors"
                        >
                          Reopen
                        </button>
                      )}
                      {canManageTasks && assignTaskId !== task.id && (
                        <button
                          onClick={() => setAssignTaskId(task.id)}
                          className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
                        >
                          Reassign
                        </button>
                      )}
                      {assignTaskId === task.id && (
                        <form onSubmit={handleAssignTask} className="flex items-center gap-1">
                          <select
                            id="assign-user-select"
                            value={assignUserId}
                            onChange={(e) => setAssignUserId(e.target.value)}
                            required
                            className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-100"
                          >
                            <option value="">Select</option>
                            {members.map((m) => (
                              <option key={m.userId} value={m.userId}>{getMemberDisplay(m)}</option>
                            ))}
                          </select>
                          <button type="submit" disabled={actionLoading === `assign-${task.id}`} className="text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 transition-colors">
                            Save
                          </button>
                          <button type="button" onClick={() => { setAssignTaskId(null); setAssignUserId(""); }} className="text-xs text-gray-400 hover:text-gray-200">
                            Cancel
                          </button>
                        </form>
                      )}
                      {canManageTasks && (
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          disabled={actionLoading === `del-${task.id}`}
                          className="text-xs px-2 py-1 rounded bg-red-900/50 text-red-400 hover:bg-red-900 disabled:opacity-50 transition-colors"
                        >
                          {actionLoading === `del-${task.id}` ? "..." : "Delete"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!loading && tasks.length === 0 && (
            <p className="text-sm text-gray-500 mt-3">No tasks found.</p>
          )}
        </section>
      </div>
    </AuthGuard>
  );
}
