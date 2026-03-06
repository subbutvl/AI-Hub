import { useState, useEffect } from 'react';
import { Skill } from '../types/skill';

const STORAGE_KEY = 'ai_hub_skills';

export function useSkillStore() {
  const [skills, setSkills] = useState<Skill[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSkills(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse stored skills', e);
      }
    }
  }, []);

  const addSkill = (skill: Skill) => {
    const updated = [skill, ...skills];
    setSkills(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const updateSkill = (updatedSkill: Skill) => {
    const updated = skills.map(s => s.id === updatedSkill.id ? updatedSkill : s);
    setSkills(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const removeSkill = (id: string) => {
    const updated = skills.filter(s => s.id !== id);
    setSkills(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
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
