import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Sidebar } from "@/components/Sidebar";
import Dashboard from "@/pages/Dashboard";
import UsersPage from "@/pages/UsersPage";
import CreditsPage from "@/pages/CreditsPage";
import TransactionsPage from "@/pages/TransactionsPage";
import HWIDsPage from "@/pages/HWIDsPage";
import SessionsPage from "@/pages/SessionsPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import AuditLogsPage from "@/pages/AuditLogsPage";
import SettingsPage from "@/pages/SettingsPage";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import AboutPage from "@/pages/AboutPage";
import DocsPage from "@/pages/DocsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("admin_jwt");
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function Layout() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/credits" element={<CreditsPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/hwids" element={<HWIDsPage />} />
            <Route path="/sessions" element={<SessionsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/audit-logs" element={<AuditLogsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route
              path="/*"
              element={
                <RequireAuth>
                  <Layout />
                </RequireAuth>
              }
            />
          </Routes>
          <Toaster position="top-right" richColors closeButton />
        </BrowserRouter>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
