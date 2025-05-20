import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { EyeIcon, EyeOffIcon } from '@heroicons/react/outline';
import { Link, useHistory } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RegisterForm = () => {
  const history = useHistory();
  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);
  const [role, setRole] = useState('Student');

  const [formData, setFormData] = useState({
    role: 'Student',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    section: '',
    regNo: '',
    photoLink: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/departments');
        setDepartments(res.data);
      } catch {
        toast.error('Failed to load departments');
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchSections = async () => {
      const selectedDept = departments.find(d => d.name === formData.department);
      if (!selectedDept) return;

      try {
        const res = await axios.get(`http://localhost:5000/api/sections/${selectedDept.id}`);
        const list = res.data || [];
        setSections(list);

        // Do NOT auto-assign even if there's only one section
        // Leave section field blank for 0 or 1 sections
        setFormData(prev => ({ ...prev, section: '' }));
      } catch {
        toast.error('Failed to load sections');
      }
    };

    if (formData.department) {
      fetchSections();
    } else {
      setSections([]);
      setFormData(prev => ({ ...prev, section: '' }));
    }
  }, [formData.department, departments]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    setRole(selectedRole);
    setFormData(prev => ({ ...prev, role: selectedRole }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      // Omit section if not selected
      const dataToSubmit = { ...formData };
      if (!dataToSubmit.section?.trim()) {
        delete dataToSubmit.section;
      }

      await axios.post('http://localhost:5000/api/auth/register', dataToSubmit);
      toast.success('User registered successfully! Redirecting...');
      setTimeout(() => history.push('/login'), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="flex justify-center items-start min-h-screen bg-gray-50 py-10">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm p-6 space-y-4 bg-white shadow-md rounded-md overflow-y-auto max-h-[90vh]"
        >
          <h2 className="text-2xl font-semibold text-center text-gray-700">Register</h2>

          <div>
            <label className="text-sm font-medium text-gray-600">Role</label>
            <select
              name="role"
              value={role}
              onChange={handleRoleChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded"
            >
              <option value="Student">Student</option>
              <option value="Staff">Staff</option>
              <option value="HOD">HOD</option>
            </select>
          </div>

          <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required className="w-full p-2 border rounded" />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="w-full p-2 border rounded" />

          {role === 'Student' && (
            <>
              <input type="text" name="regNo" placeholder="Registration No" value={formData.regNo} onChange={handleChange} className="w-full p-2 border rounded" />
              <input type="url" name="photoLink" placeholder="Photo Link" value={formData.photoLink} onChange={handleChange} required className="w-full p-2 border rounded" />
            </>
          )}

          <div>
            <label className="text-sm font-medium text-gray-600">Department</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded"
              required
            >
              <option value="">Select Department</option>
              {departments.map(dep => (
                <option key={dep.id} value={dep.name}>{dep.name}</option>
              ))}
            </select>
          </div>

          {(role === 'Student' || role === 'Staff') && sections.length > 1 && (
            <div>
              <label className="text-sm font-medium text-gray-600">Section</label>
              <select
                name="section"
                value={formData.section}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded"
              >
                <option value="">Select Section</option>
                {sections.map(sec => (
                  <option key={sec.id} value={sec.name}>{sec.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex space-x-2">
            <div className="relative w-1/2">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded pr-10"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-2">
                {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
            <div className="relative w-1/2">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded pr-10"
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-2 top-2">
                {showConfirmPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition duration-200">
            Register
          </button>

          <p className="text-center text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-semibold">Login</Link>
          </p>
        </form>
      </div>
    </>
  );
};

export default RegisterForm;
