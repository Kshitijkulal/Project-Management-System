"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { post } from "@/lib/api";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSendOtp(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await post("/auth/send-otp", { email });
      toast.success("OTP sent");
      setStep(2);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await post("/auth/reset-password", { email, otp, newPassword });
      toast.success("Password reset successful");
      setDone(true);
    } catch (err) {
      toast.error(err.message);
      if (err.message?.toLowerCase().includes("otp")) {
        setOtp("");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-sm p-6 bg-gray-900 border border-gray-800 rounded-lg">
        <h1 className="text-xl font-bold mb-4">Reset Password</h1>

        {done && (
          <div className="text-sm space-y-3">
            <p className="text-green-400">Password reset successful. You can now log in.</p>
            <Link href="/login" className="text-blue-400 hover:underline">Back to login →</Link>
          </div>
        )}

        {!done && step === 1 && (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              id="reset-send-otp"
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-500 disabled:opacity-50 transition-colors"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {!done && step === 2 && (
          <form onSubmit={handleReset} className="flex flex-col gap-3">
            <p className="text-sm text-gray-400">
              Code sent to <span className="text-gray-200">{email}</span>.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">OTP</label>
              <input
                id="reset-otp"
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
                autoFocus
                placeholder="Enter code"
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
              <input
                id="reset-new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              id="reset-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-500 disabled:opacity-50 transition-colors"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
            <button
              type="button"
              onClick={() => { setStep(1); setOtp(""); }}
              className="text-xs text-gray-500 hover:text-gray-300 text-left"
            >
              ← Back / resend OTP
            </button>
          </form>
        )}

        {!done && (
          <p className="mt-4 text-sm">
            <Link href="/login" className="text-blue-400 hover:underline">Back to Login</Link>
          </p>
        )}
      </div>
    </div>
  );
}
