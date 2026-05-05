"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    router.push(token ? "/dashboard" : "/login");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-sm text-gray-400">Loading...</p>
    </div>
  );
}
