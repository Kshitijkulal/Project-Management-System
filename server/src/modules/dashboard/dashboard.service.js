import prisma from "../../config/prisma.js";
import ApiError from "../../utils/apiError.js";

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

export const getProjectDashboardService = async (userId, projectId) => {
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

  const now = new Date();

  const summary = {
    total: tasks.length,
    todo: 0,
    inProgress: 0,
    done: 0,
    overdue: 0
  };

  const userStats = {};

  for (const task of tasks) {
    if (task.status === "TODO") summary.todo++;
    if (task.status === "IN_PROGRESS") summary.inProgress++;
    if (task.status === "DONE") summary.done++;

    if (task.dueDate && task.dueDate < now && task.status !== "DONE") {
      summary.overdue++;
    }

    if (!userStats[task.assignedTo]) {
      userStats[task.assignedTo] = {
        total: 0,
        completed: 0
      };
    }

    userStats[task.assignedTo].total++;

    if (task.status === "DONE") {
      userStats[task.assignedTo].completed++;
    }
  }

  return {
    summary,
    userStats
  };
};

export const getGlobalDashboardService = async (userId) => {
  const memberships = await prisma.projectMember.findMany({
    where: { userId },
    select: { projectId: true }
  });

  const projectIds = memberships.map(m => m.projectId);

  if (projectIds.length === 0) {
    return {
      total: 0,
      todo: 0,
      inProgress: 0,
      done: 0,
      overdue: 0
    };
  }

  const tasks = await prisma.task.findMany({
    where: {
      projectId: { in: projectIds },
      ...notDeleted
    }
  });

  const now = new Date();

  const summary = {
    total: tasks.length,
    todo: 0,
    inProgress: 0,
    done: 0,
    overdue: 0
  };

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