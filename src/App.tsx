import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from 'next-themes';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import TopNav from '@/components/TopNav';
import Rendas from "./pages/Rendas";
import Despesas from "./pages/Despesas";
import Cartoes from "./pages/Cartoes";
import Cofrinhos from "./pages/Cofrinhos";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
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

const AppContent = () => {
  const location = useLocation();
  const hideTopNavPaths = ['/', '/login', '/register'];
  const isLandingLike = hideTopNavPaths.includes(location.pathname);

  return (
    <>
      {!isLandingLike && <TopNav />}
      <div className={!isLandingLike ? "pt-16 md:pt-20" : ""}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/profile"
            element={(
              <RequireAuth>
                <Profile />
              </RequireAuth>
            )}
          />
          <Route
            path="/app"
            element={(
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            )}
          />
          <Route
            path="/rendas"
            element={(
              <RequireAuth>
                <Rendas />
              </RequireAuth>
            )}
          />
          <Route
            path="/despesas"
            element={(
              <RequireAuth>
                <Despesas />
              </RequireAuth>
            )}
          />
          <Route
            path="/cartoes"
            element={(
              <RequireAuth>
                <Cartoes />
              </RequireAuth>
            )}
          />
          <Route
            path="/cofrinhos"
            element={(
              <RequireAuth>
                <Cofrinhos />
              </RequireAuth>
            )}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
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
