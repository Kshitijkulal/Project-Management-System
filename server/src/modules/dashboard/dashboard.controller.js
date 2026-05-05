import asyncHandler from "../../utils/asyncHandler.js";
import {
  getProjectDashboardService,
  getGlobalDashboardService
} from "./dashboard.service.js";

export const getProjectDashboard = asyncHandler(async (req, res) => {
  const { projectId } = req.query;

  const data = await getProjectDashboardService(
    req.user.userId,
    projectId
  );

  res.json({
    success: true,
    data
  });
});

export const getGlobalDashboard = asyncHandler(async (req, res) => {
  const data = await getGlobalDashboardService(req.user.userId);

  res.json({
    success: true,
    data
  });
});