import prisma from "../../config/prisma.js";
import ApiError from "../../utils/apiError.js";
import { checkPermission } from "../../utils/checkPermission.js";
import { PERMISSIONS } from "../../utils/permissions.js";

const notDeleted = {
  OR: [
    { deletedAt: null },
    { deletedAt: { isSet: false } }
  ]
};

const getMembership = async (userId, projectId) => {
  const membership = await prisma.projectMember.findFirst({
    where: { userId, projectId }
  });

  if (!membership) {
    throw new ApiError(403, "Not part of project");
  }

  return membership;
};

export const createTaskService = async (userId, data) => {
  const { title, projectId, assignedTo, description, dueDate } = data;

  if (!title || !projectId || !assignedTo) {
    throw new ApiError(400, "Missing required fields");
  }

  const membership = await getMembership(userId, projectId);

  checkPermission(membership.role, PERMISSIONS.CREATE_TASK);

  const assigneeMembership = await prisma.projectMember.findFirst({
    where: {
      userId: assignedTo,
      projectId
    }
  });

  if (!assigneeMembership) {
    throw new ApiError(400, "Assignee not part of project");
  }

  return prisma.task.create({
    data: {
      title,
      description,
      projectId,
      assignedTo,
      dueDate: dueDate ? new Date(dueDate) : undefined
    }
  });
};

export const getTasksAdvancedService = async (userId, filters) => {
  const { projectId, status, overdue } = filters;

  if (!projectId) {
    throw new ApiError(400, "Project ID required");
  }

  await getMembership(userId, projectId);

  const where = {
    projectId,
    ...notDeleted
  };

  if (status) {
    where.status = status;
  }

  if (overdue === "true") {
    where.dueDate = { lt: new Date() };
    where.status = { not: "DONE" };
  }

  return prisma.task.findMany({
    where,
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });
};

export const startTaskService = async (userId, taskId) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId }
  });

  if (!task || task.deletedAt) {
    throw new ApiError(404, "Task not found");
  }

  if (task.assignedTo !== userId) {
    const membership = await prisma.projectMember.findFirst({
      where: { userId, projectId: task.projectId }
    });

    if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
      throw new ApiError(403, "Only assignee, owner, or admin can start task");
    }
  }

  if (task.status !== "TODO") {
    throw new ApiError(400, "Task already started");
  }

  return prisma.task.update({
    where: { id: taskId },
    data: { status: "IN_PROGRESS" }
  });
};

export const completeTaskService = async (userId, taskId) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId }
  });

  if (!task || task.deletedAt) {
    throw new ApiError(404, "Task not found");
  }

  if (task.assignedTo !== userId) {
    const membership = await prisma.projectMember.findFirst({
      where: { userId, projectId: task.projectId }
    });

    if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
      throw new ApiError(403, "Only assignee, owner, or admin can complete task");
    }
  }

  if (task.status !== "IN_PROGRESS") {
    throw new ApiError(400, "Task must be in progress");
  }

  return prisma.task.update({
    where: { id: taskId },
    data: { status: "DONE" }
  });
};

export const reopenTaskService = async (userId, taskId) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId }
  });

  if (!task || task.deletedAt) {
    throw new ApiError(404, "Task not found");
  }

  const membership = await getMembership(userId, task.projectId);

  checkPermission(membership.role, PERMISSIONS.UPDATE_TASK);

  return prisma.task.update({
    where: { id: taskId },
    data: { status: "TODO" }
  });
};

export const assignTaskService = async (userId, taskId, newUserId) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId }
  });

  if (!task || task.deletedAt) {
    throw new ApiError(404, "Task not found");
  }

  const membership = await getMembership(userId, task.projectId);

  checkPermission(membership.role, PERMISSIONS.ASSIGN_TASK);

  const targetMembership = await prisma.projectMember.findFirst({
    where: {
      userId: newUserId,
      projectId: task.projectId
    }
  });

  if (!targetMembership) {
    throw new ApiError(400, "User not part of project");
  }

  return prisma.task.update({
    where: { id: taskId },
    data: {
      assignedTo: newUserId
    }
  });
};

export const bulkUpdateStatusService = async (userId, taskIds, status) => {
  if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
    throw new ApiError(400, "Task IDs required");
  }

  if (!status) {
    throw new ApiError(400, "Status required");
  }

  const tasks = await prisma.task.findMany({
    where: { id: { in: taskIds }, ...notDeleted }
  });

  if (tasks.length === 0) {
    throw new ApiError(404, "No tasks found");
  }

  for (const task of tasks) {
    const membership = await getMembership(userId, task.projectId);
    checkPermission(membership.role, PERMISSIONS.UPDATE_TASK);
  }

  return prisma.task.updateMany({
    where: { id: { in: taskIds } },
    data: { status }
  });
};

export const deleteTaskService = async (userId, taskId) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId }
  });

  if (!task || task.deletedAt) {
    throw new ApiError(404, "Task not found");
  }

  const membership = await getMembership(userId, task.projectId);

  checkPermission(membership.role, PERMISSIONS.CREATE_TASK);

  return prisma.task.update({
    where: { id: taskId },
    data: {
      deletedAt: new Date()
    }
  });
};

export const getTaskSummaryService = async (userId, projectId) => {
  if (!projectId) {
    throw new ApiError(400, "Project ID required");
  }

  await getMembership(userId, projectId);

  const tasks = await prisma.task.findMany({
    where: {
      projectId,
      ...notDeleted
    }
  });

  const summary = {
    total: tasks.length,
    todo: 0,
    inProgress: 0,
    done: 0,
    overdue: 0
  };

  const now = new Date();

  for (const task of tasks) {
    if (task.status === "TODO") summary.todo++;
    if (task.status === "IN_PROGRESS") summary.inProgress++;
    if (task.status === "DONE") summary.done++;

    if (task.dueDate && task.dueDate < now && task.status !== "DONE") {
      summary.overdue++;
    }
  }

  return summary;
};