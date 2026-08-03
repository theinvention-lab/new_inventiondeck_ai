import { Navigate, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { MyPage } from './pages/mypage/MyPage';
import { GeneratorPage } from './pages/generator/GeneratorPage';
import { DeveloperPage } from './pages/developer/DeveloperPage';
import { PlannerPage } from './pages/planner/PlannerPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { useAuthStore } from './store/authStore';

function RootRedirect() {
  const currentEmail = useAuthStore((s) => s.currentEmail);
  return <Navigate to={currentEmail ? '/mypage' : '/login'} replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route
        path="/mypage"
        element={
          <ProtectedRoute>
            <MyPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/project/:projectId/generator"
        element={
          <ProtectedRoute>
            <GeneratorPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/project/:projectId/developer"
        element={
          <ProtectedRoute>
            <DeveloperPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/project/:projectId/planner"
        element={
          <ProtectedRoute>
            <PlannerPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
