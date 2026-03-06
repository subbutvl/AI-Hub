import { useState, useEffect } from "react";
import { Layout } from "../../components/Layout";
import { useUseCaseStore } from "../../hooks/useUseCaseStore";
import { usePipelineStore } from "../../hooks/usePipelineStore";
import { useSkillStore } from "../../hooks/useSkillStore";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ChevronLeft, Save, Trash2, Play, CheckCircle2, GitCommit, ArrowRight } from "lucide-react";
import * as LucideIcons from "lucide-react";

const POPULAR_ICONS = ["Lightbulb", "Code2", "MessageSquare", "FileText", "Search", "Database", "Sparkles", "Zap", "Layers", "Rocket"];

const COLORS = [
  { label: "Blue", value: "bg-blue-500/10" },
  { label: "Green", value: "bg-green-500/10" },
  { label: "Amber", value: "bg-amber-500/10" },
  { label: "Purple", value: "bg-purple-500/10" },
  { label: "Rose", value: "bg-rose-500/10" },
  { label: "Slate", value: "bg-slate-500/10" },
];

const MOCK_ISSUES = [
  { id: 1, category: "Security", categoryColor: "bg-red-500", file: "auth.js:45", issue: "Password stored in plaintext", suggestion: "Use bcrypt or argon2 to hash passwords before storage" },
  { id: 2, category: "Performance", categoryColor: "bg-yellow-500", file: "api.js:12", issue: "N+1 query detected in user lookup", suggestion: "Use JOIN or eager loading to fetch related data" },
  { id: 3, category: "Accessibility", categoryColor: "bg-blue-400", file: "Button.tsx:8", issue: "Interactive element missing aria-label", suggestion: "Add aria-label or title attribute to non-descriptive icon buttons" },
  { id: 4, category: "Code Quality", categoryColor: "bg-purple-500", file: "utils.ts:102", issue: "Function complexity score exceeds threshold (cyclomatic: 14)", suggestion: "Break down into smaller single-responsibility helper functions" }
];

