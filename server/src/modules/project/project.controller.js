import asyncHandler from "../../utils/asyncHandler.js";
import {
  createProjectService,
  addMemberService,
  getProjectsService,
  removeMemberService,
  updateMemberRoleService
} from "./project.service.js";

export const createProject = asyncHandler(async (req, res) => {
  const project = await createProjectService(req.user.userId, req.body);

  res.json({
    success: true,
    message: "Project created",
    data: project
  });
});

export const addMember = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { userId, role } = req.body;

  const member = await addMemberService(
    req.user.userId,
    projectId,
    userId,
    role
  );

  res.json({
    success: true,
    message: "Member added",
    data: member
  });
});

export const getProjects = asyncHandler(async (req, res) => {
  const projects = await getProjectsService(req.user.userId);

  res.json({
    success: true,
    message: "Projects fetched",
    data: projects
  });
});

export const removeMember = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;

  await removeMemberService(req.user.userId, projectId, userId);

  res.json({
    success: true,
    message: "Member removed",
    data: null
  });
});

export const updateMemberRole = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;
  const { role } = req.body;

  const member = await updateMemberRoleService(
    req.user.userId,
    projectId,
    userId,
    role
  );

  res.json({
    success: true,
    message: "Member role updated",
    data: member
  });
});