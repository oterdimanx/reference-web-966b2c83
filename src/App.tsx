
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import AllWebsites from "./pages/AllWebsites";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/all-websites" element={
              <ProtectedRoute>
                <AllWebsites />
              </ProtectedRoute>
            } />
            <Route 
              path="/rankings" 
              element={
                <ProtectedRoute>
                  <div>Rankings Page (Protected)</div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/keywords" 
              element={
                <ProtectedRoute>
                  <div>Keywords Page (Protected)</div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/add-website" 
              element={
                <ProtectedRoute>
                  <div>Add Website Page (Protected)</div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <div>Profile Page (Protected)</div>
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
