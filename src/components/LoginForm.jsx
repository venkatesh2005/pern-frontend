import React, { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { EyeIcon, EyeOffIcon } from '@heroicons/react/outline';
import { Link, useHistory } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginForm = () => {
  const [credentials, setCredentials] = useState({ emailOrRegNo: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const history = useHistory();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', credentials);
      const token = res.data.token;
      localStorage.setItem('authToken', token);

      const decoded = jwtDecode(token);
      const role = decoded.role;

      if (role === 'Student' && res.data.regNo) {
        localStorage.setItem('regNo', res.data.regNo);
      }

      toast.success('Login successful! Redirecting...');

      let redirectPath = '/';
      switch (role) {
        case 'Student':
          redirectPath = '/student/dashboard';
          break;
        case 'Staff':
          redirectPath = '/staff/dashboard';
          break;
        case 'HOD':
          redirectPath = '/hod/dashboard';
          break;
        case 'Principal':
          redirectPath = '/principal/dashboard';
          break;
        case 'Admin':
          redirectPath = '/admin/dashboard';
          break;
        default:
          redirectPath = '/login';
      }

      setTimeout(() => history.push(redirectPath), 2000);
    } catch (err) {
      const backendMsg = err.response?.data?.message;

      // Optional fallback if no backend message
      const defaultMsg = 'Invalid email or password';

      toast.error('Login failed: ' + (backendMsg || defaultMsg));
    }
  };

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <form onSubmit={handleSubmit} className="w-full max-w-sm p-6 bg-white shadow-lg rounded-md space-y-4">
          <h2 className="text-2xl font-semibold text-center text-gray-700">Login</h2>

          <input
            type="text"
            name="emailOrRegNo"
            value={credentials.emailOrRegNo}
            onChange={handleChange}
            required
            placeholder="Email or Registration Number"
            className="w-full p-2 border rounded"
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              placeholder="Password"
              className="w-full p-2 border rounded pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-2"
            >
              {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            </button>
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
            Login
          </button>

          <p className="text-center text-sm">
            Don’t have an account?{' '}
            <Link to="/register" className="text-indigo-600 hover:text-indigo-800 font-semibold">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </>
  );
};

export default LoginForm;
