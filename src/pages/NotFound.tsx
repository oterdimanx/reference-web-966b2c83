
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12">
        <div className="text-center max-w-md px-4">
          <h1 className="text-6xl font-bold text-rank-blue mb-4">404</h1>
          <div className="w-24 h-1 bg-rank-teal mx-auto mb-6"></div>
          <p className="text-2xl font-semibold mb-4">Page Not Found</p>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          <Button asChild className="bg-rank-teal hover:bg-rank-teal/90">
            <a href="/">Back to Dashboard</a>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
