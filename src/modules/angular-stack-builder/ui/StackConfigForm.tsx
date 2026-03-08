import React from 'react';
import { StackConfig, ANGULAR_VERSIONS, UI_FRAMEWORKS, PRIMENG_VERSIONS, LINTING_OPTIONS, TESTING_OPTIONS, EDITOR_INTEGRATIONS, BACKEND_FRAMEWORKS } from '../config/options';
import { Label } from '../../../../components/ui/label';
import { Input } from '../../../../components/ui/input';
import { RadioGroup, RadioGroupItem } from '../../../../components/ui/radio-group';
import { Checkbox } from '../../../../components/ui/checkbox';
import { Switch } from '../../../../components/ui/switch';

interface StackConfigFormProps {
  config: StackConfig;
  setConfig: React.Dispatch<React.SetStateAction<StackConfig>>;
}

export function StackConfigForm({ config, setConfig }: StackConfigFormProps) {
  const updateField = (field: keyof StackConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const toggleEditor = (id: string, checked: boolean) => {
    if (checked) {
      updateField('editors', [...config.editors, id]);
    } else {
      updateField('editors', config.editors.filter(e => e !== id));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* Column 1 */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Project Details</h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name</Label>
              <Input 
                id="projectName" 
                value={config.projectName} 
                onChange={e => updateField('projectName', e.target.value)} 
                placeholder="my-angular-app"
                className="bg-muted/30"
              />
            </div>

            <div className="space-y-3">
              <Label>Angular Version</Label>
              <RadioGroup value={config.angularVersion} onValueChange={(v) => updateField('angularVersion', v)} className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {ANGULAR_VERSIONS.map(v => (
                  <label key={v.id} className="flex flex-col items-center justify-center p-2 border rounded-lg cursor-pointer hover:bg-muted/50 hover:border-foreground/30 transition-all [&:has([data-state=checked])]:bg-[#dd0031]/5 [&:has([data-state=checked])]:border-[#dd0031] [&:has([data-state=checked])]:ring-1 [&:has([data-state=checked])]:ring-[#dd0031]">
                    <RadioGroupItem value={v.id} className="sr-only" />
                    {v.icon && <img src={v.icon} alt={v.label} className="w-5 h-5 mb-1 opacity-90" />}
                    <span className="text-[11px] font-medium text-center">{v.label}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>PrimeNG Version <span className="text-[10px] text-muted-foreground font-normal ml-1">(Optional UI Kit)</span></Label>
              <RadioGroup value={config.primeNgVersion} onValueChange={(v) => updateField('primeNgVersion', v)} className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {PRIMENG_VERSIONS.map(v => (
                  <label key={v.id} className="flex flex-col items-center justify-center p-2 border rounded-lg cursor-pointer hover:bg-muted/50 hover:border-foreground/30 transition-all [&:has([data-state=checked])]:bg-[#dd0031]/5 [&:has([data-state=checked])]:border-[#dd0031] [&:has([data-state=checked])]:ring-1 [&:has([data-state=checked])]:ring-[#dd0031]">
                    <RadioGroupItem value={v.id} className="sr-only" />
                    {v.icon && <img src={v.icon} alt={v.label} className="w-5 h-5 mb-1 opacity-90" />}
                    <span className="text-[11px] font-medium text-center">{v.label}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">CSS Framework</h3>
          <RadioGroup value={config.uiFramework} onValueChange={(v) => updateField('uiFramework', v)} className="grid grid-cols-2 gap-3">
            {UI_FRAMEWORKS.map(fw => (
              <label 
                key={fw.id} 
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 hover:border-foreground/30 opacity-${fw.disabled ? '50 pointer-events-none' : '100'} [&:has([data-state=checked])]:bg-[#dd0031]/5 [&:has([data-state=checked])]:border-[#dd0031] [&:has([data-state=checked])]:ring-1 [&:has([data-state=checked])]:ring-[#dd0031]`}
              >
                <RadioGroupItem value={fw.id} disabled={fw.disabled} className="sr-only" />
                {fw.icon ? <img src={fw.icon} alt={fw.label} className="w-6 h-6" /> : <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px]">🚫</div>}
                <span className="text-sm font-medium">{fw.label}</span>
              </label>
            ))}
          </RadioGroup>
        </div>
      </div>

      {/* Column 2 */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-2">Backend Framework (API)</h3>
          <p className="text-xs text-muted-foreground mb-4">Select a backend framework to provide initial configuration structure.</p>
          <RadioGroup value={config.backendFramework} onValueChange={(v) => updateField('backendFramework', v)} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {BACKEND_FRAMEWORKS.map(fw => (
              <label 
                key={fw.id} 
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 hover:border-foreground/30 opacity-${fw.disabled ? '50 pointer-events-none' : '100'} [&:has([data-state=checked])]:bg-[#dd0031]/5 [&:has([data-state=checked])]:border-[#dd0031] [&:has([data-state=checked])]:ring-1 [&:has([data-state=checked])]:ring-[#dd0031]`}
              >
                <RadioGroupItem value={fw.id} disabled={fw.disabled} className="sr-only" />
                {fw.icon ? <img src={fw.icon} alt={fw.label} className="w-6 h-6" /> : <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px]">🚫</div>}
                <span className="text-sm font-medium">{fw.label}</span>
              </label>
            ))}
          </RadioGroup>
        </div>

        <div className="bg-white dark:bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Tooling</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Linting</Label>
              <RadioGroup value={config.linting} onValueChange={(v) => updateField('linting', v)} className="grid grid-cols-1 gap-2">
                {LINTING_OPTIONS.map(opt => (
                  <label key={opt.id} className="flex items-center gap-3 p-2 border rounded-lg cursor-pointer hover:bg-muted/50 hover:border-foreground/30 transition-all [&:has([data-state=checked])]:bg-[#dd0031]/5 [&:has([data-state=checked])]:border-[#dd0031] [&:has([data-state=checked])]:ring-1 [&:has([data-state=checked])]:ring-[#dd0031]">
                    <RadioGroupItem value={opt.id} className="sr-only" />
                    {opt.icon ? <img src={opt.icon} alt={opt.label} className="w-5 h-5" /> : <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px]">🚫</div>}
                    <span className="text-xs font-medium">{opt.label}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>Testing</Label>
              <RadioGroup value={config.testing} onValueChange={(v) => updateField('testing', v)} className="grid grid-cols-1 gap-2">
                {TESTING_OPTIONS.map(opt => (
                  <label key={opt.id} className="flex items-center gap-3 p-2 border rounded-lg cursor-pointer hover:bg-muted/50 hover:border-foreground/30 transition-all [&:has([data-state=checked])]:bg-[#dd0031]/5 [&:has([data-state=checked])]:border-[#dd0031] [&:has([data-state=checked])]:ring-1 [&:has([data-state=checked])]:ring-[#dd0031]">
                    <RadioGroupItem value={opt.id} className="sr-only" />
                    {opt.icon ? <img src={opt.icon} alt={opt.label} className="w-5 h-5" /> : <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px]">🚫</div>}
                    <span className="text-xs font-medium">{opt.label}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-2">IDE Configuration</h3>
          <p className="text-xs text-muted-foreground mb-4">Select integrations to generate specific configuration workspaces.</p>
          <div className="grid grid-cols-3 gap-3">
            {EDITOR_INTEGRATIONS.map(ed => (
              <label key={ed.id} className={`flex flex-col items-center justify-center p-3 border rounded-xl cursor-pointer hover:bg-muted/50 hover:border-foreground/30 transition-all ${config.editors.includes(ed.id) ? 'bg-[#dd0031]/5 border-[#dd0031] ring-1 ring-[#dd0031]' : ''}`}>
                <Checkbox 
                  checked={config.editors.includes(ed.id)}
                  onCheckedChange={(c) => toggleEditor(ed.id, !!c)}
                  className="sr-only"
                />
                {ed.icon ? <img src={ed.icon} alt={ed.label} className="w-6 h-6 mb-2" /> : <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-xs mb-2">💻</div>}
                <span className="text-xs font-medium text-center">{ed.label}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="bg-white dark:bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Cursor AI Rules</h3>
              <p className="text-xs text-muted-foreground mt-1">Enable Cursor Editor specific `.cursor/rules/angular.md` generation.</p>
            </div>
            <Switch 
              checked={config.includeRules} 
              onCheckedChange={(v) => updateField('includeRules', v)}
              className="data-[state=checked]:bg-[#dd0031]" 
            />
          </div>
        </div>

      </div>
    </div>
  );
}
