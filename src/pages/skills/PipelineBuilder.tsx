import { Layout } from "../../components/Layout";
import { useState } from "react";
import { useSkillStore } from "../../hooks/useSkillStore";
import { usePipelineStore } from "../../hooks/usePipelineStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skill } from "../../types/skill";
import { Plus, GripVertical, Play, Save, ChevronRight, X, GitCommit, Settings2, CheckCircle2 } from "lucide-react";

export default function PipelineBuilder() {
  const { skills } = useSkillStore();
  const { addPipeline } = usePipelineStore();
  const [pipeline, setPipeline] = useState<Skill[]>([]);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [pipelineName, setPipelineName] = useState("");
  const [pipelineDesc, setPipelineDesc] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Simulation Status States
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(-1);
  const [showSimulationSuccess, setShowSimulationSuccess] = useState(false);

  const addToPipeline = (skill: Skill) => {
    setPipeline([...pipeline, { ...skill, id: crypto.randomUUID() }]); // Clone with new ID for repeated skills
  };

  const removeFromPipeline = (index: number) => {
    const newPipeline = [...pipeline];
    newPipeline.splice(index, 1);
    setPipeline(newPipeline);
  };

  const handleSavePipeline = () => {
    if (!pipelineName.trim() || pipeline.length === 0) return;
    
    addPipeline({
      name: pipelineName.trim(),
      description: pipelineDesc.trim(),
      skillIds: pipeline.map(s => s.id) // Note: this maps the cloned UUIDs right now, but for real usage we might want original skill IDs. We'll map the original IDs for UseCases.
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsSaveDialogOpen(false);
      setPipelineName("");
      setPipelineDesc("");
    }, 1500);
  };

  const handleSimulate = () => {
    setIsSimulating(true);
    setShowSimulationSuccess(false);
    setSimulationStep(0);

    let currentStep = 0;
    const totalSteps = pipeline.length;
    
    // Simulate 1.2s per skill step
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep >= totalSteps) {
        clearInterval(interval);
        setSimulationStep(totalSteps); // Marks completion
        setTimeout(() => {
          setShowSimulationSuccess(true);
        }, 800);
      } else {
        setSimulationStep(currentStep);
      }
    }, 1200);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-foreground">
              Pipeline Builder
            </h1>
            <p className="text-muted-foreground mt-1">
              Chain multiple skills together to create complex automated workflows.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-white dark:bg-card">
                  <Save className="w-4 h-4 mr-2" /> Save Pipeline
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                {!saveSuccess ? (
                  <>
                    <DialogHeader>
                      <DialogTitle>Save Pipeline</DialogTitle>
                      <DialogDescription>
                        Give your configured workflow a name to reuse it as a custom Use Case later.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input 
                          id="name" 
                          value={pipelineName} 
                          onChange={(e) => setPipelineName(e.target.value)} 
                          placeholder="e.g. Document Summarizer"
                          className="col-span-3" 
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="desc" className="text-right">Description</Label>
                        <Input 
                          id="desc" 
                          value={pipelineDesc} 
                          onChange={(e) => setPipelineDesc(e.target.value)} 
                          placeholder="Optional short description..."
                          className="col-span-3" 
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleSavePipeline} disabled={!pipelineName.trim() || pipeline.length === 0}>
                        Save Configuration
                      </Button>
                    </DialogFooter>
                  </>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">Pipeline Saved!</h3>
                    <p className="text-muted-foreground text-sm">Your new workflow configuration is ready to use.</p>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Execute Flow Simulator Dialog */}
            <Dialog open={isSimulating} onOpenChange={(open) => {
              if (!open) {
                setIsSimulating(false);
                setShowSimulationSuccess(false);
                setSimulationStep(-1);
              }
            }}>
              <DialogTrigger asChild>
                <Button disabled={pipeline.length === 0} onClick={handleSimulate}>
                  <Play className="w-4 h-4 mr-2 text-white" /> Execute Flow
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Simulating Execution...</DialogTitle>
                  <DialogDescription>
                    Running the pipeline sequence against mocked input data.
                  </DialogDescription>
                </DialogHeader>
                
                {showSimulationSuccess ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-6">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Simulation Complete</h3>
                    <p className="text-muted-foreground text-sm max-w-[280px]">
                      The AI generated a final report aggregating outputs from all {pipeline.length} active skills in your pipeline.
                    </p>
                    <Button className="mt-8" onClick={() => setIsSimulating(false)}>Close Simulator</Button>
                  </div>
                ) : (
                  <div className="py-6 space-y-4">
                    {/* Pull Request - Mock Step */}
                    <div className="flex items-start gap-4 p-3 rounded-lg bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                      <div className="mt-1">
                         <CheckCircle2 className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <div className="font-medium text-sm text-foreground">Extracting Pull Request Source...</div>
                        <div className="text-xs text-muted-foreground">Gathering 12 modified files and PR metadata.</div>
                      </div>
                    </div>

                    {/* Dynamic Skill Steps */}
                    {pipeline.map((skill, index) => {
                      const isActive = simulationStep === index;
                      const isComplete = simulationStep > index;
                      
                      let containerClass = "flex items-start gap-4 p-3 rounded-lg border transition-all ";
                      if (isActive) containerClass += "bg-primary/5 border-primary/20 shadow-sm";
                      else if (isComplete) containerClass += "bg-muted/30 border-border";
                      else containerClass += "opacity-50 border-transparent grayscale";
                      
                      return (
                        <div key={skill.id} className={containerClass}>
                          <div className="mt-1">
                            {isComplete ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : isActive ? (
                              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            ) : (
                              <div className="w-5 h-5 border-2 border-muted-foreground/30 rounded-full" />
                            )}
                          </div>
                          <div>
                            <div className={"font-medium text-sm transition-colors " + (isActive ? 'text-primary' : 'text-foreground')}>
                              {isActive ? "Executing" : isComplete ? "Completed" : "Pending"}: {skill.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {isActive ? "Computing LLM completion against source..." : isComplete ? "Analysis compiled successfully." : "Waiting in queue."}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </DialogContent>
            </Dialog>

          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-250px)] min-h-[600px]">
          
          {/* Left Column: Skill Gallery */}
          <div className="lg:col-span-1 bg-white dark:bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="bg-muted/30 border-b border-border px-4 py-3">
              <h2 className="font-semibold text-sm">Available Skills</h2>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto space-y-3">
              {skills.length === 0 ? (
                <div className="text-center p-4 pt-8 text-muted-foreground text-sm">
                  Your library is empty. Create skills first to use them in pipelines.
                </div>
              ) : (
                skills.map(skill => (
                  <div 
                    key={skill.id}
                    className="border border-border p-3 rounded-lg hover:border-primary/50 transition-colors bg-card group cursor-pointer"
                    onClick={() => addToPipeline(skill)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm line-clamp-1 flex-1 pr-2">{skill.name}</div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus className="w-4 h-4 text-primary" />
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {skill.description}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Flow Canvas */}
          <div className="lg:col-span-3 bg-muted/10 border border-border rounded-xl shadow-sm overflow-y-auto flex flex-col items-center p-8 relative">
            
            <div className="absolute top-4 left-4 text-sm font-medium text-muted-foreground flex items-center gap-2">
              <GitCommit className="w-4 h-4" /> Workflow Canvas
            </div>

            {pipeline.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 border border-primary/20 text-primary">
                  <Play className="w-6 h-6 ml-1" />
                </div>
                <h3 className="text-lg font-medium mb-2">Build Your Sequence</h3>
                <p className="text-muted-foreground text-sm">
                  Click on skills from the gallery on the left to add them to your pipeline. 
                  Every pipeline automatically begins with a Pull Request parsing step and ends with a Final AI Report compilation.
                </p>
              </div>
            ) : (
              <div className="w-full max-w-2xl py-8 space-y-0">
                
                {/* Static Start Node */}
                <div className="relative flex flex-col items-center mb-2">
                  <div className="w-full bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-900/50 p-4 rounded-xl shadow-sm flex items-center gap-4">
                    <div className="text-blue-500">
                      <GitCommit className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                          Input Event
                        </span>
                        <span className="font-semibold text-foreground">Pull Request Created / Synchronized</span>
                      </div>
                      <div className="text-sm text-muted-foreground line-clamp-1 pr-6">
                        System automatically pulls the diff, changed files, and PR metadata to begin execution.
                      </div>
                    </div>
                  </div>
                </div>
                {pipeline.map((node, i) => (
                  <div key={node.id} className="relative flex flex-col items-center">
                    
                    {/* Connection Line & Arrow (Always show from the node above it) */}
                    <div className="flex flex-col items-center my-2">
                       <div className="w-px h-6 bg-border"></div>
                       <ChevronRight className="w-4 h-4 text-border rotate-90 -mt-1" />
                    </div>

                    {/* Node Card */}
                    <div className="w-full bg-white dark:bg-card border-2 border-border hover:border-primary/30 transition-colors p-4 rounded-xl shadow-sm flex items-center gap-4 group">
                      <div className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing">
                        <GripVertical className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">
                            Step {i + 1}
                          </span>
                          <span className="font-semibold text-foreground">{node.name}</span>
                        </div>
                        <div className="text-sm text-muted-foreground line-clamp-1 pr-6">
                          {node.description || "No description"}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <Settings2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeFromPipeline(i)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                  </div>
                ))}
                
                {/* Static End Pipeline Node */}
                <div className="flex flex-col items-center my-2 mt-4 opacity-70">
                  <div className="w-px h-6 bg-border"></div>
                  <ChevronRight className="w-4 h-4 text-border rotate-90 -mt-1" />
                  <div className="w-full bg-green-50 dark:bg-green-950/30 border-2 border-green-200 dark:border-green-900/50 p-4 rounded-xl shadow-sm flex items-center gap-4 mt-2">
                    <div className="text-green-500">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-2 py-0.5 rounded">
                          Final Output
                        </span>
                        <span className="font-semibold text-foreground">Final AI Report Compiled</span>
                      </div>
                      <div className="text-sm text-muted-foreground line-clamp-1 pr-6">
                        Results from all active skills are merged and posted back to the original Pull Request as a unified comment.
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      </div>
    </Layout>
  );
}
