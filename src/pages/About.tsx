
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';

const About = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">About Reference-Web</h1>

          <div className="prose dark:prose-invert max-w-none">
            <p className="mb-4">
              Reference-Web is a powerful SEO ranking and website monitoring platform designed to help businesses and individuals 
              track their online presence and improve their search engine rankings.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
            <p className="mb-4">
              Our mission is to provide accessible and actionable insights into website performance, 
              helping our users make data-driven decisions to improve their online visibility.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">The Team</h2>
            <p className="mb-4">
              Founded by a team of SEO experts and web developers, Reference-Web combines technical 
              expertise with user-friendly design to deliver a seamless experience.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Our Technology</h2>
            <p className="mb-4">
              We use cutting-edge technology to gather and analyze data from search engines, providing 
              accurate and up-to-date information about your website's performance.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
            <p className="mb-4">
              Have questions or feedback? We'd love to hear from you! Contact our support team 
              at <a href="mailto:support@reference-web.com" className="text-rank-teal hover:underline">support@reference-web.com</a>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
