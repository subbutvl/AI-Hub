import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import MyRepos from './pages/MyRepos';
import RepoDetail from './pages/RepoDetail';
import AIIndex from './pages/AIIndex';
import DevIndex from './pages/DevIndex';
import AIExplorer from './pages/AIExplorer';
import AwesomeAI from './pages/AwesomeAI';
import Settings from './pages/Settings';
import CreateSkill from './pages/skills/CreateSkill';
import SkillLibrary from './pages/skills/SkillLibrary';
import EditSkill from './pages/skills/EditSkill';
import TestSkill from "./pages/skills/TestSkill";
import PipelineBuilder from "./pages/skills/PipelineBuilder";
import UseCases from "./pages/skills/UseCases";
import CreateUseCase from "./pages/skills/CreateUseCase";
import EditUseCase from "./pages/skills/EditUseCase";
import Help from "./pages/Help";
import WebHub from "./pages/WebHub";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/my-repos" element={<MyRepos />} />
        <Route path="/ai-index" element={<AIIndex />} />
        <Route path="/dev-index" element={<DevIndex />} />
        <Route path="/awesome-ai" element={<AwesomeAI />} />
        <Route path="/ai-explorer" element={<AIExplorer />} />
        <Route path="/repo/:owner/:repo" element={<RepoDetail />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/skills/create" element={<CreateSkill />} />
        <Route path="/skills/library" element={<SkillLibrary />} />
        <Route path="/skills/edit/:id" element={<EditSkill />} />
        <Route path="/skills/test" element={<TestSkill />} />
        <Route path="/skills/pipeline" element={<PipelineBuilder />} />
        <Route path="/skills/use-cases" element={<UseCases />} />
        <Route path="/skills/use-cases/create" element={<CreateUseCase />} />
        <Route path="/skills/use-cases/edit/:id" element={<EditUseCase />} />
        <Route path="/help" element={<Help />} />
        <Route path="/web-hub" element={<WebHub />} />
      </Routes>
    </Router>
  );
}
