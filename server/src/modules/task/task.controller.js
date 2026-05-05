import asyncHandler from "../../utils/asyncHandler.js";
import {
  createTaskService,
  getTasksAdvancedService,
  startTaskService,
  completeTaskService,
  reopenTaskService,
  assignTaskService,
  bulkUpdateStatusService,
  deleteTaskService,
  getTaskSummaryService
} from "./task.service.js";

export const createTask = asyncHandler(async (req, res) => {
  const task = await createTaskService(req.user.userId, req.body);
  res.json({ success: true, message: "Task created", data: task });
});

export const getTasks = asyncHandler(async (req, res) => {
  const tasks = await getTasksAdvancedService(req.user.userId, req.query);
  res.json({ success: true, message: "Tasks fetched", data: tasks });
});

export const startTask = asyncHandler(async (req, res) => {
  const task = await startTaskService(req.user.userId, req.params.taskId);
  res.json({ success: true, message: "Task started", data: task });
});

export const completeTask = asyncHandler(async (req, res) => {
  const task = await completeTaskService(req.user.userId, req.params.taskId);
  res.json({ success: true, message: "Task completed", data: task });
});

export const reopenTask = asyncHandler(async (req, res) => {
  const task = await reopenTaskService(req.user.userId, req.params.taskId);
  res.json({ success: true, message: "Task reopened", data: task });
});

export const assignTask = asyncHandler(async (req, res) => {
  const task = await assignTaskService(
    req.user.userId,
    req.params.taskId,
    req.body.userId
  );
  res.json({ success: true, message: "Task assigned", data: task });
});

export const bulkUpdateStatus = asyncHandler(async (req, res) => {
  const result = await bulkUpdateStatusService(
    req.user.userId,
    req.body.taskIds,
    req.body.status
  );
  res.json({ success: true, message: "Tasks updated", data: result });
});

export const deleteTask = asyncHandler(async (req, res) => {
  await deleteTaskService(req.user.userId, req.params.taskId);
  res.json({ success: true, message: "Task deleted", data: null });
});

export const getTaskSummary = asyncHandler(async (req, res) => {
  const summary = await getTaskSummaryService(
    req.user.userId,
    req.query.projectId
  );
  res.json({ success: true, message: "Task summary fetched", data: summary });
});