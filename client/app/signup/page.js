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
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
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
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-sm p-6 bg-gray-900 border border-gray-800 rounded-lg">
        <h1 className="text-xl font-bold mb-4">Sign Up</h1>

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
          <form onSubmit={handleSignup} className="flex flex-col gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
              <input id="signup-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">OTP</label>
              <input id="signup-otp" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500" />
            </div>
            <button
              id="signup-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-500 disabled:opacity-50 transition-colors"
            >
              {loading ? "Creating..." : "Sign Up"}
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
