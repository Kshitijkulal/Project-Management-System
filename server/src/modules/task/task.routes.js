import express from "express";
import {
  createTask,
  getTasks,
  startTask,
  completeTask,
  reopenTask,
  assignTask,
  bulkUpdateStatus,
  deleteTask,
  getTaskSummary
} from "./task.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createTask);
router.get("/", getTasks);

router.patch("/:taskId/start", startTask);
router.patch("/:taskId/complete", completeTask);
router.patch("/:taskId/reopen", reopenTask);

router.patch("/:taskId/assign", assignTask);
router.patch("/bulk/status", bulkUpdateStatus);

router.delete("/:taskId", deleteTask);

router.get("/summary", getTaskSummary);

export default router;