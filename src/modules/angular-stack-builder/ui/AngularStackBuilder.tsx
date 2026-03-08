import React, { useState } from 'react';
import { Layout } from '../../../components/Layout';
import { Button } from '../../../../components/ui/button';
import { Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import { StackConfigForm } from './StackConfigForm';
import { SkillSelector } from './SkillSelector';
import { ExternalSkillSelector } from './ExternalSkillSelector';
import { StackConfig, DEFAULT_STACK_CONFIG, BACKEND_FRAMEWORKS, UI_FRAMEWORKS } from '../config/options';

// These generator functions will be implemented soon
import { generateZip } from '../generator/zipProject';

export default function AngularStackBuilder() {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<StackConfig>(DEFAULT_STACK_CONFIG);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      await generateZip(config);
    } catch (e: any) {
      setError(e.message || 'Failed to generate project zip');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Angular Stack Builder</h1>
              <span className="px-2 py-1 text-[10px] font-bold tracking-wider text-[#dd0031] bg-[#dd0031]/10 rounded border border-[#dd0031]/20 uppercase">
                Beta
              </span>
            </div>
            <p className="text-muted-foreground">Generate a completely customized, production-ready Angular boilerplate tailored with your selected UI frameworks, editors, and intelligent AI Hub skills.</p>
          </div>
        </div>

        {/* Wizard Progress Indicator */}
        <div className="flex items-center justify-between relative mb-8">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted -z-10 rounded-full"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#dd0031] -z-10 transition-all duration-300 rounded-full" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>

          {[1, 2, 3].map((num) => (
            <div
              key={num}
              onClick={() => {
                if (num === 1 || config.projectName) setStep(num);
              }}
              className={`flex flex-col items-center justify-center gap-2 cursor-pointer group ${step >= num ? 'text-[#dd0031]' : 'text-muted-foreground'} ${num !== 1 && !config.projectName ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all border-2 group-hover:scale-110 ${step >= num ? 'bg-white border-[#dd0031]' : 'bg-muted border-transparent text-muted-foreground group-hover:border-foreground/20'}`}>
                {num}
              </div>
              <span className="text-xs font-medium hidden md:block group-hover:text-foreground transition-colors">
                {num === 1 ? 'Technical Stack' : num === 2 ? 'AI Intelligence' : 'Review & Generate'}
              </span>
            </div>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 rounded-xl mb-6">
            <AlertCircle className="w-5 h-5" />
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        <div className="min-h-[400px]">
          {/* Step 1: Standard Technical Config */}
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
              <StackConfigForm config={config} setConfig={setConfig} />
            </div>
          )}

          {/* Step 2: AI Hub Knowledge Base */}
          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300 w-full max-w-7xl mx-auto">
              <SkillSelector
                includeAiSkills={config.includeAiSkills}
                setIncludeAiSkills={(val) => setConfig(prev => ({ ...prev, includeAiSkills: val }))}
                selectedAiSkills={config.selectedSkills}
                setSelectedAiSkills={(val) => setConfig(prev => ({ ...prev, selectedSkills: val }))}
                includeBuiltinSkills={config.includeBuiltinSkills}
                setIncludeBuiltinSkills={(val) => setConfig(prev => ({ ...prev, includeBuiltinSkills: val }))}
              />
              <ExternalSkillSelector config={config} setConfig={setConfig} />
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-right-4 fade-in duration-300">

              {/* Review Details Column */}
              <div className="bg-white dark:bg-card border border-border rounded-xl p-6 space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Configuration Summary
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Project Name</span>
                      <p className="font-medium">{config.projectName}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Angular Version</span>
                      <p className="font-medium">v{config.angularVersion}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">UI Framework</span>
                      <p className="font-medium">{UI_FRAMEWORKS.find(f => f.id === config.uiFramework)?.label}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Backend API</span>
                      <p className="font-medium">{BACKEND_FRAMEWORKS.find(f => f.id === config.backendFramework)?.label}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4 text-sm space-y-2">
                    <p><span className="text-muted-foreground">AI Skills Included:</span> <span className="font-medium">{config.selectedSkills.length} selected</span></p>
                    <p><span className="text-muted-foreground">External Scripts:</span> <span className="font-medium">{config.externalSkills.length} selected</span></p>
                    <p><span className="text-muted-foreground">Cursor Rules:</span> <span className="font-medium">{config.includeRules ? 'Yes' : 'No'}</span></p>
                  </div>
                </div>
              </div>

              {/* Generate Action Column */}
              <div className="bg-white dark:bg-card border border-[#dd0031]/20 rounded-xl p-8 text-center flex flex-col items-center justify-center space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#dd0031]/10 text-[#dd0031] mb-2 ring-8 ring-[#dd0031]/5">
                  <Download className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Ready to Generate</h3>
                  <p className="text-muted-foreground">
                    Click below to compile and pack <strong>{config.projectName}</strong> into a downloadable boilerplate ZIP file.
                  </p>
                </div>

                <div className="pt-6">
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !config.projectName}
                    className="bg-[#dd0031] hover:bg-[#c3002b] w-full text-white shadow-lg shadow-[#dd0031]/20 h-14 text-lg transition-all"
                  >
                    {isGenerating ? (
                      <span className="flex items-center gap-2">Building Project... <span className="animate-spin ml-2">⚪</span></span>
                    ) : (
                      <span className="flex items-center gap-2"><Download className="w-6 h-6" /> Generate & Download ZIP</span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-border mt-8">
          <Button
            variant="outline"
            onClick={() => setStep(prev => Math.max(1, prev - 1))}
            disabled={step === 1 || isGenerating}
          >
            Previous
          </Button>

          {step < 3 && (
            <Button
              onClick={() => setStep(prev => Math.min(3, prev + 1))}
              className="bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50"
              disabled={step === 1 && !config.projectName}
            >
              Next Step
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
}
