import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const currentEmail = useAuthStore((s) => s.currentEmail);
  const location = useLocation();

  if (!currentEmail) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}
