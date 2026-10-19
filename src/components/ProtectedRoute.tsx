import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { UserRole } from '../types/index.js';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-medium">নিরাপত্তা ও অ্যাক্সেস যাচাই করা হচ্ছে...</p>
      </div>
    );
  }

  // Not authenticated -> redirect to login panel with original path in state
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific roles are required (e.g., admin / content manager)
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = allowedRoles.includes(user.role);
    if (!hasRole) {
      // Students accessing admin route get redirected to their student dashboard
      if (user.role === 'user' || user.role === 'paid_user') {
        return <Navigate to="/dashboard" replace />;
      }
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};
