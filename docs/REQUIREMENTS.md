# Chrome Extension: Shame Redirector

## Purpose

This extension blocks navigation to specific domains and replaces the page with a "shaming page" that displays statistics about attempts to visit those sites.

The goal is to discourage procrastination through behavioral friction and visibility.

The extension operates entirely locally and does not send data to any external servers.

---

# Core Features

## Domain Blocking

Users maintain a list of blocked domains.

Example:

twitter.com
reddit.com
news.ycombinator.com

Blocking rules apply to:

- the exact domain
- all subdomains

Example:

Blocking `twitter.com` blocks:

www.twitter.com  
mobile.twitter.com  
api.twitter.com  

---

## Navigation Behavior

When a blocked domain is visited:

1. The navigation is intercepted
2. The tab is redirected
3. The extension loads an internal page: `blocked.html`

The redirect occurs in the **same tab**.

There is **no bypass mechanism** in v1.

Closing the tab is the only way to exit.

---

# Logging

Every blocked navigation attempt is logged.

Each attempt stores:

timestamp  
domain  
fullUrl  

Example:

{
  "timestamp": 1719921231231,
  "domain": "twitter.com",
  "fullUrl": "https://twitter.com/home"
}

Logs are stored locally using `chrome.storage.local`.

Logs are **not limited in size** for v1.

---

# Metrics

The extension tracks two metrics:

## Domain totals

Example:

twitter.com → 37  
reddit.com → 12  

## URL totals

Example:

twitter.com/home → 21  
twitter.com/notifications → 8  

---

# Refresh Behavior

Refreshing the shame page must NOT increment attempt counters.

Only real navigation attempts count.

---

# Shame Page

When a block occurs, the extension shows a shame page.

The page includes:

### Insulting Message

Example tone:

Nice try.  
You have attempted to visit twitter.com 37 times.  
Maybe write some code instead.

The tone is fixed in v1.

---

### Blocked URL

Display the exact URL the user attempted to visit.

Example:

Blocked URL:  
https://twitter.com/home

---

### Domain Attempt Count

Example:

Attempts for twitter.com: 37

---

### Recent Attempts

Display the **last 10 attempts** for the same domain.

Example:

10:32 twitter.com/home  
10:30 twitter.com/notifications  
10:28 twitter.com/home  

---

# Popup Interface

The popup is the main control interface.

There is no separate options page in v1.

---

## Blocked Domains

Editable list of blocked domains.

Users can:

- add domains
- remove domains

Example:

twitter.com  
reddit.com  

---

## Quick Block Current Site

If the user opens the popup while on:

instagram.com

The popup shows:

Block this site

Clicking it:

1. Adds the domain to the block list
2. Immediately redirects the tab to the shame page

---

## Stats Summary

The popup displays a short stats summary.

Example:

Attempts Today: 14

Top Distractions:

1. twitter.com (9)  
2. reddit.com (3)  
3. youtube.com (2)

---

# Storage Schema

Stored in `chrome.storage.local`

---

# Technology Stack

The extension must use:

Vite  
React  
TypeScript  
Tailwind  
Manifest V3  

---

# Redirect Mechanism

Use:

chrome.declarativeNetRequest

Rules redirect blocked domains to:

blocked.html?url=<original>

---

# Edge Cases

The extension must not block:

chrome:// URLs  
chrome-extension:// URLs  
file:// URLs  

It must also avoid redirect loops.

---

# MVP Completion Criteria

The extension is considered complete when:

- Domains can be added/removed from popup
- Visiting a blocked domain redirects to shame page
- Attempt is logged
- Shame page shows stats and recent attempts
- Popup displays stats
- Data persists across browser restarts
