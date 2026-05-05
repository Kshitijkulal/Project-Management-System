import express from "express";
import {
  getProjectDashboard,
  getGlobalDashboard
} from "./dashboard.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/project", getProjectDashboard);
router.get("/global", getGlobalDashboard);

export default router;