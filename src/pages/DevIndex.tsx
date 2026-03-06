import { useState, useEffect } from 'react';
import { searchUsers, getUserProfile, UserProfile } from '../services/github';
import { Github, Twitter, MapPin, Link as LinkIcon, Users, Building, Code } from 'lucide-react';
import { Layout } from '../components/Layout';
import { CsvControls } from '../components/CsvControls';
import { HelpDrawer } from '../components/HelpDrawer';
import { HelpButton } from '../components/HelpButton';

export default function DevIndex() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    const fetchDevs = async () => {
      try {
        // Search for users with specified keywords in their bio/readme
        // Simplified query to avoid GitHub API 422 errors (too complex)
        const query = 'type:user sort:followers "ai" OR "machine learning" OR "llm" OR "generative ai" OR "deep learning"';
        
        const searchResults = await searchUsers(query, 50);
        
        // Fetch detailed profiles for the top results to get bio, location, etc.
        // We limit to 50 as requested, but handle potential rate limits
        const profiles = await Promise.all(
          searchResults.map(user => getUserProfile(user.login).catch(err => {
            console.warn(`Failed to fetch profile for ${user.login}`, err);
            return null;
          }))
        );
        
        // Filter out any failed profile fetches
        setUsers(profiles.filter((p): p is UserProfile => p !== null));
      } catch (err) {
        console.error(err);
        setError('Failed to load developers. GitHub API rate limit might be exceeded.');
      } finally {
        setLoading(false);
      }
    };

    fetchDevs();
  }, []);

  const handleImport = (importedData: UserProfile[]) => {
    setUsers(importedData);
    alert(`Imported ${importedData.length} developers.`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[50vh] text-red-500">
          {error}
        </div>
      </Layout>
    );
  }

  if (!loading && !error && users.length === 0) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[50vh] text-muted-foreground">
          No developers found.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-foreground flex items-center gap-2">
              <Code className="w-8 h-8 text-primary" />
              Dev Index
            </h1>
            <p className="text-muted-foreground mt-2">
              Top 50 developers in AI, Vibe Coding, LLMs, and more.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CsvControls 
              data={users} 
              filename="ai-developers.csv" 
              onImport={handleImport} 
            />
            <HelpButton onClick={() => setIsHelpOpen(true)} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map(user => (
            <div key={user.id} className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full">
              <div className="flex items-start gap-4 mb-4">
                <img 
                  src={user.avatar_url} 
                  alt={user.login} 
                  className="w-16 h-16 rounded-full border border-gray-100 dark:border-gray-800 object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate text-gray-900 dark:text-foreground">
                    <a href={user.html_url} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                      {user.name || user.login}
                    </a>
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">@{user.login}</p>
                  {user.company && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 truncate">
                      <Building className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{user.company}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-muted-foreground line-clamp-3 mb-6 flex-grow">
                {user.bio || "No bio available"}
              </p>

              <div className="space-y-3 text-sm text-muted-foreground mt-auto pt-4 border-t border-gray-100 dark:border-border">
                {user.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{user.location}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{user.followers.toLocaleString()} followers</span>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <a 
                    href={user.html_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-gray-400 hover:text-gray-900 dark:hover:text-foreground transition-colors"
                    title="GitHub Profile"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                  
                  {user.twitter_username && (
                    <a 
                      href={`https://twitter.com/${user.twitter_username}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                      title="Twitter Profile"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                  
                  {user.blog && (
                    <a 
                      href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-gray-400 hover:text-primary transition-colors"
                      title="Website"
                    >
                      <LinkIcon className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <HelpDrawer
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title="About Dev Index"
      >
        <p className="lead">
          Dev Index showcases top developers and contributors in the AI and Machine Learning space.
        </p>
        
        <h3>What is this page?</h3>
        <p>
          This page lists influential developers who are actively contributing to AI, LLMs, and related technologies on GitHub. It's a great way to find people to follow and learn from.
        </p>

        <h3>How to use</h3>
        <ul>
          <li><strong>Connect:</strong> Click on the social icons (GitHub, Twitter, Website) to connect with the developers.</li>
          <li><strong>Learn:</strong> Read their bios to understand their areas of expertise and current focus.</li>
          <li><strong>Location:</strong> See where these developers are based around the world.</li>
        </ul>

        <h3>Data Management</h3>
        <p>
          You can export the list of developers to a CSV file to build your own network or analysis.
        </p>
      </HelpDrawer>
    </Layout>
  );
}
