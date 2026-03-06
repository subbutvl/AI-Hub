import { useState, useEffect } from "react";
import { Layout } from "../../components/Layout";
import { useUseCaseStore } from "../../hooks/useUseCaseStore";
import { usePipelineStore } from "../../hooks/usePipelineStore";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, Save, Trash2 } from "lucide-react";
import * as LucideIcons from "lucide-react";

// Limit icons to a digestible few for the dropdown
const POPULAR_ICONS = ["Lightbulb", "Code2", "MessageSquare", "FileText", "Search", "Database", "Sparkles", "Zap", "Layers", "Rocket"];

const COLORS = [
  { label: "Blue", value: "bg-blue-500/10" },
  { label: "Green", value: "bg-green-500/10" },
  { label: "Amber", value: "bg-amber-500/10" },
  { label: "Purple", value: "bg-purple-500/10" },
  { label: "Rose", value: "bg-rose-500/10" },
  { label: "Slate", value: "bg-slate-500/10" },
];

export default function EditUseCase() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useCases, updateUseCase, deleteUseCase } = useUseCaseStore();
  const { pipelines } = usePipelineStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pipelineId, setPipelineId] = useState("");
  const [icon, setIcon] = useState("Lightbulb");
  const [color, setColor] = useState("bg-blue-500/10");
  const [isLoaded, setIsLoaded] = useState(false);

  const targetUseCase = useCases.find(uc => uc.id === id);

  useEffect(() => {
    if (targetUseCase && !isLoaded) {
      setTitle(targetUseCase.title);
      setDescription(targetUseCase.description || "");
      setPipelineId(targetUseCase.pipelineId);
      setIcon(targetUseCase.icon || "Lightbulb");
      setColor(targetUseCase.color || "bg-blue-500/10");
      setIsLoaded(true);
    } else if (id && useCases.length > 0 && !targetUseCase) {
      navigate("/skills/use-cases");
    }
  }, [targetUseCase, navigate, id, useCases.length, isLoaded]);

  const handleSave = () => {
    if (!title.trim() || !id) return;
    
    updateUseCase(id, {
      title: title.trim(),
      description: description.trim(),
      pipelineId,
      icon,
      color
    });

    navigate("/skills/use-cases");
  };

  const handleDelete = () => {
    if (!id) return;
    if (confirm("Are you sure you want to delete this Use Case? This action cannot be undone.")) {
      deleteUseCase(id);
      navigate("/skills/use-cases");
    }
  };

  if (!targetUseCase) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto space-y-6 flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Loading Use Case...</p>
        </div>
      </Layout>
    );
  }

  const SelectedIcon = (LucideIcons as any)[icon] || LucideIcons.Lightbulb;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/skills/use-cases")}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-foreground">
              Edit Use Case
            </h1>
            <p className="text-muted-foreground mt-1">
              Modify properties representing this active pipeline configuration.
            </p>
          </div>
          <Button variant="outline" className="text-destructive hover:bg-destructive/10 border-destructive/20" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" /> Delete 
          </Button>
        </div>

        <div className="bg-white dark:bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 space-y-6">
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g. Automated Code Review"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Explain what this sequence accomplishes..."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1.5 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Assigned Pipeline</Label>
                  <Select value={pipelineId} onValueChange={setPipelineId}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select a saved pipeline..." />
                    </SelectTrigger>
                    <SelectContent>
                      {pipelines.length === 0 && !pipelineId ? (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                          No pipelines saved.
                        </div>
                      ) : (
                        pipelines.map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))
                      )}
                      
                      {/* Allow retaining legacy empty pipelines from the mocked seeds */}
                      {pipelineId === "" && (
                        <SelectItem value="" disabled>
                          (Legacy Built-In Mock)
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Visual Theme</Label>
                  <div className="flex items-center gap-3 mt-1.5">
                    <Select value={icon} onValueChange={setIcon}>
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {POPULAR_ICONS.map(i => (
                          <SelectItem key={i} value={i}>
                            <div className="flex items-center gap-2">
                              {(LucideIcons as any)[i] && (
                                <span className="w-4 h-4 flex items-center justify-center">
                                  {(() => { const Ic = (LucideIcons as any)[i]; return <Ic className="w-4 h-4" /> })()}
                                </span>
                              )}
                              {i}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={color} onValueChange={setColor}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COLORS.map(c => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Card */}
            <div className="bg-muted/30 border border-border p-6 rounded-xl mt-8">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Live Preview</h3>
              <div className="bg-white dark:bg-card border border-border rounded-xl p-6 shadow-sm max-w-sm">
                 <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                    <SelectedIcon className="w-5 h-5 text-foreground opacity-80" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">
                  {title || "Untitled Use Case"}
                </h3>
                <p className="text-muted-foreground line-clamp-4 text-sm">
                  {description || "No description provided."}
                </p>
              </div>
            </div>

          </div>
          
          <div className="bg-muted/20 border-t border-border px-6 py-4 flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate("/skills/use-cases")}>Cancel</Button>
            <Button 
              onClick={handleSave} 
              disabled={!title.trim()}
            >
              <Save className="w-4 h-4 mr-2" /> Save Updates
            </Button>
          </div>
        </div>

      </div>
    </Layout>
  );
}
