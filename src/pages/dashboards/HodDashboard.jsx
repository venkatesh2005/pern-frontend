import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaUserCircle, FaTrash } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";

const thumb = (url = "", sz = 100) => {
  // If it's already a direct link or Googleusercontent link
  if (url.startsWith("http://") || url.startsWith("https://lh3.googleusercontent.com/")) {
    return url;
  }

  // Handle standard Google Drive share link
  const match = url.match(/(?:\/d\/|id=)([A-Za-z0-9_-]{10,})/);
  if (match && match[1]) {
    return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  }

  return "";
};

const StatCard = ({ label, value }) => (
  <div className="bg-white shadow rounded p-5 text-center">
    <div className="text-gray-500 text-sm">{label}</div>
    <div className="text-3xl font-bold text-indigo-600 mt-2">{value}</div>
  </div>
);

// ✅ Full field list as used in StaffDashboard
const STUDENT_HEADINGS = {
  regNo: "Reg No", name: "Name", gender: "Gender", dob: "DOB", department: "Dept",
  year: "Year", section: "Sec", admissionType: "Admission", mobile: "Mobile",
  email: "Email", collegeEmail: "College Email", profileUrl: "Profile URL", address: "Address",
  nativeDistrict: "District", tenthBoard: "10th Board", tenthPercent: "10th %", tenthYOP: "10th YOP",
  twelfthBoard: "12th Board", twelfthPercent: "12th %", twelfthYOP: "12th YOP",
  diplomaBranch: "Diploma Br.", diplomaPercent: "Diploma %", diplomaYOP: "Diploma YOP",
  cgpaSem1: "S1", cgpaSem2: "S2", cgpaSem3: "S3", cgpaSem4: "S4", cgpaSem5: "S5",
  cgpaSem6: "S6", cgpaSem7: "S7", cgpaSem8: "S8", cgpa: "Overall CGPA",
  standingArrears: "Stand Arr?", standingArrearsCount: "Stand Cnt",
  historyArrears: "Hist Arr?", historyArrearCount: "Hist Cnt", placementWilling: "Placement?",
  residenceType: "Residence", fatherName: "Father", fatherOccupation: "Father Occ.",
  motherName: "Mother", motherOccupation: "Mother Occ.", parentMobileFather: "Father Mob",
  parentMobileMother: "Mother Mob", skills: "Skills", linkedin: "LinkedIn", github: "GitHub"
};
const STUDENT_FIELDS = Object.keys(STUDENT_HEADINGS);

