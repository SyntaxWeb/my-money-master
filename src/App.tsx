import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from 'next-themes';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import TopNav from '@/components/TopNav';
import Rendas from "./pages/Rendas";
import Despesas from "./pages/Despesas";
import Cartoes from "./pages/Cartoes";
import Cofrinhos from "./pages/Cofrinhos";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <TopNav />
        <div className="pt-16 md:pt-20">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/rendas" element={<Rendas />} />
            <Route path="/despesas" element={<Despesas />} />
            <Route path="/cartoes" element={<Cartoes />} />
            <Route path="/cofrinhos" element={<Cofrinhos />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
