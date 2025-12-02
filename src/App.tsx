import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from 'next-themes';
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import TopNav from '@/components/TopNav';
import Rendas from "./pages/Rendas";
import Despesas from "./pages/Despesas";
import Cartoes from "./pages/Cartoes";
import Cofrinhos from "./pages/Cofrinhos";
import NotFound from "./pages/NotFound";

const AppContent = () => {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <>
      {!isLanding && <TopNav />}
      <div className={!isLanding ? "pt-16 md:pt-20" : ""}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/app" element={<Dashboard />} />
          <Route path="/rendas" element={<Rendas />} />
          <Route path="/despesas" element={<Despesas />} />
          <Route path="/cartoes" element={<Cartoes />} />
          <Route path="/cofrinhos" element={<Cofrinhos />} />
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
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
