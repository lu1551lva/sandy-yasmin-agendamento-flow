
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/auth-context";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PublicLayout from "./components/layouts/PublicLayout";
import AdminLayout from "./components/layouts/AdminLayout";
import SalonAppointment from "./pages/public/SalonAppointment";
import AdminLogin from "./pages/admin/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/admin/Dashboard";
import AppointmentList from "./pages/admin/AppointmentList";
import WeeklySchedule from "./pages/admin/WeeklySchedule";
import Professionals from "./pages/admin/Professionals";
import Services from "./pages/admin/Services";
import WhatsAppMessages from "./pages/admin/WhatsAppMessages";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { initializeDefaultData } from "@/lib/initData";

// Super Admin
import SuperAdminLayout from "./pages/superadmin/SuperAdminLayout";
import SuperAdminDashboard from "./pages/superadmin/Dashboard";
import SaloesList from "./pages/superadmin/SaloesList";
import SuperAdminStatistics from "./pages/superadmin/Statistics";
import SuperAdminSettings from "./pages/superadmin/Settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, 
      retry: 1,
    },
  },
});

const App = () => {
  // Initialize default data
  useEffect(() => {
    const initData = async () => {
      await initializeDefaultData();
    };
    
    initData();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Navigate to="/agendar" replace />} />
                <Route path="/agendar" element={<Navigate to="/registrar" replace />} />
                <Route path="/agendar/:slug" element={<SalonAppointment />} />
              </Route>

              {/* Auth Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/registrar" element={<Register />} />

              {/* Admin Routes - Multi-Tenant */}
              <Route 
                path="/admin/:slug" 
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="agendamentos" element={<AppointmentList />} />
                <Route path="agenda-semanal" element={<WeeklySchedule />} />
                <Route path="profissionais" element={<Professionals />} />
                <Route path="servicos" element={<Services />} />
                <Route path="mensagens" element={<WhatsAppMessages />} />
              </Route>
              
              {/* Redirects for old routes */}
              <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
              <Route path="/admin/dashboard" element={<Navigate to="/admin/login" replace />} />
              
              {/* Super Admin Routes */}
              <Route
                path="/superadmin"
                element={
                  <ProtectedRoute>
                    <SuperAdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<SuperAdminDashboard />} />
                <Route path="saloes" element={<SaloesList />} />
                <Route path="estatisticas" element={<SuperAdminStatistics />} />
                <Route path="configuracoes" element={<SuperAdminSettings />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
