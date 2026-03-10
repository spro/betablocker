# BetaBlocker

Don't be a beta. Block distracting sites on a schedule and get shamed every time you try to sneak through.

## Features

- Block domains by schedule (e.g. 10am–6pm)
- Right-click any page to instantly add it to the block list
- Blocked page shows attempt count, a 48-hour histogram, and recent visit history
- Rotating snarky messages to make you feel something

## Install

```bash
npm install
npm run prepare    # format → lint → build → dist/
```

Then load the extension in Chrome:

1. Go to `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** and select the `dist/` folder

After any changes, re-run `npm run prepare` and click the reload button on the extension card.
