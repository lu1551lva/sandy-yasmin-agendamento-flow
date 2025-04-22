
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
import Appointment from "./pages/public/Appointment";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/admin/Dashboard";
import AppointmentList from "./pages/admin/AppointmentList";
import WeeklySchedule from "./pages/admin/WeeklySchedule";
import Professionals from "./pages/admin/Professionals";
import Services from "./pages/admin/Services";
import WhatsAppMessages from "./pages/admin/WhatsAppMessages";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => (
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
              <Route path="/agendar" element={<Appointment />} />
            </Route>

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="agendamentos" element={<AppointmentList />} />
              <Route path="agenda-semanal" element={<WeeklySchedule />} />
              <Route path="profissionais" element={<Professionals />} />
              <Route path="servicos" element={<Services />} />
              <Route path="mensagens" element={<WhatsAppMessages />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
