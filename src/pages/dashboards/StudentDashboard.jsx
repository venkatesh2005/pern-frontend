import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUserCircle } from "react-icons/fa";

/* ---------- static helpers ---------- */
const TN_DISTRICTS = [
  "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri",
  "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur",
  "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal",
  "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet",
  "Salem", "Sivagangai", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi",
  "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur",
  "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"
];

const BOARDS           = ["State Board", "CBSE", "ICSE"];
const ADMISSION_TYPES  = ["Counselling", "Management"];
const YES_NO           = ["Yes", "No"];
const RESIDENCE_TYPES  = ["Day Scholar", "Hosteller"];
const SKILL_SUGGESTIONS = [
  "C", "C++", "Java", "Python", "JavaScript", "React",
  "Node.js", "HTML/CSS", "SQL", "MongoDB", "Git", "AWS"
];

/* ---------- component ---------- */
const StudentDashboard = () => {
  const [student,  setStudent]  = useState(null);
  const [formData, setFormData] = useState({});
  const [editing,  setEditing]  = useState(false);
  const [loading,  setLoading]  = useState(true);

  /* ---------- fetch once ---------- */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5000/api/student/me",
          { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } }
        );
        setStudent(data);
        setFormData(data);
      } catch (err) {
        console.error("Fetch‑profile error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---------- helpers ---------- */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? (checked ? "Yes" : "No") : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const saveProfile = async () => {
    try {
      await axios.put("http://localhost:5000/api/student/me", formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
      });
      setStudent(formData);
      setEditing(false);
      alert("Profile updated ✔");
    } catch (err) {
      console.error("Save‑profile error:", err);
    }
  };

  /* ---- Google‑Drive helpers ---- */
  const extractDriveId = (u = "") =>
    (/\/d\/([a-zA-Z0-9_-]+)\//.exec(u) || /id=([a-zA-Z0-9_-]+)/.exec(u) || [])[1] ?? null;

const thumbUrl = (url = "", sz = 100) => {
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

  const downloadUrl= (u) => (extractDriveId(u) ? `https://drive.google.com/uc?export=download&id=${extractDriveId(u)}` : "#");

  /* ---------- small render utils ---------- */
  const renderSelect = (label, name, opts) => (
    <div className="flex flex-col">
      <label className="font-medium text-gray-700">{label}</label>
      <select
        name={name}
        value={formData[name] ?? ""}
        onChange={handleChange}
        disabled={!editing}
        className="border px-3 py-2 rounded bg-white"
      >
        <option value="">— Select —</option>
        {opts.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  /* single input with datalist suggestions (user can type custom) */
  const renderCombo = (label, name, suggestions) => (
    <div className="flex flex-col">
      <label className="font-medium text-gray-700">{label}</label>
      <input
        list={`${name}List`}
        name={name}
        value={formData[name] ?? ""}
        onChange={handleChange}
        disabled={!editing}
        placeholder="Select or type…"
        className="border px-3 py-2 rounded"
      />
      <datalist id={`${name}List`}>
        {suggestions.map(s => <option key={s} value={s} />)}
      </datalist>
    </div>
  );

  const renderInput = (label, name, type="text") => (
    <div className="flex flex-col">
      <label className="font-medium text-gray-700">{label}</label>
      <input
        type={type}
        name={name}
        value={formData[name] ?? ""}
        onChange={handleChange}
        disabled={!editing}
        className="border px-3 py-2 rounded"
      />
    </div>
  );

  /* ---------- flags ---------- */
  const showStanding = formData.standingArrears === "Yes";
  const showHistory  = formData.historyArrears  === "Yes";

  if (loading) return <div className="p-10 text-center">Loading …</div>;

  /* ---------- JSX ---------- */
  return (
    <div className="flex h-screen bg-gray-100">
      {/* -------- sidebar -------- */}
      <aside className="w-64 bg-gray-800 text-white p-5 flex flex-col">
        <h1 className="text-2xl font-bold mb-8">Student Panel</h1>
        <button
          className="px-3 py-2 mb-3 rounded hover:bg-gray-700 bg-gray-700"
          disabled
        >
          My Profile
        </button>
        <button
          className="px-3 py-2 rounded hover:bg-gray-700"
          onClick={() => { localStorage.clear(); window.location.href = "/login"; }}
        >
          Logout
        </button>
      </aside>

      {/* -------- content -------- */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Welcome, {student?.name}</h2>
          <div className="flex items-center gap-2">
            <FaUserCircle size={24} className="text-indigo-600" />
            <span>{student?.regNo}</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="bg-white p-6 shadow rounded">
            {/* --- top card --- */}
            <div className="flex items-center border-b pb-4 mb-6 space-x-4">
              {thumbUrl(formData.profileUrl)
                ? <img src={thumbUrl(formData.profileUrl)} alt="profile" className="w-20 h-20 rounded-full border object-cover" />
                : <FaUserCircle size={80} className="text-gray-300 border rounded-full p-2" />}
              <div>
                <h3 className="text-xl font-semibold">{student?.name}</h3>
                <p className="text-sm text-gray-500">Reg No: {student?.regNo}</p>
                <p className="text-sm text-gray-500">Dept:  {student?.department}</p>

                {formData.profileUrl && (
                  <div className="flex gap-4 mt-1">
                    <a href={thumbUrl(formData.profileUrl)} target="_blank" rel="noreferrer"
                       className="text-blue-600 underline text-sm">Preview</a>
                    <a href={downloadUrl(formData.profileUrl)} target="_blank" rel="noreferrer"
                       className="text-blue-600 underline text-sm">Download</a>
                  </div>
                )}
              </div>
            </div>

            {/* --- edit / save --- */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Student Profile</h3>
              <button
                onClick={() => (editing ? saveProfile() : setEditing(true))}
                className={`px-4 py-2 rounded text-white ${editing ? "bg-green-600 hover:bg-green-700" : "bg-indigo-600 hover:bg-indigo-700"}`}
              >
                {editing ? "Save" : "Edit"}
              </button>
            </div>

            {/* --- form grid --- */}
            <div className="grid gap-4 text-sm grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {/* BASIC */}
              <div className="col-span-3 text-indigo-700 font-semibold">Basic Info</div>
              {renderInput ("Name",     "name")}
              {renderInput ("Register Number","regNo")}
              {renderSelect("Admission Type","admissionType", ADMISSION_TYPES)}
              {renderSelect("Gender",   "gender", ["Male","Female","Other"])}
              {renderInput ("Date of Birth","dob","date")}
              {renderInput ("Department","department")}
              {renderInput ("Year",     "year")}
              {renderInput ("Section",  "section")}
              {renderInput ("Mobile Number","mobile")}
              {renderInput ("Personal Email","email")}
              {renderInput ("College Email","collegeEmail")}
              {renderInput ("Profile Photo URL","profileUrl")}
              {renderInput ("Address","address")}
              {renderCombo ("Native District","nativeDistrict", TN_DISTRICTS)}

              {/* SCHOOL */}
              <div className="col-span-3 text-indigo-700 font-semibold mt-6">10th &amp; 12th Education</div>
              {renderCombo ("10th Board","tenthBoard", BOARDS)}
              {renderInput ("10th %","tenthPercent")}
              {renderInput ("10th Year of Passing","tenthYOP")}
              {renderCombo ("12th Board","twelfthBoard", BOARDS)}
              {renderInput ("12th %","twelfthPercent")}
              {renderInput ("12th Year of Passing","twelfthYOP")}

              {/* DIPLOMA */}
              <div className="col-span-3 text-indigo-700 font-semibold mt-6">Diploma Details</div>
              {renderInput ("Diploma Branch","diplomaBranch")}
              {renderInput ("Diploma %","diplomaPercent")}
              {renderInput ("Diploma Year of Passing","diplomaYOP")}

              {/* CGPA */}
              <div className="col-span-3 text-indigo-700 font-semibold mt-6">Engineering CGPA</div>
              <div className="col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({length:8}, (_,i)=>renderInput(`Sem ${i+1} CGPA`,`cgpaSem${i+1}`))}
                {renderInput("Overall CGPA","cgpa")}
              </div>

              {/* ARREARS */}
              <div className="col-span-3 text-indigo-700 font-semibold mt-6">Arrears</div>
              {renderSelect("Standing Arrears","standingArrears", YES_NO)}
              {showStanding && renderInput("Standing Arrears Count","standingArrearsCount","number")}
              {renderSelect("History of Arrears","historyArrears", YES_NO)}
              {showHistory  && renderInput("History Arrear Count","historyArrearCount","number")}

              {/* PLACEMENT */}
              <div className="col-span-3 text-indigo-700 font-semibold mt-6">Placement Details</div>
              {renderSelect("Placement Willingness","placementWilling", YES_NO)}
              {renderSelect("Residence Type","residenceType", RESIDENCE_TYPES)}

              {/* PARENTS */}
              <div className="col-span-3 text-indigo-700 font-semibold mt-6">Parent Information</div>
              {renderInput ("Father's Name","fatherName")}
              {renderInput ("Father's Occupation","fatherOccupation")}
              {renderInput ("Mother's Name","motherName")}
              {renderInput ("Mother's Occupation","motherOccupation")}
              {renderInput ("Parent Mobile (Father)","parentMobileFather")}
              {renderInput ("Parent Mobile (Mother)","parentMobileMother")}

              {/* SKILLS & LINKS */}
              <div className="col-span-3 text-indigo-700 font-semibold mt-6">Skills &amp; Links</div>
              {/* skills with datalist */}
              <div className="flex flex-col col-span-3">
                <label className="font-medium text-gray-700">Skill Set</label>
                <input
                  name="skills"
                  list="skillList"
                  value={formData.skills ?? ""}
                  onChange={handleChange}
                  disabled={!editing}
                  className="border px-3 py-2 rounded"
                  placeholder="e.g. Python, React"
                />
                <datalist id="skillList">
                  {SKILL_SUGGESTIONS.map(s => <option key={s} value={s} />)}
                </datalist>
              </div>
              {renderInput("LinkedIn URL","linkedin")}
              {renderInput("GitHub URL","github")}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
