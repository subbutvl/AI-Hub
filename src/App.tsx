import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import MyRepos from './pages/MyRepos';
import RepoDetail from './pages/RepoDetail';
import AIIndex from './pages/AIIndex';
import DevIndex from './pages/DevIndex';
import AIExplorer from './pages/AIExplorer';
import AwesomeAI from './pages/AwesomeAI';

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
      </Routes>
    </Router>
  );
}
