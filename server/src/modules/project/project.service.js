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

export const createProjectService = async (userId, data) => {
  if (!data.name) {
    throw new ApiError(400, "Project name required");
  }

  return prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      createdBy: userId,
      members: {
        create: {
          userId,
          role: "OWNER"
        }
      }
    }
  });
};

export const addMemberService = async (userId, projectId, newUserId, role) => {
  const membership = await prisma.projectMember.findFirst({
    where: { userId, projectId }
  });

  if (!membership) throw new ApiError(403, "Not part of project");

  checkPermission(membership.role, PERMISSIONS.ADD_MEMBER);

  const existing = await prisma.projectMember.findFirst({
    where: { userId: newUserId, projectId }
  });

  if (existing) {
    throw new ApiError(400, "User already in project");
  }

  const userExists = await prisma.user.findUnique({
    where: { id: newUserId }
  });

  if (!userExists) {
    throw new ApiError(404, "User not found");
  }

  return prisma.projectMember.create({
    data: {
      userId: newUserId,
      projectId,
      role
    }
  });
};

export const getProjectsService = async (userId) => {
  return prisma.project.findMany({
    where: {
      ...notDeleted,
      members: {
        some: {
          userId
        }
      }
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }
    }
  });
};

export const removeMemberService = async (userId, projectId, targetUserId) => {
  const membership = await prisma.projectMember.findFirst({
    where: { userId, projectId }
  });

  if (!membership) throw new ApiError(403, "Not part of project");

  if (membership.role !== "OWNER") {
    throw new ApiError(403, "Only owner can remove members");
  }

  if (userId === targetUserId) {
    throw new ApiError(400, "Owner cannot remove themselves");
  }

  const target = await prisma.projectMember.findFirst({
    where: { userId: targetUserId, projectId }
  });

  if (!target) {
    throw new ApiError(404, "Member not found");
  }

  if (target.role === "OWNER") {
    throw new ApiError(400, "Cannot remove an owner");
  }

  return prisma.projectMember.delete({
    where: {
      id: target.id
    }
  });
};

const ALLOWED_ROLES = ["ADMIN", "MEMBER"];

export const updateMemberRoleService = async (
  userId,
  projectId,
  targetUserId,
  newRole
) => {
  if (!newRole || !ALLOWED_ROLES.includes(newRole)) {
    throw new ApiError(400, "Invalid role. Allowed: ADMIN, MEMBER");
  }

  const membership = await prisma.projectMember.findFirst({
    where: { userId, projectId }
  });

  if (!membership) throw new ApiError(403, "Not part of project");

  if (membership.role !== "OWNER") {
    throw new ApiError(403, "Only owner can update roles");
  }

  if (userId === targetUserId) {
    throw new ApiError(400, "Owner role cannot be changed");
  }

  const target = await prisma.projectMember.findFirst({
    where: { userId: targetUserId, projectId }
  });

  if (!target) {
    throw new ApiError(404, "Member not found");
  }

  if (target.role === "OWNER") {
    throw new ApiError(400, "Cannot change the role of an owner");
  }

  return prisma.projectMember.update({
    where: { id: target.id },
    data: {
      role: newRole
    }
  });
};