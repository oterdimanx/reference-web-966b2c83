import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient } from 'react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Home from './pages/Home';
import About from './pages/About';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import AdminPage from './pages/Admin';
import Websites from './pages/Websites';
import AddWebsite from './pages/AddWebsite';
import Directories from './pages/Directories';
import AdminDirectory from './pages/Admin/Directory';
import AdminDirectoryCategories from './pages/Admin/DirectoryCategories';

function App() {
  return (
    <BrowserRouter>
      <QueryClient>
        <LanguageProvider>
          <AuthProvider>
            <Toaster />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/websites" element={<Websites />} />
              <Route path="/add-website" element={<AddWebsite />} />
              <Route path="/directories" element={<Directories />} />
              <Route path="/admin/directory" element={<AdminDirectory />} />
              <Route path="/admin/directory/categories" element={<AdminDirectoryCategories />} />
            </Routes>
          </AuthProvider>
        </LanguageProvider>
      </QueryClient>
    </BrowserRouter>
  );
}

export default App;
