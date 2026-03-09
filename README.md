# BetaBlocker

Don't be a beta. Block distracting sites on a schedule and get shamed every time you try to sneak through.

## Features

- Block domains by schedule (e.g. 10am–6pm)
- Blocked page shows attempt count, a 48-hour histogram, and recent visit history
- Rotating snarky messages to make you feel something

## Dev

```bash
npm install
npm run dev        # watch mode
npm run build      # production build → dist/
```

```bash
npm run format     # prettier
npm run lint       # eslint
```

## Loading in Chrome

1. Run `npm run build`
2. Go to `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked** and select the `dist/` folder
