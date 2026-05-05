"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";
import { get, post } from "@/lib/api";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  async function fetchProjects() {
    setLoading(true);
    try {
      const res = await get("/projects");
      setProjects(res.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      await post("/projects", { name, description });
      toast.success("Project created");
      setName("");
      setDescription("");
      setShowForm(false);
      await fetchProjects();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <AuthGuard>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-bold">Projects</h1>
          <button
            id="toggle-project-form"
            onClick={() => setShowForm(!showForm)}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-500 transition-colors"
          >
            {showForm ? "Cancel" : "New Project"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-4 flex flex-col gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
              <input
                id="project-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <input
                id="project-description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              id="create-project-submit"
              type="submit"
              disabled={creating}
              className="self-start px-4 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-500 disabled:opacity-50 transition-colors"
            >
              {creating ? "Creating..." : "Create"}
            </button>
          </form>
        )}

        {loading && <p className="text-sm text-gray-400">Loading...</p>}

        {!loading && projects.length === 0 && (
          <p className="text-sm text-gray-500">No projects yet.</p>
        )}

        <div className="flex flex-col gap-2">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/project/${project.id}`}
              className="block bg-gray-900 border border-gray-800 rounded-lg p-4 hover:bg-gray-800 transition-colors"
            >
              <p className="font-medium">{project.name}</p>
              {project.description && <p className="text-sm text-gray-400 mt-1">{project.description}</p>}
              <p className="text-xs text-gray-500 mt-2">{project.members?.length || 0} members</p>
            </Link>
          ))}
        </div>
      </div>
    </AuthGuard>
  );
}
