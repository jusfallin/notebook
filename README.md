# DEKA NOTEBOOK 💛

A tactile, romantic digital diary designed to feel like a handcrafted journal.

## Included

- Leather/fabric-inspired notebook cover with foil-like title treatment
- Animated cover entrance and page transitions
- Dedication page with couple-photo upload
- First entry fixed to **25.07.2026**
- Unlimited diary pages with editable dates
- Text, image, and audio/voice-note content blocks
- Mood and weather stamps
- Automatic localStorage persistence
- Keyboard navigation: `←`, `→`, `Space`, and `E` for edit mode
- Mobile swipe navigation
- Responsive notebook proportions
- Print-friendly styles

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Deploy to Vercel

Import `jusfallin/notebook` into Vercel. No environment variables are required for the current local-first version.

## Architecture

- Next.js App Router
- React client state for the notebook session
- Framer Motion for page/cover transitions
- Browser localStorage for persistence
- Data URLs for locally uploaded images/audio
- CSS-only physical paper/cover texture, shadows, and layout

## Data model

Each diary entry stores: `id`, `date`, `mood`, `weather`, `text`, `image`, and `audio`.

The current implementation is intentionally backend-free so it can be used privately without exposing diary content to a server. For true two-person cloud synchronization, add authentication plus a database/storage layer later.
