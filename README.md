# Glyph

> **A fast, local-first Markdown editor built for developers who prefer the keyboard.**

Glyph is a lightweight WYSIWYG Markdown editor designed around one idea:

**Writing should feel fast, focused, and familiar.**

It combines a rich visual editing experience with Markdown-first workflows, Vim-style motions, local persistence, command-based actions, and a minimal interface that stays out of the way.

**No account. No backend. No cloud dependency. Your notes stay in your browser.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Try%20Glyph-black?style=for-the-badge)](https://glyph-sigma.vercel.app)

---

## ✨ Features

- **WYSIWYG Markdown editing** — Write Markdown through a rich visual editing experience.
- **Vim-style editing** — Navigate and edit using familiar Vim-inspired modes and motions.
- **Local-first storage** — Notes persist locally in the browser using Zustand.
- **No authentication** — Open Glyph and start writing immediately.
- **No backend required** — The editor works without a remote database or API.
- **Multiple notes** — Create, rename, edit, and delete Markdown files from the sidebar.
- **Command menu** — Access commands and common actions without leaving the keyboard.
- **Markdown export** — Export notes as `.md` files.
- **PDF export** — Print the current document and save it as a PDF.
- **Dark & light themes** — Switch themes without leaving the editor.
- **Rich Markdown** — Headings, lists, task lists, links, images, tables, highlights, underline, typography, and code blocks.
- **Syntax highlighting** — Code blocks are highlighted with Shiki.
- **Keyboard-first workflow** — Designed around desktop use and efficient keyboard interaction.

---

## 📸 Screenshots

### Editor

![Glyph Editor](./screenshots/editor.png)

### Command Menu

![Glyph Command Menu](./screenshots/command-menu.png)

### Vim Mode

![Glyph Vim Mode](./screenshots/vim-mode.png)

---

## 🌐 Live Demo

Try Glyph directly in your browser:

**[→ Open Glyph](https://glyph-sigma.vercel.app)**

No account or installation is required.

---

## 🧠 Vim Mode

Glyph includes a Vim-inspired editing system built around three modes:

| Mode       | Purpose                                   |
| ---------- | ----------------------------------------- |
| **Normal** | Navigate and perform editing operations   |
| **Insert** | Type and edit content normally            |
| **Visual** | Select content using Vim-style navigation |

### Supported motions & operations

| Key                   | Action                              |
| --------------------- | ----------------------------------- |
| `h` / `j` / `k` / `l` | Move around the document            |
| `w`                   | Move forward by word                |
| `b`                   | Move backward by word               |
| `e`                   | Move to the end of a word           |
| `0` / `^`             | Move to the beginning of a line     |
| `$`                   | Move to the end of a line           |
| `gg`                  | Go to the beginning of the document |
| `G`                   | Go to the end of the document       |
| `i`                   | Enter insert mode                   |
| `a`                   | Enter insert mode after the cursor  |
| `o` / `O`             | Create a line below / above         |
| `v`                   | Enter visual mode                   |
| `d` / `dd`            | Delete                              |
| `c` / `cc`            | Change                              |
| `y` / `yy`            | Yank                                |
| `x`                   | Delete a character                  |
| `r`                   | Replace a character                 |
| `Esc`                 | Return to normal mode               |

Glyph is **not intended to be a complete Vim implementation**.

Instead, it focuses on the parts of Vim navigation and editing that make Markdown writing faster and more enjoyable.

---

## 🏗️ Architecture

Glyph follows a feature-oriented separation between the application layer, UI, editor logic, state, and shared utilities.

```text
┌─────────────────────────────────────────────────┐
│                    Next.js                      │
│             Application / Routing               │
└───────────────────────┬─────────────────────────┘
                        │
          ┌─────────────┴─────────────┐
          │                           │
          ▼                           ▼
   ┌──────────────┐            ┌──────────────┐
   │      UI      │            │    Editor    │
   │              │            │              │
   │ Components   │            │    Tiptap    │
   │ Sidebar      │            │ Vim System   │
   │ Commands     │            │ Extensions   │
   │ Toolbar      │            │ Serialization │
   └──────┬───────┘            └──────┬───────┘
          │                           │
          └─────────────┬─────────────┘
                        ▼
                 ┌──────────────┐
                 │    State     │
                 │              │
                 │   Zustand    │
                 │ Persistence  │
                 └──────┬───────┘
                        │
                        ▼
                 ┌──────────────┐
                 │   Browser    │
                 │              │
                 │ Local Storage│
                 └──────────────┘
```

### Main responsibilities

```text
app/
  Application routes and global styles

component/
  UI components and editor-facing components

hook/
  Reusable React hooks

lib/
  Editor behavior, file operations, and utilities

store/
  Application state and persisted notes

type/
  Shared TypeScript types
```

The architecture keeps UI concerns separate from editor behavior and persistence, making individual parts easier to reason about and extend.

---

## 💡 Key Technical Decisions

### Why Next.js?

Next.js provides the application structure, routing, build pipeline, and modern React environment required by the project without introducing unnecessary infrastructure.

### Why Tiptap?

The editor requires rich-text behavior while still supporting Markdown-oriented workflows.

Tiptap provides a flexible ProseMirror-based foundation that makes custom extensions and editor behavior possible without implementing a rich-text engine from scratch.

### Why Zustand?

Glyph's state requirements are relatively small.

Zustand provides a lightweight state model without the ceremony of a larger state-management solution, while its persistence middleware allows notes to survive browser sessions.

### Why local-first?

A backend would introduce authentication, databases, APIs, synchronization, hosting, and additional failure points.

Glyph doesn't need those features to fulfill its primary purpose.

Keeping notes local makes the application:

- Faster to start
- Simpler to deploy
- Usable without an account
- Independent of a backend
- More private by default

### Why Vim-inspired editing?

The target workflow is keyboard-heavy.

Vim-style navigation reduces the need to constantly move between the keyboard and mouse, making document navigation and editing more efficient for users already familiar with Vim.

### Why TypeScript?

The application contains several interacting systems—editor state, document state, commands, keyboard modes, and UI state.

TypeScript provides stronger contracts between these systems and makes refactoring safer as the codebase evolves.

---

## 🧩 Challenges & Solutions

### 1. Building Vim-style editing inside a rich-text editor

**Challenge**

Traditional Vim operates on text positions, while a rich-text editor has a structured document model containing paragraphs, headings, lists, links, code blocks, and other nodes.

**Solution**

Glyph implements Vim-inspired behavior on top of the editor's document and selection model rather than attempting to recreate Vim's underlying text engine.

This allows familiar navigation while preserving the benefits of a structured rich-text document.

---

### 2. Persisting multiple documents without a backend

**Challenge**

Glyph needed multiple editable notes that survive page reloads without introducing authentication or server-side storage.

**Solution**

Application state is managed through Zustand with persistence, allowing the note collection and active document state to be stored locally in the browser.

This keeps the architecture entirely client-side.

---

### 3. Keeping keyboard workflows from interfering with normal editing

**Challenge**

Global keyboard shortcuts can easily conflict with text input, browser behavior, and editor commands.

**Solution**

Keyboard handling is aware of the editor's current Vim mode and interaction context, allowing commands to be interpreted differently depending on whether the user is navigating, inserting, or selecting content.

---

### 4. Keeping the interface minimal while exposing many actions

**Challenge**

An editor needs many operations, but constantly displaying toolbars and controls works against a focused writing experience.

**Solution**

Glyph uses a command menu to make secondary actions available on demand while keeping the main editing surface visually clean.

---

## 💾 Local-first by Design

Glyph deliberately avoids requiring a backend.

Notes are persisted locally in the browser using **Zustand's persistence middleware**, allowing the application to work without accounts, servers, or cloud infrastructure.

Notes are stored under the `glyph-notes` browser storage key.

### ⚠️ Important

Because your notes are stored locally:

- Clearing browser site data can remove your notes.
- Glyph currently does not provide cloud synchronization.
- Glyph does not provide automatic backups.

For important documents, export a Markdown copy to keep an additional backup.

This trade-off is intentional:

**Glyph prioritizes simplicity, privacy, and immediate usability over cloud-based infrastructure.**

---

## ⌨️ Command Menu

Press `:` while in **Normal mode** to open the command menu.

From there you can:

- Toggle the theme
- Toggle the sidebar
- Export the current note as Markdown
- Export the current note as PDF
- Switch between notes

The command menu keeps frequently used actions accessible without interrupting a keyboard-driven workflow.

---

## 🛠️ Tech Stack

| Technology         | Purpose                        |
| ------------------ | ------------------------------ |
| **Next.js 16**     | Application framework          |
| **React 19**       | UI                             |
| **TypeScript**     | Type-safe development          |
| **Tiptap 3**       | Rich-text editor               |
| **Zustand**        | State management & persistence |
| **Tailwind CSS 4** | Styling                        |
| **shadcn/ui**      | UI primitives                  |
| **Lucide**         | Icons                          |
| **Framer Motion**  | UI animations                  |
| **Shiki**          | Syntax highlighting            |
| **Sonner**         | Notifications                  |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 20+**
- **npm**, **pnpm**, **yarn**, or **Bun**

### Installation

Clone the repository:

```bash
git clone https://github.com/tasha-dev/glyph.git
cd glyph
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### Production build

```bash
npm run build
npm run start
```

### Lint

```bash
npm run lint
```

---

## 🗂️ Project Structure

```text
app/             Next.js routes and global styles
component/       Editor, sidebar, toolbar, command menu, and UI
hook/            Reusable React hooks
lib/             Editor, file, and utility logic
store/           Zustand stores and persisted note state
type/            Shared TypeScript types
screenshots/     Project screenshots
```

---

## 🎯 Philosophy

Glyph is intentionally small and focused.

It doesn't try to become a collaborative workspace, project-management platform, or cloud document suite.

**The editor is the product.**

The goal is to make Markdown editing feel closer to using a dedicated writing application than filling out a web form:

**fast, keyboard-friendly, visually polished, and local by default.**

Every feature exists to support that workflow.

---

## ⚠️ Desktop-first

Glyph is currently designed for **desktop and laptop environments**.

Its editing experience relies heavily on keyboard interaction and Vim-style motions, so touch devices are not currently supported.

---

## 📄 License

Glyph is open source and available under the [MIT License](LICENSE).

---

## 🌐 Live Demo

**[Try Glyph →](https://glyph-sigma.vercel.app)**

No account required.

---

Built with TypeScript, React, and a slightly unreasonable love for keyboard shortcuts.
