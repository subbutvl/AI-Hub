import React from 'react';
import { Switch } from '../../../../components/ui/switch';
import { Label } from '../../../../components/ui/label';
import { Badge } from '../../../../components/ui/badge';
import { Checkbox } from '../../../../components/ui/checkbox';
import { useAIHubSkills, BUILT_IN_SKILLS } from '../services/aiHubSkillService';

interface SkillSelectorProps {
  includeAiSkills: boolean;
  setIncludeAiSkills: (val: boolean) => void;
  selectedAiSkills: string[];
  setSelectedAiSkills: (val: string[]) => void;
  
  includeBuiltinSkills: boolean;
  setIncludeBuiltinSkills: (val: boolean) => void;
}

export function SkillSelector({
  includeAiSkills, setIncludeAiSkills, selectedAiSkills, setSelectedAiSkills,
  includeBuiltinSkills, setIncludeBuiltinSkills
}: SkillSelectorProps) {
  const allSkills = useAIHubSkills();
  
  const toggleAiSkill = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedAiSkills([...selectedAiSkills, id]);
    } else {
      setSelectedAiSkills(selectedAiSkills.filter(s => s !== id));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <div className="bg-white dark:bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
          <div>
            <h3 className="text-lg font-semibold text-foreground">AI Hub Skills</h3>
            <p className="text-sm text-muted-foreground">Select AI skills to embed into the generated project's \`.ai/\` directory.</p>
          </div>
          <Switch 
            checked={includeAiSkills} 
            onCheckedChange={setIncludeAiSkills} 
            className="data-[state=checked]:bg-[#dd0031]"
          />
        </div>

        {includeAiSkills && (
          <div className="space-y-3 animate-in fade-in duration-300">
            {allSkills.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 italic text-center border border-dashed rounded-lg bg-muted/20">
                No AI skills found in your AI Hub.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2">
                {allSkills.map(skill => (
                  <label key={skill.id} className="flex items-start gap-3 p-3 border border-border rounded-lg hover:bg-muted/30 hover:border-[#dd0031]/50 cursor-pointer transition-colors group">
                    <Checkbox 
                      checked={selectedAiSkills.includes(skill.id)}
                      onCheckedChange={(c) => toggleAiSkill(skill.id, !!c)}
                      className="mt-1 data-[state=checked]:bg-[#dd0031] data-[state=checked]:border-[#dd0031]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-medium text-sm truncate group-hover:text-[#dd0031] transition-colors">{skill.name}</span>
                        {skill.category && <Badge variant="secondary" className="text-[10px] uppercase font-mono px-1.5 py-0">{skill.category}</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{skill.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Built-in Best Practices</h3>
            <p className="text-sm text-muted-foreground">Include default Angular best practices and rules.</p>
          </div>
          <Switch 
            checked={includeBuiltinSkills} 
            onCheckedChange={setIncludeBuiltinSkills}
            className="data-[state=checked]:bg-[#dd0031]" 
          />
        </div>
        
        {includeBuiltinSkills && (
          <div className="mt-4 grid grid-cols-1 gap-3 animate-in fade-in duration-300 max-h-[400px] overflow-y-auto pr-2">
            {BUILT_IN_SKILLS.map(sk => (
               <div key={sk.id} className="flex flex-col p-3 border border-border rounded-lg bg-muted/10 hover:bg-muted/30 transition-colors">
                 <span className="font-medium text-sm mb-1">{sk.name}</span>
                 <p className="text-xs text-muted-foreground leading-relaxed">{sk.description}</p>
               </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
