import { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { FileTree } from '../components/FileTree';
import { MarkdownViewer } from '../components/MarkdownViewer';
import { fetchRepoTree, fetchFileContent, buildFileTree, fetchRepoInfo, GitHubError } from '../services/github';
import { FileNode, RepoInfo, FileCache } from '../types';
import { Search, FileText, AlertCircle, Github, Code, Eye, ExternalLink, Copy, Download, Check, ArrowLeft, Loader2, Edit2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from "@/components/ui/button";
import { Layout } from '../components/Layout';
import { useRepoStore } from '../hooks/useRepoStore';
import { AddRepoModal } from '../components/AddRepoModal';
import { CsvControls } from '../components/CsvControls';
import { HelpDrawer } from '../components/HelpDrawer';
import { HelpButton } from '../components/HelpButton';

export default function RepoDetail() {
  const { owner, repo } = useParams();
  const [searchParams] = useSearchParams();
  const recursive = searchParams.get('recursive') === 'true';

  const { repos, updateRepo, getCategories } = useRepoStore();
  const savedRepo = useMemo(() => repos.find(r => r.owner === owner && r.repo === repo), [repos, owner, repo]);
  const categories = getCategories();

  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [fileCache, setFileCache] = useState<FileCache>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'raw' | 'preview'>('preview');
  const [copied, setCopied] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    if (owner && repo) {
      loadRepo(owner, repo, recursive);
    }
  }, [owner, repo, recursive]);

  const loadRepo = async (owner: string, repo: string, recursive: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const [info, treeNodes] = await Promise.all([
        fetchRepoInfo(owner, repo),
        fetchRepoTree(owner, repo, recursive)
      ]);

      setRepoInfo(info);
      const tree = buildFileTree(treeNodes);
      setFiles(tree);

      const readme = treeNodes.find(n => n.name.toLowerCase() === 'readme.md');
      if (readme) {
        handleSelectFile(readme, info);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load repository');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFile = async (node: FileNode, currentRepoInfo = repoInfo) => {
    if (!currentRepoInfo) return;
    
    setSelectedFile(node);
    // Auto-detect view mode
    const isMarkdown = node.name.toLowerCase().endsWith('.md');
    setViewMode(isMarkdown ? 'preview' : 'raw');
    
    if (fileCache[node.path]) {
      setFileContent(fileCache[node.path]);
      return;
    }

    setContentLoading(true);
    try {
      const content = await fetchFileContent(
        currentRepoInfo.owner, 
        currentRepoInfo.repo, 
        node.path,
        currentRepoInfo.default_branch
      );
      setFileContent(content);
      setFileCache(prev => ({ ...prev, [node.path]: content }));
    } catch (err) {
      console.error(err);
      setFileContent('Error loading file content.');
    } finally {
      setContentLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!selectedFile) return;
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filterNodes = (nodes: FileNode[], query: string): FileNode[] => {
    if (!query) return nodes;
    return nodes.reduce((acc: FileNode[], node) => {
      if (node.type === 'blob') {
        if (node.name.toLowerCase().includes(query.toLowerCase())) {
          acc.push(node);
        }
      } else if (node.children) {
        const filteredChildren = filterNodes(node.children, query);
        if (filteredChildren.length > 0) {
          acc.push({ ...node, children: filteredChildren });
        }
      }
      return acc;
    }, []);
  };

  const displayedFiles = useMemo(() => filterNodes(files, searchQuery), [files, searchQuery]);

  const flatFiles = useMemo(() => {
    const flatten = (nodes: FileNode[]): any[] => {
        let res: any[] = [];
        nodes.forEach(node => {
            const { children, ...rest } = node;
            res.push(rest);
            if (children) {
                res = res.concat(flatten(children));
            }
        });
        return res;
    };
    return flatten(files);
  }, [files]);

  const handleImport = (importedData: any[]) => {
    try {
        const nodes = importedData as FileNode[];
        const tree = buildFileTree(nodes);
        setFiles(tree);
        alert(`Imported file structure with ${nodes.length} nodes.`);
    } catch (e) {
        console.error("Import failed", e);
        alert("Failed to import file structure.");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-full mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Something went wrong</h3>
          <p className="text-muted-foreground max-w-md mb-6">{error}</p>
          <Link to="/">
            <Button variant="outline">Go Back Home</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Sub-header: back button, repo name, actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-secondary/50"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
            <Github className="w-5 h-5" />
            <span>{repoInfo?.owner} / {repoInfo?.repo}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CsvControls
            data={flatFiles}
            filename={`${repoInfo?.repo || 'repo'}-files.csv`}
            onImport={handleImport}
            className="mr-1"
          />
          {savedRepo && (
            <AddRepoModal
              onAdd={updateRepo}
              existingCategories={categories}
              repoToEdit={savedRepo}
              trigger={
                <Button variant="ghost" size="icon" title="Edit Repo Details">
                  <Edit2 className="w-4 h-4" />
                </Button>
              }
            />
          )}
          <HelpButton onClick={() => setIsHelpOpen(true)} />
        </div>
      </div>

      {/* File Browser */}
      <div className="flex gap-0 border border-border rounded-xl overflow-hidden" style={{height: 'calc(100vh - 220px)'}}>
        {/* Sidebar */}
        <div className="w-72 border-r border-border bg-muted/10 flex flex-col flex-shrink-0">
          <div className="p-2 border-b border-border bg-card sticky top-0">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search files..."
                className="w-full pl-8 pr-3 py-2 text-sm border border-input rounded-md focus:outline-none focus:border-ring bg-background dark:text-foreground"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {displayedFiles.length > 0 ? (
              <FileTree
                files={displayedFiles}
                onSelectFile={(node) => handleSelectFile(node)}
                selectedFile={selectedFile}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No files found
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-background relative">
          {selectedFile ? (
            <div className="min-h-full">
              <div className="border-b border-border p-3 sticky top-0 bg-background/90 backdrop-blur-sm z-10 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium text-foreground truncate">{selectedFile.path}</span>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  <div className="flex items-center bg-muted rounded-lg p-1 mr-1">
                    <button
                      onClick={() => setViewMode('preview')}
                      className={cn(
                        "px-3 py-1 text-xs font-medium rounded-md transition-all",
                        viewMode === 'preview'
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => setViewMode('raw')}
                      className={cn(
                        "px-3 py-1 text-xs font-medium rounded-md transition-all",
                        viewMode === 'raw'
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Raw
                    </button>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy} title="Copy">
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDownload} title="Download">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="View on GitHub">
                    <a
                      href={`https://github.com/${repoInfo?.owner}/${repoInfo?.repo}/blob/${repoInfo?.default_branch || 'HEAD'}/${selectedFile.path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>
              <MarkdownViewer content={fileContent} loading={contentLoading} viewMode={viewMode} fileName={selectedFile.name} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 opacity-20" />
              </div>
              <p className="text-lg font-medium text-foreground mb-1">Select a file</p>
              <p className="max-w-md">Choose a file from the sidebar to view its content.</p>
            </div>
          )}
        </div>
      </div>

      <HelpDrawer
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title="About Repository View"
      >
        <p className="lead">
          Explore the file structure and content of any GitHub repository.
        </p>
        <h3>What is this page?</h3>
        <p>
          This page shows a file explorer for the selected repository. You can navigate through folders and view file contents directly in the browser.
        </p>
        <h3>How to use</h3>
        <ul>
          <li><strong>Navigation:</strong> Use the sidebar to browse folders and files. Click on a file to view its content.</li>
          <li><strong>Search:</strong> Use the search bar in the sidebar to filter files by name.</li>
          <li><strong>View Modes:</strong> Toggle between "Preview" (rendered Markdown) and "Raw" (source code) for Markdown files.</li>
          <li><strong>Actions:</strong> Use the toolbar buttons to copy file content, download the file, or open it on GitHub.</li>
        </ul>
        <h3>Data Management</h3>
        <p>
          You can export the file structure to a CSV file. You can also import a CSV file to visualize a file structure offline.
        </p>
      </HelpDrawer>
    </Layout>
  );
}
