import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUserTie, FaTrash, FaDownload, FaUserCircle } from 'react-icons/fa';

// Utility: build Google Drive thumbnail
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

// SectionManager
const SectionManager = ({ departmentId }) => {
  const [sections, setSections] = useState([]);
  const [newSection, setNewSection] = useState('');
  const base = 'http://localhost:5000/api/sections';

  const load = async () => {
    try {
      const { data } = await axios.get(`${base}/${departmentId}`);
      setSections(Array.isArray(data) ? data : []);
    } catch (err) {
      setSections([]);
    }
  };
  useEffect(() => { if (departmentId) load(); }, [departmentId]);

  const add = async () => {
    if (!newSection.trim()) return;
    try {
      await axios.post(base, { name: newSection.trim(), DepartmentId: departmentId });
      setNewSection('');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Add failed');
    }
  };

  const remove = async id => {
    if (!window.confirm('Delete this section?')) return;
    try {
      await axios.delete(`${base}/${id}`);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="mt-3 ml-4">
      <div className="flex gap-2 mb-2">
        <input
          value={newSection}
          onChange={e => setNewSection(e.target.value)}
          placeholder="Add Section (A/B/C)"
          className="border px-2 py-1 rounded w-40 text-sm"
        />
        <button onClick={add} className="bg-green-600 text-white px-3 py-1 rounded text-sm">
          Add
        </button>
      </div>
      {sections.length === 0 ? (
        <p className="italic text-sm text-gray-500">No sections added yet.</p>
      ) : (
        <ul className="list-disc pl-4 text-sm">
          {sections.map(sec => (
            <li key={sec.id} className="flex justify-between items-center pr-4">
              {sec.name}
              <button
                onClick={() => remove(sec.id)}
                className="text-red-500 text-xs flex items-center gap-1"
              >
                <FaTrash size={12} /> Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Headings
const HEADINGS = {
  regNo: 'Reg No',
  name: 'Name',
  gender: 'Gender',
  dob: 'DOB',
  department: 'Dept',
  year: 'Year',
  section: 'Sec',
  admissionType: 'Admission',
  mobile: 'Mobile',
  email: 'Email',
  collegeEmail: 'College Email',
  tenthBoard: '10th Board',
  tenthPercent: '10th %',
  tenthYOP: '10th YOP',
  twelfthBoard: '12th Board',
  twelfthPercent: '12th %',
  twelfthYOP: '12th YOP',
  diplomaBranch: 'Diploma Br.',
  diplomaPercent: 'Diploma %',
  diplomaYOP: 'Diploma YOP',
  cgpaSem1: 'S1',
  cgpaSem2: 'S2',
  cgpaSem3: 'S3',
  cgpaSem4: 'S4',
  cgpaSem5: 'S5',
  cgpaSem6: 'S6',
  cgpaSem7: 'S7',
  cgpaSem8: 'S8',
  cgpa: 'Overall CGPA',
  standingArrears: 'Stand Arr?',
  standingArrearsCount: 'Stand Cnt',
  historyArrears: 'Hist Arr?',
  historyArrearCount: 'Hist Cnt',
  placementWilling: 'Placement?',
  residenceType: 'Residence',
  fatherName: 'Father',
  motherName: 'Mother',
  parentMobileFather: 'Father Mob',
  parentMobileMother: 'Mother Mob',
  address: 'Address',
  nativeDistrict: 'District',
  skills: 'Skills',
  linkedin: 'LinkedIn',
  github: 'GitHub',
};
const FIELD_ORDER = Object.keys(HEADINGS);

// Stat card
const Stat = ({ label, value }) => (
  <div className="bg-white shadow rounded p-5 text-center">
    <div className="text-gray-500 text-sm">{label}</div>
    <div className="text-3xl font-bold text-indigo-600 mt-2">{value}</div>
  </div>
);



// AdminDashboard
export default function AdminDashboard() {
  const api = axios.create({ baseURL: 'http://localhost:5000/api/admin' });
  const deptApi = axios.create({ baseURL: 'http://localhost:5000/api/departments' });

  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState({ totalStudents: 0, totalDepartments: 0, totalHODs: 0, pendingHODs: 0, deptCounts: [] });
  const [students, setStud] = useState([]);
  const [search, setSearch] = useState('');
  const [depts, setDepts] = useState([]);
  const [hods, setHods] = useState([]);
  const [pendingHOD, setPHOD] = useState([]);
  const [newDept, setNewDept] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data: hodList } = await api.get('/hods');
      setHods(hodList);
      if (tab === 'overview') {
        const { data } = await api.get('/stats');
        setStats(data);
      } else if (tab === 'students') {
        const { data } = await api.get('/students');
        setStud(data);
      } else if (tab === 'departments') {
        const { data } = await deptApi.get('/');
        setDepts(data);
      } else if (tab === 'hodApprovals') {
        const { data } = await api.get('/pendingHODs');
        setPHOD(data);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [tab]);

  const exportCSV = () => {
    const header = ['Photo', ...FIELD_ORDER.map(k => HEADINGS[k])];
    const rows = students.map(s => [s.profileUrl || '', ...FIELD_ORDER.map(k => s[k] ?? '')]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'students.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = students.filter(s =>
    [s.name, s.regNo, s.email, s.department, s.section].some(f =>
      (f || '').toLowerCase().includes(search.toLowerCase())
    )
  );

  const addDept = async () => {
    if (!newDept.trim()) return;
    try {
      await deptApi.post('/', { name: newDept.trim() });
      toast.success('Department added');
      setNewDept('');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Add failed');
    }
  };

  const delDept = async id => {
    if (!window.confirm('Delete this department?')) return;
    try {
      await deptApi.delete(`/${id}`);
      toast.warn('Department deleted');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Delete failed');
    }
  };

  const approveHOD = async id => {
    try {
      await api.put(`/approveHOD/${id}`);
      toast.success('HOD approved');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error');
    }
  };

  const rejectHOD = async id => {
    if (!window.confirm('Delete this HOD account?')) return;
    try {
      await api.delete(`/rejectHOD/${id}`);
      toast.warn('HOD removed');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error');
    }
  };

  const [filters, setFilters] = useState({});

// Apply all filters & global search
const filteredStudents = students.filter(student => {
  // All column filters
  const matchesFilters = Object.entries(filters).every(([key, val]) => {
    const field = (student[key] ?? '').toString().toLowerCase();
    return field.includes(val.toLowerCase());
  });

  // Global search (name, regNo, email, department, section)
  const globalMatch = [student.name, student.regNo, student.email, student.department, student.section]
    .some(f => (f || '').toLowerCase().includes(search.toLowerCase()));

  return matchesFilters && globalMatch;
});


  return (
    <div className="flex h-screen bg-gray-100 text-gray-800">
      <aside className="w-72 bg-gray-800 text-white flex flex-col p-5">
        <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
        {[
          { key: 'overview', label: 'Dashboard' },
          { key: 'students', label: 'Manage Students' },
          { key: 'departments', label: 'Manage Departments' },
          { key: 'hodApprovals', label: `HOD Approvals (${stats.pendingHODs})` },
          { key: 'manageHODs', label: 'Manage HODs' },
        ].map(({ key, label }) => (
          <button
            key={key}
            className={`text-left px-3 py-2 rounded mb-1 ${tab === key ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
        <button
          onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
          className="mt-auto text-left px-3 py-2 rounded hover:bg-gray-700"
        >
          Logout
        </button>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow px-6 py-4">
          <h2 className="text-xl font-semibold">Welcome, Admin</h2>
        </header>
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 relative">
          <ToastContainer position="top-center" />
          {loading && <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10"><span>Loading…</span></div>}

          {tab === 'manageHODs' && (
            <>
              <h3 className="text-2xl font-bold mb-4">Approved HODs</h3>
              {hods.length === 0 ? (
                <p className="text-gray-500 italic">No HODs found.</p>
              ) : (
                <div className="bg-white rounded shadow overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-200 text-gray-700">
                      <tr>
                        <th className="p-2">#</th>
                        <th className="p-2 text-left">Name</th>
                        <th className="p-2 text-left">Email</th>
                        <th className="p-2 text-left">Department</th>
                        <th className="p-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hods.map((h, i) => (
                        <tr key={h.id} className="border-t">
                          <td className="p-2">{i + 1}</td>
                          <td className="p-2">{h.name}</td>
                          <td className="p-2">{h.email}</td>
                          <td className="p-2">{h.department}</td>
                          <td className="p-2 space-x-2">
                            <button
                              onClick={() => rejectHOD(h.id)}
                              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}


          {/* Overview */}
          {tab === 'overview' && (
            <>
              <div className="grid md:grid-cols-4 gap-6">
                <Stat label="Total Students" value={stats.totalStudents} />
                <Stat label="Total Departments" value={stats.totalDepartments} />
                <Stat label="Total HODs" value={stats.totalHODs} />
                <Stat label="Pending HODs" value={stats.pendingHODs} />
              </div>

              {/* Students per dept */}
              <div className="bg-white rounded shadow p-5 mt-8">
                <h4 className="font-semibold mb-3">Students per Department</h4>
                {stats.deptCounts.length === 0 ? (
                  <p className="italic text-gray-500 text-sm">No data yet.</p>
                ) : (
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 text-gray-700"><tr><th className="p-2 text-left">Department</th><th className="p-2 text-left">Count</th></tr></thead>
                    <tbody>
                      {stats.deptCounts.map(dc => (
                        <tr key={dc.department} className="border-t">
                          <td className="p-2">{dc.department}</td>
                          <td className="p-2">{dc.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {/* Manage Students — full table */}
        {tab === 'students' && (
  <>
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-2xl font-bold">All Students</h3>
      <div className="flex items-center gap-2">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Global search…"
          className="border px-3 py-1.5 rounded text-sm w-64"
        />
        <button
          onClick={exportCSV}
          className="bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 flex items-center gap-1 text-sm"
        >
          <FaDownload /> Export CSV
        </button>
      </div>
    </div>

    <div className="bg-white rounded shadow p-4 overflow-x-auto">
      <div className="min-w-[2000px]">
        <table className="min-w-full text-xs">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="p-2 sticky left-0 bg-gray-200">Photo</th>
              {FIELD_ORDER.map(key => (
                <th key={key} className="p-2 text-left whitespace-nowrap">
                  {HEADINGS[key]}
                </th>
              ))}
            </tr>
            <tr className="bg-gray-100">
              <th className="p-2 sticky left-0 bg-gray-100"></th>
              {FIELD_ORDER.map(key => (
                <th key={key} className="p-1">
                  <input
                    type="text"
                    value={filters[key] || ''}
                    onChange={e =>
                      setFilters(prev => ({ ...prev, [key]: e.target.value }))
                    }
                    placeholder="Filter…"
                    className="w-full px-1 py-0.5 rounded border text-xs"
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(s => (
              <tr key={s.id} className="border-t hover:bg-gray-50">
                <td className="p-2 sticky left-0 bg-white">
                  {s.profileUrl ? (
                    <img
                      src={thumb(s.profileUrl)}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <FaUserCircle size={40} className="text-gray-400" />
                  )}
                </td>
                {FIELD_ORDER.map(key => (
                  <td key={key} className="p-2 whitespace-nowrap">
                    {s[key] ?? ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {filteredStudents.length === 0 && (
          <p className="text-center py-6 text-gray-500">No students found.</p>
        )}
      </div>
    </div>
  </>
)}


          {/* Manage Departments */}
          {tab === 'departments' && (
            <>
              <h3 className="text-2xl font-bold mb-4">Manage Departments &amp; Sections</h3>
              <div className="flex gap-4 mb-6">
                <input
                  value={newDept}
                  onChange={e => setNewDept(e.target.value)}
                  placeholder="New Department"
                  className="border px-3 py-2 rounded w-72"
                />
                <button onClick={addDept} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Add
                </button>
              </div>

              <div className="bg-white rounded shadow divide-y">
                {depts.map(d => (
                  <div key={d.id} className="p-4">
                    <div className="flex justify-between items-center">
                      <strong>{d.name}</strong>
                      <button
                        onClick={() => delDept(d.id)}
                        className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm"
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                    <SectionManager departmentId={d.id} />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* HOD Approvals */}
          {tab === 'hodApprovals' && (
            <>
              <h3 className="text-2xl font-bold mb-4">Pending HOD Approvals</h3>
              {pendingHOD.length === 0 ? (
                <p className="text-gray-600">🎉 No pending HOD accounts.</p>
              ) : (
                <div className="overflow-x-auto bg-white rounded shadow">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-200 text-gray-700">
                      <tr>
                        <th className="p-2"></th>
                        <th className="p-2 text-left">Name</th>
                        <th className="p-2 text-left">Email</th>
                        <th className="p-2 text-left">Department</th>
                        <th className="p-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingHOD.map(h => (
                        <tr key={h.id} className="border-t">
                          <td className="p-2"><FaUserTie size={34} className="text-gray-400" /></td>
                          <td className="p-2">{h.name}</td>
                          <td className="p-2">{h.email}</td>
                          <td className="p-2">{h.department}</td>
                          <td className="p-2 space-x-2">
                            <button onClick={() => approveHOD(h.id)} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Approve</button>
                            <button onClick={() => rejectHOD(h.id)} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Reject</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
          {/* Existing tabs below (overview, students, departments, hodApprovals)... */}
          {/* Keep existing code for those tabs exactly as in your last version */}
        </main>
      </div>
    </div>
  );
}
