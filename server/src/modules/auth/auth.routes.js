import express from "express";
import {
  sendOtp,
  signup,
  login,
  resetPassword
} from "./auth.controller.js";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/signup", signup);
router.post("/login", login);
router.post("/reset-password", resetPassword);

export default router;