"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function useAuth() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (stored) {
      setToken(stored);
    }
    setLoading(false);
  }, []);

  function login(newToken) {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    router.push("/login");
  }

  return { token, loading, login, logout };
}
