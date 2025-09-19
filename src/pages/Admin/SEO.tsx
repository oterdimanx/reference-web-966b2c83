import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { MetadataManager } from '@/components/Admin/SEO/MetadataManager';
import { DynamicHead } from '@/components/SEO/DynamicHead';

const AdminSEO = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <DynamicHead 
        pageKey="admin-seo"
        fallbackTitle="SEO Management - Admin"
        fallbackDescription="Manage SEO metadata for all pages in your application"
        fallbackKeywords="seo management, metadata, admin, search optimization"
      />
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <MetadataManager />
      </main>
      <Footer />
    </div>
  );
};

export default AdminSEO;