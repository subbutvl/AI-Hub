import { Layout } from "../../components/Layout";
import { useState } from "react";
import { useSkillStore } from "../../hooks/useSkillStore";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Play, RotateCcw, Bot, User, Code2, Cpu } from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function TestSkill() {
  const { skills } = useSkillStore();
  const [selectedSkillId, setSelectedSkillId] = useState<string>("");
  const [inputPrompt, setInputPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Derive the active skill
  const activeSkill = skills.find(s => s.id === selectedSkillId);

  const handleTest = () => {
    if (!inputPrompt.trim() || !activeSkill) return;

    const userMessage = inputPrompt.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInputPrompt("");
    setIsRunning(true);

    // Mock an LLM processing delay
    setTimeout(() => {
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: `I am simulating a response as the AI following the \`${activeSkill.name}\` instructions.\n\nHere is your requested output for: "${userMessage}"\n\n*(Note: This is a placeholder UI. Real AI execution will require a backend inference API hookup later.)*` 
        }
      ]);
      setIsRunning(false);
    }, 1500);
  };

  const handleReset = () => {
    setMessages([]);
    setInputPrompt("");
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-foreground">
              Test Skill
            </h1>
            <p className="text-muted-foreground mt-1">
              Simulate skill execution and prompt adherence
            </p>
          </div>
          
          <div className="w-full md:w-[300px]">
            <Select value={selectedSkillId} onValueChange={setSelectedSkillId}>
              <SelectTrigger>
                <Cpu className="w-4 h-4 mr-2 text-primary" />
                <SelectValue placeholder="Select a skill to test..." />
              </SelectTrigger>
              <SelectContent>
                {skills.map(skill => (
                  <SelectItem key={skill.id} value={skill.id}>
                    {skill.name} <span className="text-muted-foreground text-xs ml-2">v{skill.version}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {!activeSkill ? (
          <div className="text-center py-20 bg-white dark:bg-card border border-border rounded-xl shadow-sm">
            <Cpu className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground">No Skill Selected</h3>
            <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
              Please use the dropdown menu above to select a skill from your library to begin testing.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-250px)] min-h-[600px]">
            
            {/* Left Column: Context Definition */}
            <div className="flex flex-col bg-white dark:bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="bg-muted/30 border-b border-border px-4 py-3 flex items-center justify-between">
                <h2 className="font-semibold text-sm flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-primary" />
                  System Instructions
                </h2>
                <Badge variant="outline" className="text-xs font-normal">
                  Read-only
                </Badge>
              </div>
              <div className="p-4 flex-1 overflow-y-auto bg-muted/10 font-mono text-sm text-foreground/80 whitespace-pre-wrap">
                {activeSkill.instructions || "No instructions provided for this skill."}
              </div>
              <div className="p-4 bg-muted/20 border-t border-border flex items-center flex-wrap gap-2">
                <Badge variant="secondary" className="font-normal">{activeSkill.category}</Badge>
                {activeSkill.language && <Badge variant="outline" className="font-normal">{activeSkill.language}</Badge>}
                {activeSkill.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-muted-foreground font-normal border-dashed">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Right Column: Interactive Chat */}
            <div className="flex flex-col bg-white dark:bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="bg-muted/30 border-b border-border px-4 py-3 flex items-center justify-between">
                <h2 className="font-semibold text-sm flex items-center gap-2">
                  <Bot className="w-4 h-4 text-primary" />
                  Simulator Log
                </h2>
                <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 px-2 text-xs" title="Reset Session">
                  <RotateCcw className="w-3.5 h-3.5 mr-1" /> Clear
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center bg-muted/5 rounded-lg border border-dashed border-border/50">
                    <User className="w-8 h-8 mb-3 opacity-50" />
                    <p className="text-sm">Log is empty. Send a prompt to test the model constraints.</p>
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 ${msg.role === 'assistant' ? 'bg-primary/5 p-3 rounded-lg border border-primary/10' : 'pl-3'}`}>
                      <div className="mt-0.5">
                        {msg.role === 'user' ? (
                          <div className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-bold">
                            U
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                            <Bot className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-2 text-sm text-foreground/90 whitespace-pre-wrap">
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
                
                {isRunning && (
                  <div className="flex gap-3 bg-primary/5 p-3 rounded-lg border border-primary/10 animate-pulse">
                    <div className="mt-0.5">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="flex-1 space-y-2 text-sm text-muted-foreground flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 block bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 block bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 block bg-primary/40 rounded-full animate-bounce"></span>
                      </div>
                      Executing skill...
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-muted/10 border-t border-border">
                <Label htmlFor="prompt" className="sr-only">Test Prompt</Label>
                <div className="relative">
                  <Textarea 
                    id="prompt"
                    placeholder="Enter your test input..."
                    value={inputPrompt}
                    onChange={(e) => setInputPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleTest();
                      }
                    }}
                    className="min-h-[80px] resize-none pr-12 focus-visible:ring-1"
                  />
                  <Button 
                    size="icon" 
                    className="absolute bottom-2 right-2 h-8 w-8 rounded-full"
                    onClick={handleTest}
                    disabled={!inputPrompt.trim() || isRunning}
                  >
                    <Play className="w-4 h-4 ml-0.5" />
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 text-center">
                  Press Enter to send. Shift + Enter for new line.
                </p>
              </div>
            </div>
            
          </div>
        )}
      </div>
    </Layout>
  );
}
