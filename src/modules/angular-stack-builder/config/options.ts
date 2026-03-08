export const ANGULAR_VERSIONS = [
  { id: '13', label: 'Angular 13', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/angular/angular-original.svg' },
  { id: '14', label: 'Angular 14', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/angular/angular-original.svg' },
  { id: '15', label: 'Angular 15', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/angular/angular-original.svg' },
  { id: '16', label: 'Angular 16', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/angular/angular-original.svg' },
  { id: '17', label: 'Angular 17', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/angular/angular-original.svg' },
  { id: '18', label: 'Angular 18', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/angular/angular-original.svg' },
  { id: '19', label: 'Angular 19', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/angular/angular-original.svg' },
  { id: '20', label: 'Angular 20', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/angular/angular-original.svg' },
  { id: '21', label: 'Angular 21', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/angular/angular-original.svg' },
];

export const UI_FRAMEWORKS = [
  { id: 'none', label: 'None', icon: '' },
  { id: 'bootstrap', label: 'Bootstrap 5+', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/bootstrap/bootstrap-original.svg' },
  { id: 'tailwind', label: 'Tailwind CSS', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg' },
  { id: 'metronic', label: 'Metronic', disabled: true, icon: 'https://keenthemes.com/metronic/assets/media/logos/metronic.svg' },
];

export const PRIMENG_VERSIONS = [
  { id: 'none', label: 'None', icon: '' },
  { id: '13', label: 'PrimeNG 13', icon: 'https://primefaces.org/cdn/primeng/images/primeng-logo-dark.svg' },
  { id: '14', label: 'PrimeNG 14', icon: 'https://primefaces.org/cdn/primeng/images/primeng-logo-dark.svg' },
  { id: '15', label: 'PrimeNG 15', icon: 'https://primefaces.org/cdn/primeng/images/primeng-logo-dark.svg' },
  { id: '16', label: 'PrimeNG 16', icon: 'https://primefaces.org/cdn/primeng/images/primeng-logo-dark.svg' },
  { id: '17', label: 'PrimeNG 17', icon: 'https://primefaces.org/cdn/primeng/images/primeng-logo-dark.svg' },
  { id: '18', label: 'PrimeNG 18', icon: 'https://primefaces.org/cdn/primeng/images/primeng-logo-dark.svg' },
  { id: '19', label: 'PrimeNG 19', icon: 'https://primefaces.org/cdn/primeng/images/primeng-logo-dark.svg' },
  { id: '20', label: 'PrimeNG 20', icon: 'https://primefaces.org/cdn/primeng/images/primeng-logo-dark.svg' },
  { id: '21', label: 'PrimeNG 21', icon: 'https://primefaces.org/cdn/primeng/images/primeng-logo-dark.svg' },
];

export const LINTING_OPTIONS = [
  { id: 'none', label: 'None', icon: '' },
  { id: 'eslint', label: 'ESLint', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/eslint/eslint-original.svg' },
];

export const TESTING_OPTIONS = [
  { id: 'default', label: 'Karma/Jasmine', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/jasmine/jasmine-original.svg' },
  { id: 'jest', label: 'Jest', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/jest/jest-plain.svg' },
  { id: 'none', label: 'None', icon: '' },
];

export const EDITOR_INTEGRATIONS = [
  { id: 'vscode', label: 'VS Code', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vscode/vscode-original.svg' },
  { id: 'cursor', label: 'Cursor', icon: '' }, // We'll use a lucide icon fallback if needed
  { id: 'antigravity', label: 'Antigravity IDE', icon: '' },
];

export const BACKEND_FRAMEWORKS = [
  { id: 'none', label: 'None', icon: '' },
  { id: 'abp', label: 'ABP Framework', disabled: true, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/dot-net/dot-net-original.svg' },
  { id: 'aspnet-zero', label: 'ASP.NET Zero Framework', disabled: true, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/dot-net/dot-net-original.svg' },
];

export interface ExternalSkill {
  id: string;
  name: string;
  description: string;
  repositoryUrl: string;
  installCommand: string;
}

export const EXTERNAL_SKILL_PACKAGES: Record<string, ExternalSkill[]> = {
  'analogjs/angular-skills': [
    { id: 'analogjs-all', name: 'All AnalogJS Skills', description: 'Install all skills', repositoryUrl: 'https://github.com/analogjs/angular-skills', installCommand: 'npx skills add analogjs/angular-skills' },
    { id: 'analogjs-component', name: 'Angular Component', description: 'Signals, inject(), standalone defaults', repositoryUrl: 'https://github.com/analogjs/angular-skills/blob/main/skills/angular-component', installCommand: 'npx skills add analogjs/angular-skills/skills/angular-component' },
    { id: 'analogjs-di', name: 'Dependency Injection', description: 'inject() function usage', repositoryUrl: 'https://github.com/analogjs/angular-skills/blob/main/skills/angular-di', installCommand: 'npx skills add analogjs/angular-skills/skills/angular-di' },
    { id: 'analogjs-directives', name: 'Angular Directives', description: 'Standalone directives', repositoryUrl: 'https://github.com/analogjs/angular-skills/blob/main/skills/angular-directives', installCommand: 'npx skills add analogjs/angular-skills/skills/angular-directives' },
    { id: 'analogjs-forms', name: 'Angular Forms', description: 'Signal Forms (experimental)', repositoryUrl: 'https://github.com/analogjs/angular-skills/blob/main/skills/angular-forms', installCommand: 'npx skills add analogjs/angular-skills/skills/angular-forms' },
    { id: 'analogjs-http', name: 'Angular HTTP', description: 'httpResource() and resource()', repositoryUrl: 'https://github.com/analogjs/angular-skills/blob/main/skills/angular-http', installCommand: 'npx skills add analogjs/angular-skills/skills/angular-http' },
    { id: 'analogjs-routing', name: 'Angular Routing', description: 'Functional guards and routing patterns', repositoryUrl: 'https://github.com/analogjs/angular-skills/blob/main/skills/angular-routing', installCommand: 'npx skills add analogjs/angular-skills/skills/angular-routing' },
    { id: 'analogjs-signals', name: 'Angular Signals', description: 'signal, computed, linkedSignal, effect', repositoryUrl: 'https://github.com/analogjs/angular-skills/blob/main/skills/angular-signals', installCommand: 'npx skills add analogjs/angular-skills/skills/angular-signals' },
    { id: 'analogjs-ssr', name: 'Angular SSR', description: 'Server Side Rendering patterns', repositoryUrl: 'https://github.com/analogjs/angular-skills/blob/main/skills/angular-ssr', installCommand: 'npx skills add analogjs/angular-skills/skills/angular-ssr' },
    { id: 'analogjs-testing', name: 'Angular Testing', description: 'Testing patterns', repositoryUrl: 'https://github.com/analogjs/angular-skills/blob/main/skills/angular-testing', installCommand: 'npx skills add analogjs/angular-skills/skills/angular-testing' },
    { id: 'analogjs-tooling', name: 'Angular Tooling', description: 'Tooling configuration', repositoryUrl: 'https://github.com/analogjs/angular-skills/blob/main/skills/angular-tooling', installCommand: 'npx skills add analogjs/angular-skills/skills/angular-tooling' },
  ],
  'alfredoperez/angular-best-practices': [
    { id: 'alfredoperez-all', name: 'All Angular Best Practices', description: 'Concise, actionable Angular best practices optimized for AI agents and LLMs. 151 rules.', repositoryUrl: 'https://angular-best-practices-web.vercel.app/', installCommand: 'npx skills add alfredoperez/angular-best-practices' },
  ]
};

export interface StackConfig {
  projectName: string;
  angularVersion: string;
  uiFramework: string;
  primeNgVersion: string;
  linting: string;
  testing: string;
  editors: string[];
  backendFramework: string;
  externalSkills: string[];
  includeAiSkills: boolean;
  selectedSkills: string[];
  includeBuiltinSkills: boolean;
  includeRules: boolean;
}

export const DEFAULT_STACK_CONFIG: StackConfig = {
  projectName: 'my-angular-app',
  angularVersion: '18',
  uiFramework: 'tailwind',
  primeNgVersion: 'none',
  linting: 'eslint',
  testing: 'default',
  editors: ['vscode', 'cursor'],
  backendFramework: 'none',
  externalSkills: [],
  includeAiSkills: true,
  selectedSkills: [],
  includeBuiltinSkills: true,
  includeRules: true,
};
