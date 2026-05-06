"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { post } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSendOtp(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await post("/auth/send-otp", { email });
      toast.success("OTP sent to your email");
      setStep(2);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleOtpNext(e) {
    e.preventDefault();
    if (!otp.trim()) {
      toast.error("Enter the OTP from your email");
      return;
    }
    setStep(3);
  }

  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await post("/auth/signup", { email, name, otp, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success("Account created");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err.message);
      // if the server rejects the OTP, send them back to re-enter it
      if (err.message?.toLowerCase().includes("otp")) {
        setStep(2);
        setOtp("");
      }
    } finally {
      setLoading(false);
    }
  }

  const stepLabel = { 1: "Enter email", 2: "Verify OTP", 3: "Set password" }[step];

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-sm p-6 bg-gray-900 border border-gray-800 rounded-lg">
        <h1 className="text-xl font-bold mb-1">Sign Up</h1>
        <p className="text-xs text-gray-500 mb-4">Step {step} of 3 — {stepLabel}</p>

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              id="signup-send-otp"
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-500 disabled:opacity-50 transition-colors"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleOtpNext} className="flex flex-col gap-3">
            <p className="text-sm text-gray-400">
              A code was sent to <span className="text-gray-200">{email}</span>.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">OTP</label>
              <input
                id="signup-otp"
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
            <button
              id="signup-verify-otp"
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-500 transition-colors"
            >
              Continue
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

        {step === 3 && (
          <form onSubmit={handleSignup} className="flex flex-col gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
              <input
                id="signup-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              id="signup-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-500 disabled:opacity-50 transition-colors"
            >
              {loading ? "Creating..." : "Sign Up"}
            </button>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-xs text-gray-500 hover:text-gray-300 text-left"
            >
              ← Back
            </button>
          </form>
        )}

        <p className="mt-4 text-sm text-gray-400">
          Already have an account? <Link href="/login" className="text-blue-400 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
