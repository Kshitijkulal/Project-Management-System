import express from "express";
import {
  createProject,
  addMember,
  getProjects,
  removeMember,
  updateMemberRole
} from "./project.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createProject);
router.get("/", getProjects);
router.post("/:projectId/members", addMember);
router.delete("/:projectId/members/:userId", removeMember);
router.patch("/:projectId/members/:userId", updateMemberRole);

export default router;