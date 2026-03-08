import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { StackConfig } from '../config/options';
import { buildProject } from './buildProject';
import { Skill } from '../../../types/skill';

const STORAGE_KEY = 'ai_hub_skills';

export async function generateZip(config: StackConfig) {
  // Directly pull from local storage within this async action 
  // to avoid drilling massive state via props through components initially.
  // This behaves as our "AI Hub Database Call".
  let skillsPayload: Skill[] = [];
  try {
     const stored = window.localStorage.getItem(STORAGE_KEY);
     if (stored) {
       skillsPayload = JSON.parse(stored);
     }
  } catch (e) {
    console.error("Failed to parse skills from local storage", e);
  }

  // Orchestrate the virtual files
  const virtualStore = buildProject(config, skillsPayload);

  // Hydrate zip
  const zip = new JSZip();
  const projectFolder = zip.folder(config.projectName);
  
  if (!projectFolder) {
    throw new Error('Failed to instantiate zip file system.');
  }

  // Iterate over our virtual store paths and write to the zip system
  Object.keys(virtualStore.paths).forEach(path => {
    projectFolder.file(path, virtualStore.paths[path]);
  });

  // Generate and Download
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `\${config.projectName}-stack.zip`);
}
