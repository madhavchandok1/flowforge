import { Routes, Route, Navigate } from "react-router";
import { useAuthStore } from "@/stores/useAuthStore";
import AppLayout from "@/layouts/AppLayout";
import LoginPage from "@/features/auth/LoginPage";
import DashboardPage from "@/features/dashboard/DashboardPage";
import ProjectsPage from "@/features/projects/ProjectsPage";
import ProjectDetailPage from "@/features/projects/ProjectDetailPage";
import BoardsListPage from "@/features/boards/BoardsListPage";
import BoardDetailPage from "@/features/boards/BoardDetailPage";
import SettingsPage from "@/features/settings/SettingsPage";

export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
        <Route path="/boards" element={<BoardsListPage />} />
        <Route path="/boards/:boardId" element={<BoardDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
