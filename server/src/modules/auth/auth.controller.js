import asyncHandler from "../../utils/asyncHandler.js";
import {
  sendOtpService,
  verifyOtpSignupService,
  loginService,
  resetPasswordService
} from "./auth.service.js";

export const sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  await sendOtpService(email);

  res.json({ success: true, message: "OTP sent", data: null });
});

export const signup = asyncHandler(async (req, res) => {
  const { email, name, otp, password } = req.body;

  const result = await verifyOtpSignupService(email, otp, password, name);

  res.json({ success: true, message: "Signup successful", data: result });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await loginService(email, password);

  res.json({ success: true, message: "Login successful", data: result });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  await resetPasswordService(email, otp, newPassword);

  res.json({ success: true, message: "Password reset successful", data: null });
});