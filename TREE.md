```
betablocker/
├── src/
│   ├── background/
│   │   └── index.ts          # Service worker
│   ├── blocked/
│   │   ├── Blocked.tsx        # Blocked page UI
│   │   ├── Histogram.tsx      # Histogram component
│   │   ├── histogramData.ts
│   │   ├── main.tsx
│   │   ├── messages.ts
│   │   └── utils.ts
│   ├── lib/
│   │   └── schedule.ts        # Scheduling logic
│   ├── popup/
│   │   ├── Popup.tsx          # Extension popup UI
│   │   └── main.tsx
│   ├── index.css
│   └── types.ts               # Shared types
├── public/
│   └── manifest.json          # Extension manifest
├── blocked.html               # Entry HTML for blocked page
├── popup.html                 # Entry HTML for popup
└── vite.config.ts             # Build config
```
