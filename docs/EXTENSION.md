# Chrome Extension Best Practices

A guide to setting up a modern Chrome extension using the stack in this repo: Vite + React + TypeScript + Tailwind CSS.

## Stack

| Tool | Purpose |
|------|---------|
| Vite | Bundler and dev server |
| TypeScript | Type-safe application code |
| React | UI for popup and injected pages |
| Tailwind CSS | Utility-first styling |
| ESLint | Static analysis |
| Prettier | Code formatting |

## Project Structure

```
my-extension/
├── public/
│   └── manifest.json         # Chrome extension manifest (copied as-is)
├── src/
│   ├── index.css             # Tailwind directives
│   ├── types.ts              # Shared TypeScript interfaces
│   ├── background/
│   │   └── index.ts          # Service worker
│   ├── popup/
│   │   ├── main.tsx          # React entry point
│   │   └── Popup.tsx         # UI component
│   └── [page-name]/          # One directory per HTML entry point
│       ├── main.tsx
│       └── [PageName].tsx
├── popup.html                # Extension popup HTML shell
├── [page-name].html          # Additional full-page HTML shells
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── eslint.config.js
├── .prettierrc
├── tailwind.config.js
└── postcss.config.js
```

Keep background logic, UI components, and utility functions in separate files. Shared types live in `src/types.ts`.

## Manifest V3

Store `manifest.json` in `public/` so Vite copies it to `dist/` without transformation.

```json
{
  "manifest_version": 3,
  "name": "My Extension",
  "version": "1.0.0",
  "description": "...",
  "permissions": ["storage"],
  "host_permissions": ["<all_urls>"],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_popup": "popup.html"
  }
}
```

Only request permissions you actually use. Reviewers and users scrutinize permissions.

## Vite Config

Extensions have multiple entry points. Configure Rollup's `input` accordingly:

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            input: {
                popup: "popup.html",
                background: "src/background/index.ts",
                // add more HTML pages here
            },
            output: {
                // Background script must have a stable, unhashed filename
                // because manifest.json references it by exact name
                entryFileNames: (chunk) => {
                    if (chunk.name === "background") return "[name].js";
                    return "assets/[name]-[hash].js";
                },
            },
        },
    },
});
```

The background service worker must have a stable filename because `manifest.json` references it directly. UI bundles can use content hashes.

## TypeScript

Use project references so IDE tooling and `tsc -b` handle both app code and build-tool code (e.g. `vite.config.ts`) with appropriate settings.

**tsconfig.json** — root, references only:
```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

**tsconfig.app.json** — application source:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "erasableSyntaxOnly": true,
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "types": ["vite/client", "chrome"]
  },
  "include": ["src"]
}
```

**tsconfig.node.json** — for `vite.config.ts` and other build tools:
```json
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": ["vite.config.ts"]
}
```

Key settings:
- `moduleResolution: "bundler"` — correct for Vite; avoids Node resolution quirks
- `verbatimModuleSyntax: true` — preserves `import type` / `export type`, required with some tools
- `noEmit: true` — Vite owns compilation; `tsc -b` is for type-checking only
- `erasableSyntaxOnly: true` — disallows TypeScript syntax that requires runtime transforms (e.g. `const enum`)

Install `@types/chrome` for full Chrome extension API types.

## ESLint

Use the flat config format (ESLint v9+):

```javascript
// eslint.config.js
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default tseslint.config(
    { ignores: ["dist"] },
    {
        extends: [
            js.configs.recommended,
            ...tseslint.configs.recommended,
        ],
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            globals: globals.browser,
        },
        plugins: {
            "react-hooks": reactHooks,
            "react-refresh": reactRefresh,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            "react-refresh/only-export-components": [
                "warn",
                { allowConstantExport: true },
            ],
        },
    },
);
```

## Prettier

```json
{
  "tabWidth": 4,
  "trailingComma": "all"
}
```

4-space indentation and trailing commas keep diffs clean when adding items to multi-line lists.

## Tailwind CSS

```javascript
// tailwind.config.js
export default {
    content: [
        "./src/**/*.{ts,tsx}",
        "./popup.html",
        // list every HTML entry point so Tailwind scans all template files
    ],
    theme: { extend: {} },
    plugins: [],
};
```

```javascript
// postcss.config.js
export default {
    plugins: {
        tailwindcss: {},
        autoprefixer: {},
    },
};
```

Import Tailwind in a single shared CSS file:

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Import that CSS file from each page's `main.tsx`.

## HTML Entry Points

Each page needs a minimal HTML shell. Reference the entry script with `type="module"`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Extension</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/popup/main.tsx"></script>
  </body>
</html>
```

## React Entry Points

```tsx
// src/popup/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../index.css";
import Popup from "./Popup";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Popup />
    </StrictMode>,
);
```

## Background Service Worker

The background script runs as a service worker — it has no DOM and may be terminated by Chrome at any time. Design accordingly:

- Do not store state in module-level variables across async boundaries; use `chrome.storage` instead
- Register event listeners at the top level, not inside async callbacks
- Use `chrome.runtime.onInstalled` to set up default state

```typescript
// src/background/index.ts
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ myKey: defaultValue });
});

chrome.someApi.onSomeEvent.addListener((details) => {
    // handle event
});
```

## Chrome Storage

Prefer `chrome.storage.local` over `localStorage`. It works in service workers, has a larger quota, and is accessible from any extension context.

```typescript
// Read
const { myKey } = await chrome.storage.local.get("myKey");

// Write
await chrome.storage.local.set({ myKey: newValue });
```

Define a shared `types.ts` for all storage schemas so popup, background, and other pages agree on shape.

## NPM Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "watch": "vite build --watch",
    "lint": "eslint .",
    "format": "prettier --write src",
    "prepare": "npm run format && npm run lint && npm run build"
  }
}
```

- `build` runs `tsc -b` first so type errors fail the build
- `prepare` is the single command to run before committing — formats, lints, then builds
- `watch` is useful during development; load `dist/` as an unpacked extension and Chrome reloads on rebuild

## Loading in Chrome

1. `npm run build` — outputs to `dist/`
2. Open `chrome://extensions`
3. Enable Developer mode
4. Click "Load unpacked" and select the `dist/` folder
5. During development, use `npm run watch` and click the reload icon after each rebuild