const HODDashboard = () => {
  const token = localStorage.getItem("authToken");
  const user = jwtDecode(token);

  const [tab, setTab] = useState("dashboard");
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, totalStudents: 0 });
  const [pending, setPending] = useState([]);
  const [approvedStaff, setApprovedStaff] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => { fetchData(); }, [tab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === "dashboard") {
        const { data } = await axios.get("http://localhost:5000/api/hod/stats", config);
        const { total, approved, pending } = data;
        setStats({ total, approved, pending, totalStudents: 0 });
        const studentsRes = await axios.get("http://localhost:5000/api/hod/students", config);
        setStats(prev => ({ ...prev, totalStudents: studentsRes.data.length }));
      } else if (tab === "pending") {
        const { data } = await axios.get("http://localhost:5000/api/hod/pendingStaff", config);
        setPending(data);
      } else if (tab === "staffs") {
        const { data } = await axios.get("http://localhost:5000/api/hod/staff", config);
        setApprovedStaff(data);
      } else if (tab === "students") {
        const { data } = await axios.get("http://localhost:5000/api/hod/students", config);
        setStudents(data);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Error loading data");
    } finally {
      setLoading(false);
    }
  };

  const approve = async id => {
    try {
      await axios.put(`http://localhost:5000/api/hod/approve/${id}`, {}, config);
      toast.success("Staff approved");
      setPending(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      toast.error(e.response?.data?.message || "Approval failed");
    }
  };

  const reject = async id => {
    if (!window.confirm("Remove this staff account?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/hod/reject/${id}`, config);
      toast.warn("Staff rejected");
      setPending(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      toast.error(e.response?.data?.message || "Rejection failed");
    }
  };

  const removeStaff = async id => {
    if (!window.confirm("Delete this staff permanently?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/hod/removeStaff/${id}`, config);
      toast.warn("Staff deleted");
      setApprovedStaff(prev => prev.filter(s => s.id !== id));
    } catch (e) {
      toast.error(e.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800">
      <aside className="w-64 bg-gray-800 text-white flex flex-col p-5">
        <h1 className="text-2xl font-bold mb-8">HOD Panel</h1>
        {[
          { key: "dashboard", label: "Dashboard" },
          { key: "pending", label: "Staff Approvals" },
          { key: "staffs", label: "Manage Staffs" },
          { key: "students", label: "Manage Students" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`w-full text-left px-3 py-2 rounded ${tab === key ? "bg-gray-700" : "hover:bg-gray-700"}`}
          >
            {label}
          </button>
        ))}
        <button
          onClick={() => { localStorage.clear(); window.location.href = "/login"; }}
          className="w-full text-left px-3 py-2 rounded hover:bg-gray-700 mt-auto"
        >
          Logout
        </button>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow px-6 py-4">
          <h2 className="text-xl font-semibold">Welcome, {user.name} — {user.department}</h2>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 relative">
          <ToastContainer position="top-center" />
          {loading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
              <span>Loading…</span>
            </div>
          )}

          {tab === "dashboard" && (
            <div className="grid md:grid-cols-4 gap-6">
              <StatCard label="Total Staff" value={stats.total} />
              <StatCard label="Approved Staff" value={stats.approved} />
              <StatCard label="Pending Staff" value={stats.pending} />
              <StatCard label="Total Students" value={stats.totalStudents} />
            </div>
          )}

          {tab === "pending" && (
            <>
              <h1 className="text-2xl font-bold mb-6">Pending Staff Approvals</h1>
              <div className="bg-white shadow rounded overflow-x-auto p-4">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-200 text-gray-700">
                    <tr>
                      <th className="p-2"></th>
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Email</th>
                      <th className="p-2 text-left">Section</th>
                      <th className="p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map(stf => (
                      <tr key={stf.id} className="border-t hover:bg-gray-50">
                        <td className="p-2"><FaUserCircle size={36} className="text-gray-400" /></td>
                        <td className="p-2">{stf.name}</td>
                        <td className="p-2">{stf.email}</td>
                        <td className="p-2">{stf.section}</td>
                        <td className="p-2 space-x-2">
                          <button onClick={() => approve(stf.id)} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Approve</button>
                          <button onClick={() => reject(stf.id)} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Reject</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab === "staffs" && (
            <>
              <h1 className="text-2xl font-bold mb-6">Approved Staffs</h1>
              <div className="bg-white shadow rounded overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-200 text-gray-700">
                    <tr>
                      <th className="p-2">#</th>
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Email</th>
                      <th className="p-2 text-left">Section</th>
                      <th className="p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedStaff.map((s, i) => (
                      <tr key={s.id} className="border-t">
                        <td className="p-2">{i + 1}</td>
                        <td className="p-2">{s.name}</td>
                        <td className="p-2">{s.email}</td>
                        <td className="p-2">{s.section}</td>
                        <td className="p-2">
                          <button
                            onClick={() => removeStaff(s.id)}
                            className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm"
                          >
                            <FaTrash size={12} /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab === "students" && (
            <>
              <h1 className="text-2xl font-bold mb-6">Department Students</h1>
              <div className="bg-white shadow rounded p-4 overflow-x-auto">
                <div className="min-w-[1600px]">
                  <table className="min-w-full text-xs">
                    <thead className="bg-gray-200 text-gray-700">
                      <tr>
                        <th className="p-2">Photo</th>
                        {STUDENT_FIELDS.map(k => (
                          <th key={k} className="p-2 text-left whitespace-nowrap">{STUDENT_HEADINGS[k]}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(stu => (
                        <tr key={stu.id} className="border-t hover:bg-gray-50">
                          <td className="p-2">
                            {stu.profileUrl
                              ? <img src={thumb(stu.profileUrl, 80)} alt="" className="w-10 h-10 rounded-full object-cover" />
                              : <FaUserCircle size={40} className="text-gray-400" />}
                          </td>
                          {STUDENT_FIELDS.map(k => (
                            <td key={k} className="p-2 whitespace-nowrap">{stu[k] ?? ""}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default HODDashboard;
