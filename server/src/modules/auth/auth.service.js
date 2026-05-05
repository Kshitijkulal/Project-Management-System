import prisma from "../../config/prisma.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import ApiError from "../../utils/apiError.js";
import { otpStore, generateOTP } from "../../utils/otp.util.js";
import { sendEmail } from "../../utils/email.util.js";


const OTP_TTL = 5 * 60 * 1000;

function stripPassword(user) {
  const { password, ...safe } = user;
  return safe;
}

export const sendOtpService = async (email) => {
  if (!email) throw new ApiError(400, "Email required");

  const existing = otpStore.get(email);
  if (existing && existing.expiresAt > Date.now()) {
    throw new ApiError(429, "OTP already sent");
  }

  const otp = generateOTP();

  otpStore.set(email, {
    otp,
    expiresAt: Date.now() + OTP_TTL
  });

  await sendEmail(
  email,
  "Your OTP Code",
  `Your OTP is ${otp}. It will expire in 5 minutes.`
);
};

export const verifyOtpSignupService = async (email, otp, password, name) => {
  if (!email || !otp || !password || !name) {
    throw new ApiError(400, "Missing fields");
  }

  const record = otpStore.get(email);

  if (!record || record.expiresAt < Date.now()) {
    otpStore.delete(email);
    throw new ApiError(400, "Invalid or expired OTP");
  }

  if (record.otp !== otp) {
    throw new ApiError(400, "Invalid OTP");
  }

  otpStore.delete(email);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ApiError(400, "User already exists");

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      name,
    }
  });

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return { user: stripPassword(user), token };
};

export const loginService = async (email, password) => {
  if (!email || !password) {
    throw new ApiError(400, "Missing credentials");
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.password) {
    throw new ApiError(400, "Invalid credentials");
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw new ApiError(400, "Invalid credentials");
  }

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return { user: stripPassword(user), token };
};

export const resetPasswordService = async (email, otp, newPassword) => {
  if (!email || !otp || !newPassword) {
    throw new ApiError(400, "Missing fields");
  }

  const record = otpStore.get(email);

  if (!record || record.expiresAt < Date.now()) {
    otpStore.delete(email);
    throw new ApiError(400, "Invalid or expired OTP");
  }

  if (record.otp !== otp) {
    throw new ApiError(400, "Invalid OTP");
  }

  otpStore.delete(email);

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { email },
    data: { password: hashed }
  });

  return true;
};