import { useState, useEffect } from 'react';
import { FileNode } from '../types';
import { ChevronRight, ChevronDown, FileText, Folder } from 'lucide-react';
import { cn } from '../lib/utils';

interface FileTreeProps {
  files: FileNode[];
  onSelectFile: (file: FileNode) => void;
  selectedFile: FileNode | null;
}

const FileTreeNode = ({ 
  node, 
  depth, 
  onSelectFile, 
  selectedFile 
}: { 
  node: FileNode; 
  depth: number; 
  onSelectFile: (file: FileNode) => void;
  selectedFile: FileNode | null;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isSelected = selectedFile?.path === node.path;

  // Auto-expand if a child is selected
  useEffect(() => {
    if (selectedFile?.path.startsWith(node.path + '/')) {
      setIsOpen(true);
    }
  }, [selectedFile, node.path]);

  if (node.type === 'blob') {
    return (
      <div
        className={cn(
          "flex items-center py-1 px-2 cursor-pointer text-sm hover:bg-gray-100 dark:hover:bg-muted/50 transition-colors rounded-sm",
          isSelected && "bg-gray-200 dark:bg-muted font-medium text-black dark:text-foreground"
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => onSelectFile(node)}
      >
        <FileText className="w-4 h-4 mr-2 text-gray-500 dark:text-muted-foreground" />
        <span className="truncate text-gray-700 dark:text-foreground">{node.name}</span>
      </div>
    );
  }

  return (
    <div>
      <div
        className="flex items-center py-1 px-2 cursor-pointer text-sm hover:bg-gray-100 dark:hover:bg-muted/50 transition-colors rounded-sm text-gray-700 dark:text-foreground font-medium"
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <ChevronDown className="w-4 h-4 mr-2 text-gray-400 dark:text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 mr-2 text-gray-400 dark:text-muted-foreground" />
        )}
        <Folder className="w-4 h-4 mr-2 text-gray-400 dark:text-muted-foreground" />
        <span className="truncate">{node.name}</span>
      </div>
      {isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              onSelectFile={onSelectFile}
              selectedFile={selectedFile}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export function FileTree({ files, onSelectFile, selectedFile }: FileTreeProps) {
  return (
    <div className="w-full">
      {files.map((node) => (
        <FileTreeNode
          key={node.path}
          node={node}
          depth={0}
          onSelectFile={onSelectFile}
          selectedFile={selectedFile}
        />
      ))}
    </div>
  );
}
