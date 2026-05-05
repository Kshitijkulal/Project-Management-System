"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) setUser(JSON.parse(stored));
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  }

  function getInitial() {
    if (user?.name) return user.name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "?";
  }

  return (
    <nav className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800">
      <div className="flex gap-4">
        <Link href="/dashboard" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
          Dashboard
        </Link>
        <Link href="/projects" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
          Projects
        </Link>
      </div>
      <div className="relative" ref={dropdownRef}>
        <button
          id="profile-toggle"
          onClick={() => setOpen(!open)}
          className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-semibold flex items-center justify-center hover:bg-blue-500 transition-colors"
        >
          {getInitial()}
        </button>
        {open && (
          <div className="absolute right-0 top-10 w-56 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50">
            <div className="px-3 py-3">
              <p className="text-sm font-semibold text-gray-100">{user?.name || "Unknown"}</p>
              <p className="text-xs text-gray-400 mt-0.5">{user?.email || ""}</p>
            </div>
            <div className="h-px bg-gray-700" />
            <button
              id="logout-btn"
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-800 transition-colors rounded-b-lg"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
