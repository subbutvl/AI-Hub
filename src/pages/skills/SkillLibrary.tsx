import { Layout } from "../../components/Layout";
import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { useSkillStore } from "../../hooks/useSkillStore";
import { Skill, exportSkillAsMarkdown } from "../../types/skill";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Edit2, Download, Trash2, Library, Tag, Code2, ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SkillLibrary() {
  const { skills, removeSkill, getCategories, getLanguages } = useSkillStore();
  const categories = getCategories();
  const languages = getLanguages();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');

  const filteredAndSortedSkills = useMemo(() => {
    // 1. Filter
    let result = skills.filter((skill) => {
      // Category Filter
      if (filterCategory !== 'all' && skill.category !== filterCategory) return false;
      
      // Language Filter
      if (filterLanguage !== 'all' && skill.language !== filterLanguage) return false;

      // Text Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          skill.name.toLowerCase().includes(query) ||
          skill.description.toLowerCase().includes(query) ||
          skill.category.toLowerCase().includes(query) ||
          (skill.language && skill.language.toLowerCase().includes(query)) ||
          skill.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      }
      return true;
    });

    // 2. Sort
    result.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        // Date sort (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return result;
  }, [skills, searchQuery, sortBy, filterCategory, filterLanguage]);

  const handleDownload = (skill: Skill) => {
    const mdContent = exportSkillAsMarkdown(skill);
    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${skill.name.toLowerCase().replace(/\s+/g, '-')}-v${skill.version}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the skill "${name}"?`)) {
      removeSkill(id);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-foreground">Skill Library</h1>
        <div className="flex items-center gap-4 w-full sm:w-auto flex-wrap">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search skills..."
              className="pl-9 w-full sm:w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterLanguage} onValueChange={setFilterLanguage}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              {languages.map(lang => (
                <SelectItem key={lang} value={lang}>{lang}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <ArrowUpDown className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Newest First</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
            </SelectContent>
          </Select>
          <Link to="/skills/create" className="w-full sm:w-auto">
            <Button className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Create Skill
            </Button>
          </Link>
        </div>
      </div>

      {filteredAndSortedSkills.length === 0 ? (
        <div className="text-center py-20">
          <div className="bg-white dark:bg-card p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-border inline-block max-w-md">
            <Library className="w-12 h-12 mx-auto text-gray-300 dark:text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-foreground mb-2">No skills found</h2>
            <p className="text-gray-500 dark:text-muted-foreground mb-6">
              {searchQuery ? "Try adjusting your search query." : "Create a reusable skill template to get started."}
            </p>
            {!searchQuery && (
              <Link to="/skills/create">
                <Button>Create your first skill</Button>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedSkills.map((skill) => (
            <div key={skill.id} className="group border border-border rounded-xl p-5 hover:shadow-md transition-all bg-card flex flex-col h-full hover:border-border/80">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg line-clamp-1" title={skill.name}>
                  {skill.name}
                </h3>
                <Badge variant="outline" className="font-mono text-xs whitespace-nowrap bg-muted/50">
                  v{skill.version}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className="text-primary bg-primary/5 text-xs font-semibold border-primary/20">
                  {skill.category}
                </Badge>
                {skill.language && (
                  <Badge variant="outline" className="text-secondary-foreground bg-secondary text-xs flex items-center gap-1">
                    <Code2 className="w-3 h-3" />
                    {skill.language}
                  </Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1" title={skill.description}>
                {skill.description || "No description provided."}
              </p>

              {skill.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-5 items-center">
                  <Tag className="w-3 h-3 text-muted-foreground opacity-70 mr-0.5" />
                  {skill.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                      {tag}
                    </Badge>
                  ))}
                  {skill.tags.length > 3 && (
                    <span className="text-xs text-muted-foreground">+{skill.tags.length - 3}</span>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 pt-4 border-t border-border mt-auto opacity-0 group-hover:opacity-100 transition-opacity">
                <Link to={`/skills/edit/${skill.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full h-8 px-2 text-xs">
                    <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Edit
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDownload(skill)}
                  className="h-8 px-2 text-xs"
                  title="Download Markdown"
                >
                  <Download className="w-3.5 h-3.5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDelete(skill.id, skill.name)}
                  className="h-8 px-2 text-xs text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/30"
                  title="Delete Skill"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
