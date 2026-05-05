import express from "express";

import authRoutes from "../modules/auth/auth.routes.js";
import projectRoutes from "../modules/project/project.routes.js";
import taskRoutes from "../modules/task/task.routes.js";
import dashboardRoutes from "../modules/dashboard/dashboard.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/projects", projectRoutes);
router.use("/tasks", taskRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;