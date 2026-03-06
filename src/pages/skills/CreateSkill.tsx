import { Layout } from "../../components/Layout";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSkillStore } from "../../hooks/useSkillStore";
import { Skill, SAMPLE_SKILL_TEMPLATE, exportSkillAsMarkdown } from "../../types/skill";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Download, FileSignature, Save, Clock, CalendarDays } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function CreateSkill() {
  const navigate = useNavigate();
  const { addSkill, getCategories, getLanguages } = useSkillStore();
  const existingCategories = getCategories();
  const existingLanguages = getLanguages();

  // Basic info form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [language, setLanguage] = useState("");
  const [newLanguage, setNewLanguage] = useState("");
  const [version, setVersion] = useState("1.0.0");
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  
  // Editor state
  const [instructions, setInstructions] = useState("");

  // System dates
  const now = new Date();
  const formattedDate = now.toLocaleDateString() + " " + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleLoadTemplate = () => {
    if (instructions.trim() && !window.confirm("This will overwrite your current instructions. Continue?")) {
      return;
    }
    setInstructions(SAMPLE_SKILL_TEMPLATE);
  };

  const handleDownload = () => {
    const finalCategory = category === "new" ? newCategory : category;
    const finalLanguage = language === "new" ? newLanguage : language;
    const skillData = {
      name,
      category: finalCategory,
      language: finalLanguage,
      version,
      description,
      tags,
      instructions
    };
    
    const mdContent = exportSkillAsMarkdown(skillData);
    
    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name ? name.toLowerCase().replace(/\s+/g, '-') : 'new-skill'}-v${version}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert("Please enter a skill name");
      return;
    }

    const finalCategory = category === "new" ? newCategory : category;
    const finalLanguage = language === "new" ? newLanguage : language;

    const newSkill: Skill = {
      id: crypto.randomUUID(),
      name,
      category: finalCategory || "Uncategorized",
      language: finalLanguage || undefined,
      version,
      description,
      tags,
      instructions,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    addSkill(newSkill);
    navigate("/skills/library"); // Placeholder navigation depending on next tasks
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-foreground">
              Create New Skill
            </h1>
            <p className="text-muted-foreground mt-1">
              Design, template, and save a reusable instruction set.
            </p>
          </div>
          <Button onClick={handleSave} className="w-full md:w-auto">
            <Save className="w-4 h-4 mr-2" />
            Save to Library
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Basic Info */}
          <div className="lg:col-span-1 space-y-6 bg-white dark:bg-card border border-border rounded-xl shadow-sm p-6 h-fit">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2 border-b border-border pb-2">
                Basic Information
              </h2>

              <div className="space-y-2">
                <Label htmlFor="skill-name">Skill Name <span className="text-red-500">*</span></Label>
                <Input 
                  id="skill-name" 
                  placeholder="e.g. Code Review Assistant" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {existingCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                    <SelectItem value="new">+ Create New Category</SelectItem>
                  </SelectContent>
                </Select>
                {category === "new" && (
                  <Input 
                    placeholder="Enter new category name..." 
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="mt-2"
                    autoFocus
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent>
                    {existingLanguages.map(lang => (
                      <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                    ))}
                    <SelectItem value="new">+ Create New Language</SelectItem>
                  </SelectContent>
                </Select>
                {language === "new" && (
                  <Input 
                    placeholder="Enter new language name..." 
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    className="mt-2"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input 
                  id="version" 
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Short)</Label>
                <Textarea 
                  id="description" 
                  placeholder="Briefly describe what this skill does..." 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="resize-none h-20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (Press Enter to add)</Label>
                <Input 
                  id="tags" 
                  placeholder="e.g. development, review..." 
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                />
                <div className="flex flex-wrap gap-2 pt-2">
                  {tags.map(tag => (
                    <Badge 
                      key={tag} 
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      onClick={() => handleRemoveTag(tag)}
                      title="Click to remove"
                    >
                      {tag} &times;
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <h2 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" /> System Metadata
              </h2>
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5"><CalendarDays className="w-3 h-3"/> Created Date</span>
                  <span>{formattedDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5"><CalendarDays className="w-3 h-3"/> Last Edited</span>
                  <span>{formattedDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Markdown Editor */}
          <div className="lg:col-span-2 bg-white dark:bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
            
            {/* Editor Header */}
            <div className="bg-muted/30 border-b border-border px-4 py-3 xl:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Skill Template Editor</h2>
              
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLoadTemplate}
                  className="h-8 text-xs bg-white dark:bg-background"
                >
                  <FileSignature className="w-3.5 h-3.5 mr-1.5" />
                  Load Sample Template
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDownload}
                  className="h-8 text-xs bg-white dark:bg-background"
                  title="Download as Markdown"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Download
                </Button>
              </div>
            </div>

            {/* Editor Body */}
            <div className="p-4 xl:p-6 flex-1 flex flex-col">
              <Label htmlFor="instructions" className="sr-only">Markdown Instructions</Label>
              <Textarea 
                id="instructions"
                placeholder="Write your markdown instructions here. Use the 'Load Sample Template' logic for a quick start."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="flex-1 min-h-[500px] font-mono text-sm resize-y focus-visible:ring-1 border-muted"
                spellCheck={false}
              />
            </div>
            
          </div>

        </div>
      </div>
    </Layout>
  );
}
