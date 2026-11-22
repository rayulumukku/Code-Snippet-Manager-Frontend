# Code Snippet Manager Frontend

Modern single-page web client built for code snippet discovery, structural complexity benchmarking, active-recall practice, and multi-format distribution.

---

## Overview

The Code Snippet Manager frontend is developed using React 19, Vite, and Tailwind CSS. It delivers an intuitive, responsive interface optimized for developers, software engineers, and computer science students. The application emphasizes clean visual hierarchy, keyboard-driven workflows, interactive code execution, and adaptive responsiveness across every display size.

---

## Developer and Student Features

### 1. Command Palette Navigation (`Cmd+K` / `Ctrl+K`)
- Spotlight-style navigation overlay accessible from any screen via `Cmd+K` or `Ctrl+K`.
- Fast fuzzy filtering across snippet titles, language categories, tags, and author profiles.
- Integrated keyboard triggers for changing visual themes, accessing collections, and opening documentation cheat sheets.

### 2. Code Complexity and Health Metrics Analyzer
- Automated AST structural analyzer providing instant insight into code quality:
  - **Lines of Code (LOC)**: Total lines, code lines, blank lines, and comment lines.
  - **Documentation Ratio**: Real-time comment-to-code percentage calculation.
  - **Cyclomatic and Cognitive Complexity**: Automated detection of branching keywords (`if`, `for`, `while`, `catch`, `case`, ternary operators, and logical conditionals).
  - **Difficulty Assessment**: Categorizes snippets into Low, Moderate, or High complexity tiers.
  - **Comprehension Velocity**: Estimates reading and evaluation time for learners studying unfamiliar algorithms.
  - **Actionable Insights**: Specific recommendations to decompose deeply nested functions or improve documentation coverage.

### 3. Student Active-Recall and Quiz Engine
- Transforms static code listings into interactive learning modules:
  - Dynamically computes and tests **Time and Space Complexity (Big-O)** based on algorithm structure.
  - Evaluates critical **runtime edge cases** (e.g., null references, zero denominators, empty collections).
  - Highlights core **programming paradigms** (Object-Oriented Encapsulation, Functional Pipelines, Dynamic Programming, Asynchronous Event Loops).
  - Provides instantaneous verification, scoring telemetry, and clear conceptual explanations for incorrect choices.

### 4. Multi-Format Export Suite
- **Source File Download**: Exports code directly into native language file extensions (`.js`, `.py`, `.cpp`, `.rs`, `.go`, `.ts`, `.html`).
- **Formatted Markdown**: Generates complete Markdown documentation blocks formatted with language fences and metadata for GitHub READMEs or technical notes.
- **Structured JSON**: Exports full snippet payloads with tags, author information, and revision history metadata.
- **Terminal cURL Command**: Generates one-line terminal commands for streaming plaintext directly to shell interpreters.

### 5. Code Editor and Auto-Formatter
- **Integrated Formatting (`Alt + Shift + F`)**: Normalizes indentation levels, resolves bracket matching, strips trailing whitespace, and formats JSON structures.
- **Tab Key Indentation**: Supports two-space indentation with cursor preservation (`Tab` to indent, `Shift + Tab` to unindent).
- **Curated Starter Templates**: Pre-configured boilerplates for Binary Search, Debounce Utilities, Competitive Programming C++ templates, LRU Caches, and Resilient Fetch with Retry logic.

### 6. Big-O Complexity and Syntax Cheat Sheet (`Cmd + Shift + C`)
- Built-in reference sheet accessible throughout the interface:
  - Asymptotic complexity table comparing common data structures and sorting algorithms.
  - Modern JavaScript array methods and asynchronous execution patterns.
  - Python idioms, comprehensions, and slicing conventions.
  - Daily Git commands and HTTP status code reference tables.

### 7. Version History and Line Diff Viewer
- Side-by-side **Split View** and **Unified View** comparing code snapshots across historical revisions.
- Line-by-line diff engine highlighting additions, removals, and unchanged code blocks.
- One-click restore functionality allowing snippet owners to roll back changes safely.

---

## Visual Design Standards

