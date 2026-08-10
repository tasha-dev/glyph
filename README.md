# Glyph

> A fast, local-first Markdown editor built for developers.

Glyph is a lightweight WYSIWYG Markdown editor designed around a simple idea: **writing should feel fast, focused, and familiar to developers.**

It combines a rich visual editing experience with Markdown-first workflows, Vim-style motions, local persistence, command-based actions, and a clean interface that stays out of your way.

**No account. No backend. No sync service. Your notes stay in your browser.**

## ✨ Features

- **WYSIWYG Markdown editing** — Write Markdown while editing through a rich visual editor.
- **Vim motions** — Navigate and edit using familiar Vim-style modes and motions.
- **Local-first storage** — Notes are persisted locally in the browser with Zustand.
- **No authentication** — Start writing immediately without creating an account.
- **No backend required** — Your notes don't need a remote database or API.
- **Multiple Markdown files** — Create, rename, edit, and delete notes from the sidebar.
- **Command menu** — Quickly access commands, notes, theme controls, and exports.
- **Markdown export** — Export your notes as `.md` files.
- **PDF export / printing** — Print your current note to save it as a PDF.
- **Dark and light themes** — Switch between themes without leaving the editor.
- **Rich Markdown support** — Includes headings, lists, task lists, links, images, tables, highlights, underline, typography, and code blocks.
- **Syntax highlighting** — Code blocks are rendered with Shiki.
- **Keyboard-first UI** — Designed primarily for desktop environments and keyboard interaction.

## 🧠 Vim Mode

Glyph includes a Vim-inspired editing system with three main modes:

- **Normal** — Navigate and perform editing operations.
- **Insert** — Type and edit content normally.
- **Visual** — Select content using Vim-style navigation.

Some supported motions and operations include:

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
| `o` / `O`             | Create a new line below / above     |
| `v`                   | Enter visual mode                   |
| `d` / `dd`            | Delete                              |
| `c` / `cc`            | Change                              |
| `y` / `yy`            | Yank                                |
| `x`                   | Delete character                    |
| `r`                   | Replace character                   |
| `Esc`                 | Return to normal mode               |

Glyph is not intended to be a complete Vim implementation. The goal is to bring the parts of Vim navigation and editing that make Markdown writing feel fast and enjoyable.

## 💾 Local-first by design

Glyph stores notes in the browser using Zustand's persistence middleware. The application doesn't require an account or a server to save your work.

Your notes are stored locally under the `glyph-notes` browser storage key.

This also means that **clearing your browser's site data can remove your notes**. Glyph currently does not provide cloud synchronization or automatic backups, so export important documents when you need an additional copy.

## ⌨️ Command Menu

Press `:` while in normal mode to open the command menu.

From there you can:

- Toggle the theme
- Toggle the sidebar
- Export the current note to Markdown
- Export the current note to PDF
- Quickly switch between notes

The command menu keeps common actions accessible without interrupting a keyboard-driven workflow.

## 🛠️ Tech Stack

Glyph is built with a modern React/TypeScript stack:

- [Next.js](https://nextjs.org/) 16
- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/)
- [Tiptap](https://tiptap.dev/) 3
- [Zustand](https://zustand.docs.pmnd.rs/)
- [Tailwind CSS](https://tailwindcss.com/) 4
- [shadcn/ui](https://ui.shadcn.com/)
- [Lucide](https://lucide.dev/)
- [Framer Motion](https://motion.dev/)
- [Shiki](https://shiki.style/)
- [Sonner](https://sonner.emilkowal.ski/)

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm, pnpm, yarn, or Bun

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

Open http://localhost:3000 in your browser.

### Production build

```bash
npm run build
npm run start
```

### Lint

```bash
npm run lint
```

## 🗂️ Project Structure

The project keeps the editor logic, UI, state, and utilities separated:

```text
app/             Next.js application routes and global styles
component/       Editor, sidebar, toolbar, command menu, and UI components
hook/            Reusable React hooks
lib/             Editor, file, and utility logic
store/           Zustand stores and persisted note state
type/            Shared TypeScript types
```

## 🎯 Philosophy

Glyph is intentionally small and focused.

There are no accounts, collaboration features, dashboards, complicated settings, or cloud infrastructure. The application is built around a local writing workflow where the editor is the main product.

The goal is to make Markdown editing feel closer to using a dedicated writing application than filling out a web form — **fast, keyboard-friendly, visually polished, and local by default.**

## ⚠️ Desktop-first

Glyph is designed for desktop and laptop use. Its editing experience relies heavily on keyboard interaction and Vim-style motions, so touch devices are currently not supported.

## 📄 License

Glyph is open source and available under the [MIT License](LICENSE).

## 🌐 Live Demo

Try Glyph in your browser:

**https://glyph-sigma.vercel.app**

---

Built with TypeScript, React, and a slightly unreasonable love for keyboard shortcuts.
