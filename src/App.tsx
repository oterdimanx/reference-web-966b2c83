
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Index from './pages/Index';
import About from './pages/About';
import Pricing from './pages/Pricing';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import AdminPage from './pages/Admin';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminAnalytics from './pages/Admin/Analytics';
import AdminPricing from './pages/Admin/Pricing';
import AddWebsite from './pages/AddWebsite';
import AllWebsites from './pages/AllWebsites';
import Directories from './pages/Directories';
import AdminDirectory from './pages/Admin/Directory';
import AdminDirectoryCategories from './pages/Admin/DirectoryCategories';
import Sitemap from './pages/Sitemap';
import SitemapXml from './pages/SitemapXml';

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
          themes={['light', 'dark', 'system']}
          value={{
            light: 'light',
            dark: 'dark',
            system: 'system'
          }}
        >
          <LanguageProvider>
            <AuthProvider>
              <Toaster />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/admin/dashboard-rw" element={<AdminDashboard />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
                <Route path="/admin/pricing" element={<AdminPricing />} />
                <Route path="/add-website" element={<AddWebsite />} />
                <Route path="/all-websites" element={<AllWebsites />} />
                <Route path="/directories" element={<Directories />} />
                <Route path="/admin/directory" element={<AdminDirectory />} />
                <Route path="/admin/directory/categories" element={<AdminDirectoryCategories />} />
                <Route path="/sitemap" element={<Sitemap />} />
                <Route path="/sitemap.xml" element={<SitemapXml />} />
              </Routes>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
