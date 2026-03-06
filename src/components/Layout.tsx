import { Link, useLocation } from "react-router-dom";
import { Github, LayoutDashboard, Database, Users, Compass, BookOpen, AlertTriangle, X, ChevronDown, Folder } from "lucide-react";
import { ModeToggle } from "./ModeToggle";
import { useState, useEffect, useRef } from "react";
import { errorBus } from "../services/errorBus";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRepoHubOpen, setIsRepoHubOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = errorBus.subscribe((msg) => {
      setErrorMessage(msg);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsRepoHubOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      {/* Error Banner */}
      {errorMessage && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-yellow-800 dark:text-yellow-200">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{errorMessage}</p>
            </div>
            <button 
              onClick={() => setErrorMessage(null)}
              className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white dark:bg-card border-b border-gray-200 dark:border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-gray-900 dark:text-foreground">
              <Github className="w-6 h-6" />
              <span>AI Hub</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-1">
              <Link 
                to="/" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  location.pathname === "/" 
                    ? "bg-secondary text-secondary-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              
              <Link 
                to="/my-repos" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  location.pathname === "/my-repos" 
                    ? "bg-secondary text-secondary-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                <Github className="w-4 h-4" />
                My Repos
              </Link>

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsRepoHubOpen(!isRepoHubOpen)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                    isRepoHubOpen || ["/ai-index", "/dev-index", "/awesome-ai", "/ai-explorer"].includes(location.pathname)
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  <Folder className="w-4 h-4" />
                  Repo Hub
                  <ChevronDown className={`w-4 h-4 transition-transform ${isRepoHubOpen ? "rotate-180" : ""}`} />
                </button>

                {isRepoHubOpen && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-popover border border-border shadow-md rounded-md py-1 z-50 flex flex-col animate-in fade-in zoom-in-95 duration-100">
                    <Link 
                      to="/ai-index" 
                      className={`px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2 ${
                        location.pathname === "/ai-index" ? "bg-accent/50 text-accent-foreground" : ""
                      }`}
                      onClick={() => setIsRepoHubOpen(false)}
                    >
                      <Database className="w-4 h-4" /> AI Index
                    </Link>
                    <Link 
                      to="/dev-index" 
                      className={`px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2 ${
                        location.pathname === "/dev-index" ? "bg-accent/50 text-accent-foreground" : ""
                      }`}
                      onClick={() => setIsRepoHubOpen(false)}
                    >
                      <Users className="w-4 h-4" /> Dev Index
                    </Link>
                    <Link 
                      to="/awesome-ai" 
                      className={`px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2 ${
                        location.pathname === "/awesome-ai" ? "bg-accent/50 text-accent-foreground" : ""
                      }`}
                      onClick={() => setIsRepoHubOpen(false)}
                    >
                      <BookOpen className="w-4 h-4" /> Awesome AI
                    </Link>
                    <Link 
                      to="/ai-explorer" 
                      className={`px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2 ${
                        location.pathname === "/ai-explorer" ? "bg-accent/50 text-accent-foreground" : ""
                      }`}
                      onClick={() => setIsRepoHubOpen(false)}
                    >
                      <Compass className="w-4 h-4" /> AI Explorer
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
