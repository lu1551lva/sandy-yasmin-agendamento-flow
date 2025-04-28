
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PublicLayout from "./components/layouts/PublicLayout";
import AdminLayout from "./components/layouts/AdminLayout";
import Appointment from "./pages/public/Appointment";
import ClientArea from "./pages/public/ClientArea"; // New import
import AdminLogin from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import AppointmentList from "./pages/admin/AppointmentList";
import WeeklySchedule from "./pages/admin/WeeklySchedule";
import Professionals from "./pages/admin/Professionals";
import Services from "./pages/admin/Services";
import WhatsAppMessages from "./pages/admin/WhatsAppMessages";
import Profile from "./pages/admin/Profile";
import Reviews from "./pages/admin/Reviews"; // Import the new Reviews page
import { AuthProvider } from "./context/auth-context";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import { initializeDefaultData } from "@/lib/initData";
import BlocksList from "./pages/admin/blocks/BlocksList";

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
  useEffect(() => {
    const initData = async () => {
      await initializeDefaultData();
    };
    
    initData();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Navigate to="/agendar" replace />} />
                <Route path="/agendar" element={<Appointment />} />
                <Route path="/cliente" element={<ClientArea />} />
              </Route>

              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/register" element={<Register />} />

              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />

              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="agendamentos" element={<AppointmentList />} />
                <Route path="agenda-semanal" element={<WeeklySchedule />} />
                <Route path="profissionais" element={<Professionals />} />
                <Route path="servicos" element={<Services />} />
                <Route path="mensagens" element={<WhatsAppMessages />} />
                <Route path="perfil" element={<Profile />} />
                <Route path="bloqueios" element={<BlocksList />} />
                <Route path="avaliacoes" element={<Reviews />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
