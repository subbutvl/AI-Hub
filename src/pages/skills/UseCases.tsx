import { Layout } from "../../components/Layout";
import { useState, useMemo, useRef } from "react";
import { useUseCaseStore } from "../../hooks/useUseCaseStore";
import { usePipelineStore } from "../../hooks/usePipelineStore";
import { useSkillStore } from "../../hooks/useSkillStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import { 
  Lightbulb, 
  ArrowRight,
  Sparkles,
  Search,
  Download,
  Upload,
  Pencil,
  Trash2
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { UseCase } from "../../types/useCase";

export default function UseCases() {
  const navigate = useNavigate();
  const { useCases, deleteUseCase, importUseCases } = useUseCaseStore();
  const { pipelines } = usePipelineStore();
  const { skills } = useSkillStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const DynamicIcon = ({ name, className }: { name: string, className?: string }) => {
    const IconComponent = (LucideIcons as any)[name] || LucideIcons.Lightbulb;
    return <IconComponent className={className} />;
  };

  const getPipelineSkillNames = (pipelineId: string) => {
    if (!pipelineId) return ["Legacy Mock Sequence"]; 
    const pipeline = pipelines.find(p => p.id === pipelineId);
    if (!pipeline) return ["Unknown Pipeline"];
    
    return pipeline.skillIds.map(id => {
      const skill = skills.find(s => s.id === id);
      return skill ? skill.name : "Unknown Skill";
    });
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...useCases];

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(uc => 
        uc.title.toLowerCase().includes(lowerQuery) || 
        (uc.description && uc.description.toLowerCase().includes(lowerQuery))
      );
    }

    if (sortBy === "name") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "newest") {
      result.sort((a, b) => b.createdAt - a.createdAt);
    }

    return result;
  }, [useCases, searchQuery, sortBy]);

  const handleExportCSV = () => {
    if (useCases.length === 0) return;

    const headers = ["id", "title", "description", "pipelineId", "icon", "color", "createdAt", "updatedAt"];
    
    const csvContent = [
      headers.join(","),
      ...useCases.map(uc => {
        return [
          uc.id,
          `"${uc.title.replace(/"/g, '""')}"`,
          `"${(uc.description || "").replace(/"/g, '""')}"`,
          uc.pipelineId,
          uc.icon,
          uc.color,
          uc.createdAt,
          uc.updatedAt
        ].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "ai_hub_use_cases.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n');
      if (lines.length < 2) return; 

      const importedUseCases: UseCase[] = [];
      const headers = lines[0].split(',').map(h => h.trim());

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        
        if (values.length === headers.length) {
          try {
            const uc: any = {};
            headers.forEach((header, index) => {
              let val = values[index];
              if (val.startsWith('"') && val.endsWith('"')) {
                val = val.substring(1, val.length - 1).replace(/""/g, '"');
              }
              uc[header] = header.includes('At') ? Number(val) : val;
            });
            
            if (uc.id && uc.title) {
              importedUseCases.push(uc as UseCase);
            }
          } catch (err) {
            console.error("Error parsing row", i, err);
          }
        }
      }

      if (importedUseCases.length > 0) {
        importUseCases(importedUseCases);
        alert(`Successfully imported ${importedUseCases.length} use cases!`);
      } else {
        alert("No valid use cases found in the CSV file.");
      }
    };
    
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteUseCase(id);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 rounded-2xl border border-primary/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-foreground">
                Inspiration & Use Cases
              </h1>
            </div>
            <p className="text-muted-foreground max-w-2xl text-lg">
              Discover how compounding modular AI skills can automate complex workflows and save thousands of hours.
            </p>
          </div>
          <Link to="/skills/use-cases/create">
            <Button size="lg" className="shadow-md">
              <Lightbulb className="w-4 h-4 mr-2" />
              Create Custom Use Case
            </Button>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-card p-4 rounded-xl border border-border shadow-sm">
          <div className="relative flex-1 w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search use cases..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
              </SelectContent>
            </Select>

            <div className="h-6 w-px bg-border mx-1"></div>

            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" /> Export
            </Button>
            
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleImportCSV} 
            />
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" /> Import
            </Button>
          </div>
        </div>

        {filteredAndSorted.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-card border border-border rounded-xl shadow-sm">
            <Lightbulb className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-foreground">No Use Cases Found</h3>
            <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
              We couldn't find any use cases matching your query. Try adjusting your search or create a new one.
            </p>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {filteredAndSorted.map((useCase) => (
              <div 
                key={useCase.id} 
                className="break-inside-avoid bg-white dark:bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all group relative"
              >
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-md shadow-sm border border-border p-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => navigate(`/skills/use-cases/edit/${useCase.id}`)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(useCase.id, useCase.title)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>

                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${useCase.color || "bg-primary/10"}`}>
                    <DynamicIcon name={useCase.icon} className="w-5 h-5 text-foreground opacity-80" />
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold mb-2 text-foreground pr-8">
                  {useCase.title}
                </h3>
                
                <p className="text-muted-foreground mb-6 line-clamp-4 text-sm">
                  {useCase.description || "No description provided."}
                </p>

                <div className="space-y-3">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                    <span>Pipeline Sequence</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {getPipelineSkillNames(useCase.pipelineId).map((skillName, index, arr) => (
                      <div key={index} className="flex items-center gap-1.5">
                        <Badge variant="secondary" className="font-normal bg-secondary/50 max-w-[120px] truncate block">
                          {skillName}
                        </Badge>
                        {index < arr.length - 1 && (
                          <ArrowRight className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
              </div>
            ))}
          </div>
        )}

      </div>
    </Layout>
  );
}
