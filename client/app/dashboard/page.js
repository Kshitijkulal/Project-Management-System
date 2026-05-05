"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";
import { get } from "@/lib/api";

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await get("/dashboard/global");
        setSummary(res.data);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  const cards = summary
    ? [
        { label: "Total", value: summary.total, color: "text-gray-100" },
        { label: "To Do", value: summary.todo, color: "text-gray-100" },
        { label: "In Progress", value: summary.inProgress, color: "text-yellow-400" },
        { label: "Done", value: summary.done, color: "text-green-400" },
        { label: "Overdue", value: summary.overdue, color: "text-red-400" },
      ]
    : [];

  return (
    <AuthGuard>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold mb-5">Dashboard</h1>

        {loading && <p className="text-sm text-gray-400">Loading...</p>}

        {summary && (
          <div className="grid grid-cols-5 gap-3">
            {cards.map((card) => (
              <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-400">{card.label}</p>
                <p className={`text-lg font-bold mt-1 ${card.color}`}>{card.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
