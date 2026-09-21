import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from 'next-themes';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Rendas from "./pages/Rendas";
import Despesas from "./pages/Despesas";
import Cartoes from "./pages/Cartoes";
import Cofrinhos from "./pages/Cofrinhos";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import CentralFinanceira from "./pages/CentralFinanceira";
import Settings from "./pages/Settings";
import Financiamentos from "./pages/Financiamentos";
import AppShell from "@/components/AppShell";
import { FinanceDataProvider } from "@/hooks/useFinanceData";

type RequireAuthProps = {
  children: JSX.Element;
};

const RequireAuth = ({ children }: RequireAuthProps) => {
  const location = useLocation();
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const privatePage = (page: JSX.Element) => (
  <RequireAuth>
    <AppShell>{page}</AppShell>
  </RequireAuth>
);

const AppContent = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={privatePage(<Profile />)} />
      <Route path="/central" element={privatePage(<CentralFinanceira />)} />
      <Route path="/settings" element={privatePage(<Settings />)} />
      <Route path="/financiamentos" element={privatePage(<Financiamentos />)} />
      <Route path="/app" element={privatePage(<Dashboard />)} />
      <Route path="/rendas" element={privatePage(<Rendas />)} />
      <Route path="/despesas" element={privatePage(<Despesas />)} />
      <Route path="/cartoes" element={privatePage(<Cartoes />)} />
      <Route path="/cofrinhos" element={privatePage(<Cofrinhos />)} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Toaster />
        <Sonner />
        <FinanceDataProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </FinanceDataProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
