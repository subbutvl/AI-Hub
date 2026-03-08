import { StackConfig } from '../config/options';
import { BUILT_IN_SKILLS } from '../services/aiHubSkillService';
import { Skill } from '../../../types/skill';

export function applySkills(
  config: StackConfig,
  aiHubSkillsMap: Skill[],
  addFileToZip: (path: string, content: string) => void
) {
  let combinedRulesContent = `# AI Driven Development Rules for Angular\n\n`;

  // 1. Resolve and Add AI Hub Skills
  if (config.includeAiSkills && config.selectedSkills.length > 0) {
    config.selectedSkills.forEach(skillId => {
       const skill = aiHubSkillsMap.find(s => s.id === skillId);
       if (skill) {
         const markdown = `# ${skill.name}\n\n**Category**: ${skill.category}\n**Language**: ${skill.language}\n\n## Instructions\n${skill.instructions}\n`;
         addFileToZip(`.ai/${skill.name.toLowerCase().replace(/\\s+/g, '-')}.md`, markdown);
         combinedRulesContent += `## ${skill.name}\n${skill.instructions}\n\n`;
       }
    });
  }

  // 2. Resolve and Add Built-in Skills
  if (config.includeBuiltinSkills) {
    BUILT_IN_SKILLS.forEach(skill => {
        addFileToZip(`.ai/${skill.id}.md`, skill.content);
        combinedRulesContent += `\n${skill.content}\n`;
    });
  }

  // 3. Resolve Editor specific rules
  if (config.editors.includes('cursor') && config.includeRules) {
    addFileToZip(`.cursor/rules/angular.md`, combinedRulesContent);
  }

  // VS Code Settings Example
  if (config.editors.includes('vscode')) {
    addFileToZip(`.vscode/settings.json`, `{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.defaultFormatter": "vscode.typescript-language-features"
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}`);
  }

  // Antigravity rules example
  if (config.editors.includes('antigravity')) {
     addFileToZip(`.antigravity/config`, `project_type=angular\nframework=${config.uiFramework}\nlinting=${config.linting}`);
  }
}
