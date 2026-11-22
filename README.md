# Code Snippet Manager — Frontend 🎨

![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?style=for-the-badge&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Vitest](https://img.shields.io/badge/Tested%20with-Vitest-6E9F18?style=for-the-badge&logo=vitest)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)

A modern, super-responsive, production-grade web application built for developers, engineers, and students to create, manage, benchmark, practice, and share code snippets worldwide.

---

## ✨ Cutting-Edge Developer & Student Features

### 1. 🔍 Universal Command Palette (`⌘K` / `Ctrl+K`)
- Spotlight-style keyboard navigation accessible from anywhere.
- Instant search across code titles, tags, and authors with live debounced suggestions.
- Quick navigation shortcuts: toggle themes, navigate to collections, or open developer tools.

### 2. 📊 Code Complexity & Health Metrics Analyzer
- Real-time AST structural analysis computing:
  - **Lines of Code (LOC)**, code-to-comment ratio, blank lines.
  - **Estimated Cyclomatic Complexity**: Branching keyword detection (`if`, `for`, `while`, `catch`, `case`, `? :`, `&&`, `||`).
  - **Cognitive Load & Reading Time**: Understand how quickly a developer or student can parse the algorithm.
  - **Architecture Health Insights**: Actionable recommendations for code structure and maintainability.

### 3. 🎓 Student Active-Recall & Quiz Mode
- Transforms any code snippet into an active learning quiz:
  - Dynamically calculates **Time & Space Complexity (Big-O)**.
  - Generates critical **runtime edge-case testing** scenarios.
  - Highlights core **programming paradigms** (OOP, FP, Memoization, Asynchronous I/O).
  - Provides instant answer verification, score counter, and detailed technical explanations.

### 4. 📦 1-Click Multi-Format Export Suite
- **Native Source File**: One-click download with correct language extensions (`.js`, `.py`, `.cpp`, `.rs`, `.go`, `.ts`, `.html`).
- **Markdown with Syntax Fences**: Formatted with titles, metadata, and tags for GitHub READMEs or Notion.
- **Complete JSON Schema**: Full snippet object export with author and version metadata.
- **Terminal cURL Command**: Instant one-liner to stream code straight into bash or pipe to a compiler.

### 5. ⚡ Code Editor & 1-Click Beautifier
- **Auto-Formatting (`Alt + Shift + F`)**: Normalizes indentation, trims trailing spaces, and standardizes code structures.
- **Tab Key Indentation**: 2-space indentation with cursor preservation (and `Shift + Tab` unindent).
- **Starter Templates**: Instant boilerplate for Binary Search, Debounce, Competitive Programming C++, LRU Cache, and Fetch with Retry.

### 6. 📖 Big-O Complexity & Syntax Cheat Sheet (`⌘ + Shift + C`)
- Built-in reference sheet featuring:
  - Time & Space complexity comparisons for common data structures and sorting algorithms.
  - Modern JavaScript Array methods and Async/Await patterns.
  - Python idioms and comprehensions.
  - Daily Git workflow commands and HTTP Status Code cheat sheets.

### 7. 🔀 Git-Like Version History & Code Diffs
- Side-by-side **Split View** and **Unified View** comparing lines added, removed, or unchanged across version revisions.
- One-click restore point activation for snippet authors.

### 8. 📱 Super-Responsive Multi-Viewport Architecture
- **Mobile (< 640px)**: 1-column layouts, touch-friendly 44px+ tap targets, no horizontal overflow.
- **Tablet (768px – 1024px)**: Fluid 2-column cards, adaptive filter drawers, and modal responsiveness.
- **Desktop (1280px)**: 3-column balanced grids.
- **Ultra-Wide (1536px – 2560px 4K)**: 4-column fluid grids (`2xl:grid-cols-4`) with `max-w-7xl` centering.
- **Zero One-Sided Border Highlights**: Adheres to balanced 360-degree rounded borders, surface pills, and smooth elevation.

---

## 📁 Project Structure

```
Code-Snippet-Manager-Frontend/
├── public/                  # Static assets & favicon
├── src/
│   ├── components/
│   │   ├── CheatSheetModal.jsx      # Big-O & syntax cheat sheet
│   │   ├── CodeDiffView.jsx         # Line diff comparison (split/unified)
│   │   ├── CodeExecutor.jsx         # In-browser sandboxed execution engine
│   │   ├── CodeMetricsModal.jsx     # Complexity & health metrics analyzer
│   │   ├── CommandPalette.jsx       # Cmd+K spotlight search & actions
│   │   ├── ExportModal.jsx          # Multi-format export suite
│   │   ├── Navbar.jsx               # Responsive navigation & search trigger
│   │   ├── Pagination.jsx           # Windowed sliding pagination
│   │   ├── ShareEmbedModal.jsx      # Responsive iframe & markdown badge embed
│   │   ├── SnippetCard.jsx          # Interactive snippet preview card
│   │   ├── StudentQuizModal.jsx     # Active-recall student practice modal
│   │   ├── TagFilter.jsx            # Multi-tag selector & filter pills
│   │   └── VersionHistoryDrawer.jsx # Version history slide-out drawer
│   ├── context/
│   │   ├── AuthContext.jsx          # Session state & authentication provider
│   │   ├── ThemeContext.jsx         # Dark / light theme provider
│   │   └── ToastContext.jsx         # Custom notification system
│   ├── pages/
│   │   ├── CollectionDetail.jsx     # Curated collection view & manager
│   │   ├── Collections.jsx          # Public & personal collections directory
│   │   ├── Home.jsx                 # Main discovery feed, tabs & language pills
│   │   ├── Login.jsx / Register.jsx # Authentication screens
│   │   ├── Profile.jsx              # User profile & created snippet library
│   │   ├── Search.jsx               # Weighted search with advanced filters
│   │   ├── SnippetDetail.jsx        # Full snippet view, runner & action bar
│   │   └── SnippetEditor.jsx        # Create/edit snippet with templates & formatter
│   ├── services/
│   │   └── api.js                   # Axios HTTP client with auth interceptors
│   └── utils/
│       ├── codeMetrics.js           # AST complexity & metric algorithms
│       ├── commandRegistry.js       # Command palette actions & shortcuts
│       ├── exportUtils.js           # File exporter & markdown formatters
│       └── quizGenerator.js         # Intelligent quiz question generator
├── tests/                           # Vitest test suites
├── vercel.json                      # Vercel deployment & rewrite config
├── vite.config.js                   # Vite bundler config with chunk optimization
└── tailwind.config.js               # Tailwind styling & typography tokens
```

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js** v18+
- **npm** or **pnpm**

### Installation

1. **Navigate to the frontend directory**:
   ```bash
   cd Code-Snippet-Manager-Frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 📦 Production Build & Scripts

```bash
# Build for production
npm run build

# Run automated test suites (Vitest)
npm test

# Run ESLint linter
npm run lint

# Preview production build locally
npm run preview
```

---

## 🌐 Deployment & Vercel Rewrites

This frontend is optimized for deployment on **Vercel**.

> [!IMPORTANT]
> **Preserved Cloudflare Rerouting**:
> In `vercel.json`, the rewrite rule:
> ```json
> {
>   "source": "/projects/code-snippet-manager/(.*)",
>   "destination": "/index.html"
> }
> ```
> is reserved for Cloudflare portfolio integration and must remain intact.
