export interface Skill {
  id: string;
  name: string;
  category: string;
  language?: string;
  agents?: string[];
  ides?: string[];
  description: string;
  tags: string[];
  version: string;
  instructions: string;
  createdAt: string;
  updatedAt: string;
}

export const SAMPLE_SKILL_TEMPLATE = `# Description
Briefly describe what this skill does and its main purpose.

# Context
Explain the context or role the AI should assume when executing this skill.

# Instructions
1. First step or rule the AI should follow.
2. Second step or rule.
3. Keep instructions clear and concise.

# Constraints
- Limitations or things the AI MUST NOT do.
- Format requirements (e.g., "Must output in JSON").

# Examples
**Input:**
[User input example]

**Output:**
[Expected AI response]
`;

export function exportSkillAsMarkdown(skill: Partial<Skill>): string {
  const { name, version, category, language, agents, ides, description, tags, instructions, createdAt, updatedAt } = skill;
  
  const tagString = tags && tags.length > 0 ? tags.map(t => `\`${t}\``).join(', ') : 'None';
  const agentString = agents && agents.length > 0 ? agents.join(', ') : 'None';
  const ideString = ides && ides.length > 0 ? ides.join(', ') : 'None';
  
  return `# ${name || 'Untitled Skill'}
**Version**: ${version || '1.0.0'}
**Category**: ${category || 'Uncategorized'}
**Language**: ${language || 'Any/None'}
**Coding Agents**: ${agentString}
**IDEs**: ${ideString}
**Created**: ${createdAt ? new Date(createdAt).toLocaleString() : 'Unknown'}
**Last Updated**: ${updatedAt ? new Date(updatedAt).toLocaleString() : 'Unknown'}
**Tags**: ${tagString}

## Description
${description || 'No description provided.'}

---

${instructions || ''}
`;
}
