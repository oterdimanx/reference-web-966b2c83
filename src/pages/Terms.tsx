
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';

const Terms = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>

          <div className="prose dark:prose-invert max-w-none">
            <p className="mb-4">
              Last updated: May 20, 2025
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
            <p className="mb-4">
              By accessing or using Reference-Web ("the Service"), you agree to be bound by these Terms of Service. 
              If you disagree with any part of the terms, you may not access the Service.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">2. User Accounts</h2>
            <p className="mb-4">
              When you create an account with us, you must provide accurate, complete, and current information. 
              You are responsible for safeguarding the password and for all activities under your account.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">3. Service Usage</h2>
            <p className="mb-4">
              Users may not use the Service to:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Violate any laws or regulations</li>
              <li>Infringe upon intellectual property rights</li>
              <li>Transmit harmful code or malware</li>
              <li>Attempt to gain unauthorized access to systems</li>
              <li>Harvest or collect data without consent</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Content Ownership</h2>
            <p className="mb-4">
              The Service and its contents are owned by Reference-Web and are protected by copyright, 
              trademark, and other intellectual property laws.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Subscription and Payments</h2>
            <p className="mb-4">
              Some features of the Service require a subscription. You agree to pay all fees associated 
              with your subscription plan. Fees are non-refundable except as required by law.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Termination</h2>
            <p className="mb-4">
              We may terminate or suspend your account at any time, without prior notice, for conduct that 
              we determine violates these Terms or is harmful to other users, us, or third parties.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Limitation of Liability</h2>
            <p className="mb-4">
              To the maximum extent permitted by law, Reference-Web shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages resulting from your use of the Service.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">8. Changes to Terms</h2>
            <p className="mb-4">
              We reserve the right to modify these Terms at any time. We will notify users of material changes 
              by posting the new Terms on this page and updating the "Last updated" date.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">9. Contact Us</h2>
            <p className="mb-4">
              If you have any questions about these Terms, please contact us at 
              <a href="mailto:legal@reference-web.com" className="text-rank-teal hover:underline"> legal@reference-web.com</a>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
