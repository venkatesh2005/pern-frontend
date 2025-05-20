import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Reusable Stat component (same as AdminDashboard)
const Stat = ({ label, value }) => (
  <div className="bg-white shadow rounded p-5 text-center">
    <div className="text-gray-500 text-sm">{label}</div>
    <div className="text-3xl font-bold text-indigo-600 mt-2">{value}</div>
  </div>
);

export default function PrincipalDashboard() {
  const [stats, setStats] = useState({
    departments: [],
    totalStaff: 0,
    approvedStaff: 0,
    pendingStaff: 0,
    totalStudents: 0,
  });

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const { data } = await axios.get("http://localhost:5000/api/overview/overview", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(data);
    } catch (err) {
      toast.error("Failed to load overview");
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800">
      <aside className="w-72 bg-gray-800 text-white flex flex-col p-5">
        <h1 className="text-2xl font-bold mb-6">Principal Panel</h1>
        <button
          className="text-left px-3 py-2 rounded bg-gray-700"
          disabled
        >
          Dashboard
        </button>
        <button
          onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
          className="mt-auto text-left px-3 py-2 rounded hover:bg-gray-700"
        >
          Logout
        </button>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow px-6 py-4">
          <h2 className="text-xl font-semibold">Welcome, Principal</h2>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 relative">
          <ToastContainer position="top-center" />

          {/* Stat cards */}
          <div className="grid md:grid-cols-4 gap-6">
            <Stat label="Departments" value={stats.departments.length} />
            <Stat label="Total Staff" value={stats.totalStaff} />
            <Stat label="Approved Staff" value={stats.approvedStaff} />
            <Stat label="Pending Staff" value={stats.pendingStaff} />
            <Stat label="Total Students" value={stats.totalStudents} />
          </div>

          {/* Department List */}
          <div className="bg-white rounded shadow p-5 mt-8">
            <h4 className="font-semibold mb-3">Departments</h4>
            {stats.departments.length === 0 ? (
              <p className="italic text-gray-500 text-sm">No departments found.</p>
            ) : (
              <ul className="list-disc list-inside text-sm text-gray-700">
                {stats.departments.map(dep => (
                  <li key={dep}>{dep}</li>
                ))}
              </ul>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
