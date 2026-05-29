import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

// Layout Wrappers
import { AuthLayout } from '../layouts/AuthLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { TeacherLayout } from '../layouts/TeacherLayout';
// Portals Pages
import { Login } from '../pages/Login';

// Admin Portal Pages
import { AdminDashboard } from '../pages/admin/Dashboard';
import { AdminTeachers } from '../pages/admin/Teachers';
import { AdminParents } from '../pages/admin/Parents';
import { AdminClassrooms } from '../pages/admin/Classrooms';
import { AdminClassroomDetails } from '../pages/admin/ClassroomDetails';

// Teacher Portal Pages
import { TeacherDashboard } from '../pages/teacher/Dashboard';
import { TeacherClassrooms } from '../pages/teacher/Classrooms';
import { TeacherStudentActivities } from '../pages/teacher/StudentActivities';

/**
 * Gatekeeper route to protect and filter pages by role
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { currentUser } = useApp();

  // If not logged in, redirect to login page
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If user role is not allowed, redirect to their home portal
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    const fallbackRedirects = {
      superadmin: '/admin',
      teacher: '/teacher',
    };
    return <Navigate to={fallbackRedirects[currentUser.role] || '/login'} replace />;
  }

  return children;
};

export const AppRoutes = () => {
  const { currentUser } = useApp();

  return (
    <Routes>
      {/* Root Path Redirection */}
      <Route
        path="/"
        element={
          currentUser ? (
            <Navigate to={currentUser.role === 'superadmin' ? '/admin' : '/teacher'} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Unified Login Route */}
      <Route
        path="/login"
        element={
          currentUser ? (
            <Navigate to={currentUser.role === 'superadmin' ? '/admin' : '/teacher'} replace />
          ) : (
            <AuthLayout>
              <Login />
            </AuthLayout>
          )
        }
      />

      {/* Admin Portal Protected Subroutes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="teachers" element={<AdminTeachers />} />
        <Route path="parents" element={<AdminParents />} />
        <Route path="classrooms" element={<AdminClassrooms />} />
        <Route path="classrooms/:id" element={<AdminClassroomDetails />} />
        {/* Fallback inside admin */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>

      {/* Teacher Portal Protected Subroutes */}
      <Route
        path="/teacher/*"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<TeacherDashboard />} />
        <Route path="classrooms" element={<TeacherClassrooms />} />
        <Route path="activities" element={<TeacherStudentActivities />} />
        {/* Fallback inside teacher */}
        <Route path="*" element={<Navigate to="/teacher" replace />} />
      </Route>

      {/* Global Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
