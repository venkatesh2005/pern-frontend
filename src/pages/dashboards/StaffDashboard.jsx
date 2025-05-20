import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaUserCircle, FaTrash, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";

// Constants
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



const YES_NO = ["Yes", "No"];
const BOARDS = ["State Board", "CBSE", "ICSE"];
const ADMISSION_TYPES = ["Counselling", "Management"];
const RESIDENCE_TYPES = ["Day Scholar", "Hosteller"];
const TN_DISTRICTS = [
  "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri",
  "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur",
  "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal",
  "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet",
  "Salem", "Sivagangai", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi",
  "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur",
  "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"
];
const SKILL_SUGGESTIONS = [
  "C", "C++", "Java", "Python", "JavaScript", "React",
  "Node.js", "HTML/CSS", "SQL", "MongoDB", "Git", "AWS"
];

const HEADINGS = {
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
const FIELD_ORDER = Object.keys(HEADINGS);

// Input Helpers
const renderInput = (key, value, handleChange) => (
  <input
    type="text"
    value={value || ""}
    onChange={(e) => handleChange(key, e.target.value)}
    className="border px-2 py-1 w-32 rounded text-xs"
  />
);

const renderSelect = (key, value, options, handleChange) => (
  <select
    value={value || ""}
    onChange={(e) => handleChange(key, e.target.value)}
    className="border px-2 py-1 w-32 rounded text-xs bg-white"
  >
    <option value="">—</option>
    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
  </select>
);

const renderCombo = (key, value, suggestions, handleChange) => (
  <>
    <input
      list={`${key}List`}
      value={value || ""}
      onChange={(e) => handleChange(key, e.target.value)}
      className="border px-2 py-1 w-32 rounded text-xs"
    />
    <datalist id={`${key}List`}>
      {suggestions.map((s) => <option key={s} value={s} />)}
    </datalist>
  </>
);

// Stat card component
const StatCard = ({ label, value }) => (
  <div className="bg-white shadow rounded p-5 text-center">
    <div className="text-gray-500 text-sm">{label}</div>
    <div className="text-3xl font-bold text-indigo-600 mt-2">{value}</div>
  </div>
);

// Main component
const StaffDashboard = () => {
  const token = localStorage.getItem("authToken");
  const user = jwtDecode(token);

  const [tab, setTab] = useState("dashboard");
  const [pending, setPending] = useState([]);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0 });
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === "dashboard") {
        const { data } = await axios.get("http://localhost:5000/api/staff/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(data);
      } else {
        const url = tab === "pending" ? "pendingStudents" : "students";
        const { data } = await axios.get(`http://localhost:5000/api/staff/${url}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        tab === "pending" ? setPending(data) : setStudents(data);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [tab]);

  const approve = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/staff/approve/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Approved!");
      setPending(pending.filter((s) => s.id !== id));
    } catch (e) {
      toast.error(e.response?.data?.message || "Error");
    }
  };

  const reject = async (id) => {
    if (!window.confirm("Delete this student record?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/staff/reject/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.warn("Rejected & removed.");
      setPending(pending.filter((s) => s.id !== id));
    } catch (e) {
      toast.error(e.response?.data?.message || "Error");
    }
  };

  const handleEdit = (student) => {
    setEditId(student.id);
    setEditData({ ...student });
  };

  const handleChange = (key, value) => {
    setEditData(prev => ({ ...prev, [key]: value }));
  };

  const saveEdit = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/staff/update/${id}`, editData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Updated successfully");
      setEditId(null);
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || "Update failed");
    }
  };

  const deleteStudent = async (id) => {
    if (!window.confirm("Are you sure to delete this student?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/staff/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.warn("Student deleted");
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch (e) {
      toast.error(e.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col p-5">
        <h1 className="text-2xl font-bold mb-8">Staff Panel</h1>
        <nav className="space-y-3">
          {[
            { key: "dashboard", label: "Dashboard" },
            { key: "pending", label: "Approvals" },
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
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
            className="w-full text-left px-3 py-2 rounded hover:bg-gray-700"
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            Welcome, {user.name} — {user.department}/{user.section}
          </h2>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
            className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 relative">
          <ToastContainer position="top-center" />
          {loading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
              <div className="text-gray-700 text-lg">Loading…</div>
            </div>
          )}

          {tab === "dashboard" && (
            <div className="grid md:grid-cols-3 gap-6">
              <StatCard label="Total Students" value={stats.total} />
              <StatCard label="Approved" value={stats.approved} />
              <StatCard label="Pending Approval" value={stats.pending} />
            </div>
          )}

          {tab === "pending" && (
            <>
              <h1 className="text-2xl font-bold mb-6">Pending Student Approvals</h1>
              <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-200 text-gray-700">
                    <tr>
                      <th className="p-2 text-left">Photo</th>
                      <th className="p-2 text-left">Reg No</th>
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Email</th>
                      <th className="p-2 text-left">Dept</th>
                      <th className="p-2 text-left">Sec</th>
                      <th className="p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map(s => (
                      <tr key={s.id} className="border-t">
                        <td className="p-2">
                          {s.profileUrl
                            ? <img src={thumb(s.profileUrl)} alt="" className="w-10 h-10 rounded-full object-cover" />
                            : <FaUserCircle size={40} className="text-gray-400" />}
                        </td>
                        <td className="p-2">{s.regNo}</td>
                        <td className="p-2">{s.name}</td>
                        <td className="p-2">{s.email}</td>
                        <td className="p-2">{s.department}</td>
                        <td className="p-2">{s.section}</td>
                        <td className="p-2 space-x-2">
                          <button onClick={() => approve(s.id)} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Approve</button>
                          <button onClick={() => reject(s.id)} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Reject</button>
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
              <h1 className="text-2xl font-bold mb-6">Approved Students</h1>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="overflow-x-auto">
                  <div className="min-w-[1600px]">
                    <table className="min-w-full text-xs">
                      <thead className="bg-gray-200 text-gray-700">
                        <tr>
                          <th className="p-2 whitespace-nowrap">Photo</th>
                          {FIELD_ORDER.map((key) => (
                            <th key={key} className="p-2 text-left whitespace-nowrap">{HEADINGS[key]}</th>
                          ))}
                          <th className="p-2 text-left whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((s) => (
                          <tr key={s.id} className="border-t hover:bg-gray-50">
                            <td className="p-2">
                              {s.profileUrl
                                ? <img src={thumb(s.profileUrl)} alt="" className="w-10 h-10 rounded-full object-cover" />
                                : <FaUserCircle size={40} className="text-gray-400" />}
                            </td>
                            {FIELD_ORDER.map((key) => (
                              <td key={key} className="p-2 whitespace-nowrap">
                                {editId === s.id ? (
                                  key === "nativeDistrict" ? renderCombo(key, editData[key], TN_DISTRICTS, handleChange)
                                  : key === "tenthBoard" || key === "twelfthBoard" ? renderCombo(key, editData[key], BOARDS, handleChange)
                                  : key === "admissionType" ? renderSelect(key, editData[key], ADMISSION_TYPES, handleChange)
                                  : key === "gender" ? renderSelect(key, editData[key], ["Male", "Female", "Other"], handleChange)
                                  : key === "residenceType" ? renderSelect(key, editData[key], RESIDENCE_TYPES, handleChange)
                                  : key === "placementWilling" || key === "standingArrears" || key === "historyArrears" ? renderSelect(key, editData[key], YES_NO, handleChange)
                                  : key === "skills" ? renderCombo(key, editData[key], SKILL_SUGGESTIONS, handleChange)
                                  : renderInput(key, editData[key], handleChange)
                                ) : (
                                  s[key] ?? ""
                                )}
                              </td>
                            ))}
                            <td className="p-2 whitespace-nowrap">
                              {editId === s.id ? (
                                <>
                                  <button onClick={() => saveEdit(s.id)} className="text-green-600 hover:text-green-800 mr-2"><FaSave /></button>
                                  <button onClick={() => setEditId(null)} className="text-gray-600 hover:text-gray-800"><FaTimes /></button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => handleEdit(s)} className="text-blue-600 hover:text-blue-800 mr-2"><FaEdit /></button>
                                  <button onClick={() => deleteStudent(s.id)} className="text-red-600 hover:text-red-800"><FaTrash /></button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default StaffDashboard;
