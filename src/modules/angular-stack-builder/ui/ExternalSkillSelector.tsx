import React from 'react';
import { StackConfig, EXTERNAL_SKILL_PACKAGES } from '../config/options';
import { Checkbox } from '../../../../components/ui/checkbox';
import { Badge } from '../../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '../../../../components/ui/sheet';
import { Button } from '../../../../components/ui/button';
import { ExternalLink, Globe } from 'lucide-react';

interface ExternalSkillSelectorProps {
  config: StackConfig;
  setConfig: React.Dispatch<React.SetStateAction<StackConfig>>;
}

export function ExternalSkillSelector({ config, setConfig }: ExternalSkillSelectorProps) {
  const toggleExternalSkill = (skillId: string, checked: boolean) => {
    setConfig(prev => {
      const currentSkills = new Set(prev.externalSkills);
      if (checked) {
        currentSkills.add(skillId);
      } else {
        currentSkills.delete(skillId);
      }
      return { ...prev, externalSkills: Array.from(currentSkills) };
    });
  };

  const getSourceDisplayName = (source: string) => {
    if (source === 'analogjs/angular-skills') return 'AnalogJS Angular Agent Skills';
    if (source === 'alfredoperez/angular-best-practices') return 'Alfredo Perez Angular Best Practices';
    return source;
  };

  return (
    <div className="bg-white dark:bg-card border border-border rounded-xl p-5 mt-6 shadow-sm w-full">
      <div className="flex flex-col mb-6 pb-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          Online Agent Skills
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 rounded-full font-medium">Community Driven</Badge>
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Select external AI skills from trusted community repositories. (Included as installation commands in `README.md`).
        </p>
      </div>

      <Tabs defaultValue={Object.keys(EXTERNAL_SKILL_PACKAGES)[0]} className="w-full">
        <TabsList className="w-full bg-muted/50 p-1 flex flex-wrap h-auto">
          {Object.keys(EXTERNAL_SKILL_PACKAGES).map((sourceKey) => (
            <TabsTrigger key={sourceKey} value={sourceKey} className="flex-1 text-xs md:text-sm data-[state=active]:bg-white data-[state=active]:text-[#dd0031] data-[state=active]:shadow-sm">
              {getSourceDisplayName(sourceKey)}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {Object.entries(EXTERNAL_SKILL_PACKAGES).map(([sourceKey, skills]) => (
          <TabsContent key={sourceKey} value={sourceKey} className="pt-4 outline-none">
            <div className="flex justify-end mb-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 h-8">
                    <Globe className="w-4 h-4" /> View Source Details
                  </Button>
                </SheetTrigger>
                <SheetContent className="sm:max-w-[700px] w-full p-0 flex flex-col">
                  <SheetHeader className="p-4 border-b shrink-0 bg-muted/10">
                    <SheetTitle>{getSourceDisplayName(sourceKey)}</SheetTitle>
                    <SheetDescription>Repository details and technical specifications.</SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 w-full bg-muted/30">
                    <iframe 
                      src={`https://github.com/${sourceKey}`} 
                      title={sourceKey} 
                      className="w-full h-full border-0"
                    />
                  </div>
                  <div className="p-4 border-t shrink-0 flex justify-end">
                    <Button onClick={() => window.open(`https://github.com/${sourceKey}`, '_blank')} className="bg-[#dd0031] hover:bg-[#dd0031]/90 text-white">
                      Open in Browser
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {skills.map(skill => (
                <label key={skill.id} className={`flex flex-col gap-2 p-3 bg-white dark:bg-card border rounded-xl cursor-pointer transition-all hover:shadow-md hover:border-[#dd0031]/50 ${config.externalSkills.includes(skill.id) ? 'border-[#dd0031] ring-1 ring-[#dd0031]' : ''}`}>
                   <div className="flex items-start justify-between mb-1">
                     <Checkbox 
                       checked={config.externalSkills.includes(skill.id)}
                       onCheckedChange={(checked) => toggleExternalSkill(skill.id, !!checked)}
                       className="data-[state=checked]:bg-[#dd0031] data-[state=checked]:border-[#dd0031]"
                     />
                     <div className="w-6 h-6 rounded bg-muted/30 flex items-center justify-center text-muted-foreground/50">
                       <Globe className="w-3 h-3" />
                     </div>
                   </div>
                   <div className="flex-1 flex flex-col justify-end">
                     <p className="text-sm font-semibold leading-tight line-clamp-2 mb-1">{skill.name}</p>
                     <p className="text-[10px] text-muted-foreground line-clamp-2">{skill.description}</p>
                   </div>
                </label>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
