
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserPreferences } from "@/hooks/use-user-preferences";

type ThemePreference = 'light' | 'dark' | 'system';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { user } = useAuth();
  const { preferences, updateThemePreference } = useUserPreferences();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply saved theme preference when user is authenticated and preferences are loaded
  useEffect(() => {
    if (user && preferences && mounted && preferences.theme_preference !== theme) {
      console.log('Applying saved theme preference:', preferences.theme_preference);
      setTheme(preferences.theme_preference);
    }
  }, [user, preferences, mounted, setTheme, theme]);

  // Ensure system theme gets its own class
  useEffect(() => {
    if (mounted && theme) {
      console.log('Current theme:', theme, 'Resolved theme:', resolvedTheme);
      document.documentElement.classList.remove('light', 'dark', 'system');
      
      if (theme === 'system') {
        document.documentElement.classList.add('system');
      } else {
        document.documentElement.classList.add(theme);
      }
      
      console.log('Applied theme class:', theme);
    }
  }, [mounted, theme, resolvedTheme]);

  const handleThemeChange = async (newTheme: ThemePreference) => {
    console.log('Changing theme to:', newTheme);
    setTheme(newTheme);
    
    // Save to database if user is authenticated
    if (user) {
      await updateThemePreference(newTheme);
    }
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9 chrome-button">
        <div className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 chrome-button relative overflow-hidden">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-500 dark:-rotate-90 dark:scale-0 text-amber-500" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100 text-indigo-400" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="chrome-card border-0 backdrop-blur-xl bg-white/90 dark:bg-slate-800/90 z-50"
      >
        <DropdownMenuItem 
          onClick={() => handleThemeChange("light")}
          className="chrome-button border-0 mb-1 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-300 cursor-pointer"
        >
          <Sun className="mr-2 h-4 w-4 text-amber-500" />
          <span className="font-medium">Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleThemeChange("dark")}
          className="chrome-button border-0 mb-1 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-300 cursor-pointer"
        >
          <Moon className="mr-2 h-4 w-4 text-indigo-400" />
          <span className="font-medium">Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleThemeChange("system")}
          className="chrome-button border-0 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-300 cursor-pointer"
        >
          <Monitor className="mr-2 h-4 w-4 text-teal-500" />
          <span className="font-medium">System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
