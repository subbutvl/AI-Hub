import { StackConfig, EXTERNAL_SKILL_PACKAGES } from '../config/options';
import { 
  getBasePackageJson, 
  getAngularJson, 
  MAIN_TS, 
  APP_CONFIG_TS, 
  APP_ROUTES_TS, 
  APP_COMPONENT_TS, 
  INDEX_HTML,
  TSCONFIG_APP_JSON,
  TSCONFIG_JSON 
} from '../templates/baseTemplate';
import { applyFramework } from './applyFramework';
import { applySkills } from './addSkills';
import { generateReadme } from './generateReadme';
import { Skill } from '../../../types/skill'; // using existing types

export interface VirtualFileStore {
  paths: Record<string, string>;
  addFile: (path: string, content: string) => void;
}

export function buildProject(config: StackConfig, aiHubSkillsMap: Skill[]): VirtualFileStore {
  const store: VirtualFileStore = {
    paths: {},
    addFile: (path: string, content: string) => {
      store.paths[path] = content;
    }
  };

  const packageJson = getBasePackageJson(config);
  const angularJson = getAngularJson(config);

  // Apply mutations for framework/linting
  applyFramework(config, packageJson, angularJson, store.addFile);

  // Write base JSON configuration files
  store.addFile('package.json', JSON.stringify(packageJson, null, 2));
  store.addFile('angular.json', JSON.stringify(angularJson, null, 2));
  store.addFile('tsconfig.json', TSCONFIG_JSON);
  store.addFile('tsconfig.app.json', TSCONFIG_APP_JSON);

  // Write base App architecture
  store.addFile('src/main.ts', MAIN_TS);
  store.addFile('src/index.html', INDEX_HTML(config.projectName));
  store.addFile('src/app/app.config.ts', APP_CONFIG_TS);
  store.addFile('src/app/app.routes.ts', APP_ROUTES_TS);
  store.addFile('src/app/app.component.ts', APP_COMPONENT_TS);

  // Write missing empty folders usually expected in angular structure
  store.addFile('src/assets/.gitkeep', '');

  // Embed AI Skills
  applySkills(config, aiHubSkillsMap, store.addFile);

  // Setup external skills scripts if selected
  if (config.externalSkills.length > 0) {
    const allExternalSkills = Object.values(EXTERNAL_SKILL_PACKAGES).flat();
    const selectedExternals = config.externalSkills.map(id => allExternalSkills.find(s => s.id === id)).filter(Boolean);
    
    let shScript = '#!/bin/bash\n\n# External Skills Installation Script\n\n';
    let batScript = '@echo off\n\n:: External Skills Installation Script\n\n';
    
    selectedExternals.forEach(s => {
      shScript += `echo "Installing ${s!.name}..."\n${s!.installCommand}\n\n`;
      batScript += `echo Installing ${s!.name}...\n${s!.installCommand}\n\n`;
    });
    
    shScript += 'echo "All external skills installed successfully!"\n';
    batScript += 'echo All external skills installed successfully!\npause\n';

    store.addFile('setup-skills.sh', shScript);
    store.addFile('setup-skills.bat', batScript);
  }

  // README
  store.addFile('README.md', generateReadme(config));

  return store;
}
