import { useState } from "react";
import { WelcomeModal } from "../components/WelcomeModal";
import { Layout } from "../components/Layout";
import { Link } from "react-router-dom";
import {
  BookOpen, Library, Wrench, TestTube, GitMerge, Lightbulb,
  ChevronDown, ChevronRight, Rocket, CheckCircle2, Zap,
  Bot, Monitor, FileText, Star, ArrowRight, Shield, Info, Globe, Users
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────

interface Section {
  id: string;
  icon: React.ReactNode;
  title: string;
  color: string;
  badge?: string;
  what: string;
  why: string;
  where: string;
  how: { step: string; detail: string }[];
  bestPractices: string[];
  tips?: string[];
}

const SECTIONS: Section[] = [
  {
    id: "skill-library",
    icon: <Library className="w-5 h-5" />,
    title: "Skill Library",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    badge: "Core",
    what: "The Skill Library is your central repository of reusable AI instruction sets (called Skills). Each skill encodes a specific AI behaviour — e.g. 'Code Review', 'Security Analysis' — that can be executed individually, composed into pipelines, or referenced by Use Cases.",
    why: "Instead of rewriting AI prompts every time, you author them once as a Skill and reuse them across multiple pipelines and workflows. This promotes consistency, shareability, and maintainability of your AI instructions.",
    where: "Navigate via the Skill Hub menu → Skill Library, or go directly to /skills/library.",
    how: [
      { step: "Browse", detail: "View all skills as cards. Use the search bar to find by name or description." },
      { step: "Sort", detail: "Use the Sort dropdown to order by Name (A–Z, Z–A) or Date (newest/oldest first)." },
      { step: "Filter", detail: "Filter by Language or Category using the filter dropdowns to narrow down the list." },
      { step: "Edit", detail: "Click the pencil icon on any card to open the Edit Skill form." },
      { step: "Test", detail: "Click the test tube icon to jump to Test Skill with that skill preloaded." },
      { step: "Delete", detail: "Click the trash icon on a skill card. Deletion is permanent and cannot be undone." },
    ],
    bestPractices: [
      "Give skills clear, action-oriented names: 'Security Analysis' not 'Security'.",
      "Always write a concise description — it appears on the card and helps others understand the skill at a glance.",
      "Tag skills liberally (e.g. 'review', 'security', 'typescript') to make filtering effective.",
      "Version your skills (1.0.0 → 1.1.0) when making breaking changes to instructions.",
      "Add Coding Agents and IDEs so users know where the skill is expected to run.",
    ],
    tips: [
      "The 6 default skills (Code Review, Security Analysis, etc.) cannot be removed from auto-seed — but you can freely edit them.",
      "Click any skill card's header to expand a quick-preview of its instructions.",
    ],
  },
  {
    id: "create-skill",
    icon: <Wrench className="w-5 h-5" />,
    title: "Create Skill",
    color: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800",
    badge: "Author",
    what: "The Create Skill form is where you author a new AI skill from scratch. You define its metadata (name, category, language, version, tags, agents, IDEs) and write a Markdown instruction document that tells the AI how to behave.",
    why: "Every custom workflow starts with a well-authored skill. The more precise and structured your instruction Markdown, the better and more reproducible the AI output will be.",
    where: "Skill Hub menu → Create Skill, or go to /skills/create.",
    how: [
      { step: "Skill Name", detail: "Enter a unique, descriptive name. Required field." },
      { step: "Category", detail: "Pick an existing category or type a new one. This groups related skills in the library." },
      { step: "Language", detail: "Specify the primary language this skill targets (TypeScript, Python, etc.)." },
      { step: "Coding Agents", detail: "Multi-select dropdown — choose which AI coding agents this skill is designed for (GitHub Copilot, Gemini, Claude, etc.)." },
      { step: "Compatible IDEs", detail: "Multi-select dropdown — choose which IDEs support running this skill (VS Code, Cursor, Windsurf, etc.)." },
      { step: "Version", detail: "Set a semantic version string like 1.0.0. Increment when you make breaking changes." },
      { step: "Description", detail: "A brief one-liner shown on the library card." },
      { step: "Tags", detail: "Type a tag and press Enter. Add as many as needed." },
      { step: "Skill Template Editor", detail: "Your main instruction Markdown. Use 'Load Sample Template' to get a head-start." },
      { step: "Download", detail: "Download the skill as a .md file for use in external tools or source control." },
      { step: "Save to Library", detail: "Click to persist the skill into the library." },
    ],
    bestPractices: [
      "Structure your instruction Markdown with clear sections: # Context, # Instructions, # Constraints, # Examples.",
      "Be explicit about output format in the Constraints section (e.g. 'Must respond in JSON').",
      "Use # Examples to illustrate sample input/output — this dramatically improves AI responses.",
      "Keep one skill focused on one concern (single-responsibility principle).",
      "Use the 'Load Sample Template' to always start from a structured base.",
    ],
    tips: [
      "Commit the downloaded .md files to your repository's .ai/ or .prompts/ directory.",
      "You can create new categories and languages on the fly — no need to pre-configure them.",
    ],
  },
  {
    id: "edit-skill",
    icon: <FileText className="w-5 h-5" />,
    title: "Edit Skill",
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    badge: "Modify",
    what: "Edit Skill lets you update any metadata or instruction content of an existing skill. All fields from Create Skill are editable here, including the skill name, category, language, agents, IDEs, version, and the full Markdown instruction body.",
    why: "AI prompts are living documents — as your codebase evolves, your skills should too. Regularly updating your skills ensures AI outputs remain relevant and accurate.",
    where: "Click the pencil icon on any library card, or navigate to /skills/edit/:id.",
    how: [
      { step: "Open", detail: "Click the pencil (edit) icon on a skill card in the library." },
      { step: "Update Metadata", detail: "Change any left-column fields: name, category, language, agents, IDEs, version, description, tags." },
      { step: "Update Instructions", detail: "Edit the Markdown instruction body in the right-column editor." },
      { step: "Save Changes", detail: "Click 'Save Changes' — the 'Updated At' timestamp will be updated automatically." },
      { step: "Download", detail: "Export the updated skill as a .md file at any time." },
    ],
    bestPractices: [
      "Increment the version number every time you change the behaviour of a skill.",
      "Add a change note inside the Markdown itself (e.g. ## Changelog section) for traceability.",
      "Review which pipelines reference a skill before making breaking changes to it.",
      "When adding new Coding Agents, test the skill against that agent before committing.",
    ],
  },
  {
    id: "test-skill",
    icon: <TestTube className="w-5 h-5" />,
    title: "Test Skill",
    color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800",
    badge: "Validate",
    what: "Test Skill provides a sandbox environment where you can execute a skill's instructions against sample inputs — without touching a real pipeline or use case. It's a quick-feedback loop for validating prompt quality.",
    why: "Shipping a poorly authored skill into a pipeline affects every downstream use case that depends on it. Testing skills in isolation before integrating them prevents regressions and ensures quality.",
    where: "Skill Hub menu → Test Skill, or go to /skills/test.",
    how: [
      { step: "Select Skill", detail: "Pick any skill from the dropdown — it will load the skill's instructions automatically." },
      { step: "Enter Test Input", detail: "Provide sample code, text, or data that the skill should process." },
      { step: "Run Test", detail: "Click 'Run Test' — the skill's instructions are sent with your input to simulate execution." },
      { step: "Review Output", detail: "Review the AI response in the output panel and check if it matches expectations." },
      { step: "Iterate", detail: "Go back to Edit Skill, refine your instructions, and re-test until satisfied." },
    ],
    bestPractices: [
      "Test with both typical inputs and edge cases (empty files, unusual syntax, etc.).",
      "Capture a good test case as an Example in your skill's instruction Markdown.",
      "Test after every significant instruction change before saving to the library.",
      "Use realistic code snippets from your actual codebase as test input for the most relevant results.",
    ],
    tips: [
      "This is the only feature in the prototype that will directly call an AI API when properly configured.",
      "If no API key is configured, this page will show a placeholder response for demo purposes.",
    ],
  },
  {
    id: "pipeline-builder",
    icon: <GitMerge className="w-5 h-5" />,
    title: "Pipeline Builder",
    color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800",
    badge: "Compose",
    what: "Pipeline Builder is a visual workflow editor for composing sequences of Skills into an ordered execution pipeline. Every pipeline starts with a fixed 'Start: Pull Request' node and ends with a fixed 'End: Final AI Report' node — you add any number of skills in between.",
    why: "A single skill handles one concern. A pipeline combines multiple skills to produce a comprehensive, multi-dimensional AI review. This is how you create an 'Automated Code Review' that checks security, performance, and documentation in one run.",
    where: "Skill Hub menu → Pipeline Builder, or go to /skills/pipeline.",
    how: [
      { step: "Browse Available Skills", detail: "The left panel shows all skills in your library. Click one to add it to the workflow." },
      { step: "Reorder Skills", detail: "Drag skills up or down in the right panel to change their execution order." },
      { step: "Remove a Skill", detail: "Click the × on any workflow node to remove it from the sequence." },
      { step: "Save Pipeline", detail: "Click 'Save Pipeline', enter a name and optional description, then confirm. The pipeline is saved for reuse in Use Cases." },
      { step: "Execute Flow", detail: "Click 'Execute Flow' to run a simulated execution — each skill is processed sequentially with animated progress indicators, concluding with a mock Final AI Report." },
      { step: "Scroll Canvas", detail: "If the pipeline is long, the canvas scrolls vertically to accommodate all nodes." },
    ],
    bestPractices: [
      "Order skills logically: run 'Security Analysis' before 'Code Review' so security issues inform the review.",
      "Keep pipelines focused — a pipeline with 2–4 skills is more manageable than one with 10.",
      "Name pipelines descriptively: 'Full PR Audit' is clearer than 'Pipeline 1'.",
      "Reuse the same pipeline across multiple Use Cases rather than duplicating it.",
      "Treat the 'Execute Flow' simulation as a demo — for production use, connect a real execution backend.",
    ],
    tips: [
      "The Start and End nodes are fixed and cannot be removed — this enforces a consistent PR-based workflow structure.",
      "Saved pipelines are immediately available in the Use Cases 'Assigned Pipeline' dropdown.",
    ],
  },
  {
    id: "web-hub",
    icon: <Globe className="w-5 h-5" />,
    title: "Web Hub",
    color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800",
    badge: "New",
    what: "Web Hub is a personal link management system designed for the AI Hub ecosystem. It allows users to store, categorize, and tag web pages, YouTube videos, and GitHub repositories in a highly visual 6-cards-per-row grid.",
    why: "Centralizing research and resources is critical for building effective AI skills. Web Hub provides a visual, searchable library for these resources with automatic metadata fetching (YouTube & GitHub), keeping your research organized in one place.",
    where: "Access it via the 'Web Hub' link in the global navigation header (if enabled in Settings), or navigate to /web-hub.",
    how: [
      { step: "Add Link", detail: "Click 'Add Link', paste a URL, and use the refresh icon to auto-fetch the title and type-detection." },
      { step: "Categorize", detail: "Create new categories or select existing ones to group your links logically." },
      { step: "Tagging", detail: "Add multiple tags to links for advanced cross-category filtering." },
      { step: "Filter & Sort", detail: "Use type-specific pills (e.g. Video, Shorts) or the search bar/dropdowns to navigate your library." },
      { step: "Data Portability", detail: "Use the Import/Export CSV tools to backup your local library or share it across devices." },
    ],
    bestPractices: [
      "Always use the Auto-Fetch tool for YouTube/GitHub URLs to get accurate metadata instantly.",
      "Assign one category per link but multiple tags for better discovery.",
      "Periodically export your library to CSV as data is stored locally in your browser cache.",
      "Use the 'Article' or 'Tool' types for non-video/repo resources to keep icons consistent.",
    ],
    tips: [
      "YouTube Shorts, Playlists, and Channels have distinct color-coded icons to help you scan your library faster.",
      "Hover over any link card to reveal quick-actions like Edit, Delete, and Open Link.",
    ],
  },
  {
    id: "stack-builder",
    icon: <Wrench className="w-5 h-5" />,
    title: "Angular Stack Builder",
    color: "bg-[#dd0031]/10 text-[#dd0031] dark:text-[#f15e7c] border-[#dd0031]/20 dark:border-[#960021]",
    badge: "Tool",
    what: "A visual, step-by-step wizard to configure and generate production-ready Angular project codebases pre-integrated with AI Hub skills and best practices.",
    why: "Setting up a new Angular project with the right linting, testing, UI framework, and AI tooling is time-consuming. Stack Builder automates this into a downloadable ZIP, saving you hours of boilerplate configuration.",
    where: "Access it via the 'ng Stack Builder' link in the top navigation, or navigate to /angular-builder.",
    how: [
      { step: "Project Details", detail: "Configure your Angular version, CSS framework, PrimeNG, and IDE integrations." },
      { step: "AI Intelligence", detail: "Embed specific AI Hub skills, built-in best practices, and community agent skills directly into your project's `.ai/` directory." },
      { step: "Review & Generate", detail: "Double check your selections and click 'Download Project ZIP' to get your scaffolded codebase." }
    ],
    bestPractices: [
      "Select IDE integrations to automatically generate workspace configurations for Cursor or VS Code.",
      "Include 'Built-in Best Practices' to automatically scaffold a strong foundation for your team.",
      "Use the 'Online Agent Skills' tab to add quick setup installation commands into your new project's README."
    ],
    tips: [
      "You can click on the step numbers at the top of the wizard to quickly navigate between sections."
    ],
  },
];

const FUTURE_ENHANCEMENTS = [
  {
    category: "🏪 AI Skill Marketplace",
    icon: <Star className="w-4 h-4" />,
    items: [
      "Browse thousands of community skills",
      "Rate and review skills",
      "Premium skill subscriptions",
      "Verified skill creators",
    ],
  },
  {
    category: "📂 Skill Versioning",
    icon: <GitMerge className="w-4 h-4" />,
    items: [
      "Semantic versioning support",
      "Skill dependency graphs",
      "Automatic migration tools",
      "Rollback capabilities",
    ],
  },
  {
    category: "👥 Team Skill Sharing",
    icon: <Users className="w-4 h-4" />,
    items: [
      "Private team repositories",
      "Skill access controls",
      "Collaborative editing",
      "Approval workflows",
    ],
  },
  {
    category: "📈 AI Skill Analytics",
    icon: <BookOpen className="w-4 h-4" />,
    items: [
      "Execution metrics",
      "Performance tracking",
      "Cost analysis",
      "Usage reports",
    ],
  },
  {
    category: "🗺️ Skill Composition",
    icon: <Monitor className="w-4 h-4" />,
    items: [
      "Visual workflow builder",
      "Conditional branching",
      "Parallel execution",
      "Error handling",
    ],
  },
  {
    category: "🌐 Multi-Language Support",
    icon: <FileText className="w-4 h-4" />,
    items: [
      "Language-agnostic patterns",
      "Auto-detection",
      "Cross-language suggestions",
      "Universal best practices",
    ],
  },
  {
    category: "💬 Real-time Collaboration",
    icon: <Bot className="w-4 h-4" />,
    items: [
      "Live editing sessions",
      "Shared skill testing",
      "Team chat integration",
      "Presence indicators",
    ],
  },
  {
    category: "🛡️ Enterprise Security",
    icon: <Shield className="w-4 h-4" />,
    items: [
      "SOC 2 compliance",
      "Audit logging",
      "Secret management",
      "RBAC controls",
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function SectionCard({ section }: { section: Section }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      {/* Header — always visible, click to expand */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-muted/30 transition-colors"
        aria-expanded={open}
      >
        <div className={`w-10 h-10 rounded-lg border flex items-center justify-center flex-shrink-0 ${section.color}`}>
          {section.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
            {section.badge && (
              <Badge variant="outline" className="text-xs font-normal">{section.badge}</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{section.what.substring(0, 100)}…</p>
        </div>
        {open
          ? <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          : <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        }
      </button>

      {/* Expanded Content */}
      {open && (
        <div className="border-t border-border px-6 py-6 space-y-6">
          {/* What / Why / Where grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">What</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{section.what}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">Why</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{section.why}</p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowRight className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Where</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{section.where}</p>
            </div>
          </div>

          {/* How */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Rocket className="w-4 h-4 text-primary" /> How to Use
            </h3>
            <ol className="space-y-2">
              {section.how.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div>
                    <span className="text-sm font-semibold text-foreground">{step.step}: </span>
                    <span className="text-sm text-muted-foreground">{step.detail}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Best Practices */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" /> Best Practices
            </h3>
            <ul className="space-y-2">
              {section.bestPractices.map((practice, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>{practice}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tips (optional) */}
          {section.tips && section.tips.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-lg p-4">
              <h3 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> Tips & Notes
              </h3>
              <ul className="space-y-1.5">
                {section.tips.map((tip, i) => (
                  <li key={i} className="text-sm text-amber-800 dark:text-amber-300 flex items-start gap-2">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function Help() {
  const [activeTab, setActiveTab] = useState<"guide" | "future">("guide");
  const [showWelcome, setShowWelcome] = useState(false);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Page Header */}
        <div className="text-center space-y-3 py-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-2">
            <BookOpen className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Help & Documentation</h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-base">
            Everything you need to know about AI Hub — what each feature does, how to use it, why it exists, and how to get the most out of it.
          </p>
          <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-300 text-xs font-medium px-3 py-1.5 rounded-full">
            <Shield className="w-3.5 h-3.5" /> This is a prototype — not intended for production use.
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-muted/40 border border-border rounded-xl p-1 w-full max-w-sm mx-auto">
          <button
            type="button"
            onClick={() => setActiveTab("guide")}
            className={"flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all " + (
              activeTab === "guide"
                ? "bg-white dark:bg-card shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Feature Guide
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("future")}
            className={"flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all " + (
              activeTab === "future"
                ? "bg-white dark:bg-card shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Future Enhancements
          </button>
        </div>

        {/* Welcome Launch Button */}
        <div className="flex justify-center mt-4">
           <Button variant="outline" onClick={() => setShowWelcome(true)} className="gap-2">
             <Rocket className="w-4 h-4 text-primary" />
             View AI Hub Introduction
           </Button>
        </div>

        {/* ── Feature Guide Tab ── */}
        {activeTab === "guide" && (
          <div className="space-y-4">
            {/* Quick-nav */}
            <p className="text-sm text-muted-foreground text-center">Click any section to expand full documentation.</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SECTIONS.map(s => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="text-xs px-3 py-1.5 rounded-full border border-border bg-muted/30 hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {s.title}
                </a>
              ))}
            </div>

            {/* Section cards */}
            <div className="space-y-4" id="sections">
              {SECTIONS.map(section => (
                <div id={section.id} key={section.id}>
                  <SectionCard section={section} />
                </div>
              ))}
            </div>

            {/* Feature quick-access */}
            <div className="bg-muted/20 border border-border rounded-xl p-6 mt-6">
              <h2 className="text-base font-semibold text-foreground mb-4">Quick Access</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Skill Library", to: "/skills/library", icon: <Library className="w-4 h-4" /> },
                  { label: "Create Skill", to: "/skills/create", icon: <Wrench className="w-4 h-4" /> },
                  { label: "Test Skill", to: "/skills/test", icon: <TestTube className="w-4 h-4" /> },
                  { label: "Pipeline Builder", to: "/skills/pipeline", icon: <GitMerge className="w-4 h-4" /> },
                  { label: "Use Cases", to: "/skills/use-cases", icon: <Lightbulb className="w-4 h-4" /> },
                  { label: "Web Hub", to: "/web-hub", icon: <Globe className="w-4 h-4" /> },
                  { label: "ng Stack Builder", to: "/angular-builder", icon: <Wrench className="w-4 h-4" /> },
                  { label: "Settings", to: "/settings", icon: <Shield className="w-4 h-4" /> },
                ].map(item => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center gap-2.5 px-4 py-3 bg-white dark:bg-card border border-border rounded-lg text-sm font-medium text-foreground hover:border-primary/40 hover:shadow-sm transition-all group"
                  >
                    <span className="text-primary group-hover:scale-110 transition-transform">{item.icon}</span>
                    {item.label}
                    <ArrowRight className="w-3 h-3 text-muted-foreground ml-auto" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Future Enhancements Tab ── */}
        {activeTab === "future" && (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground text-center">
              These are the planned and proposed ways to extend AI Hub into a production-grade platform.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {FUTURE_ENHANCEMENTS.map((group) => (
                <div
                  key={group.category}
                  className="bg-white dark:bg-card border border-border rounded-xl p-5 space-y-3 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{group.category.split(" ")[0]}</span>
                    <h3 className="text-base font-semibold text-foreground">
                      {group.category.replace(/^[^\s]+\s/, "")}
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {group.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <ArrowRight className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6 text-center space-y-3">
              <Rocket className="w-8 h-8 text-primary mx-auto" />
              <h3 className="text-lg font-semibold text-foreground">Ready to Contribute?</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                AI Hub is an open prototype. If you want to extend it with real backend integration, CI/CD hooks, or team features — the architecture is intentionally modular and ready to grow.
              </p>
              <Button variant="outline" size="sm" asChild className="mt-2">
                <Link to="/settings">
                  <Shield className="w-4 h-4 mr-2" /> Check Settings & Configuration
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>

      <WelcomeModal isOpen={showWelcome} onClose={() => setShowWelcome(false)} />
    </Layout>
  );
}
