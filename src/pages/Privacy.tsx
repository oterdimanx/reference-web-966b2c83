
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';

const Privacy = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

          <div className="prose dark:prose-invert max-w-none">
            <p className="mb-4">
              Last updated: May 20, 2025
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Introduction</h2>
            <p className="mb-4">
              Reference-Web ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, and share your information when you use our website and services.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Information We Collect</h2>
            <p className="mb-4">
              We collect information you provide directly to us, such as when you create an account, 
              subscribe to updates, or contact us for support. This may include:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Contact information (name, email address)</li>
              <li>Account credentials</li>
              <li>Website URLs and domains you submit for tracking</li>
              <li>Keywords you wish to monitor</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Your Information</h2>
            <p className="mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Process and complete transactions</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Monitor and analyze trends, usage, and activities</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Data Sharing</h2>
            <p className="mb-4">
              We may share your information with:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Service providers who perform functions on our behalf</li>
              <li>Business partners with your consent</li>
              <li>Legal authorities when required by law</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Your Rights</h2>
            <p className="mb-4">
              You have the right to access, correct, or delete your personal information. 
              To exercise these rights, please contact us at 
              <a href="mailto:privacy@reference-web.com" className="text-rank-teal hover:underline"> privacy@reference-web.com</a>.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Changes to This Policy</h2>
            <p className="mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any changes 
              by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
            <p className="mb-4">
              If you have any questions about this Privacy Policy, please contact us at 
              <a href="mailto:privacy@reference-web.com" className="text-rank-teal hover:underline"> privacy@reference-web.com</a>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
