import { useState, useEffect } from 'react';
import { Skill } from '../types/skill';
import { dbManager } from '../db';
import { skills as skillsSchema } from '../db/schema';
import { eq } from 'drizzle-orm';

const DEFAULT_NOTE = "\n\n> **Note:** This prototype is NOT intended for production.";

const DEFAULT_SKILLS: Skill[] = [
  {
    id: 'default-skill-code-review',
    name: "Code Review",
    description: "Analyzes code for style violations, anti-patterns, and logic bugs.",
    instructions: "Review the provided code. Identify any stylistic issues, architectural anti-patterns, or pure logic bugs. Suggest specific refactoring steps." + DEFAULT_NOTE,
    category: "Code Quality",
    language: "TypeScript",
    version: "1.0.0",
    tags: ["review", "lint", "quality"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'default-skill-security-analysis',
    name: "Security Analysis",
    description: "Scans for vulnerabilities, plaintext secrets, and injection flaws.",
    instructions: "Analyze the provided codebase for common vulnerabilities (OWASP Top 10). Highlight any instances of plaintext secrets, improper hashing, or SQL/NoSQL injection paths." + DEFAULT_NOTE,
    category: "Security",
    language: "JavaScript",
    version: "1.0.0",
    tags: ["security", "vulnerability", "auth"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'default-skill-accessibility-review',
    name: "Accessibility Review",
    description: "Evaluates UI components against WCAG standards.",
    instructions: "Review the provided HTML/JSX. Check for missing ARIA labels, improper color contrast ratios, missing alt tags, and keyboard navigation issues." + DEFAULT_NOTE,
    category: "Frontend",
    language: "React",
    version: "1.0.0",
    tags: ["wcag", "a11y", "ui"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'default-skill-refactoring',
    name: "Refactoring",
    description: "Suggests cleaner, modern, and more functional coding approaches.",
    instructions: "Analyze the code and suggest modern ECMAScript features or design patterns that could simplify the logic. Focus on cyclomatic complexity reduction." + DEFAULT_NOTE,
    category: "Architecture",
    language: "JavaScript",
    version: "1.0.0",
    tags: ["refactoring", "clean-code", "es6"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'default-skill-performance-optimization',
    name: "Performance Optimization",
    description: "Identifies memory leaks, N+1 queries, and render bottlenecks.",
    instructions: "Examine the code for potential performance bottlenecks. Look for redundant loops, unmemoized React components, or inefficient database queries." + DEFAULT_NOTE,
    category: "Performance",
    language: "TypeScript",
    version: "1.0.0",
    tags: ["optimization", "speed", "memory"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'default-skill-documentation-generation',
    name: "Documentation Generation",
    description: "Auto-generates JSDoc blocks and Markdown readmes for complex features.",
    instructions: "Generate comprehensive JSDoc comments for all exported functions and classes. Explain the parameters, return types, and business logic intent." + DEFAULT_NOTE,
    category: "Documentation",
    language: "Markdown",
    version: "1.0.0",
    tags: ["docs", "jsdoc", "markdown"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export function useSkillStore() {
  const [skills, setSkills] = useState<Skill[]>([]);

  useEffect(() => {
    // Only load once the database provider is completely ready
    if (!dbManager.isInitialized) return;
    
    // Load existing from SQLite
    let existing = dbManager.db.select().from(skillsSchema).all();

    // Find any default skills that are not yet in the store (matched by name)
    const existingNames = new Set(existing.map(s => s.name));
    const missing = DEFAULT_SKILLS.filter(d => !existingNames.has(d.name));

    if (missing.length > 0) {
      // Insert missing defaults to DB
      for (const m of missing) {
        dbManager.db.insert(skillsSchema).values(m).run();
      }
      dbManager.save(); // flush to IndexedDB
      
      // Re-query ensuring pure local state matches remote reality exactly
      existing = dbManager.db.select().from(skillsSchema).all();
    }
    
    setSkills(existing);
  }, [dbManager.isInitialized]); // React to initialization state (if we somehow boot late)

  const addSkill = (skill: Skill) => {
    try {
      dbManager.db.insert(skillsSchema).values(skill).run();
      dbManager.save();
      setSkills([skill, ...skills]);
    } catch(e) {
      console.error("Failed to add skill", e);
    }
  };

  const updateSkill = (updatedSkill: Skill) => {
    try {
      dbManager.db.update(skillsSchema)
        .set(updatedSkill)
        .where(eq(skillsSchema.id, updatedSkill.id))
        .run();
      dbManager.save();
      
      const updated = skills.map(s => s.id === updatedSkill.id ? updatedSkill : s);
      setSkills(updated);
    } catch(e) {
       console.error("Failed to update skill", e);
    }
  };

  const removeSkill = (id: string) => {
    try {
      dbManager.db.delete(skillsSchema)
        .where(eq(skillsSchema.id, id))
        .run();
      dbManager.save();
      
      const updated = skills.filter(s => s.id !== id);
      setSkills(updated);
    } catch(e) {
       console.error("Failed to remove skill", e);
    }
  };

  const getCategories = () => {
    const categories = new Set(skills.map(s => s.category).filter(Boolean));
    return Array.from(categories);
  };

  const getLanguages = () => {
    const languages = new Set(skills.map(s => s.language).filter(Boolean));
    return Array.from(languages);
  };

  return { skills, addSkill, updateSkill, removeSkill, getCategories, getLanguages };
}
