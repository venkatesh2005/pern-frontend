import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';

import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import PrivateRoute from './components/PrivateRoute';

import StudentDashboard from './pages/dashboards/StudentDashboard';
import StaffDashboard from './pages/dashboards/StaffDashboard';
import HodDashboard from './pages/dashboards/HodDashboard';
import PrincipalDashboard from './pages/dashboards/PrincipalDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';

function App() {
  return (
    <Router>
      <div className="App min-h-screen bg-gray-100">
        <Switch>
          {/* Public Routes */}
          <Route exact path="/login" component={LoginForm} />
          <Route exact path="/register" component={RegisterForm} />

          {/* Role-Protected Dashboard Routes */}
          <PrivateRoute path="/student/dashboard" component={StudentDashboard} requiredRole="Student" />
          <PrivateRoute path="/staff/dashboard" component={StaffDashboard} requiredRole="Staff" />
          <PrivateRoute path="/hod/dashboard" component={HodDashboard} requiredRole="HOD" />
          <PrivateRoute path="/principal/dashboard" component={PrincipalDashboard} requiredRole="Principal" />
          <PrivateRoute path="/admin/dashboard" component={AdminDashboard} requiredRole="Admin" />

          {/* Default fallback */}
          <Redirect to="/login" />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
