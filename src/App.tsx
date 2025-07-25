
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, AdminRedirectProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "next-themes";
import { SecurityHeaders } from "@/components/Security/SecurityHeaders";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import AllWebsites from "./pages/AllWebsites";
import AddWebsite from "./pages/AddWebsite";
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Rankings from "./pages/Rankings";
import Keywords from "./pages/Keywords";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/Admin/Dashboard";
import AdminPricing from "./pages/Admin/Pricing";
import AdminAnalytics from "./pages/Admin/Analytics";
import AdminDirectory from "./pages/Admin/Directory";
import AdminDirectoryCategories from './pages/Admin/DirectoryCategories';
import AdminRankings from "./pages/Admin/Rankings";
import Directories from "./pages/Directories";
import Sitemap from "./pages/Sitemap";
import SitemapXml from "./pages/SitemapXml";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider 
      attribute="class" 
      defaultTheme="system" 
      enableSystem={false}
      themes={['light', 'dark', 'system']}
    >
      <TooltipProvider>
        <SecurityHeaders />
        <BrowserRouter>
          <AuthProvider>
            <LanguageProvider>
              <AdminRedirectProvider>
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/directories" element={<Directories />} />
                  <Route path="/rankings" element={<Rankings />} />
                  <Route path="/keywords" element={<Keywords />} />
                  <Route path="/sitemap" element={<Sitemap />} />
                  <Route path="/sitemap.xml" element={<SitemapXml />} />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  <Route path="/all-websites" element={
                    <ProtectedRoute>
                      <AllWebsites />
                    </ProtectedRoute>
                  } />
                  <Route path="/add-website" element={
                    <ProtectedRoute>
                      <AddWebsite />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin" element={
                    <ProtectedRoute>
                      <Admin />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/dashboard-rw" element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/pricing" element={
                    <ProtectedRoute>
                      <AdminPricing />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/analytics" element={
                    <ProtectedRoute>
                      <AdminAnalytics />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/rankings" element={
                    <ProtectedRoute>
                      <AdminRankings />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/directory" element={
                    <ProtectedRoute>
                      <AdminDirectory />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/directory/categories" element={
                    <ProtectedRoute>
                      <AdminDirectoryCategories />
                    </ProtectedRoute>
                  } />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AdminRedirectProvider>
            </LanguageProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