export default function EditUseCase() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useCases, updateUseCase, deleteUseCase } = useUseCaseStore();
  const { pipelines } = usePipelineStore();
  const { skills } = useSkillStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pipelineId, setPipelineId] = useState("__legacy__");
  const [icon, setIcon] = useState("Lightbulb");
  const [color, setColor] = useState("bg-blue-500/10");
  const [isLoaded, setIsLoaded] = useState(false);

  // Simulator state
  const [simOpen, setSimOpen] = useState(false);
  const [simStep, setSimStep] = useState(-1);
  const [simComplete, setSimComplete] = useState(false);

  const targetUseCase = useCases.find(uc => uc.id === id);

  useEffect(() => {
    if (targetUseCase && !isLoaded) {
      setTitle(targetUseCase.title);
      setDescription(targetUseCase.description || "");
      setPipelineId(targetUseCase.pipelineId || "__legacy__");
      setIcon(targetUseCase.icon || "Lightbulb");
      setColor(targetUseCase.color || "bg-blue-500/10");
      setIsLoaded(true);
    } else if (id && useCases.length > 0 && !targetUseCase) {
      navigate("/skills/use-cases");
    }
  }, [targetUseCase, navigate, id, useCases.length, isLoaded]);

  // Build skill name list from the selected pipeline
  const getSkillNamesForPipeline = (pid: string): string[] => {
    if (!pid || pid === "__legacy__") return ["Legacy Mock Sequence"];
    const pipeline = pipelines.find(p => p.id === pid);
    if (!pipeline) return ["Unknown Pipeline"];
    return pipeline.skillIds.map(sid => {
      const skill = skills.find(s => s.id === sid);
      return skill ? skill.name : "Unknown Skill";
    });
  };

  const currentSkillNames = getSkillNamesForPipeline(pipelineId);

  const handleRunSimulation = () => {
    setSimOpen(true);
    setSimComplete(false);
    setSimStep(0);

    let step = 0;
    const total = currentSkillNames.length;
    const interval = setInterval(() => {
      step++;
      if (step >= total) {
        clearInterval(interval);
        setSimStep(total);
        setTimeout(() => setSimComplete(true), 800);
      } else {
        setSimStep(step);
      }
    }, 1200);
  };

  const handleSave = () => {
    if (!title.trim() || !id) return;
    updateUseCase(id, {
      title: title.trim(),
      description: description.trim(),
      pipelineId: pipelineId === "__legacy__" ? "" : pipelineId,
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
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-foreground">Edit Use Case</h1>
            <p className="text-muted-foreground mt-1">Modify properties representing this active pipeline configuration.</p>
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
                <Input id="title" placeholder="e.g. Automated Code Review" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5" />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Explain what this sequence accomplishes..." rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1.5 resize-none" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Assigned Pipeline</Label>
                  <Select value={pipelineId} onValueChange={setPipelineId}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select a saved pipeline..." />
                    </SelectTrigger>
                    <SelectContent>
                      {pipelines.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                      {(pipelineId === "__legacy__" || !pipelines.find(p => p.id === pipelineId)) && (
                        <SelectItem value="__legacy__">(No Pipeline — Legacy Built-In)</SelectItem>
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
                                  {(() => { const Ic = (LucideIcons as any)[i]; return <Ic className="w-4 h-4" />; })()}
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
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Pipeline Sequence Preview */}
            <div className="bg-muted/20 border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <GitCommit className="w-4 h-4 text-muted-foreground" /> Pipeline Sequence
                </h3>
                <Button size="sm" onClick={handleRunSimulation} disabled={currentSkillNames.length === 0}>
                  <Play className="w-3.5 h-3.5 mr-1.5" /> Run Scenario
                </Button>
              </div>

              {currentSkillNames.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pipeline selected. Choose one above to preview its skill sequence.</p>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  {/* Start node */}
                  <Badge variant="outline" className="font-normal text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-900/50 dark:text-blue-300 text-xs px-2.5 py-1">
                    PR Event
                  </Badge>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />

                  {currentSkillNames.map((name, idx, arr) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-normal text-xs px-2.5 py-1 max-w-[140px] truncate block">
                        {name}
                      </Badge>
                      {idx < arr.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
                      )}
                    </div>
                  ))}

                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
                  {/* End node */}
                  <Badge variant="outline" className="font-normal text-green-600 border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-900/50 dark:text-green-300 text-xs px-2.5 py-1">
                    Final Report
                  </Badge>
                </div>
              )}
            </div>

            {/* Preview Card */}
            <div className="bg-muted/30 border border-border p-6 rounded-xl">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Live Preview</h3>
              <div className="bg-white dark:bg-card border border-border rounded-xl p-6 shadow-sm max-w-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                    <SelectedIcon className="w-5 h-5 text-foreground opacity-80" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">{title || "Untitled Use Case"}</h3>
                <p className="text-muted-foreground line-clamp-4 text-sm">{description || "No description provided."}</p>
              </div>
            </div>

          </div>

          <div className="bg-muted/20 border-t border-border px-6 py-4 flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate("/skills/use-cases")}>Cancel</Button>
            <Button onClick={handleSave} disabled={!title.trim()}>
              <Save className="w-4 h-4 mr-2" /> Save Updates
            </Button>
          </div>
        </div>
      </div>

      {/* Execution Simulation Dialog */}
      <Dialog open={simOpen} onOpenChange={(open) => { if (!open) { setSimOpen(false); setSimStep(-1); setSimComplete(false); } }}>
        <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Play className="w-4 h-4 text-primary" />
              {simComplete ? "Simulation Complete — Final AI Report" : "Executing Pipeline..."}
            </DialogTitle>
            <DialogDescription>
              {simComplete ? `${title} — Issues found and compiled into a PR comment.` : "Processing each skill in sequence against mocked source code..."}
            </DialogDescription>
          </DialogHeader>

          {!simComplete ? (
            <div className="py-4 space-y-3">
              {/* Static PR step */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-sm text-foreground flex items-center gap-2">
                    <GitCommit className="w-3.5 h-3.5" /> Pull Request Loaded
                  </div>
                  <div className="text-xs text-muted-foreground">12 changed files · 347 additions · 89 deletions</div>
                </div>
              </div>

              {currentSkillNames.map((name, index) => {
                const isActive = simStep === index;
                const isComplete = simStep > index;
                let cls = "flex items-start gap-3 p-3 rounded-lg border transition-all ";
                if (isActive) cls += "bg-primary/5 border-primary/20 shadow-sm";
                else if (isComplete) cls += "bg-muted/30 border-border";
                else cls += "opacity-40 border-transparent";
                return (
                  <div key={index} className={cls}>
                    <div className="mt-0.5 shrink-0">
                      {isComplete ? <CheckCircle2 className="w-5 h-5 text-green-500" /> :
                        isActive ? <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> :
                          <div className="w-5 h-5 border-2 border-muted-foreground/20 rounded-full" />}
                    </div>
                    <div>
                      <div className={"font-medium text-sm " + (isActive ? "text-primary" : "text-foreground")}>
                        {isActive ? "Analyzing" : isComplete ? "Completed" : "Queued"}: {name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {isActive ? "Running LLM inference on diff context..." : isComplete ? "Issues compiled successfully." : "Waiting..."}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="rounded-xl overflow-hidden border border-border bg-card">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/40">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs shrink-0">AI</div>
                  <div>
                    <div className="font-semibold text-sm text-foreground">ai-reviewer[bot]</div>
                    <div className="text-xs text-muted-foreground">just now · Automated Code Review Report</div>
                  </div>
                  <Badge className="ml-auto text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50">AI Generated</Badge>
                </div>
                <div className="px-5 py-4 text-sm text-muted-foreground border-b border-border">
                  <p>Ran <strong className="text-foreground">{currentSkillNames.length} skill{currentSkillNames.length !== 1 ? "s" : ""}</strong> across <strong className="text-foreground">12 changed files</strong>. Found <strong className="text-red-500">{MOCK_ISSUES.length} issues</strong> requiring attention.</p>
                </div>
                <div className="px-5 py-3 bg-muted/30 border-b border-border">
                  <h3 className="text-sm font-semibold text-foreground">Example PR Comment</h3>
                </div>
                <div className="p-4 space-y-3">
                  {MOCK_ISSUES.map((issue) => (
                    <div key={issue.id} className="bg-muted/30 rounded-lg border-l-4 overflow-hidden" style={{ borderLeftColor: issue.id === 1 ? '#ef4444' : issue.id === 2 ? '#eab308' : issue.id === 3 ? '#60a5fa' : '#a855f7' }}>
                      <div className="px-4 py-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded text-white ${issue.categoryColor}`}>{issue.category}</span>
                          <span className="text-xs text-muted-foreground font-mono">{issue.file}</span>
                        </div>
                        <div className="text-sm text-foreground font-semibold mb-1">
                          <span className="text-muted-foreground font-normal">Issue: </span>{issue.issue}
                        </div>
                        <div className="text-sm text-foreground">
                          <span className="text-muted-foreground font-normal">Suggestion: </span>{issue.suggestion}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-3 bg-muted/30 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Generated by AI Hub · For demo purposes only</span>
                  <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => { setSimOpen(false); setSimStep(-1); setSimComplete(false); }}>Close</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