- **Zero One-Sided Border Highlights**: The application strictly avoids directional accent borders (such as left-edge or bottom-edge accent strips). All containers, cards, dialogs, and navigation elements utilize balanced, 360-degree rounded borders, soft elevation, and surface tinting.
- **Multi-Device Responsiveness**:
  - **Mobile (< 640px)**: Single-column layouts with touch-friendly 44px minimum tap targets, wrapped toolbars, and scrollable code containers.
  - **Tablet (768px to 1024px)**: Fluid two-column grids with adaptive navigation drawers.
  - **Desktop (1280px)**: Three-column balanced catalog layouts with persistent quick search.
  - **Ultra-Wide and 4K (> 1536px)**: Four-column grid arrangements (`2xl:grid-cols-4`) centered within maximum-width constraints (`max-w-7xl`).
- **Theme Support**: Seamless Dark Mode and Light Mode with persistent local state storage.

---

## Directory Structure

```
Code-Snippet-Manager-Frontend/
|-- public/                  # Static assets and site icon
|-- src/
|   |-- components/
|   |   |-- CheatSheetModal.jsx      # Big-O and syntax reference modal
|   |   |-- CodeDiffView.jsx         # Line-by-line diff comparison viewer
|   |   |-- CodeExecutor.jsx         # Sandboxed in-browser code execution engine
|   |   |-- CodeMetricsModal.jsx     # Complexity and structural metrics dialog
|   |   |-- CommandPalette.jsx       # Cmd+K spotlight search overlay
|   |   |-- ExportModal.jsx          # Multi-format export dialog
|   |   |-- Navbar.jsx               # Header navigation with mobile menu
|   |   |-- Pagination.jsx           # Dynamic sliding pagination controls
|   |   |-- ShareEmbedModal.jsx      # Responsive iframe and markdown badge generator
|   |   |-- SnippetCard.jsx          # Snippet preview card
|   |   |-- StudentQuizModal.jsx     # Active-recall quiz engine
|   |   |-- TagFilter.jsx            # Multi-tag selection and filter badges
|   |   `-- VersionHistoryDrawer.jsx # Git-like version revision drawer
|   |-- context/
|   |   |-- AuthContext.jsx          # Session state and auth provider
|   |   |-- ThemeContext.jsx         # Theme toggle provider
|   |   `-- ToastContext.jsx         # Notification alert provider
|   |-- pages/
|   |   |-- CollectionDetail.jsx     # Curated collection view
|   |   |-- Collections.jsx          # Collection directory
|   |   |-- Home.jsx                 # Discovery feed with language filters
|   |   |-- Login.jsx / Register.jsx # Authentication interfaces
|   |   |-- Profile.jsx              # User profile and authored snippet library
|   |   |-- Search.jsx               # Weighted search with advanced filters
|   |   |-- SnippetDetail.jsx        # Snippet view, execution, and metrics toolbar
|   |   `-- SnippetEditor.jsx        # Snippet creation and auto-formatting
|   |-- services/
|   |   `-- api.js                   # Axios HTTP client configuration
|   `-- utils/
|       |-- codeMetrics.js           # Structural complexity analysis algorithms
|       |-- commandRegistry.js       # Command palette registry and shortcuts
|       |-- exportUtils.js           # Multi-extension export formatters
|       `-- quizGenerator.js         # Dynamic quiz generation logic
|-- tests/                           # Vitest component and integration suites
|-- vercel.json                      # Deployment and rewrite configuration
|-- vite.config.js                   # Vite bundler configuration
`-- tailwind.config.js               # Tailwind design system tokens
```

---

## Getting Started

### Prerequisites
- Node.js 18.0.0 or higher
- npm or pnpm

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd Code-Snippet-Manager-Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

4. Start the local development server:
   ```bash
   npm run dev
   ```

---

## Available Scripts

```bash
# Start local development server with Hot Module Replacement (HMR)
npm run dev

# Compile production bundle into dist/
npm run build

# Run automated Vitest test suites
npm test

# Run ESLint validation
npm run lint

# Preview the production build locally
npm run preview
```

---

## Deployment and Routing

The frontend is configured for deployment on Vercel with dedicated header caching and route rewrites.

### Preserved Cloudflare Rewrite
The routing rule in `vercel.json`:
```json
{
  "source": "/projects/code-snippet-manager/(.*)",
  "destination": "/index.html"
}
```
maintains direct integration with the external Cloudflare portfolio rerouting configuration and must remain unmodified.
